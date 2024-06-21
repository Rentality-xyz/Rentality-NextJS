build:
	docker rm -f contracts
	docker network create rentality-build-network
	docker build . --target ganache -t ganache-rentality:latest
	docker run -d --name ganache --network rentality-build-network ganache-rentality
	docker volume create abis-volume
	cd ../demo-rentality-web3-contracts; \
	docker build . --network rentality-build-network -t contracts-rentality:latest; \
	docker run --network rentality-build-network --mount source=abis-volume,target=/home/app/src/abis contracts-rentality npx hardhat compile
	docker run --network rentality-build-network --mount source=abis-volume,target=/home/app/src/abis contracts-rentality npx hardhat run --network ganache ./scripts/deploy_x_Rentality_full.js
	docker build . --target nextjs --network rentality-build-network -t nextjs-rentality:latest
	docker stop ganache
	docker rm -f ganache
	docker network rm rentality-build-network
up:
	docker compose up -d nextjs --remove-orphans

down:
	docker compose down
	
reload: down up
