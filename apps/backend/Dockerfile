# Backend Dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Production dependencies
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Build stage
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN bun run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=build /app/dist dist
COPY --from=build /app/package.json .

# Create data directory for SQLite
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["bun", "run", "start"]
