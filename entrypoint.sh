#!/bin/bash
# entrypoint.sh

# Replace SERVER_NAME in the template and output to the actual config location
SERVER_NAME=${SERVER_NAME:-_}
envsubst '${SERVER_NAME}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start NGINX
exec nginx -g "daemon off;"
