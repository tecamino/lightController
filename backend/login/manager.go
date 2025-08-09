package login

import (
	"backend/dbRequest"
	"backend/utils"
	"database/sql"
	"fmt"
	"os"
)

type LoginManager struct {
	dbType string
	dbFile string
}

func NewLoginManager(dir string) (*LoginManager, error) {
	if dir == "" {
		dir = "."
	}

	var typ string = "sqlite"
	var file string = fmt.Sprintf("%s/user.db", dir)

	if _, err := os.Stat(file); err != nil {
		db, err := sql.Open(typ, file)
		if err != nil {
			return nil, err
		}
		defer db.Close()

		_, err = db.Exec(dbRequest.DBCreate)
		if err != nil {
			return nil, err
		}

		hash, err := utils.HashPassword("tecamino@2025")
		if err != nil {
			return nil, err
		}
		_, err = db.Exec(dbRequest.DBNewUser, "admin", "admin", hash)
		if err != nil {
			return nil, err
		}
	}
	return &LoginManager{
		dbType: typ,
		dbFile: file,
	}, nil
}
