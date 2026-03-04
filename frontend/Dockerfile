FROM alpine:3.18

# Install lightweight web server
RUN apk add --no-cache nginx

# Copy frontend static files directly
COPY frontend /var/www/html

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
