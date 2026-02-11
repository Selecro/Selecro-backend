# Released 2026-01-13 by @marco-ippolito
FROM node:24.13.0-alpine

# Update and upgrade Alpine packages to ensure OS-level security
RUN apk update && \
  apk upgrade && \
  rm -rf /var/cache/apk/*

# Create app directory and set ownership to non-root `node` user
RUN mkdir -p /home/node/app && chown node:node /home/node/app

WORKDIR /home/node/app

# Switch to the non-root built-in user `node`
USER node

# Install app dependencies
COPY --chown=node package*.json ./
RUN npm install

# Bundle app source code
COPY --chown=node . .

RUN npm run build

# Expose the application port
ARG APP_DEFAULT_PORT=3000
EXPOSE ${APP_DEFAULT_PORT}

# Entry point
CMD [ "node", "dist/index.js" ]
