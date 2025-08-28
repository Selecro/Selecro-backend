# Check out https://hub.docker.com/_/node to select a new base image

# UPDATED BASE IMAGE: Using 'node:22-bookworm-slim' which is built on Debian Bookworm (slim)
# and contains more recent security fixes to address reported vulnerabilities.
FROM node:22-bookworm-slim

# Update system packages to address known vulnerabilities (run as root)
RUN apt-get update && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

# Create app directory and set ownership to non-root `node` user
RUN mkdir -p /home/node/app && chown node:node /home/node/app

WORKDIR /home/node/app

# Switch to the non-root built-in user `node` for installing dependencies and running the app
USER node

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package*.json ./

RUN npm install

# Bundle app source code
COPY --chown=node . .

RUN npm run build

# Expose the application port. This will be dynamically set by Docker Compose.
ARG APP_DEFAULT_PORT=3000
EXPOSE ${APP_DEFAULT_PORT}

# Command to run the application. Assuming your LoopBack app's entry point
# is 'dist/index.js' after the build.
CMD [ "node", "dist/index.js" ]
