build:
	(docker network rm rentality-build-network || true) && docker network create rentality-build-network
		
	docker build . -f Dockerfile.ganache -t ganache-rentality:latest
	docker run -d --name ganache-build --network rentality-build-network ganache-rentality:latest

	cd ../demo-rentality-web3-contracts; \
	docker build . --network rentality-build-network -t contracts-rentality:latest

	docker volume rm abis-volume || true
	docker run -it --name contracts-build -v abis-volume:/home/app/src/abis contracts-rentality echo abis
	export DOCKER_BUILDKIT=0 && docker build . --network rentality-build-network -t nextjs-rentality:latest

	(docker stop ganache-build || true) && docker rm ganache-build
	(docker stop contracts-build || true) && docker rm contracts-build
	docker network rm rentality-build-network
up:
	docker volume rm rentality-nextjs-localnodes || true
	sudo rm -rf node_modules || true && mkdir node_modules
	docker compose up -d nextjs --remove-orphans
	docker exec nextjs cp -a /home/abis-volume/. /home/app/src/abis/
	which xdg-open && xdg-open http://localhost:3000 1>/dev/null 2>&1
down:
	docker compose down
	sudo rm -rf node_modules
	
reload: down up
