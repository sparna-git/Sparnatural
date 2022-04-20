FROM node:14

# to have latest npm version
RUN npm i -g npm

WORKDIR /usr/src/app/

# start a http server on the dist/folder
RUN npm install -g http-server
CMD [ "http-server", "-p", "8080", "/usr/src/app/dist/"]
EXPOSE 8080
