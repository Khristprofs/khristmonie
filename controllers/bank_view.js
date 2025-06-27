const Bank = require('../models/Bank');


exports.createBank = async (req, res) => {
    try {
        const { name, description, logo, code, address, country } = req.body;
        if (!name || !code) return res.status(400).json({ message: 'Bank name and code are required.' });
        const existing = await Bank.findOne({ where: { code } });
        if (existing) return res.status(400).json({ message: 'Bank code already exists.' });
        const bank = await Bank.create({ name, description, logo, code, address, country });
        return res.status(201).json({ message: 'Bank created successfully.', data: bank });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to create bank.', error: err.message });
    }
};

exports.getAllBanks = async (req, res) => {
    try {
        const banks = await Bank.findAll();
        return res.status(200).json({ message: 'Banks fetched successfully.', data: banks });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch banks.', error: err.message });
    }
};

exports.getBankById = async (req, res) => {
    try {
        const { id } = req.params;
        const bank = await Bank.findByPk(id);

        if (!bank) return res.status(404).json({ message: 'Bank not found.' });

        return res.status(200).json({ message: 'Bank fetched successfully.', data: bank });
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching bank.', error: err.message });
    }
};

exports.updateBank = async (req, res) => {
    try {
        const { id } = req.params;
        const bank = await Bank.findByPk(id);
        if (!bank) return res.status(404).json({ message: 'Bank not found.' });
        bank.name = req.body.name;
        bank.description = req.body.description;
        bank.logo = req.body.logo;
        bank.code = req.body.code;
        bank.address = req.body.address;
        bank.country = req.body.country;
        const updatedBank = await bank.save();
        return res.status(200).json({ message: 'Bank updated successfully.', data: updatedBank });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to update bank.', error: err.message });
    }
};

exports.deleteBank = async (req, res) => {
    try {
        const { id } = req.params;
        const bank = await Bank.findByPk(id);
        if (!bank) return res.status(404).json({ message: 'Bank not found.' });
        await bank.destroy();
        return res.status(200).json({ message: 'Bank deleted successfully.' });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to delete bank.', error: err.message });
    }
};