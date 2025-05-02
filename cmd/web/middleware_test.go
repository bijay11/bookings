package main

import (
	"net/http"
	"testing"
)

func TestNoSurf(t *testing.T) {
	var myH myHandler
	h := NoSurf(&myH)

	switch v := h.(type) {
	case http.Handler: // ok
	default:
		t.Errorf("NoSurf() does not return a http.Handler, got %T", v)
	}
}

func TestSessionLoad(t *testing.T) {
	var myH myHandler
	h := SessionLoad(&myH)

	switch v := h.(type) {
	case http.Handler: // ok
	default:
		t.Errorf("SessionLoad() does not return a http.Handler, got %T", v)
	}
}
