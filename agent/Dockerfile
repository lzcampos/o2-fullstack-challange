FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Install curl for health checks and model creation
RUN apk add --no-cache curl

RUN npm run build

EXPOSE 3003

CMD ["npm", "start"] 