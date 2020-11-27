FROM nginx:stable-alpine
WORKDIR /app
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY build/index.html .
EXPOSE 80
