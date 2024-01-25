FROM node:20-alpine AS bundler

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . ./

RUN npm run build

FROM node:20-alpine AS dependencies

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json ./

RUN npm install --omit=dev

FROM node:20-alpine AS app

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=bundler /app/dist ./

CMD node main.js