package secenes

import (
	"backend/models"
	"backend/utils"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"sort"

	"github.com/gin-gonic/gin"
)

type ScenesHandler struct {
	dir string
}

func NewScenesHandler(dir string) *ScenesHandler {
	if dir == "" {
		dir = "./scenes"
	}
	return &ScenesHandler{
		dir: dir,
	}
}

func (sh *ScenesHandler) SaveScene(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}

	var scene models.Scene
	err = json.Unmarshal(body, &scene)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}

	if _, err := os.Stat(path.Join(sh.dir)); err != nil {
		err := os.MkdirAll(sh.dir, 0755)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
			return
		}
	}

	f, err := os.OpenFile(path.Join(sh.dir, scene.Name+".scene"), os.O_CREATE|os.O_TRUNC|os.O_RDWR, 0644)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}
	defer f.Close()

	_, err = f.Write(body)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Scene '%s' saved", scene.Name),
	})
}

func (sh *ScenesHandler) DeleteScene(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}

	var scene models.Scene
	err = json.Unmarshal(body, &scene)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}

	err = os.Remove(path.Join(sh.dir, scene.Name+".scene"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Scene '%s' deleted", scene.Name),
	})
}

func (sh *ScenesHandler) LoadScenes(c *gin.Context) {
	sceneMap := make(map[string]models.Scene)

	files, err := utils.FindAllFiles("./scenes", ".scene")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}

	for _, f := range files {
		content, err := os.ReadFile(f)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
			return
		}
		var scene models.Scene
		err = json.Unmarshal(content, &scene)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
			return
		}
		sceneMap[scene.Name] = scene
	}

	//sort scenes alphabetacally by name
	keys := make([]string, 0, len(sceneMap))
	for key := range sceneMap {
		keys = append(keys, key)
	}

	// Sort keys alphabetically
	sort.Strings(keys)

	var scenes []models.Scene
	//  Iterate over sorted keys
	for _, key := range keys {
		scenes = append(scenes, sceneMap[key])
	}

	c.JSON(http.StatusOK, scenes)
}

func (sh *ScenesHandler) LoadScene(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}

	var scene models.Scene

	err = json.Unmarshal(body, &scene)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}

	files, err := utils.FindAllFiles("./scenes", ".scene")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
		return
	}

	for _, f := range files {
		if filepath.Base(f) != scene.Name+".scene" {
			continue
		}
		content, err := os.ReadFile(f)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
			return
		}

		err = json.Unmarshal(content, &scene)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.NewJsonErrorResponse(err))
			return
		}
		c.JSON(http.StatusOK, scene)
		return
	}

	c.JSON(http.StatusBadRequest, models.NewJsonErrorMessageResponse(fmt.Sprintf("scene '%s' not found", scene.Name)))
}
