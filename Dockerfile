FROM nginx:1.19.3

# Copy application files
COPY ./dist /usr/share/nginx/html

# Copy NGINX config template
COPY ./nginx.template /etc/nginx/conf.d/default.conf.template

# Copy entrypoint script
COPY ./entrypoint.sh /entrypoint.sh

# Make sure the script is executable
RUN chmod +x /entrypoint.sh

# Set default SERVER_NAME environment variable
ENV SERVER_NAME=_

EXPOSE 8090

# Use our custom entrypoint script
ENTRYPOINT ["/entrypoint.sh"]