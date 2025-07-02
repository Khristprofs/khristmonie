const { Bank, sequelize } = require('../models');
const Branch = require('../models/Branch');
const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const saltRounds = 10;


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

        // Validate NIN format only if provided
        if (nin && !/^[A-Z0-9]+$/.test(nin)) {
            return res.status(400).json({ message: 'NIN must contain only uppercase letters and digits' });
        }

        // Validate role
        const validRoles = ['admin', 'staff', 'customer', 'bank_admin', 'customer_service'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        // Check if the branch exists
        const branch = await Branch.findByPk(branchId);
        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        // Check if the email or phone already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phone }]
            },
            transaction: t
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or phone already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Only hash NIN if provided
        const hashedNin = nin ? await bcrypt.hash(nin, 10) : null;

        // Create the User
        const newUser = await User.create({
            firstname,
            middlename,
            lastname,
            email,
            phone,
            nin: hashedNin, // Will be null if nin wasn't provided
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
            passwordResetToken: null, // Should not be set at creation
            refreshToken: null // Should not be set at creation
        }, { transaction: t });

        await t.commit();

        // Remove sensitive data before sending response
        const userResponse = { ...newUser.get() };
        delete userResponse.password;
        delete userResponse.nin;

        res.status(201).json({
            message: 'User and profile created successfully',
            user: userResponse,
            profile: newProfile
        });
    } catch (error) {
        await t.rollback();
        console.error('Registration error:', error);
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
    let updates = { ...req.body }; // Create a copy of updates

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash password if being updated
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, saltRounds);
        }

        // Hash NIN if being updated
        if (updates.nin) {
            updates.nin = await bcrypt.hash(updates.nin, saltRounds);
        }

        // Check for actual changes (excluding undefined values)
        const hasChanges = Object.keys(updates).some(key => {
            // Skip comparison for hashed fields
            if (key === 'password' || key === 'nin') return true;
            
            const currentValue = user[key];
            const newValue = updates[key];
            return newValue !== undefined && newValue !== currentValue;
        });

        if (!hasChanges) {
            return res.status(200).json({ message: 'No changes detected' });
        }

        // Update only the changed fields
        await user.update(updates);

        // Remove sensitive data from response
        const userResponse = user.get();
        delete userResponse.password;
        delete userResponse.nin;
        delete userResponse.refreshToken;

        return res.status(200).json({
            message: 'User updated successfully',
            user: userResponse,
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
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }
        const deleted = await User.destroy({ where: { id } });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};