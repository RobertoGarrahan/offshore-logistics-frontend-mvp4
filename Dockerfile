# Usa uma imagem oficial leve do Node.js
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (otimiza o cache do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Faz o build de produção do Next.js
RUN npm run build

# Expõe a porta do Front-End
EXPOSE 3000

# Inicia a aplicação
CMD ["npm", "start"]