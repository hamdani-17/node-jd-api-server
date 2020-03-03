const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanatize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const AppError = require('./utils/appError');
const golabalErrorHandler = require('./controllers/errorController');
const saleRouter = require('./routes/saleRoutes');
const userRouter = require('./routes/userRoutes');
const hoodRouter = require('./routes/hoodRoutes');
const amenRouter = require('./routes/amenRoutes');
const rentalRouter = require('./routes/rentalRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES
// set security http headers
app.use(helmet());

app.use(cors());

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this ip , please try again in hour!'
});
app.use('/api', limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// data sanitizations nosql query injections
app.use(mongoSanatize());

// data sanitizations against xxs
app.use(xss()); // prevent from malicious

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'place',
      'price',
      'area',
      'bedroom',
      'bathroom',
      'rental_price',
      'duration',
      'p_type'
    ]
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3) ROUTES
app.use('/api/v1/sale', saleRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/hood', hoodRouter);
app.use('/api/v1/amenities', amenRouter);
app.use('/api/v1/rental', rentalRouter);

// This endpoint is to secure a handshake with clientside.
// You may remove this before hitting production.
// This is for development only`
app.get('/api/connection', async (req, res) => {
  res.status = 200;
  res.json({ status: 'connected' });
});

//Should be the last part after run all url
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find  ${req.originalUrl} on this server!!`, 404));
});

//Error middle ware -- tutorial put in controller and import as golabalErrorHandler
app.use(golabalErrorHandler);

module.exports = app;

