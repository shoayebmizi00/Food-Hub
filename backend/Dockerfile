FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npm run prisma:generate
COPY src ./src

ENV NODE_ENV=production
EXPOSE 10000

CMD ["sh", "-c", "npm run db:deploy && npm start"]
