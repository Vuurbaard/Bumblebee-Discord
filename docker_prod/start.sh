#!/bin/sh

# Environment variables (switch for dev/prod)

NPM_INSTALL=${NPM_INSTALL_AFTER:=true}
USE_NODEMON=${USE_NODEMON:=true}

if [ $NPM_INSTALL = "true" ]; then
    echo "Running NPM Install"
    npm install
fi

if [ $USE_NODEMON = "true" ]; then \
echo "Running via Nodemon";
nodemon -L /var/www/html/app.js
else
echo "Running via Node";
node /var/www/html/app.js
fi
