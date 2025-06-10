FROM node:18-alpine AS builder
WORKDIR /app
COPY polyprep-web/package*.json ./

RUN npm install
COPY polyprep-web/ ./
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY polyprep-web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]