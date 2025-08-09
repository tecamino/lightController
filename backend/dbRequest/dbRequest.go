package dbRequest

import (
	"backend/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

var DBCreate string = `CREATE TABLE IF NOT EXISTS users (
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						username TEXT NOT NULL,
						role TEXT NOT NULL,
						password TEXT NOT NULL
						);`

var DBNewUser string = `INSERT INTO users (username, role, password) VALUES (?, ?, ?)`
var DBQueryPassword string = `SELECT role, password FROM users WHERE username = ?`
var DBUserLookup string = `SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)`
var DBRemoveUser string = `DELETE FROM users WHERE username = $1`

func CheckDBError(c *gin.Context, username string, err error) bool {
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusBadRequest, models.NewJsonErrorMessageResponse(fmt.Sprintf("no user '%s' found", username)))
			return true
		}
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return true
	}
	return false
}
