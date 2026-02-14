# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app

# зависимости
COPY package*.json ./
RUN npm ci

# код
COPY . .
RUN npm run build

# ---------- RUN ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
