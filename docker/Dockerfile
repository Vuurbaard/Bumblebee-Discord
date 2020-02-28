FROM node:13
ARG NPM_GLOBAL_PACKAGES=typescript
ARG BUILD_PROD=false
WORKDIR /var/www/html

# Install FFMPEG
COPY ./ /var/www/html
RUN if [ ! -z "$NPM_GLOBAL_PACKAGES" ] ; then npm install -g $NPM_GLOBAL_PACKAGES ; fi
RUN if [ "$BUILD_PROD" = "true" ] ; then \
    npm ci --production ; \
fi
CMD npm run start-smart
