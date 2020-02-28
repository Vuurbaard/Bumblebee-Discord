FROM node:11-alpine as builder
ARG NPM_INSTALL_BEFORE=true
ENV NODE_ENV production
ENV LC_ALL C.UTF-8
WORKDIR /var/www/html
RUN mkdir -p /var/www/html
COPY ./ /var/www/html
RUN mkdir -p /var/www/html/tmp
RUN npm install --production


FROM node:11-alpine
ENV NODE_ENV production
ENV LC_ALL C.UTF-8
RUN apk add --update --no-cache ffmpeg opus
WORKDIR /var/www/html
RUN mkdir -p /var/www/html/tmp
COPY "docker/start.sh" /var/www/start.sh
RUN chmod +x /var/www/start.sh
COPY --from=builder /var/www/html /var/www/html
CMD sh /var/www/start.sh 