package login

import (
	"backend/dbRequest"
	"backend/models"
	"backend/utils"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	_ "modernc.org/sqlite"
)

func (lm *LoginManager) AddUser(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	user := models.User{}
	err = json.Unmarshal(body, &user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if !user.IsValid() {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "user empty",
		})
		return
	}

	db, err := sql.Open(lm.dbType, lm.dbFile)
	if dbRequest.CheckDBError(c, user.Name, err) {
		return
	}
	defer db.Close()

	var exists bool

	if err := db.QueryRow(dbRequest.DBUserLookup, user.Name).Scan(&exists); dbRequest.CheckDBError(c, user.Name, err) {
		return
	}

	if exists {
		c.JSON(http.StatusOK, gin.H{
			"error": fmt.Sprintf("user '%s' exists already", user.Name),
		})
		return
	}

	hash, err := utils.HashPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	if _, err := db.Exec(dbRequest.DBNewUser, user.Name, hash); dbRequest.CheckDBError(c, user.Name, err) {
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("user '%s' successfully added", user.Name),
	})
}

func (lm *LoginManager) RemoveUser(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	user := models.User{}
	err = json.Unmarshal(body, &user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if !user.IsValid() {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "user empty",
		})
		return
	}

	db, err := sql.Open(lm.dbType, lm.dbFile)
	if dbRequest.CheckDBError(c, user.Name, err) {
		return
	}
	defer db.Close()

	var storedPassword string
	if err := db.QueryRow(dbRequest.DBQueryPassword, user.Name).Scan(&storedPassword); dbRequest.CheckDBError(c, user.Name, err) {
		return
	}

	if !utils.CheckPassword(user.Password, storedPassword) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "wrong password",
		})
		return
	}

	if _, err := db.Exec(dbRequest.DBRemoveUser, user.Name); dbRequest.CheckDBError(c, user.Name, err) {
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("user '%s' successfully removed", user.Name),
	})
}

func (lm *LoginManager) Login(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	user := models.User{}
	err = json.Unmarshal(body, &user)
	if err != nil {
		fmt.Println(2)

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if !user.IsValid() {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "user empty",
		})
		return
	}

	db, err := sql.Open(lm.dbType, lm.dbFile)
	if dbRequest.CheckDBError(c, user.Name, err) {
		return
	}
	defer db.Close()

	var storedPassword string
	if err := db.QueryRow(dbRequest.DBQueryPassword, user.Name).Scan(&storedPassword); dbRequest.CheckDBError(c, user.Name, err) {
		return
	}

	if !utils.CheckPassword(user.Password, storedPassword) {
		fmt.Println(2, user.Password)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "wrong password",
		})
		return
	}

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": user.Name,
		"exp":      time.Now().Add(time.Hour * 72).Unix(), // expires in 72h
	})

	secret, err := utils.GenerateJWTSecret(32) // 32 bytes = 256 bits
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "error generate jwt token"})
		return
	}

	// Sign and get the complete encoded token as a string
	tokenString, err := token.SignedString(secret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, models.User{
		Name:  user.Name,
		Token: tokenString,
	})
}
