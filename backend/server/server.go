package server

import (
	"fmt"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/tecamino/tecamino-dbm/cert"
	"github.com/tecamino/tecamino-logger/logging"
)

// server model for database manager websocket
type Server struct {
	Routes *gin.Engine
	sync.RWMutex
	Logger *logging.Logger
}

// initalizes new dbm server
func NewServer() *Server {
	return &Server{
		Routes: gin.Default(),
	}
}

// serve dbm as http
func (s *Server) ServeHttp(ip string, port uint) error {
	return s.Routes.Run(fmt.Sprintf("%s:%d", ip, port))
}

// serve dbm as http
func (s *Server) ServeHttps(port uint, cert cert.Cert) error {
	// generate self signed tls certificate
	if err := cert.GenerateSelfSignedCert(); err != nil {
		return err
	}
	return s.Routes.RunTLS(fmt.Sprintf(":%d", port), cert.CertFile, cert.KeyFile)
}
