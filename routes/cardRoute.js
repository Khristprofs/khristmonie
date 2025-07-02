const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card_view');
const authenticateToken = require('../Middleware/authenticateToken');
const rolesList = require('../Helpers/roleList');
const verifyRoles = require('../Helpers/verifyRole');

router.route('/create')
    .post(
        authenticateToken, 
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff
        ), 
        cardController.createCard
    );
router.route('/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
        ),
        cardController.getAllCards
    );
router.route('/:bankId/')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
        ),
        cardController.getAllCardsByBank
    );
router.route('/:branchId/all')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
        ),
        cardController.getAllCardsByBranch
    );
router.route('/:cardId')
    .get(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff
        ),
        cardController.getCardById
    );

router.route('/:cardId/update')
    .put(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff
        ),
        cardController.updateCard
    );

router.route('/:cardId/delete')
    .delete(
        authenticateToken,
        verifyRoles(
            rolesList.admin,
            rolesList.bank_admin,
            rolesList.staff
        ),
        cardController.deleteCard
    );

module.exports = router;
