FROM node:latest
ARG NPM_INSTALL_BEFORE=true
RUN mkdir -p /var/www/html
RUN yarn global add ffmpeg-binaries
RUN npm install -g nodemon

COPY ./package.json /tmp/package.json

WORKDIR /var/www/html
COPY ./ /var/www/html
COPY "docker/start.sh" /var/www/start.sh

RUN if [ $NPM_INSTALL_BEFORE = "true" ]; then \
    ls /tmp && \
    cd /tmp && \
    npm install && \
    mkdir -p /var/www/html && cp -a /tmp/node_modules /var/www/html ; \
    fi

RUN chmod +x /var/www/start.sh
CMD bash /var/www/start.sh 