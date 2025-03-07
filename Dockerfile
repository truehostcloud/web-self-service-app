FROM mhart/alpine-node:8.9.4 AS builder

# Install dependencies
RUN apk update && apk add --no-cache git ruby ruby-dev build-base

# Install Sass
RUN gem install sass

# Set up the working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Set up PATH for node modules
ENV PATH="/usr/src/app/node_modules/.bin:$PATH"

# Copy package.json and gulpfile.js
COPY package.json /usr/src/app/package.json
COPY gulpfile.js /usr/src/app/gulpfile.js

# Install global npm packages
RUN npm install bower gulp-cli -g

# Install project dependencies
RUN npm install -f
RUN npm install --save-dev gulp gulp-inject gulp-ruby-sass

# Copy the rest of the application
COPY . /usr/src/app

# Install Bower components
RUN bower --allow-root install

# Build the project
RUN gulp build

# Use Nginx to serve the app
FROM nginx:1.19.3

# Copy the built files from the builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]