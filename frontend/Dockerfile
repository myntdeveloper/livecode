FROM node:25-alpine AS builder

WORKDIR /frontend

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM alpine:latest

WORKDIR /frontend

COPY --from=builder /frontend/dist ./dist

CMD ["tail", "-f", "/dev/null"]