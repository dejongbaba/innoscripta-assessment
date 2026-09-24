FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_GUARDIAN_API_KEY
ARG VITE_NEWSAPI_AI_API_KEY
ARG VITE_NYT_API_KEY
ENV VITE_GUARDIAN_API_KEY=$VITE_GUARDIAN_API_KEY
ENV VITE_NEWSAPI_AI_API_KEY=$VITE_NEWSAPI_AI_API_KEY
ENV VITE_NYT_API_KEY=$VITE_NYT_API_KEY

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:10000/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
