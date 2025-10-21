# Package.json Explanation for Code Demo

## 📦 **Project Information**
- **Name**: `devops-pipeline-demo` - Project identifier
- **Version**: `1.0.0` - Semantic versioning
- **Type**: `module` - Enables ES6 import/export syntax
- **Description**: TechStore ecommerce website with DevOps integration
- **Author**: Group Melvin Final - SWE40006

## 🚀 **Scripts Explanation**

### Core Application Scripts:
- **`npm start`** - Production server start (runs `node server.js`)
- **`npm run dev`** - Development with auto-reload (runs `node --watch server.js`)
- **`npm test`** - Placeholder test command for CI/CD pipeline

### Additional Utility Scripts for Demo:
- **`npm run lint`** - Would run code linting in real project
- **`npm run build`** - Would run build process in real project
- **`npm run docker:build`** - Builds Docker image as `techstore`
- **`npm run docker:run`** - Runs Docker container on port 3000

## 📚 **Dependencies**

### Production Dependencies:
- **`express`** (^4.19.2) - Web framework for handling HTTP requests and routing
- **`prom-client`** (^15.1.3) - Prometheus metrics collection for monitoring and observability

### Development Dependencies:
- Currently none, but would include testing frameworks, linters, etc. in production

## 🔧 **Configuration**

### Engine Requirements:
- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0

### Repository:
- **GitHub**: https://github.com/Finn043/devops-project-final.git

## 🎯 **Demo Points to Highlight**

1. **Modern JavaScript**: Uses ES6 modules (`"type": "module"`)
2. **DevOps Integration**: Scripts ready for CI/CD pipeline
3. **Monitoring**: Prometheus metrics built-in
4. **Docker Ready**: Docker build/run scripts included
5. **Development Workflow**: Separate dev/prod commands
6. **Semantic Versioning**: Following standard version practices