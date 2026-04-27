package runner

type Runner interface {
	Run(language string, code string, input string) (string, string, error)
}

type DockerRunner struct{}

func (d *DockerRunner) Run(language string, code string, input string) (string, string, error) {
	return CodeRunner(language, code, input)
}
