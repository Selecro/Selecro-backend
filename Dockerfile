# Check out https://hub.docker.com/_/node to select a new base image

# CORRECTED BASE IMAGE: Using 'node:22-bullseye-slim' which is a valid tag on Docker Hub.
# This will pull the latest Node.js 22.x version built on Debian Bullseye (slim).
FROM node:22-bullseye-slim

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

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
