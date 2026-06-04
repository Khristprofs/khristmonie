module.exports = (sequelize, DataTypes) => {
    const Profile = sequelize.define('Profile', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        gender: DataTypes.ENUM('Male','Female'),
        occupation: DataTypes.STRING,
        civilStatus: DataTypes.ENUM('Single','Married','Widowed','Separated','Divorced'),
        nationality: DataTypes.STRING,
        contactNumber: DataTypes.STRING,
        address: DataTypes.STRING,
        bio: DataTypes.TEXT,
    }, {
        tableName: 'profiles',
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated',
        paranoid: true,
    });

    Profile.associate = (models) => {
        Profile.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return Profile;
};