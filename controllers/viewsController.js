const Tour = require('../models/tourModel'); // Assuming you have a Tour model defined
const catchAsync = require('../utils/catchAsync'); // Assuming you have a catchAsync utility function

const getOverview = catchAsync(async (req, res, next) => {
    // get the tours from the database or any data source
    const tours = await Tour.find(); // Fetch all tours from the database
    // build template data

    // render the overview page with the data

    res.render('overview', {
        title: 'Overview',
        tours,
    });
});

const getTour = catchAsync(async (req, res, next) => {
    const tourSlug = req.params.slug;
    const tour = await Tour.findOne({ slug: tourSlug }).populate({
        path: 'reviews',
        select: 'review rating user',
    });
    if (!tour) {
        return res.status(404).render('error', {
            title: 'Tour Not Found',
            message: 'The requested tour could not be found.',
        });
    }

    res.render('tour', {
        title: tour.name,
        description: 'This is the tour details page.',
        tour: tour,
    });
});

const getLoginForm = (req, res) => {
    res.render('login', {
        title: 'Login',
        description: 'Please log in to continue.',
    });
};

const getBase = (req, res) => {
    res.render('base', {
        title: 'Base Page',
        description: 'This is the base page.',
    });
};

module.exports = {
    getOverview,
    getTour,
    getBase,
    getLoginForm,
    // Add other view controller functions as needed
};
