import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const ApiStat = sequelize.define('ApiStat', {
  endpointAccess: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  requestMethod: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  statusCode: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  responseTime: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: { avg: 0, min: 0, max: 0 }
  },
  requestCount: { 
    type: DataTypes.INTEGER, 
    defaultValue: 1 
  },
  timestamp: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  userId: { 
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users', // nombre de la tabla
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
});

// Relación Sequelize
ApiStat.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ApiStat, { foreignKey: 'userId' });

export default ApiStat;
