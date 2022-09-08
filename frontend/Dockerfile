FROM node:18-alpine3.15 as builder 

WORKDIR /app

COPY package.json .

RUN npm install 

COPY . .

RUN npm run build


FROM node:18-alpine3.15

COPY --from=build /app/public .