package models

type Drivers struct {
	Name             string   `json:"name"`
	Description      string   `json:"description"`
	ExecutablePath   string   `json:"executablePath,omitempty"`
	WorkingDirectory string   `json:"workingDirectory,omitempty"`
	Arguments        []string `json:"arguments,omitempty"`
}
