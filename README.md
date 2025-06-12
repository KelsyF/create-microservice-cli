# create-microservice

A CLI tool that scaffolds production-ready, containerized microservice projects - perfect for fast prototyping and consistency across teams.

## Features

- Interactive prompt for project name
- Overwrite protection if folder already exists (`--force` to skip prompt)
- Included template files:
  - Node.js + Express app
  - Dockerfile + `.dockerignore`
  - GitHub Actions CI workflow
  - Test file and starter `README.md`
- Optional post-generation automation:
  - Runs `npm install`
  - Initializes Git repo with initial commit
  - Builds Docker image
  - Runs cotnainer and opens `http://localhost:3000` in browser
  - Executes `npm test`
- CLI options for automation, help, and safety

## Usage

### Install dependencies (if using locally):
```bash
npm install
```

### Run the CLI
```bash
node index.js
```

### Optional Flags
```bash
node index.js [options]

Options:
    --auto      Skip automation prompt and automatically:
                    - install dependencies
                    - initialize git
                    - build and run Docker container
                    - open browser
                    - run tests
    --force     Skip overwrite prompt if folder already exists
    --help      Show this help message 
```

### Example Output
```bash
? What is the name of your microservice? > test-api
? Would you like to automate the next steps? This includes:
  - install dependencies
  - initialize git
  - build and run Docker container
  - open browser
  - run tests
> (Y/n)

Project scaffolded!!
Installing dependencies...
Initializing git repo...
Building Docker image 'test-api'...
Running Docker container (port 3000)...
Running tests...
Opening http://localhost:3000...
```

### Template Structure
```bash
test-api/
├── app.js
├── Dockerfile
├── package.json
├── .dockerignore
├── .github/workflows/ci.yml
├── README.md
└── test/app.test.js
```

## Future Plans

- Support multiple languages(Python, Go)
- ~~-Add --force CLI flag~~ (added 6/11)
- ~~-Add post-gen automation (git init, npm install, etc.)~~ (added 6/11)

## Author
Kelsy Frank

[LinkedIn](https://www.linkedin.com/in/kelsy-frank-36a20732a/)
