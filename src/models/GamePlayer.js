import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GamePlayer = sequelize.define('GamePlayer', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  gameId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  playerId: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  symbol: { 
    type: DataTypes.ENUM('X', 'O'), 
    allowNull: true 
  },
  joinedAt: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  isTurn: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
}, {
  tableName: 'game_players',
  timestamps: false,
});

export default GamePlayer;
