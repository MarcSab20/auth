# Étape de construction
# ---------------------
FROM node:lts AS builder

# Crée un répertoire pour l'application
WORKDIR /usr/src/app

# Installe les fichiers de l'application
# Copie les fichiers `package.json` et `package-lock.json` (ou `yarn.lock`)
COPY package*.json ./ 

# Install Python and build dependencies
RUN apt-get install python3 make g++ && ln -sf python3 /usr/bin/python 
RUN npm install -g npm@10.2.3 

# Copie les sources de l'application
COPY . . 
# TRES TRES SALE MAIS ON FAIT AINSI EN ATTENDANT 
# DE BIEN CREER LES REPOS PAR LIB ET MICRO-SERVICE

# Installe les dépendances
RUN npm install
# Installer les dépendances - notez l'utilisation de `--production`
# pour éviter d'inclure les paquets de développement dans l'image finale
# RUN npm ci --only=production 

# Construit l'application si nécessaire
RUN npm run build  

# Étape de production
# -------------------
FROM node:lts AS production

# Informations sur le mainteneur
LABEL maintainer="jcnm@sylorion.com"  

# Crée un utilisateur non-root pour des raisons de sécurité
# RUN addgroup --system smp-group 
# RUN adduser --system smp-user --system --ingroup smp-group
# Create a non-root user for security reasons
RUN addgroup --system smp-group 
RUN adduser --system smp-user --ingroup smp-group
# Installe des outils nécessaires pour les packages natifs, puis les retire pour alléger l'image

# Définit le répertoire de travail pour l'utilisateur non-root
WORKDIR /home/smp-user

# Copie l'application construite depuis l'étape de construction
COPY --from=builder /usr/src/app/ ./ 

# Copie les fichiers `node_modules` (dépendances uniquement pour la production)
COPY --from=builder /usr/src/app/node_modules/ ./node_modules 

# Assure la possession des fichiers par l'utilisateur non-root
RUN chown -R smp-user:smp-group /home/smp-user 
# Utilise l'utilisateur non-root
USER smp-user

# Ouvre le port 4000 pour le serveur (GraphQL Yoga utilise 4000 par défaut)
EXPOSE 4000
ENV NODE_ENV=development \
    PORT=4000

# Définit le point d'entrée, par exemple "node" suivi du fichier de démarrage
# Remplacez `server.js` par le chemin du fichier de démarrage de votre application
CMD ["node", "gateway.mjs"]

