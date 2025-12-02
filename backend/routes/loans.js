const express = require('express');
const router = express.Router();
const { issueBook, returnBook, getLoans, deleteLoan } = require('../controllers/loanController');

router.post('/', issueBook);
router.put('/:id/return', returnBook);
router.get('/', getLoans);

router.delete('/:id', deleteLoan);

module.exports = router;
