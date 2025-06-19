const express = require('express');
const reviewController = require('../controllers/reviewController');
const reviewRouter = express.Router({ mergeParams: true });
const authController = require('./../controllers/authController');

reviewRouter.use(authController.protect);
// Middleware to protect all routes after this point

reviewRouter
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.restrictTo('user'), reviewController.createReview);

reviewRouter
    .route('/:id')
    .get(reviewController.getReview)
    .patch(
        authController.restrictTo('user', 'admin'),
        reviewController.updateReview
    )
    .delete(
        authController.restrictTo('user', 'admin'),
        reviewController.deleteReview
    );

module.exports = reviewRouter;
