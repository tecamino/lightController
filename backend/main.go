package main

import (
	"backend/login"
	secenes "backend/scenes"
	"backend/server"
	"backend/utils"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/tecamino/tecamino-logger/logging"
)

func main() {
	spa := flag.String("spa", "./dist/spa", "quasar spa files")
	workingDir := flag.String("workingDirectory", ".", "quasar spa files")
	ip := flag.String("ip", "0.0.0.0", "server listening ip")
	port := flag.Uint("port", 9500, "server listening port")
	debug := flag.Bool("debug", false, "log debug")
	flag.Parse()

	//change working directory only if value is given
	if *workingDir != "." && *workingDir != "" {
		fmt.Println(1, *workingDir)
		os.Chdir(*workingDir)
	}
	fmt.Println(1.1, *workingDir)
	wd, err := os.Getwd()
	if err != nil {
		log.Fatalf("Could not get working directory: %v", err)
	}

	folderName := filepath.Base(wd)
	logFileName := folderName + ".log"

	logger, err := logging.NewLogger(logFileName, &logging.Config{
		MaxSize:     1,
		MaxBackup:   3,
		MaxAge:      28,
		Debug:       *debug,
		TerminalOut: true,
	})

	//new login manager
	loginManager, err := login.NewLoginManager(".")
	if err != nil {
		logger.Error("main login manager", err.Error())
		panic(err)
	}

	//new scenes handler
	scenesHandler := secenes.NewScenesHandler("")

	// new server
	s := server.NewServer()

	s.Routes.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:9000"},
		AllowMethods:     []string{"POST", "GET", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	api := s.Routes.Group("/api")
	//set routes
	api.GET("/loadScenes", scenesHandler.LoadScenes)
	api.POST("/login", loginManager.Login)
	api.POST("/user/add", loginManager.AddUser)
	api.POST("/saveScene", scenesHandler.SaveScene)
	api.POST("/loadScene", scenesHandler.LoadScene)
	api.DELETE("/user", loginManager.RemoveUser)
	api.DELETE("/deleteScene", scenesHandler.DeleteScene)

	// Serve static files
	s.Routes.StaticFS("/assets", gin.Dir(filepath.Join(*spa, "assets"), true))
	s.Routes.NoRoute(func(c *gin.Context) {
		// Disallow fallback for /api paths
		if strings.HasPrefix(c.Request.URL.Path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "API endpoint not found"})
			return
		}
		// Try to serve file from SPA directory
		filePath := filepath.Join(*spa, c.Request.URL.Path)
		if _, err := os.Stat(filePath); err == nil {
			c.File(filePath)
			return
		}
		// Fallback to index.html for SPA routing
		c.File(filepath.Join(*spa, "index.html"))

	})

	go func() {
		time.Sleep(500 * time.Millisecond)
		if err := utils.OpenBrowser(fmt.Sprintf("http://localhost:%d", *port), logger); err != nil {
			logger.Error("main", fmt.Sprintf("starting browser error : %s", err.Error()))
		}
	}()
	fmt.Println(3, *ip, *port)
	// start http server
	logger.Info("main", fmt.Sprintf("http listen on ip: %s port: %d", *ip, *port))
	if err := s.ServeHttp(*ip, *port); err != nil {
		logger.Error("main", "error http server "+err.Error())
	}
}
