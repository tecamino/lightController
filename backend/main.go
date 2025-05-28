package main

import (
	"backend/login"
	"backend/server"
	"backend/utils"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

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

	// new server
	s := server.NewServer()

	api := s.Routes.Group("/api")
	//set routes
	api.POST("/login", loginManager.Login)
	api.POST("/user/add", loginManager.AddUser)
	api.DELETE("/user", loginManager.RemoveUser)

	// Serve static files
	s.Routes.StaticFS("/", gin.Dir(*spa, true))
	s.Routes.NoRoute(func(c *gin.Context) {
		// Try to serve file from SPA directory
		filePath := filepath.Join(*spa, c.Request.URL.Path)
		if _, err := os.Stat(filePath); err == nil {
			c.File(filePath)
		} else {
			// Fallback to index.html for SPA routing
			c.File(filepath.Join(*spa, "index.html"))
		}
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
