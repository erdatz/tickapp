import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
  },
  status: {
    type: DataTypes.ENUM('waiting', 'active', 'finished', 'abandoned'),
    defaultValue: 'waiting',
  },
  boardState: {
    type: DataTypes.JSON,
    defaultValue: Array(9).fill(null),
  },
  currentPlayerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  winnerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  turnCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'games',
  timestamps: true,
});

export default Game;
