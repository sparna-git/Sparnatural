FROM node:14

# to have latest npm version
RUN npm i -g npm

# install needed npm dependancies for build step
WORKDIR /usr/src/app/
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm install
COPY . /usr/src/app/

# build sparnatural into dist/ folder
RUN npm run build

# start a http server on the dist/folder
RUN npm install -g http-server
CMD [ "http-server", "-p", "8080", "/usr/src/app/dist/"]
EXPOSE 8080
