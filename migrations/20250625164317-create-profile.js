module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('profiles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      profilePicture: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('Male', 'Female'),
        allowNull: false,
      },
      profilePicture: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      gender: {
        type: Sequelize.ENUM('Male', 'Female'),
        allowNull: false,
      },
      civilStatus: {
        type: Sequelize.ENUM('Single', 'Married', 'Widowed', 'Separated', 'Divorced'),
        allowNull: false,
      },
      nationality: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isAlpha: true,
        },
      },
      occupation: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isAlpha: true,
        },
      },
      contactNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isNumeric: true,
        },
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      passwordResetToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      refreshToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('profiles');
  }
};