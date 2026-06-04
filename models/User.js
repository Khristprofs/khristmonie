module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    firstname: DataTypes.STRING,
    middlename: DataTypes.STRING,
    lastname: DataTypes.STRING,

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: DataTypes.STRING,
    nin: {
      type: DataTypes.STRING,
      unique: true,
    },

    role: {
      type: DataTypes.ENUM(
        'admin',
        'customer',
        'bank_admin',
        'staff',
        'customer_service'
      ),
      defaultValue: 'customer',
    },

    DOB: DataTypes.DATEONLY,
    branchId: DataTypes.INTEGER,
    bankId: DataTypes.INTEGER,

    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
    },
  }, {
    tableName: 'users',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  });

  User.associate = (models) => {
    User.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
    User.hasOne(models.Profile, { foreignKey: 'userId', as: 'profile' });
    User.hasMany(models.Transaction, { foreignKey: 'userId', as: 'transactions' });
    User.hasMany(models.Notification, { foreignKey: 'userId', as: 'notifications' });
    User.hasMany(models.Loan, { foreignKey: 'userId', as: 'loans' });
  };

  return User;
};