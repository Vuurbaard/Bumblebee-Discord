FROM node:8 as builder
ENV NODE_ENV production
WORKDIR /var/www/html
RUN mkdir -p /var/www/html
COPY ./ /var/www/html
RUN mkdir -p /var/www/html/tmp
RUN npm install --production


FROM node:8-alpine
ENV NODE_ENV production
RUN apk add ffmpeg
WORKDIR /var/www/html
RUN mkdir -p /var/www/html/tmp
COPY --from=builder /var/www/html /var/www/html
CMD node ./app.js