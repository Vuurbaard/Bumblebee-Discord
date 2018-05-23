FROM node:latest
ARG NPM_INSTALL_BEFORE=true
RUN mkdir -p /var/www/html
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

RUN sed -i "s/jessie main/jessie main contrib non-free/" /etc/apt/sources.list
RUN echo "deb http://http.debian.net/debian jessie-backports main contrib non-free" >> /etc/apt/sources.list
RUN apt-get update && apt-get install -y \
    ffmpeg

RUN apt-get install -y locales && \
    locale-gen C.UTF-8 && \
    /usr/sbin/update-locale LANG=C.UTF-8

ENV LC_ALL C.UTF-8

RUN chmod +x /var/www/start.sh
CMD bash /var/www/start.sh 