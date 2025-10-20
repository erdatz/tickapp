import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ServerLog = sequelize.define('ServerLog', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  eventType: {
    type: DataTypes.STRING, 
    allowNull: false
  },
  message: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  metadata: { 
    type: DataTypes.JSON, 
    allowNull: true 
  },
  timestamp: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
}, {
  tableName: 'server_logs',
  timestamps: false,
});

export default ServerLog;
