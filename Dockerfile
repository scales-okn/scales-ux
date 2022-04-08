FROM node:lts-alpine AS client-build
WORKDIR /app
COPY client client
ARG SSH_PRIVATE_KEY
RUN apk update && apk add openssh git && mkdir -p /root/.ssh/ && \
    echo "StrictHostKeyChecking no " > /root/.ssh/config && \
    echo "$SSH_PRIVATE_KEY" > /root/.ssh/id_rsa && \
    chmod 600 /root/.ssh/id_rsa && \
    touch /root/.ssh/known_hosts && \
    ssh-keyscan github.com >> /root/.ssh/known_hosts
RUN cd client && npm install && npm run build

FROM node:lts-alpine AS server-build
WORKDIR /app
COPY server server
COPY --from=client-build /app/client/build server/client/build
RUN cd server && npm install && npm run build

EXPOSE 8080

CMD ["node", "server/build"]

