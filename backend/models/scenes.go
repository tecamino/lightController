package models

type Scenes []Scene

type Scene struct {
	Name       string  `json:"name"`
	Desciption string  `json:"description,omitempty"`
	MovingHead bool    `json:"movingHead"`
	LightBar   bool    `json:"lightBar"`
	Values     []Value `json:"values,omitempty"`
}
