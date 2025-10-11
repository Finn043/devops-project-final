# DevOps Pipeline Demo

A complete CI/CD pipeline demonstration using Node.js, Express, Docker, GitHub Actions, and Prometheus metrics.

## Project Overview

This project demonstrates a production-ready DevOps pipeline with:
- Node.js/Express application with health monitoring
- Prometheus metrics integration
- Docker containerization
- GitHub Actions CI/CD pipeline
- Multi-platform Docker image builds (AMD64/ARM64)
- Automated deployment to Docker Hub

## Application Features

- **Main endpoint** (`/`): Returns welcome message
- **Health check** (`/health`): Application health status
- **API endpoint** (`/api/ping`): Returns timestamp
- **Metrics endpoint** (`/metrics`): Prometheus metrics for monitoring

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Monitoring**: Prometheus (prom-client)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Registry**: Docker Hub

## Local Development

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git

### Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

The application will be available at `http://localhost:3000`

## Docker Setup

### Build Docker Image Locally
```bash
docker build -t devops-demo .
docker run -p 3000:3000 devops-demo
```

### Using Docker Compose
```bash
# Start the application
docker compose up -d

# Stop the application
docker compose down
```

The application runs on port 3001 when using docker-compose (mapped from container port 3000).

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:

1. Runs on every push to the repository
2. Sets up Node.js 20 environment
3. Installs dependencies and runs tests
4. Builds multi-platform Docker images (linux/amd64, linux/arm64)
5. Pushes images to Docker Hub wit `staging` tag

### Setup Requirements

1. **GitHub Secrets** (Settings → Secrets and variables → Actions):
   - `DOCKERHUB_USER`: Your Docker Hub username
   - `DOCKERHUB_PASS`: Your Docker Hub password or access token

2. **Docker Hub Repository**:
   - Create a public repository named `devops-demo` on Docker Hub

### Docker Image

The built image is available at:
```
docker.io/hanguyen1502/devops-demo:staging
```

## Deployment

### Test Environment (Local)

Using Docker Compose:
```bash
docker compose up -d
curl http://localhost:3001/health
```

### Production Environment (Cloud VM/EC2)

1. **Setup Docker on Ubuntu**:
   ```bash
   sudo apt-get update && sudo apt-get install -y docker.io
   sudo usermod -aG docker $USER && newgrp docker
   ```

2. **Deploy Application**:
   ```bash
   docker pull docker.io/hanguyen1502/devops-demo:staging
   docker run -d --name app -p 80:3000 --restart=always docker.io/hanguyen1502/devops-demo:staging
   ```

3. **Verify Deployment**:
   ```bash
   curl http://localhost/health
   ```

### Cloud Platform Options

- **AWS EC2**: t2.micro free tier (12 months)
- **Oracle Cloud**: Always free tier (2 VMs)
- **Google Cloud**: $300 credit with e2-micro free tier
- **DigitalOcean**: $200 credit for 60 days

## Monitoring

The application exposes Prometheus metrics at `/metrics` including:
- HTTP request counters (by route, method, status)
- Default Node.js metrics (memory, CPU, etc.)

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD pipeline
├── .gitignore              # Git ignore rules
├── Dockerfile              # Docker container configuration
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # Node.js dependencies and scripts
├── package-lock.json       # Locked dependency versions
├── server.js               # Express application
└── README.md               # Project documentation
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Welcome message |
| `/health` | GET | Health check status |
| `/api/ping` | GET | API ping with timestamp |
| `/metrics` | GET | Prometheus metrics |

## Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with auto-reload
- `npm test`: Run tests

## Security Notes

- Never commit secrets or API keys
- Use environment variables for sensitive configuration
- Docker Hub credentials are stored as GitHub Secrets
- Production deployments should use HTTPS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is for educational purposes demonstrating DevOps practices.
