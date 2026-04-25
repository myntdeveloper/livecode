package runner

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"os/exec"
	"strings"
	"time"
)

type Runner interface {
	Run(language string, code string) (string, string, error)
}

type DockerRunner struct{}

func (d *DockerRunner) Run(language string, code string) (string, string, error) {
	// TODO: Add other languages and optimize code
	switch language {
	case "go":
		code = fmt.Sprintf("package main\nfunc main() {%s}", code)
		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()

		cmd := exec.CommandContext(
			ctx,
			"docker", "run", "--rm", "-i",
			"golang:1.20-alpine",
			"sh", "-c", "cat > main.go && go run main.go",
		)
		var stdout, stderr bytes.Buffer
		cmd.Stdout = &stdout
		cmd.Stderr = &stderr
		cmd.Stdin = strings.NewReader(code)

		err := cmd.Run()
		return stdout.String(), stderr.String(), err

	case "python", "python3":
		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()

		cmd := exec.CommandContext(
			ctx,
			"docker", "run", "--rm", "-i",
			"python:3.12-alpine",
			"python", "-c", code,
		)
		var stdout, stderr bytes.Buffer
		cmd.Stdout = &stdout
		cmd.Stderr = &stderr

		err := cmd.Run()
		return stdout.String(), stderr.String(), err

	default:
		return "", "", errors.New("incorrect language")
	}
}
