FROM debian:buster-slim AS builder

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    git \
    build-essential \
    ruby \
    ruby-dev

# Install Node.js 8.x
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs

# Install Sass
RUN gem install sass

# Set up the working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ENV PATH="/usr/src/app/node_modules/.bin:$PATH"

# Install app dependencies
COPY package.json /usr/src/app/package.json
COPY gulpfile.js /usr/src/app/gulpfile.js
RUN npm install bower
RUN npm install gulp-cli
COPY . /usr/src/app
RUN bower --allow-root install
RUN npm install -f
RUN npm install --save-dev gulp
RUN npm install --save-dev gulp-inject
RUN npm install --save-dev gulp-ruby-sass

# Build the app
RUN gulp build

# Use nginx to serve the application
FROM nginx:1.19.3
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]