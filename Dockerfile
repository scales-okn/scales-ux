FROM node:lts-alpine AS client-build
WORKDIR /app
COPY client client
RUN cd client && npm install && npm run build

FROM node:lts-alpine AS server-build
WORKDIR /app
COPY server server
COPY --from=client-build /app/client/build server/client/build
RUN cd server && npm install && npm run build

EXPOSE 8080

CMD ["node", "server/build"]

