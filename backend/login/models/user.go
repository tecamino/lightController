package models

type User struct {
	Name     string `json:"user"`
	Password string `json:"password,omitempty"`
	Token    string `json:"token,omitempty"`
}

func (u *User) IsValid() bool {
	return u.Name != ""
}
