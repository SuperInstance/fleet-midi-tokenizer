FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip && \
    pip3 install music21 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "-e", "console.log(require('./lib/tokenizer'))"]
