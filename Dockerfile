FROM node:20-bullseye-slim AS base

RUN apt-get update && \
 apt-get install --no-install-recommends -y \
 build-essential
RUN apt clean && rm -rf /var/lib/apt/lists/*

FROM base AS nextjs

RUN mkdir -p /home/app
WORKDIR /home/app

COPY . .

RUN npm install

EXPOSE 3000

ENTRYPOINT ["npm", "run", "dev"]
