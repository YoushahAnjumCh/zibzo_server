FROM node:alpine3.18
WORKDIR /app
COPY package.json ./
RUN rm -rf node_modules
RUN rm -rf package-lock.json
RUN npm cache clean --force
RUN npm install
COPY . .
EXPOSE 4000
CMD [ "npm", "run", "start" ]