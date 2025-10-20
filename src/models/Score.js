import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Score = sequelize.define('Score', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  playerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  result: {
    type: DataTypes.ENUM('win', 'loss', 'draw'),
    allowNull: false,
  }

}, {
  tableName: 'scores',
  timestamps: false,
});

export default Score;
