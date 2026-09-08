# --- Dockerfile: backend (NestJS API) ---
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# start:dev runs Nest in watch mode, so code changes reload automatically —
# same reasoning as the frontend's dev server.
CMD ["npm", "run", "start:dev"]
