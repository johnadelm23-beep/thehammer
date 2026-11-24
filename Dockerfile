# Dockerfile for EuroPrecision Frontend (Nginx Production)
FROM nginx:1.25-alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy website assets to Nginx web root
COPY index.html /usr/share/nginx/html/
COPY category.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY animations.css /usr/share/nginx/html/
COPY manifest.json /usr/share/nginx/html/
COPY sw.js /usr/share/nginx/html/
COPY js/ /usr/share/nginx/html/js/
COPY data/ /usr/share/nginx/html/data/
COPY images/ /usr/share/nginx/html/images/
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
    location ^~ /api/ {\n\
        resolver 127.0.0.11 ipv6=off valid=30s;\n\
        set $backend_upstream http://backend:5000;\n\
        proxy_pass $backend_upstream;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
\n\
    location = /health {\n\
        resolver 127.0.0.11 ipv6=off valid=30s;\n\
        set $backend_upstream http://backend:5000;\n\
        proxy_pass $backend_upstream;\n\
    }\n\
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
