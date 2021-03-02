const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const House = require('../models/House');

// @desc      Get all houses
// @route     GET /api/v1/houses
// @access    Public
exports.getHouses = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc      Get single house
// @route     GET /api/v1/houses/:id
// @access    Public
exports.getHouse = asyncHandler(async (req, res, next) => {
    const house = await House.findById(req.params.id);

    if (!house) {
        return next(
            new ErrorResponse(`House not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({success: true, data: house});
});

// @desc      Create new house
// @route     POST /api/v1/houses
// @access    Private
exports.createHouse = asyncHandler(async (req, res, next) => {
    // Add user to req,body
    req.body.user = req.user.id;

    // Check for published house
    const publishedHouse = await House.findOne({user: req.user.id});

    // If the user is not an admin, they can only add one house
    if (publishedHouse && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user with ID ${req.user.id} has already published a house`,
                400
            )
        );
    }

    const house = await House.create(req.body);

    res.status(201).json({
        success: true,
        data: house
    });
});

// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateHouse = asyncHandler(async (req, res, next) => {
    let house = await House.findById(req.params.id);

    if (!house) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is bootcamp owner
    if (house.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this bootcamp`,
                401
            )
        );
    }

    house = await House.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({success: true, data: house});
});

// @desc      Delete bootcamp
// @route     DELETE /api/v1/houses/:id
// @access    Private
exports.deleteHouse = asyncHandler(async (req, res, next) => {
    const house = await House.findById(req.params.id);

    if (!house) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is bootcamp owner
    if (house.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete this house`,
                401
            )
        );
    }

    await house.remove();

    res.status(200).json({success: true, data: {}});
});


// @desc      Upload photo for bootcamp
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private
exports.housePhotoUpload = asyncHandler(async (req, res, next) => {
    const house = await House.findById(req.params.id);

    if (!house) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is bootcamp owner
    if (house.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this bootcamp`,
                401
            )
        );
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
                400
            )
        );
    }

    // Create custom filename
    file.name = `photo_${house._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await House.findByIdAndUpdate(req.params.id, {photo: file.name});

        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});
