const User = require('./User');
const Recipe = require('./Recipe');
const Comment = require('./Comment');

// User associations
User.hasMany(Recipe, { foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });

// Recipe associations
Recipe.belongsTo(User, { foreignKey: 'userId' });
Recipe.hasMany(Comment, { foreignKey: 'recipeId' });

// Comment associations
Comment.belongsTo(User, { foreignKey: 'userId' });
Comment.belongsTo(Recipe, { foreignKey: 'recipeId' });

module.exports = {
  User,
  Recipe,
  Comment
}; 