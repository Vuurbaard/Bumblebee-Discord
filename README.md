# Bumblebee Discord Client

Use this package to connect bumblebee with discord. 

Currently it will listen to -tts commands or listen in a dedicated #bumblebee channel in order to do its TTS actions


For local development (or production version). Create a .env file (copy .env.example) and put it in the project root.

To start run node ./app.js

# Docker

There is also a prepared Docker version for this project. You could deploy this on docker swarm or any other docker environment.


# Known Issues

- Docker development version doesn't run well with nodemon. (Changes aren't picked up after a while)
- Bot sometimes loses connection and requires a restart (or `!disconnect` command to retry)
- Docker development requires setting up a network between the projects (currently commented in docker-compose.yml)
- API token isn't consumed by the API (?)