FROM node:alpine3.18
WORKDIR /app
COPY package.json ./
RUN rm -rf node_modules
RUN npm install
COPY . .
EXPOSE 4000
CMD [ "npm ", "run", "start" ]