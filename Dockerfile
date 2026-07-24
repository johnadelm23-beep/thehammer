# Dockerfile for EuroPrecision Frontend (Nginx Production)
FROM nginx:1.25-alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy website assets to Nginx web root
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY manifest.json /usr/share/nginx/html/
COPY sw.js /usr/share/nginx/html/
COPY js/ /usr/share/nginx/html/js/
COPY admin/ /usr/share/nginx/html/admin/

# Custom Nginx Config with gzip and security headers
RUN echo $'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    location /admin {\n\
        try_files $uri $uri/ /admin/index.html;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
