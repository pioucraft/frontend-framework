package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
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
	filePath := "src/app" + r.URL.Path + ".html"
	htmlFile, err := os.ReadFile(filePath)
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	html := strings.ReplaceAll(string(htmlAppFile), "{@app}", string(htmlFile))

	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(html))
}

func main() {
	loader()

	http.HandleFunc("/", pageHandler)
	fmt.Println("Server starting on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
