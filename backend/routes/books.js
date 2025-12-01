const express = require('express');
const router = express.Router();
const { getBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/bookController');

const upload = require('../middleware/upload');

router.get('/', getBooks);
router.get('/:id', getBookById);

router.post('/', createBook);

router.put('/:id', upload.single('coverImage'), updateBook);

router.delete('/:id', deleteBook);

module.exports = router;
