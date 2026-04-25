package service

import (
	"context"
	"errors"
	"fmt"
	"os/exec"

	"github.com/myntdeveloper/executor/internal/models"
	"github.com/myntdeveloper/executor/internal/runner"
)

type ExecuteService struct {
}

func NewExecuteService() *ExecuteService {
	return &ExecuteService{}
}

func (s *ExecuteService) Execute(language, code string) (models.ExecuteResponse, error) {
	runner := runner.DockerRunner{}
	stdout, stderr, err := runner.Run(language, code)
	timeout := false
	if err != nil {
		var execErr *exec.Error
		if errors.As(err, &execErr) && execErr.Err == exec.ErrNotFound {
			return models.ExecuteResponse{}, fmt.Errorf("docker is not installed or not available in PATH %s", err)
		}
		if errors.Is(err, context.DeadlineExceeded) {
			timeout = true
		} else {
			return models.ExecuteResponse{}, fmt.Errorf("execution failed: %v; stderr: %s", err, stderr)
		}
	}

	return models.ExecuteResponse{
		Output:  stdout,
		Error:   stderr,
		Timeout: timeout,
	}, nil
}
