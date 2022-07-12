##########################################################
# Stage 0: Install alpine Linux + node, setup dependencies
##########################################################
FROM node:16.15-alpine@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b AS dependencies

LABEL maintainer="1jz"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

ENV NODE_ENV=production

RUN apk --no-cache add curl=7.83.1-r2

# Use /app as our working directory
WORKDIR /app

##########################################################
# Stage 1: install node dependencies and deploy
##########################################################

# Copy the package.json and package-lock.json files into the working dir (/app)
COPY package.json package-lock.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci --only=production

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Switch to low privilege user
USER node
COPY --chown=node:node . /app

# Start the container by running our server
CMD ["node", "src/index.js"]

# We run our service on port 8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail localhost:8080 || exit 1
