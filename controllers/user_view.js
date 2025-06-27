const { Bank, sequelize } = require('../models');
const Branch = require('../models/Branch');
const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcrypt');


exports.createUser = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            firstname,
            middlename,
            lastname,
            email,
            phone,
            nin,
            role,
            DOB,
            branchId,
            password,
            profile // profile data comes nested
        } = req.body;
        // Validate required fields
        if (!firstname || !lastname || !email || !role || !branchId || !password) {
            return res.status(400).json({ message: 'Required fields are missing' });
        }
        // Validate email format
        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        // Validate phone number format (optional)
        if (phone && !/^[0-9]+$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must contain only digits' });
        }
        // Validate NIN format (optional)
        if (nin && !/^[A-Z0-9]+$/.test(nin)) {
            return res.status(400).json({ message: 'NIN must contain only uppercase letters and digits' });
        }
        // Validate role
        const validRoles = ['admin', 'staff', 'customer', 'bank_admin', 'customer_service']; // Define valid roles
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }
        // Check if the branch exists
        const branch = await Branch.findByPk(branchId);
        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' });
        }
        // Check if the email already exists
        const existingUser = await User.findOne({ where: { email, phone }, transaction: t });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedNin = await bcrypt.hash(nin, 10);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the User
        const newUser = await User.create({
            firstname,
            middlename,
            lastname,
            email,
            phone,
            nin: hashedNin,
            role,
            DOB,
            branchId,
            password: hashedPassword
        }, { transaction: t });

        // Create the Profile linked to this User
        const newProfile = await Profile.create({
            userId: newUser.id,
            profilePicture: profile?.profilePicture || null,
            gender: profile?.gender,
            occupation: profile?.occupation || '',
            civilStatus: profile?.civilStatus,
            nationality: profile?.nationality,
            contactNumber: profile?.contactNumber,
            address: profile?.address,
            bio: profile?.bio || '',
            passwordResetToken: profile?.passwordResetToken || null,
            refreshToken: profile?.refreshToken || null
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            message: 'User and profile created successfully',
            user: newUser,
            profile: newProfile
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: 'Failed to create user and profile',
            error: error.message
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;

        const users = await User.findAll({
            where: role ? { role } : {},
            include: [
                { model: Branch, as: 'branch' },
                { model: Profile, as: 'profile' }
            ]
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [
                { model: Branch, as: 'branch' },
                { model: Profile, as: 'profile' }
            ]
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
};

exports.getUsersByRole = async (req, res) => {
    const { role } = req.params;
    try {
        const users = await User.findAll({
            where: { role },
            include: ['profile', 'branch'],
        });

        if (!users.length) {
            return res.status(404).json({ message: 'No users found for that role' });
        }

        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users by role', error: error.message });
    }
};


exports.getUsersByBank = async (req, res) => {
    try {
        const { bankId } = req.params;

        const users = await User.findAll({
            include: [
                {
                    model: Branch,
                    as: 'branch',
                    where: { bankId },
                },
                {
                    model: Profile,
                    as: 'profile',
                },
            ],
        });

        res.status(200).json({ count: users.length, users });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get users by bank', error: error.message });
    }
};

exports.getUsersByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;

        const users = await User.findAll({
            where: { branchId },
            include: [
                { model: Branch, as: 'branch' },
                { model: Profile, as: 'profile' },
            ],
        });

        res.status(200).json({ count: users.length, users });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get users by branch', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for real changes (safe comparison)
    const hasChanges = Object.keys(updates).some((key) => {
      const currentValue = user[key];
      const newValue = updates[key];
      return newValue !== undefined && newValue !== currentValue;
    });

    if (!hasChanges) {
      return res.status(200).json({ message: 'No changes detected' });
    }

    await user.update(updates);

    return res.status(200).json({
      message: 'User updated successfully',
      user,
    });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({
      message: 'Error updating user',
      error: error.message,
    });
  }
};




exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await User.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};