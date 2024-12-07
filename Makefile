init-local:
	git clone git@github.com:Rentality-xyz/Rentality-demo-contracts.git demo-rentality-web3-contracts
	rm -rf demo-rentality-web3-contracts/.git

	cp .env-nextjs.local demo-rentality-web3-contracts/.env
	cp .env-nextjs.local .env

clean-local:
	rm -rf demo-rentality-web3-contracts
	rm .env

build:
	(docker network rm rentality-build-network || true) && docker network create rentality-build-network

	docker build . -f Dockerfile.ganache -t ganache-rentality:latest
	docker run -d --name ganache-build --network rentality-build-network ganache-rentality:latest

	cd demo-rentality-web3-contracts; \
	export DOCKER_BUILDKIT=0 && docker build . --network rentality-build-network -t contracts-rentality:latest

	cp -R demo-rentality-web3-contracts/src/abis/ src/abis

	export DOCKER_BUILDKIT=0 && docker build . --network rentality-build-network -t nextjs-rentality:latest

	(docker stop ganache-build || true) && docker rm ganache-build
	docker network rm rentality-build-network

build-local: init-local build clean-local

up:
	docker volume rm rentality-nextjs-localnodes || true
	sudo rm -rf node_modules || true && mkdir node_modules
	docker compose up -d nextjs --remove-orphans
	which xdg-open && xdg-open http://localhost:3000 1>/dev/null 2>&1
down:
	docker compose down
	sudo rm -rf node_modules
	
reload: down up
