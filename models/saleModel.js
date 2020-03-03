const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const slugify = require('slugify');
const mongoosePaginate = require('mongoose-paginate');
// const User = require ('./userModel');
// const validator = require('validator');

const Schema = mongoose.Schema;

const saleSchema = new Schema({
    place: {
      type: String,
      trim: true,
      required: [true, 'A property must have a project name']
    },
    price:{
      type: Number,
      required: [true, 'A property must have a price'],
      min :[50000, 'Price must be greater than 50K'],
      max :[100000000, 'Price must be less than 100M']
    },
    neighborhood:{
        type: String,
        required: [true, 'A property must have a neighborhood']
      },
    area:{
        type: String,
        required: [true, 'A property must have a area']
      },
    p_type:{
        type: String,
        required: [true, 'A property must have a price']
    },
    built_up_sf:{
        type: Number,
        required: [true, 'A property must have a size']
      },
    bedroom:{
        type: Number,
        required: [true, 'A property must have a bedroom']
      },
    bathroom:{
        type: Number,
        required: [true, 'A property must have a bathroom']
    },
    car_park:{
        type: Number,
        required: [true, 'A property must have a bathroom']
    },
    psf:{
        type: Number,
        required: [true, 'A property must have a psf']
    },
    rental_price:{
        type: Number,
        required: [true, 'A property must have a rental_price']
    },
    rental_psf:{
        type: Number,
        required: [true, 'A property must have a rental_psf']
    },
    transacted_price:{
        type: Number,
        required: [true, 'A property must have a transacted_price']
    },
    transacted_psf:{
        type: Number,
        required: [true, 'A property must have a transacted_psf']
    },
    eprice:{
        type: Number,
        required: [true, 'A property must have a estimated price'],
    },
    epsf:{
        type: Number,
        required: [true, 'A property must have a estimated price'],
    },
    var:{
        type: Number,
        required: [true, 'A property must have a estimated value'],
        validate: {
            validator: function(val){
                return val<this.price;
            },
            message:"Price variance ({VALUE}) can't be greater than price"
        }
    },
    var_pct:{
        type: Number,
        required: [true, 'A property must have a estimated value percentage']
    },
    changes : {
        type: [Number],
        required: [true, 'A property must have a estimated value percentage']
    },
    duration : {
        type: Number,
        required: [true, 'A property must have a estimated value percentage']
    },
    url: {
        type: String,
        trim: true,
        required: [true, 'A property must have a url'],
        unique: true
      },
    built: {
      type: Number,
      required: [true, 'A property must have a years of built '],
    },
    developer:{
      type: String,
      required:[true, 'A property must have a developer'],
    },
    total_units : {
      type: Number,
      required: [true, 'A property must have a total units'],
    },
    prioritySale: {
        type: Boolean,
        default: false
    },
    ratingsAverage: {
      type: Number,
      default: 4,
      min: [1, 'rating must above 1.0'],
      max: [5, 'rating must below 5.0'],
      set: val => Math.round(val * 10)/10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    src: {
      type: String,
      trim: true,
      required: [true, 'A property must have an image'],
      unique: true
    },
    nearest_station:{
      type: String,
      required:[true, 'A property must have a nearest station'],
    },
    nearest_station_code:{
      type: String,
      required:[true, 'A property must have a nearest station code'],
    },
    train_line:{
      type: String,
      required:[true, 'A property must have a train line'],
    },
    train_type:{
      type: String,
      required:[true, 'A property must have a train type'],
    },
    distance_to_station:{
      type: String,
      required:[true, 'A property must have a distance to station'],
    },
    nearest_school:{
      type: String,
      required:[true, 'A property must have a nearest_school'],
    },
    nearest_school_type:{
      type: String,
      required:[true, 'A property must have a nearest_school type'],
    },
    sekolah_peringkat:{
      type: String,
      required:[true, 'A property must have a sekolah_peringkat'],
    },
    distance_to_school:{
      type: String,
      required:[true, 'A property must have a distance_to_school'],
    },
    nearest_private_school:{
      type: String,
      required:[true, 'A property must have a nearest_private_school'],
    },
    distance_to_private_school:{
      type: String,
      required:[true, 'A property must have a distance_to_private_school'],
    },
    slug: String,
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    location: { //latitude,longigude information
      type: { 
        type: String,
        default : "Point" ,
        //ref: 'Hood'
        
        },
        
         coordinates: [ Number ]
     },
    agents: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    pd:{
      type:String,
      required:  [true, 'A property must have a total units']
    }
  },
  {
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
  });

  // saleSchema.index({ neighborhood: 1});
  // saleSchema.index({ price: 1});
  // saleSchema.index({ area: 1});
  // saleSchema.index({ slug : 1});
   saleSchema.index({  location: "2dsphere"  });

  // virtual populate
  saleSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'sale',
    localField: '_id'
  });

  //DOCUMENT MIDDLEWARE: runs before .save() and .create()
  saleSchema.pre('save', function(next) {
    this.slug = slugify(this.place, {lower:true});
    next();
  });

  // saleSchema.pre('save', async function(next){
  //   const agentsPromises = this.agents.map(async id => await User.findById(id));
  //   this.agents = await Promise.all(agentsPromises);
  // });

//   saleSchema.post('save', function(doc,next) {
//     // this.slug = slugify(this.place, {lower:true});
//     console.log(this);
//     next();
//   })

  //QUERY MIDDLEWARE -- use regex to search all type of find
  saleSchema.pre(/^find/, function(next) {
    this.find({prioritySale: {$ne: true}});
    next();
  });

  saleSchema.pre(/^find/, function(next) {
    this.populate({
      path: 'agents',
      select: '-__v -passwordChangedAt' // dont want need to display
    });

    next();
  });



  saleSchema.plugin(mongoosePaginate);

  saleSchema.plugin(uniqueValidator);

  const Sale = mongoose.model("Sale", saleSchema, 'sale');

  module.exports = Sale;
