package models

import "github.com/google/uuid"

type Value struct {
	Uuid  uuid.UUID `json:"uuid"`
	Path  string    `json:"path"`
	Value any       `json:"value"`
}