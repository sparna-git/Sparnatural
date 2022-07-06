### build sparnatural
FROM node:14 as sparnatural-builder
# to have latest npm version
RUN npm i -g npm
# install needed npm dependancies for build step
WORKDIR /usr/src/app/
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm install
COPY . /usr/src/app/
# build sparnatural.js and sparnatural.css from src into dist/ folder
RUN npm run build
# prepare the home page (demo-dbpedia-v2) with the latest sparnatural.js|css build 
RUN git clone https://github.com/sparna-git/sparnatural.eu.git /tmp/sparnatural.eu/
RUN cp -f /usr/src/app/dist/sparnatural.* /tmp/sparnatural.eu/demos/demo-dbpedia-v2/

### start a nginx web server to serve the demo-dbpedia-v2/ folder
FROM nginx:1.21.6
COPY --from=sparnatural-builder /tmp/sparnatural.eu/demos/demo-dbpedia-v2/ /usr/share/nginx/html/
RUN chown nginx.nginx /usr/share/nginx/html/ -R
EXPOSE 80
