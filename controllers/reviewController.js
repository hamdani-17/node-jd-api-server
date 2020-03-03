const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
// const catchasync = require('./../utils/catchAsync');


exports.setSaleUserIds = (req, res, next) => {
    // allow nested route
    if(!req.body.sale) req.body.sale = req.params.saleId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
}


exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne( Review );
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);