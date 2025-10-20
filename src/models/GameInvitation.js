import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GameInvitation = sequelize.define('GameInvitation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'players', key: 'id' },
    onDelete: 'CASCADE',
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'players', key: 'id' },
    onDelete: 'CASCADE',
  },
  gameId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'games', key: 'id' },
    onDelete: 'SET NULL',
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
  sentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'game_invitations',
  timestamps: false,
});

export default GameInvitation;
