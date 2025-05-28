package dbRequest

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

var DBCreate string = `CREATE TABLE IF NOT EXISTS users (
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						username TEXT NOT NULL,
						password TEXT NOT NULL
						);`

var DBNewUser string = `INSERT INTO users (username, password) VALUES (?, ?)`
var DBQueryPassword string = `SELECT password FROM users WHERE username = ?`
var DBUserLookup string = `SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)`
var DBRemoveUser string = `DELETE FROM users WHERE username = $1`

func CheckDBError(c *gin.Context, username string, err error) bool {
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("no user '%s' found", username),
			})
			return true
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return true
	}
	return false
}
