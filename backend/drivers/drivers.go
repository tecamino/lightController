package drivers

import (
	"backend/models"
	"encoding/json"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type DriverHandler struct {
	driversConfig string
}

func NewDriverHandler(cfgDir string) *DriverHandler {
	return &DriverHandler{driversConfig: cfgDir}
}

func (dH *DriverHandler) GetDriverList(c *gin.Context) {
	content, err := os.ReadFile(dH.driversConfig)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}

	var data struct {
		Drivers []models.Drivers `json:"drivers"`
	}
	err = json.Unmarshal(content, &data)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}
	c.JSON(http.StatusOK, data.Drivers)
}
