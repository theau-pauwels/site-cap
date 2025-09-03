FROM node:20
WORKDIR /app

# Copie uniquement les manifests pour profiter du cache Docker
COPY package.json package-lock.json* ./

RUN npm install

# Copie du reste du code
COPY . .

# Lancer le serveur de dev Astro exposé
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--watch"]
