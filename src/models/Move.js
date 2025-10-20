import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Move = sequelize.define('Move', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  playerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 8,
    },
  },
  symbol: {
    type: DataTypes.ENUM('X', 'O'),
    allowNull: false,
  },
  moveNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'moves',
  timestamps: true,
});

export default Move;
