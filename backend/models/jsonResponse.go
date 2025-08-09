package models

type JsonResponse struct {
	Error   bool   `json:"error,omitempty"`
	Message string `json:"message,omitempty"`
}

func NewJsonErrorMessageResponse(msg string) JsonResponse {
	return JsonResponse{
		Error:   true,
		Message: msg,
	}
}

func NewJsonErrorResponse(err error) JsonResponse {
	return JsonResponse{
		Error:   true,
		Message: err.Error(),
	}
}
