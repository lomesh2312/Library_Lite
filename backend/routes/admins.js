const express = require('express');

const router = express.Router();

const { getAdmins, addAdmin, deleteAdmin, updateAdmin } = require('../controllers/adminController');

const upload = require('../middleware/upload');

router.get('/', getAdmins);
router.post('/', upload.single('profileImage'), addAdmin);

router.delete('/:id', deleteAdmin);

router.put('/:id', upload.single('profileImage'), updateAdmin);

module.exports = router;
