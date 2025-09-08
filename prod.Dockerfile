FROM node:22-alpine3.19 as build

RUN mkdir -p /usr/src/app

COPY ["app-angular/package.json", "app-angular/package-lock.json", "/usr/src/app/"]

COPY ["app-angular", "/usr/src/app/"]

WORKDIR /usr/src/app

RUN npm install -g npm@9.6.4

RUN npm install

RUN npm run build --prod --omit=dev

FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /usr/src/app/dist/Modernize /usr/share/nginx/html