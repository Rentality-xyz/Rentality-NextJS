FROM node:18-bullseye-slim AS base

RUN apt-get update && \
    apt-get install --no-install-recommends -y \
        build-essential
RUN apt clean && rm -rf /var/lib/apt/lists/*

FROM base AS ganache

RUN mkdir -p /home/app
WORKDIR /home/app

RUN npm install --global ganache

EXPOSE 8545

ENTRYPOINT ["ganache", "-h 0.0.0.0", "--wallet.accounts=0x18f36ba0a734b18c5e774c0c71d554266bcf5a9b53fefd1a0cb26ad85c313b98, 1000000000000000000000", "--wallet.accounts=0xa23105c5d0a799a046cd66051f359c696642b7ae36c9a689fd92e7db8f7e5f19, 1000000000000000000000"]

FROM base AS contracts

RUN mkdir -p /home/app
WORKDIR /home/app

COPY ./contracts .

RUN npm install

COPY ./docker/env.contracts .env

RUN npx hardhat compile
RUN npx hardhat run --network ganache ./scripts/deploy_x_Rentality_full.js

FROM base AS nextjs

RUN mkdir -p /home/app
WORKDIR /home/app

COPY . .
RUN rm -rf ./contracts

RUN npm install

COPY ./docker/env.nextjs .env
COPY --from=contracts /home/app/src/abis ./src/abis

EXPOSE 3000

ENTRYPOINT ["npm", "run", "dev"]
