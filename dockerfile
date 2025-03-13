# Étape 1 : Utiliser une image de Node.js comme image de base
FROM node:16

# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier package.json et package-lock.json
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Exposer le port sur lequel l'app va tourner
EXPOSE 3000