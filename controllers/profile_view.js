const Profile = require('../models/Profile');
const User = require('../models/User');

exports.createProfile = async (req, res) => {
    try {
        const { userId, profilePicture, gender, occupation, civilStatus, nationality, contactNumber, address, bio, passwordResetToken, refreshToken } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Validate that the user exists
        const existingUser = await User.findOne({ where: { userId } });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the profile already exists for this user
        const existingProfile = await Profile.findOne({ where: { userId } });
        if (existingProfile) {
            return res.status(400).json({ message: 'Profile already exists for this user' });
        }

        const profile = await Profile.create({
            userId,
            profilePicture,
            gender,
            occupation,
            civilStatus,
            nationality,
            contactNumber,
            address,
            bio,
            passwordResetToken,
            refreshToken
        });

        return res.status(201).json({ message: 'Profile created successfully', profile });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create profile', error: error.message });
    }
}

exports.getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.findAll();
        return res.status(200).json(profiles);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch profiles', error: error.message });
    }
};

exports.getProfileById = async (req, res) => {
    const { id } = req.params;
    try {
        const profile = await Profile.findByPk(id);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        return res.status(200).json(profile);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const [updated] = await Profile.update(req.body, { where: { id } });

        if (!updated) {
            return res.status(200).json({ message: 'No changes detected' });
        }

        const updatedProfile = await Profile.findByPk(id);
        return res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

exports.deleteProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Profile.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        return res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete profile', error: error.message });
    }
};