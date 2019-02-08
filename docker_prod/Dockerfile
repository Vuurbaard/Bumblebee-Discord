FROM node:8-alpine
WORKDIR /var/www/html
RUN apk add ffmpeg
ENV LC_ALL C.UTF-8
ENV NODE_ENV production

COPY ./ /var/www/html

RUN npm install --production
CMD node /var/www/html/app.js