package main

import (
	"fmt"
	"net/http"
	"flag"
	"log"
)

func main() {
	port := flag.String("port", "8080", "Port to run the server on")
	flag.Parse()
	fmt.Println("Starting server on port", *port)

	http.HandleFunc("/", pageHandler)

	if err := http.ListenAndServe(":"+*port, nil); err != nil {
		log.Fatal(err)
	}
}

func pageHandler(w http.ResponseWriter, r *http.Request) {

}

