const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const rentalSchema = new Schema({
    location:{
        type: {
            type: String,
            default: 'Point',   
          
        },
        coordinates: [ Number ]
    },
    place_id:{
        type: String,
        required: [true, 'A rental must have a place id '],
        unique: true,
    },
    place:{
        type: String,
        required: [true, 'A rental must have a place '],    
    },
    price :{
        type : String,
        required: [true, 'A rental must have a price'],
    },
    p_type: {
        type: String,
        required: [true, 'A rental must have a p type '],
    },
    neighborhood: {
        type: String,
        required: [true, 'A rental must have a neighborhood '],
    },
    area: {
        type: String,
        required: [true, 'A rental must have a area '],
    },
    state: {
        type: String,
        required: [true, 'A rental must have a state '],
    },
    built_up_sf: {
        type: String,
        required: [true, 'A rental must have a built_up_sf '],
    },
    rental_psf: {
        type: String,
        required: [true, 'A rental must have a rental psf '],
    },
    car_park: {
        type: String,
        required: [true, 'A rental must have a car park '],
    },
    furnishing: {
        type: String,
        required: [true, 'A rental must have a furnishing'],
    },
    bedroom: {
        type: String,
        required: [true, 'A rental must have a bedroom '],
    },
    bathroom: {
        type: String,
        required: [true, 'A rental must have a bathroom '],
    },
    slug : {
        type: String,
        required: true
    }
},
{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
}
);


rentalSchema.index({location: "2dsphere"});

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
rentalSchema.pre('save', function(next) {
    this.slug = slugify(this.place, {lower:true});
    next();
});

function slugify(string) {
    
    return string.toString().toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
  }

//QUERY MIDDLEWARE -- use regex to search all type of find
rentalSchema.pre(/^find/, function(next) {
    this.find({priorityRental: {$ne: true}});
    next();
});


rentalSchema.plugin(uniqueValidator);
const Rental = mongoose.model("Rental", rentalSchema, 'rental');

module.exports = Rental;