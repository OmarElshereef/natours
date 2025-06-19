const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const User = require('./../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');

/* const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    },
}); */
const multerStorage = multer.memoryStorage(); // Store images in memory

const multerFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images.', 400),
            false
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    // Resize the image using sharp or any other image processing library
    const sharp = require('sharp');
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.path)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

const updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for updating password please use /update-password',
                400
            )
        );
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    );
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

const deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.user.id);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

const getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined',
    });
};

const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined',
    });
};

const updateUser = factory.updateOne(User);
// Do NOT update passwords with this

const deleteUser = factory.deleteOne(User);

module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
    uploadUserPhoto,
    resizeUserPhoto,
};
