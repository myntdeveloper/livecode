package runner

import (
	"bytes"
	"context"
	"errors"
	"os/exec"
	"strings"
	"time"
)

var (
	ErrIncorrectLanguage = errors.New("incorrect language")
)

func CodeRunner(language string, code string, input string) (string, string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	switch language {
	case "go":
		return GoRunner(ctx, language, code, input)
	case "python":
		return PyRunner(ctx, language, code, input)
	case "javascript":
		return JsRunner(ctx, language, code, input)
	case "typescript":
		return TsRunner(ctx, language, code, input)
	case "rust":
		return RustRunner(ctx, language, code, input)
	case "java":
		return JavaRunner(ctx, language, code, input)
	case "cpp":
		return CPPRunner(ctx, language, code, input)
	case "c":
		return CRunner(ctx, language, code, input)
	case "csharp":
		return CSharpRunner(ctx, language, code, input)
	case "php":
		return PhpRunner(ctx, language, code, input)
	case "ruby":
		return RubyRunner(ctx, language, code, input)
	case "swift":
		return SwiftRunner(ctx, language, code, input)
	case "kotlin":
		return KotlinRunner(ctx, language, code, input)
	default:
		return "", "", ErrIncorrectLanguage
	}
}

func GoRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"-e", "CODE="+code,
		"golang:1.20-alpine",
		"sh", "-c", "printf '%s' \"$CODE\" > main.go && go run main.go",
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(input)

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func PyRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"-e", "CODE="+code,
		"python:3.12-alpine",
		"sh", "-c", "printf '%s' \"$CODE\" > main.py && python main.py",
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	cmd.Stdin = strings.NewReader(input)
	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func JsRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	_ = input
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"node:20-alpine",
		"sh", "-c", "cat > main.js && node main.js",
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(code)

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func TsRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	_ = input
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"node:20-alpine",
		"sh", "-c", "cat > main.ts && npm install -g typescript && tsc main.ts && node main.js",
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(code)

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func RustRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	_ = input
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"rust:1.72-alpine",
		"sh", "-c", "cat > main.rs && rustc main.rs -o main && ./main",
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(code)

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func JavaRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	_ = input
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"openjdk:20-slim",
		"sh", "-c", "cat > Main.java && javac Main.java && java Main",
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(code)

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func CPPRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	_ = input
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"gcc:12.2.0",
		"sh", "-c", "cat > main.cpp && g++ main.cpp -o main && ./main",
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(code)

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func CRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	_ = input
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"gcc:12.2.0",
		"sh", "-c", "cat > main.c && gcc main.c -o main && ./main",
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(code)

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func CSharpRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	_ = input
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"mcr.microsoft.com/dotnet/sdk:7.0",
		"sh", "-c", "cat > Program.cs && dotnet new console -n App -o app --force && mv Program.cs app/Program.cs && cd app && dotnet run --no-restore",
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(code)

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func PhpRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	_ = input
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"php:8.2-cli",
		"sh", "-c", "cat > main.php && php main.php",
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(code)

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func RubyRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	_ = input
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"ruby:3.2-alpine",
		"sh", "-c", "cat > main.rb && ruby main.rb",
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(code)

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func SwiftRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	_ = input
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"swift:5.8",
		"sh", "-c", "cat > main.swift && swift main.swift",
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(code)

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

func KotlinRunner(ctx context.Context, language string, code string, input string) (string, string, error) {
	_ = language
	_ = input
	cmd := exec.CommandContext(
		ctx,
		"docker", "run", "--rm", "-i",
		"openjdk:17-slim",
		"sh", "-c", `
			cat > Main.kt && \
			echo "fun main() { MainKt.main() }" > entry.kt && \
			kotlinc Main.kt -include-runtime -d main.jar && \
			java -jar main.jar
		`,
	)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(code)

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}
