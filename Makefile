build:
	docker stop ganache-build || true && docker rm -f ganache-build
	docker network rm rentality-build-network || true && docker network create rentality-build-network
		
	docker build . -f Dockerfile.ganache -t ganache-rentality:latest
	docker run -d --name ganache-build --network rentality-build-network ganache-rentality:latest
	
	docker volume rm abis-volume || true && docker volume create abis-volume
	
	cd ../demo-rentality-web3-contracts; \
	docker build . --network rentality-build-network -t contracts-rentality:latest; \
	docker compose up;
	
	docker build . --network rentality-build-network -t nextjs-rentality:latest
	
	docker stop ganache-build || true && docker rm -f ganache-build
	docker network rm rentality-build-network
up:
	docker volume rm rentality-nextjs-localnodes || true
	sudo rm -rf node_modules || true && mkdir node_modules
	docker compose up -d nextjs --remove-orphans
	docker exec nextjs cp -r /home/abis-volume /home/app/src/abis
	which xdg-open && xdg-open http://localhost:3000 1>/dev/null 2>&1
down:
	docker compose down --volumes
	sudo rm -rf node_modules
	
reload: down up
