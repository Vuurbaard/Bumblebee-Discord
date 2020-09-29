FROM node:14-alpine
ARG NPM_GLOBAL_PACKAGES=typescript
ARG BUILD_PROD=false
WORKDIR /var/www/html

# Install FFMPEG
COPY --from=mwader/static-ffmpeg:latest /ffmpeg /usr/local/bin/

COPY ./ /var/www/html

RUN if [ ! -z "$NPM_GLOBAL_PACKAGES" ] ; then npm install -g $NPM_GLOBAL_PACKAGES ; fi
RUN if [ "$BUILD_PROD" = "true" ] ; then \
    apk add --no-cache --virtual .gyp python make g++ ; \
    npm ci ; \
    npm run compile ; \
    apk del .gyp ; \
else \
    apk add --no-cache --virtual .gyp python make g++ ; \
    npm install ; \
fi
CMD npm run start-smart
