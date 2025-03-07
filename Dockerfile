FROM node:8.17.0-alpine AS builder

RUN apk update && apk add --no-cache git ruby
RUN gem install sass

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV PATH="/usr/src/app/node_modules/.bin:$PATH"

COPY package.json /usr/src/app/package.json
COPY gulpfile.js /usr/src/app/gulpfile.js

RUN npm install bower gulp-cli -g
RUN npm install -f
RUN npm install --save-dev gulp gulp-inject gulp-ruby-sass

COPY . /usr/src/app

RUN bower --allow-root install

RUN gulp build

FROM nginx:1.19.3

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]