FROM node:20-slim

WORKDIR /app

COPY . .

ENV NODE_ENV=production

RUN npm install -g mcp-proxy@6.4.3

CMD ["mcp-proxy", "--", "node", "src/cli.js", "mcp"]
