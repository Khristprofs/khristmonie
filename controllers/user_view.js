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
            bankId,
            profile
        } = req.body;

        // Validate required fields
        if (!firstname || !lastname || !email || !role || !password) {
            return res.status(400).json({ message: 'Required fields are missing' });
        }

        // Validate email
        if (!/^[\w.-]+@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Optional phone format
        if (phone && !/^[0-9]+$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number must contain only digits' });
        }

        // Optional NIN format
        if (nin && !/^[A-Z0-9]+$/.test(nin)) {
            return res.status(400).json({ message: 'NIN must contain only uppercase letters and digits' });
        }

        // Allowed roles
        const validRoles = ['admin', 'staff', 'customer', 'bank_admin', 'customer_service'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        // Only require branchId for non-admin roles
        const rolesThatRequireBranch = ['staff', 'customer', 'customer_service'];
        if (rolesThatRequireBranch.includes(role) && !branchId) {
            return res.status(400).json({ message: 'Branch ID is required for staff and customer roles' });
        }

        // Require bankId for bank_admin
        if (role === 'bank_admin' && !bankId) {
            return res.status(400).json({ message: 'bankId is required for bank_admin' });
        }

        // Require branchId for roles that are not admin or bank_admin
        if (!['admin', 'bank_admin'].includes(role) && !branchId) {
            return res.status(400).json({ message: 'branchId is required for this role' });
        }

        if (role === 'bank_admin') {
            const defaultBranch = await Branch.findOne({ where: { bankId } });
            if (!defaultBranch) {
                return res.status(404).json({ message: 'No default branch found for this bank' });
            }
            branchId = defaultBranch.id; // assign to user
        }
        let branch = null;
        if (branchId) {
            branch = await Branch.findByPk(branchId);
            if (!branch) {
                return res.status(404).json({ message: 'Branch not found' });
            }
        }

        // Ensure unique email or phone
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phone }]
            },
            transaction: t
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or phone already exists' });
        }

        // Hash credentials
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedNin = nin ? await bcrypt.hash(nin, 10) : null;

        // Create User
        const newUser = await User.create({
            firstname,
            middlename,
            lastname,
            email,
            phone,
            nin: hashedNin,
            role,
            DOB,
            branchId: branchId || null,
            password: hashedPassword
        }, { transaction: t });

        // Create Profile
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
            passwordResetToken: null,
            refreshToken: null
        }, { transaction: t });

        await t.commit();

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

exports.getUsersInBankByRole = async (req, res) => {
  const { bankId, role } = req.params;

  if (!bankId || !role) {
    return res.status(400).json({ message: "Both bankId and role are required" });
  }

  try {
    const users = await User.findAll({
      where: {
        bankId,
        role
      },
      attributes: { exclude: ['password'] } // Hide password field, optional
    });

    return res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users by bank and role:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUsersByRoleInBranch = async (req, res) => {
  try {
    const { branchId, role } = req.params;

    if (!branchId || !role) {
      return res.status(400).json({ message: 'Both branchId and role are required' });
    }

    const users = await User.findAll({
      where: {
        branchId,
        role: role.toLowerCase()
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users by role in branch:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};