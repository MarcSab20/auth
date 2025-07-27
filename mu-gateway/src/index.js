// src/index.js
import { modelUser, modelProfile, modelUserPreferences, modelDocumentation, modelService, modelTopic } from 'smp-core-schema'
import { db } from "smp-core-tools"

const User = modelUser(db)
const Profile = modelProfile(db)
const UserPreferences = modelUserPreferences(db)
const Documentation = modelDocumentation(db)
const Topic = modelTopic(db)
const Service = modelService(db)

// User a un Profile
User.hasOne(Profile, {
  onDelete: 'NO ACTION',
  onUpdate: 'NO ACTION',
  foreignKey: 'profileID', // Assurez-vous que ceci correspond au champ de clé étrangère que vous avez dans User pour Profile
  as: 'profile', // Optionnel: définir un alias pour les requêtes
});

// Profile appartient à User
Profile.belongsTo(User, {
  onDelete: 'NO ACTION',
  onUpdate: 'NO ACTION',
  foreignKey: 'profileID',
  as: 'user', // Optionnel: définir un alias pour les requêtes
});

UserPreferences.belongsTo(User, {
  onDelete: 'NO ACTION',
  onUpdate: 'NO ACTION',
  foreignKey: 'userID',
  as: 'preferences', // Optionnel: définir un alias pour les requêtes
})

// Profile a une Place
// Profile.hasOne(Place, {
//   onDelete: 'NO ACTION',
//   onUpdate: 'NO ACTION',
//   foreignKey: 'placeID', // Assurez-vous que ceci correspond au champ de clé étrangère que vous avez dans User pour Profile
//   as: 'place', // Optionnel: définir un alias pour les requêtes
// });

// User.hasMany(Place, {
//   onDelete: 'NO ACTION',
//   onUpdate: 'NO ACTION',
//   foreignKey: 'authorID',
//   as: 'places'
// });

// User.hasMany(Application, {
//   onDelete: 'NO ACTION',
//   onUpdate: 'NO ACTION',
//   foreignKey: 'authorID',
//   as: 'applications'
// });

// User.hasMany(UserToken, {
//   onDelete: 'NO ACTION',
//   onUpdate: 'NO ACTION',
//   foreignKey: 'authorID', 
// });

// UserToken.belongsTo(User, {
//   onDelete: 'NO ACTION',
//   onUpdate: 'NO ACTION',
//   foreignKey: 'authorID', 
// });

// User.hasMany(Media, {
//   onDelete: 'NO ACTION',
//   onUpdate: 'NO ACTION',
//   foreignKey: 'authorID',
// });

// Media.belongsTo(User, {
//   onDelete: 'NO ACTION',
//   onUpdate: 'NO ACTION',
//   foreignKey: 'authorID'
// });

// const initDb = async (modelPaths) => {
//   await async.each((modelPath) => {
//     const model = require(modelPath)(db, Sequelize.DataTypes);
//     await model.sync();
//   });
//
//   if (dbConfig.sync) {
//     await db.sync();
//   }
//   return db;
// };

//
// initDb(modelArray)
//   .then((db) => {
//     console.log('Database initialized successfully.');
//     // You can use 'db' to perform database operations
//   })
//   .catch((err) => {
//     console.error('Error initializing database:', err);
//   });
//
export { db };
