package models

type Values struct {
	Stagelights []Value `json:"stageLights,omitempty"`
	LightBar    []Value `json:"lightBar,omitempty"`
	FloogLights []Value `json:"floodLights,omitempty"`
	MovingHead  []Value `json:"movingHead,omitempty"`
	Value       any     `json:"value"`
}
