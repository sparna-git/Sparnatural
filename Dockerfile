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
# build sparnatural into dist/ folder
RUN npm run build


### start a nginx web server to serve the dist/ folder
FROM nginx:1.21.6
COPY --from=sparnatural-builder /usr/src/app/dist/ /usr/share/nginx/html/
RUN chown nginx.nginx /usr/share/nginx/html/ -R
EXPOSE 80
