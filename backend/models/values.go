package models

type Values struct {
	MovingHead *MovingHead `json:"movingHead"`
	LightBar   *LightBar   `json:"lightBar"`
	Value      any         `json:"value"`
}
