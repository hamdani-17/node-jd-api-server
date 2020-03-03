// review / rating / creatAt / ref to sale / ref to user
const mongoose = require ('mongoose');
const Sale = require('./saleModel');

const reviewSchema = new mongoose.Schema({
    review : {
        type: String,
        required: [true, 'review can not empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    sale: {
        type: mongoose.Schema.ObjectId,
        ref: 'Sale',
        required: [true, 'review must belong to the sale']
    },
    
    user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true,'review must belong to user' ]
    }
},
{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
}

);

reviewSchema.index({ sale: 1, user: 1}, { unique: true});

reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //   path: 'sale',
    //   select: 'name' // dont want need to display
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // })

    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
});

reviewSchema.statics.calcAverageRatings = async function(saleId) {
    const stats = await this.aggregate([
        {
            $match: {sale : saleId}
        },
        {
            $group: {
                _id: '$sale',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating'}
            }
        }
    ]);
    //console.log(stats);

    if(stats.length > 0) {
        await Sale.findByIdAndUpdate(saleId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Sale.findByIdAndUpdate(saleId, {
            ratingsQuantity: 0,
            ratingsAverage: 4
        });
    }
};

reviewSchema.post('save', function() {
    // this point to current review
    this.constructor.calcAverageRatings(this.sale);

});


reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    //console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    //await this.findOne(); does not work bcs query already executed
   await this.r.constructor.calcAverageRatings(this.r.sale);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;