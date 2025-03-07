FROM node:8.17.0-alpine AS builder

# Update and install dependencies including Ruby for Sass
RUN apk update
RUN apk add --no-cache git ruby ruby-dev build-base

# Install Sass
RUN gem install sass

# Setup working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ENV PATH="/usr/src/app/node_modules/.bin:$PATH"

# Copy package files and install Node dependencies first
COPY package.json /usr/src/app/package.json
COPY gulpfile.js /usr/src/app/gulpfile.js7

# Install bower and gulp-cli globally
RUN npm install bower gulp-cli -g

# Copy the rest of the application
COPY . /usr/src/app

# Install dependencies
RUN bower --allow-root install
RUN npm install -f
RUN npm install --save-dev gulp gulp-inject gulp-ruby-sass

# Build the application
RUN gulp build

# Use Nginx to serve the application
FROM nginx:1.19.3
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]