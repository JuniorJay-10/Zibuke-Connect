# --- Dockerfile: frontend ---
# This describes how to turn the frontend/ folder into a runnable image.
# For local dev (this Day 1 skeleton) we run Vite's own dev server inside
# the container, so you get hot-reload when you edit files.

FROM node:20-alpine

WORKDIR /app

# Copy just the dependency manifests first. Docker caches each instruction
# as a "layer" — as long as package.json doesn't change, Docker reuses the
# cached "npm install" layer instead of re-running it, so rebuilds are fast.
COPY package*.json ./
RUN npm install

# Now copy the rest of the source code.
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
