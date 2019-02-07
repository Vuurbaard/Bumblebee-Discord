FROM node:8-alpine

RUN apk add ffmpeg

ENV LC_ALL C.UTF-8

COPY ./ /var/www/html

CMD node /var/www/html/app.js