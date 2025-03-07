# Use Alpine Linux as the base image
FROM alpine:3.18 AS base

# Install dependencies for Ruby and Node.js
RUN apk update && apk add --no-cache \
    build-base \
    git \
    curl \
    libffi-dev \
    openssl-dev \
    readline-dev \
    zlib-dev

# Install Node.js 8.17.0
RUN curl -fsSL https://nodejs.org/dist/v8.17.0/node-v8.17.0-linux-x64.tar.xz -o node.tar.xz && \
    tar -xJf node.tar.xz -C /usr/local --strip-components=1 && \
    rm node.tar.xz

# Install Ruby 3.4.1
RUN curl -fsSL https://cache.ruby-lang.org/pub/ruby/3.4/ruby-3.4.1.tar.gz -o ruby.tar.gz && \
    tar -xzf ruby.tar.gz && \
    cd ruby-3.4.1 && \
    ./configure --disable-install-doc --prefix=/usr/local && \
    make -j$(nproc) && \
    make install && \
    cd .. && \
    rm -rf ruby-3.4.1 ruby.tar.gz

# Verify installations
RUN node -v && npm -v && ruby -v

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

# Install Sass
RUN gem install sass

# Copy the rest of the application
COPY . /usr/src/app

# Install Bower components
RUN bower --allow-root install

# Build the project
RUN gulp build

# Serve the app with Nginx
FROM nginx:1.19.3

# Copy the built files from the builder stage
COPY --from=base /usr/src/app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]