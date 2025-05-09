package main

import (
	"fmt"
	"net/http"
	"flag"
	"os"
	"log"
	"path/filepath"
)

var baseDir string

func main() {

	exePath, err := os.Executable()
    if err != nil {
        panic(err)
    }
    baseDir = filepath.Dir(exePath)


	port := flag.String("port", "8080", "Port to run the server on")
	flag.Parse()
	fmt.Println("Starting server on port", *port)

	http.HandleFunc("/", pageHandler)

	if err := http.ListenAndServe(":"+*port, nil); err != nil {
		log.Fatal(err)
	}
}

func pageHandler(w http.ResponseWriter, r *http.Request) {
	// Try to get the page from app/web
	path := "./app/web" + r.URL.Path
	// manually parse the file content and return it
	
	content, err := readFileInBinaryDir(path)

	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.Write(content)
}

func readFileInBinaryDir(filename string) ([]byte, error) {
    fullPath := filepath.Join(baseDir, filename)
    return os.ReadFile(fullPath)
}
