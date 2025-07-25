# SMP-Core-Tools

SMP-Core-Tools est une bibliothèque regroupant plusieurs fonctions utilitaires, objets, et configurations à utiliser au sein des développements des autres micro-services. Elle n'est pas conçue pour être exécutée seule, mais pour fournir des outils communs et des configurations centralisées.

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation) 
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [Scripts](#scripts)
- [Tests](#tests)
- [Contribution](#contribution)

## Prérequis

Avant de commencer, assurez-vous d'avoir les éléments suivants installés sur votre machine :

- [Node.js](https://nodejs.org/) (version 14 ou supérieure)
- [npm](https://www.npmjs.com/)
- [RabbitMQ](https://www.rabbitmq.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Stripe](https://stripe.com/)

## Installation

Clonez le dépôt sur votre machine locale :

```bash
git clone https://github.com/sylorion/smp-core-tools.git
cd smp-core-tools
```

## Installez les dépendances :

```bash 
npm install
````
## Configuration

Avant d'utiliser la bibliothèque, vous devez configurer les variables d'environnement. Créez un fichier .env à la racine du projet et ajoutez les variables nécessaires :
 
## Utilisation

Cette bibliothèque est conçue pour être utilisée comme dépendance dans d'autres projets. Pour inclure smp-core-tools dans un autre projet, ajoutez-le simplement comme dépendance locale ou à partir du repos git dans le fichier package.json de ce projet :

```json 
{
  "dependencies": {
    "smp-core-tools": "file:../smp-core-tools"
  }
}
````

Ensuite, vous pouvez importer et utiliser les différentes fonctions et configurations fournies par smp-core-tools dans votre code :

```javascript 
const { cache, db, logger } = require('smp-core-tools');
const { authentication, authorization } = require('smp-core-tools');
```
Ou encore en utilisant la version recente du langage.
```javascript 
import { cache, db, logger } from 'smp-core-tools';
import { authentication, authorization } from 'smp-core-tools';
```

## Scripts
start: N'est pas applicable pour cette bibliothèque car elle n'est pas conçue pour être exécutée seule.
test: Exécute les tests avec Jest.

```bash
npm test
````

## Structure du projet

Voici la structure des dossiers et fichiers du projet :

```text 
smp-core-tools
├── logs
├── src
│   ├── brevo
│   │   └── brevo.js
│   ├── configs
│   │   ├── cache.js
│   │   ├── db.js
│   │   ├── env.js
│   │   ├── event.js
│   │   ├── logger.js
│   │   └── mailer.js
│   ├── handler
│   │   └── notificationHandler.js
│   ├── middleware
│   │   ├── index.js
│   │   ├── requestMiddleware.js 
│   │   └── tracer-provider.js
│   ├── rabbitMq
│   │   ├── handlerCRUDOperation.js
│   │   └── index.js
│   ├── SMPMailing
│   │   ├── brevo
│   │   └── MailingFactory.js
│   ├── SMPPayment
│   │   └── stripe.js
│   ├── utils
│   │   ├── authentication.js
│   │   ├── authorization.js
│   │   ├── context.js
│   │   ├── entityLoader.js
│   │   ├── entityMutation.js
│   │   ├── opentelemetry.js
│   │   ├── rateLimiting.js
│   │   └── SMPError.js
├── .gitignore
├── index.js
```

### Explication des principaux dossiers et fichiers
**brevo/** : Contient des intégrations pour le service de mailing Brevo.

**brevo.js** : Fichier de configuration pour Brevo.
**configs/** : Contient les fichiers de configuration pour différents services.

**cache.js** : Configuration du cache.
**db.js** : Configuration de la base de données.
**env.js** : Gestion des variables d'environnement.
**event.js** : Gestion des événements.
**logger.js** : Configuration du logger.
**mailer.js** : Configuration du service de mailing.
**handler/** : Contient les gestionnaires pour différents services.

**notificationHandler.js** : Fonctions par défaut de traitement de notifications.
**middleware/** : Contient les fonctions basics exécutées au niveau du middlewares de l'application.

**index.js** : Point d'entrée pour les fonctions middlewares.
**requestMiddleware.js** : Middleware pour les requêtes.
**tracer-provider.js** : Fournisseur de traces pour l'application.
**rabbitMq/** : Contient des intégrations pour RabbitMQ.

**handlerCRUDOperation.js** : Gestionnaire des opérations CRUD via RabbitMQ.
**index.js** : Point d'entrée pour RabbitMQ.
**SMPMailing/** : Contient les services de mailing.

**MailingFactory.js** : Fabrique pour les services de mailing.
**SMPPayment/** : Contient les services de paiement.

**stripe.js** : Intégration avec Stripe.
**utils/** : Contient les utilitaires utilisés par l'application.

**authentication.js** : Utilitaires pour l'authentification.
**authorization.js** : Utilitaires pour l'autorisation.
**context.js** : Gestion du contexte de l'application.
**entityLoader.js** : Chargement des entités.
**entityMutation.js** : Mutation des entités.
**opentelemetry.js** : Intégration avec OpenTelemetry.
**rateLimiting.js** : Gestion du rate limiting.
**SMPError.js** : Gestion des erreurs spécifiques à l'application.

## Tests

Pour exécuter les tests, utilisez la commande suivante :

```bash
npm test
````
Cette commande exécute les tests avec Jest.

## Contribution

Les contributions sont les bienvenues ! Veuillez soumettre une pull request pour toute amélioration, bug fix ou nouvelle fonctionnalité. Assurez-vous de suivre les lignes directrices de contribution et de bien documenter vos modifications.