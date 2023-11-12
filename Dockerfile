FROM node:lts-bullseye
ENV NODE_ENV=production
WORKDIR /usr/src/app
# Leave ports for compose
# EXPOSE 3000
RUN chown -R node /usr/src/app
USER node