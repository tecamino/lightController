package utils

import (
	"fmt"
	"os/exec"
	"runtime"

	"github.com/tecamino/tecamino-logger/logging"
)

func OpenBrowser(url string, logger *logging.Logger) error {
	var commands [][]string

	switch runtime.GOOS {
	case "windows":
		// Try with Chrome in kiosk mode
		commands = [][]string{
			{`C:\Program Files\Google\Chrome\Application\chrome.exe`, "--kiosk", url},
			{"rundll32", "url.dll,FileProtocolHandler", url}, // fallback
		}
	case "darwin":
		// macOS: open with Chrome in kiosk
		commands = [][]string{
			{"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--kiosk", url},
			{"open", url}, // fallback
		}
	default: // Linux
		commands = [][]string{
			{"chromium-browser", "--kiosk", url},
			{"google-chrome", "--kiosk", url},
			{"firefox", "--kiosk", url},
			{"xdg-open", url}, // fallback
		}
	}

	for _, cmd := range commands {
		execCmd := exec.Command(cmd[0], cmd[1:]...)
		if err := execCmd.Start(); err == nil {
			return nil
		} else {
			logger.Error("utils.OpenBrowser", err)
		}
	}

	return fmt.Errorf("could not open browser")
}
