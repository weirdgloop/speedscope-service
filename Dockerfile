FROM node:22-slim AS ui-builder

WORKDIR /speedscope
RUN apt-get update -y \
    && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/jlfwong/speedscope.git --depth 1

WORKDIR /speedscope/speedscope
RUN npm ci
RUN node_modules/.bin/tsx scripts/build-release.ts --outdir dist --protocol http

FROM node:22-slim AS service-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

RUN npm prune --omit=dev

FROM node:22-slim

WORKDIR /app

RUN apt-get update -y \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=service-builder /app/node_modules ./node_modules
COPY --from=service-builder /app/dist ./dist
COPY --from=service-builder /app/package*.json ./
COPY --from=service-builder /app/prisma ./prisma
COPY --from=service-builder /app/prisma.config.ts ./prisma.config.ts

COPY --from=ui-builder /speedscope/speedscope/dist ./ui

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
