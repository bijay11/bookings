package models

// Holds data sent from handlers to templates
type TemplateData struct {
	StringMap map[string]string
	IntMap    map[string]int
	FlatMap   map[string]float32
	Data      map[string]any
	CSRFToken string
	Flash     string
	Warning   string
	Error     string
}
