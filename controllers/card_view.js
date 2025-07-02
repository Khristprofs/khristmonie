const { Card, Account } = require('../models');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const generateCVV = require('../Utilis/cvvGenerator');

// Create Card
exports.createCard = async (req, res) => {
    try {
        const {
            accountId,
            cardHolderName,
            cardType,       // 'Visa', 'MasterCard', etc.
            cardBrand,      // optional
            pin,
            expirationDate,
            isVirtual = false
        } = req.body;

        if (!accountId || !cardHolderName || !cardType || !pin || !expirationDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const account = await Account.findByPk(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        const existingCard = await Card.findOne({ where: { accountId } });
        if (existingCard) {
            return res.status(409).json({ message: 'This account already has a card' });
        }
        const cardNumber = '4' + Math.floor(1e14 + Math.random() * 9e14); // Visa‑style 15‑digit
        const lastFourDigits = cardNumber.slice(-4);
        const cvv = generateCVV(cardType);
        const hashedPin = await bcrypt.hash(pin, 10);

        // 5️⃣  Create the card
        const newCard = await Card.create({
            accountId,
            cardNumber,
            lastFourDigits,
            cardHolderName,
            cardType,
            cardBrand,
            pin: hashedPin,
            expirationDate,
            cvv,
            isVirtual,
            status: 'active',
            issuedAt: new Date()
        });

        res.status(201).json({ message: 'Card issued successfully', card: newCard });
    } catch (error) {
        console.error('Error issuing card:', error);
        res.status(500).json({ message: 'Failed to issue card', error: error.message });
    }
};

// Get all cards
exports.getAllCards = async (req, res) => {
    try {
        const cards = await Card.findAll({ include: ['account'] });
        res.status(200).json(cards);
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({ message: 'Failed to fetch cards' });
    }
};

exports.getAllCardsByBank = async (req, res) => {
    try {
        const { bankId } = req.params;

        const cards = await Card.findAll({
            include: {
                model: Account,
                as: 'account',
                where: { bankId },
                attributes: ['id', 'accountNumber', 'accountName']
            },
            order: [['created', 'DESC']]
        });

        if (!cards.length) {
            return res.status(404).json({ message: 'No cards found for this bank' });
        }

        res.status(200).json(cards);
    } catch (error) {
        console.error('Error fetching cards by bank:', error);
        res.status(500).json({ message: 'Failed to fetch cards', error: error.message });
    }
};

exports.getAllCardsByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;

        const cards = await Card.findAll({
            include: {
                model: Account,
                as: 'account',
                where: { branchId },
                attributes: ['id', 'accountNumber', 'accountName']
            },
            order: [['created', 'DESC']]
        });

        if (!cards.length) {
            return res.status(404).json({ message: 'No cards found for this branch' });
        }

        res.status(200).json(cards);
    } catch (error) {
        console.error('Error fetching cards by branch:', error);
        res.status(500).json({ message: 'Failed to fetch cards', error: error.message });
    }
};


// Get card by ID
exports.getCardById = async (req, res) => {
    try {
        const card = await Card.findByPk(req.params.cardId, { include: ['account'] });
        if (!card) return res.status(404).json({ message: 'Card not found' });
        res.status(200).json(card);
    } catch (error) {
        console.error('Error fetching card:', error);
        res.status(500).json({ message: 'Failed to fetch card' });
    }
};

// Update card status
exports.updateCard = async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const updates = req.body;

        // Prevent updating cardNumber and CVV
        if ('cardNumber' in updates || 'cvv' in updates) {
            return res.status(400).json({ message: 'cardNumber and CVV cannot be updated' });
        }

        const card = await Card.findByPk(cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        // Hash the new PIN if provided
        if (updates.pin) {
            updates.pin = await bcrypt.hash(updates.pin, 10);
        }

        // If status is being updated, check for side effects
        if (updates.status) {
            card.status = updates.status;

            if (updates.status === 'blocked') {
                card.blockedAt = new Date();
            } else if (updates.status === 'active') {
                card.blockedAt = null; // unblocking card
            }
        }

        // Apply other allowed fields
        const allowedFields = ['pin', 'status', 'expirationDate', 'cardHolderName', 'cardBrand', 'isVirtual'];
        allowedFields.forEach(field => {
            if (field in updates) {
                card[field] = updates[field];
            }
        });

        await card.save();

        res.status(200).json({ message: 'Card updated successfully', card });
    } catch (error) {
        console.error('Error updating card:', error);
        res.status(500).json({ message: 'Failed to update card', error: error.message });
    }
};


// Delete card
exports.deleteCard = async (req, res) => {
    try {
        const card = await Card.findByPk(req.params.cardId);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        await card.destroy();
        res.status(200).json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error('Error deleting card:', error);
        res.status(500).json({ message: 'Failed to delete card' });
    }
};
