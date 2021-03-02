const express = require('express');
const {
    getHouses,
    getHouse,
    createHouse,
    updateHouse,
    deleteHouse,
    housePhotoUpload
} = require('../controllers/houses');

const House = require('../models/House');

// Include other resource routers
const courseRouter = require('./books');
const reviewRouter = require('./reviews');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const {protect, authorize} = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:houseId/books', courseRouter);
router.use('/:houseId/reviews', reviewRouter);


router
    .route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), housePhotoUpload);

router
    .route('/')
    .get(advancedResults(House, 'courses'), getHouses)
    .post(protect, authorize('publisher', 'admin'), createHouse);

router
    .route('/:id')
    .get(getHouse)
    .put(protect, authorize('publisher', 'admin'), updateHouse)
    .delete(protect, authorize('publisher', 'admin'), deleteHouse);

module.exports = router;
