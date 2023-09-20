FROM node:20-alpine as builder

RUN mkdir -p /app/scales-ux-server

WORKDIR /app/scales-ux-server

COPY . .

RUN npm install --legacy-peer-deps

RUN npm run build

RUN npm prune --omit=dev --legacy-peer-deps && npm cache clean --force

FROM node:20-alpine

WORKDIR /app/scales-ux-server

COPY --from=builder /app/scales-ux-server/build ./build

COPY --from=builder /app/scales-ux-server/node_modules ./node_modules

EXPOSE 8080

CMD ["node", "build/index.js"]