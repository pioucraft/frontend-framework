package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

var htmlAppFile []byte

func loader() {
	htmlFile, err := os.ReadFile("src/app.html")
	if err != nil {
		log.Fatalf("Failed to read src/app.html: %v", err)
	}
	htmlAppFile = htmlFile // Assign the file content to the global variable

}

func pageHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/script.js" {
		http.ServeFile(w, r, "script.js")
		return
	}

	if r.URL.Path == "/default.css" {
		http.ServeFile(w, r, "default.css")
		return
	}

	filePath := "src/app" + r.URL.Path + ".html"
	htmlFile, err := os.ReadFile(filePath)
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	html := "<script src='/script.js'></script><link rel='stylesheet' href='/default.css'></link>" + strings.ReplaceAll(string(htmlAppFile), "{@app}", string(htmlFile))

	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(html))
}

func mapFolderStructure(root string) map[string]string {
	structure := make(map[string]string)

	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Printf("Error accessing path %s: %v", path, err)
			return err
		}
		if info.IsDir() {
			structure[path] = "directory"
		} else {
			structure[path] = "file"
		}
		return nil
	})
	if err != nil {
		log.Fatalf("Error walking the path %s: %v", root, err)
	}

	return structure
}

func main() {
	loader()

	// Example usage of mapFolderStructure
	fmt.Println("Mapping folder structure of 'src/app':")
	folderStructure := mapFolderStructure("src/app")
	for path, fileType := range folderStructure {
		fmt.Printf("%s: %s\n", path, fileType)
	}

	http.HandleFunc("/", pageHandler)
	fmt.Println("Server starting on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
