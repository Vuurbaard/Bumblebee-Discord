FROM node:latest
RUN yarn global add ffmpeg-binaries
COPY ./ /var/www/html
CMD node /var/www/html/app.js