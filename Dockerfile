FROM node:8.17.0 AS builder

# Install Ruby 3.4.1
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    libssl-dev \
    libreadline-dev \
    zlib1g-dev \
    autoconf \
    bison \
    libyaml-dev \
    libncurses5-dev \
    libffi-dev

# Install rbenv and ruby-build
RUN git clone https://github.com/rbenv/rbenv.git ~/.rbenv
RUN git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
RUN echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
RUN echo 'eval "$(rbenv init -)"' >> ~/.bashrc
ENV PATH /root/.rbenv/bin:$PATH
RUN echo 'eval "$(rbenv init -)"' >> ~/.bashrc && eval "$(rbenv init -)"

# Install Ruby 3.4.1
RUN rbenv install 3.4.1
RUN rbenv global 3.4.1
RUN eval "$(rbenv init -)" && gem install sass

# Setup app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ENV PATH="/usr/src/app/node_modules/.bin:$PATH"

# Install Node dependencies
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
RUN eval "$(rbenv init -)" && gulp build

# Use nginx to serve the application
FROM nginx:1.19.3
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]