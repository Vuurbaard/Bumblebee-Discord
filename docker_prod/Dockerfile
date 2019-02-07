FROM node:8-alpine
WORKDIR /var/www/html
RUN apk add ffmpeg
ENV LC_ALL C.UTF-8

COPY ./ /var/www/html

RUN npm install
CMD node /var/www/html/app.js