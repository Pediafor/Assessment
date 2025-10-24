FROM node:20-bullseye-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/* \
	&& npm ci

COPY . .

RUN npm run build && npx prisma generate

EXPOSE 4005

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
