# leapmotion-hue-bridge

Control Philips Hue lights with hand gestures using Leap Motion controller

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Docker (for containerized deployment)

### Running the Application

#### Local Development
```bash
# Run directly with Node.js
node app.js

# Or use npm
npm start
```

The application will start and be available at `http://localhost:3000`

#### Docker Deployment
```bash
# Build the Docker image
docker build -t leapmotion-hue-bridge .

# Run the container
docker run -p 3000:3000 leapmotion-hue-bridge
```

### CI/CD

This project includes a GitHub Actions workflow that:
- Builds the Docker container on every push to main/develop branches
- Tests the container functionality
- Validates the build process

The workflow runs automatically on pull requests and pushes to the main branch.
