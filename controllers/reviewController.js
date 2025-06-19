const Tour = require('../models/tourModel');
const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');
const getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Review.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const reviews = await features.query;

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews,
        },
    });
});

const getReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            review,
        },
    });
});

const createReview = catchAsync(async (req, res) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview,
        },
    });
});
const updateReview = factory.updateOne(Review);

const deleteReview = factory.deleteOne(Review);

module.exports = {
    getAllReviews,
    getReview,
    createReview,
    deleteReview,
    updateReview,
};
