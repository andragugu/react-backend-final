const express = require('express');
const {
    getBooks,
    getBook,
    addBook,
    updateBook,
    deleteBook
} = require('../controllers/books');

const Book = require('../models/Book');

const router = express.Router({mergeParams: true});

const advancedResults = require('../middleware/advancedResults');
const {protect, authorize} = require('../middleware/auth');

router
    .route('/')
    .get(
        advancedResults(Book, {
            path: 'house',
            select: 'name description'
        }),
        getBooks
    )
    .post(protect, authorize('publisher', 'admin'), addBook);

router
    .route('/:id')
    .get(getBook)
    .put(protect, authorize('publisher', 'admin'), updateBook)
    .delete(protect, authorize('publisher', 'admin'), deleteBook);

module.exports = router;
