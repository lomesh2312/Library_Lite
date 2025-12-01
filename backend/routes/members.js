const express = require('express');
const router = express.Router();

const { createMember, getMembers, deleteMember } = require('../controllers/memberController');

router.post('/', createMember);
router.get('/', getMembers);

router.delete('/:id', deleteMember);

module.exports = router;
