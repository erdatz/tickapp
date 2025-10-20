import ApiStat from './ApiStat.js';
import Game from './Game.js';
import Player from './Player.js';
import Score from './Score.js';
import User from './User.js';
import GamePlayer from './GamePlayer.js';
import Move from './Move.js';
import GameInvitation from './GameInvitation.js';
import ServerLog from './ServerLog.js';

/* ==============================
   RELACIONES ENTRE MODELOS
   ============================== */

// User ↔ Player (1:1)
User.hasOne(Player, { foreignKey: 'userId', as: 'player' });
Player.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Game ↔ Player (N:M) mediante GamePlayer
Game.belongsToMany(Player, { through: GamePlayer, foreignKey: 'gameId', as: 'players' });
Player.belongsToMany(Game, { through: GamePlayer, foreignKey: 'playerId', as: 'games' });

// GamePlayer ↔ Game (N:1)
GamePlayer.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });
Game.hasMany(GamePlayer, { foreignKey: 'gameId', as: 'gamePlayers' });

// GamePlayer ↔ Player (N:1)
GamePlayer.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });
Player.hasMany(GamePlayer, { foreignKey: 'playerId', as: 'gamePlayers' });

// Game ↔ Score (1:N)
Game.hasMany(Score, { foreignKey: 'gameId', as: 'scores' });
Score.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

// Player ↔ Score (1:N)
Player.hasMany(Score, { foreignKey: 'playerId', as: 'scores' });
Score.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

// Game ↔ Move (1:N)
Game.hasMany(Move, { foreignKey: 'gameId', as: 'moves' });
Move.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

// Player ↔ Move (1:N)
Player.hasMany(Move, { foreignKey: 'playerId', as: 'moves' });
Move.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

// Game ↔ GameInvitation (1:N)
Game.hasMany(GameInvitation, { foreignKey: 'gameId', as: 'invitations' });
GameInvitation.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

// Player ↔ GameInvitation (1:N) (sender / receiver)
Player.hasMany(GameInvitation, { foreignKey: 'senderId', as: 'sentInvitations' });
Player.hasMany(GameInvitation, { foreignKey: 'receiverId', as: 'receivedInvitations' });
GameInvitation.belongsTo(Player, { foreignKey: 'senderId', as: 'sender' });
GameInvitation.belongsTo(Player, { foreignKey: 'receiverId', as: 'receiver' });

// User ↔ ServerLog (1:N)
User.hasMany(ServerLog, { foreignKey: 'userId', as: 'logs' });
ServerLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ApiStat (relación opcional con User)
User.hasMany(ApiStat, { foreignKey: 'userId', as: 'apiStats' });
ApiStat.belongsTo(User, { foreignKey: 'userId', as: 'user' });

/* ==============================
   EXPORTACIÓN DE MODELOS
   ============================== */
export {
  Game,
  Player,
  Score,
  Move,
  User,
  GamePlayer,
  ApiStat,
  GameInvitation,
  ServerLog
};
