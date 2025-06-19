const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const mongosanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const cookieParser = require('cookie-parser');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const vewRouter = require('./routes/viewRoutes');
const { get } = require('http');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Origin',
        'X-Requested-With',
        'Accept',
    ],
};

if (process.env.NODE_ENV === 'development') {
    // Enable CORS for all routes
    app.use(cors(corsOptions));

    // Handle preflight requests explicitly
    app.options('*', cors(corsOptions));

    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: [
                        "'self'",
                        'https://gc.kis.v2.scr.kaspersky-labs.com',
                    ],
                    styleSrc: [
                        "'self'",
                        "'unsafe-inline'",
                        'https://fonts.googleapis.com',
                    ],
                    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                    connectSrc: [
                        "'self'",
                        'ws://localhost:63669',
                        'http://127.0.0.1:3000',
                        'http://localhost:3000',
                        'https://gc.kis.v2.scr.kaspersky-labs.com',
                    ],
                    imgSrc: ["'self'", 'data:'],
                },
            },
        })
    );
    app.use(morgan('dev'));
} else {
    // Production CORS - more restrictive
    app.use(
        cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || false,
            credentials: true,
        })
    );

    app.use(helmet());
}
// Data sanitization against NoSQL query injection
app.use(mongosanitize());

//data sanitization against xss attacks
app.use(xss());

app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers);
    console.log(req.cookies);
    next();
});

app.use('/', vewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
