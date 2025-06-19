const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);

userRouter.post('/login', authController.login);
userRouter.post('/forgot-password', authController.forgotPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);

//protect all routes after this middleware
userRouter.use(authController.protect);

userRouter.patch('/update-password', authController.updatePassword);
userRouter.patch(
    '/update-me',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
);
userRouter.delete('/delete-me', userController.deleteMe);

userRouter.get('/me', userController.getMe);

userRouter.use(authController.restrictTo('admin'));
//only admin can access these routes

userRouter
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

userRouter
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = userRouter;
