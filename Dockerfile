FROM node:8.9.4-alpine
WORKDIR /usr/app
COPY . .
ENV HOST 0.0.0.0
ENV HTTP_PORT 8080
ENV GRPC_PORT 10382
RUN npm install --production
RUN ln -s ./node_modules/.bin/livenessProbe && ln -s ./node_modules/.bin/readinessProbe
EXPOSE 8080 10382
CMD ["node", "server.js"]
