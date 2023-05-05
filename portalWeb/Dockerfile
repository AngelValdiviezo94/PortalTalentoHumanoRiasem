FROM node:18.12.1-alpine AS build
WORKDIR /app
EXPOSE 80
EXPOSE 443
COPY ./portalWeb/ .
RUN npm install --legacy-peer-deps

RUN npm run build --aot --outputHashing=all

FROM nginx:latest AS ngbuild
COPY --from=build /app/dist/portal-web /usr/share/nginx/html



