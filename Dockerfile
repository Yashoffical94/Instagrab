# Root-level Dockerfile for Railway auto-deploys.
# Railway's GitHub trigger builds from the repo root, so this file packages
# the backend from server/ (the API rejects setting rootDirectory via API).

FROM node:18-slim

# Install yt-dlp binary
RUN apt-get update && apt-get install -y curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY server/src ./src

EXPOSE 5000

CMD ["node", "src/server.js"]
