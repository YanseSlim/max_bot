FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY requirements.txt ./
RUN npm install --omit=dev
COPY . .
CMD ["node", "app.js"]