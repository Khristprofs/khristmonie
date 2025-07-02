const Bank = require('../models/Bank');
const Branch = require('../models/Branch');

exports.createBranch = async (req, res) => {
    try {
        const { bankId, name, code, address, phone, city } = req.body;

        if (!bankId || !name || !code) {
            return res.status(400).json({ message: 'bankId, name, and code are required' });
        }
        // Check if the bank exists
        const bank = await Bank.findByPk(bankId);
        if (!bank) {
            return res.status(404).json({ message: 'Bank not found' });
        }
        // Check if the branch code is unique
        const existingBranch = await Branch.findOne({ where: { code } });
        if (existingBranch) {
            return res.status(400).json({ message: 'Branch code already exists' });
        }

        const branch = await Branch.create({
            bankId,
            name,
            code,
            address,
            phone,
            city,
        });

        res.status(201).json({ message: 'Branch created successfully', branch });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create branch', error: error.message });
    }
};

exports.getAllBranches = async (req, res) => {
    try {
        const branches = await Branch.findAll({
            include: {
                model: Bank,
                as: 'bank',
            },
        });
        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch branches', error: error.message });
    }
};

exports.getAllBranchesByBank = async (req, res) => {
  try {
    const { bankId } = req.params;

    const branches = await Branch.findAll({
      where: { bankId },
      order: [['created', 'DESC']] // optional sorting
    });

    if (!branches.length) {
      return res.status(404).json({ message: 'No branches found for this bank' });
    }

    res.status(200).json(branches);
  } catch (error) {
    console.error('Error fetching branches by bank:', error);
    res.status(500).json({ message: 'Failed to fetch branches', error: error.message });
  }
};

exports.getBranchById = async (req, res) => {
    try {
        const { id } = req.params;
        const branch = await Branch.findByPk(id, {
            include: {
                model: Bank,
                as: 'bank',
            },
        });

        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        res.status(200).json(branch);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch branch', error: error.message });
    }
};

exports.updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Branch.update(req.body, {
            where: { id },
        });

        if (updated[0] === 0) {
            return res.status(404).json({ message: 'Branch not found or no change detected' });
        }

        const updatedBranch = await Branch.findByPk(id);
        res.status(200).json({ message: 'Branch updated', branch: updatedBranch });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update branch', error: error.message });
    }
};

exports.deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Branch.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        res.status(200).json({ message: 'Branch deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete branch', error: error.message });
    }
};
