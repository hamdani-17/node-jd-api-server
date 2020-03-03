const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('mongoose-slug-generator');
const slugify = require('slugify');

mongoose.plugin(slug);
const Schema = mongoose.Schema;

const amenitiesSchema = new Schema({
    locations: {
        type: {
            type: String,
            default:"Point",
            required: true,
            
        },
        coordinates: [ Number ]
     
    },
    poi: {
        type: String,
        required: [true, 'amenities must have a poi']
    },
    slug:{
        type: String,
        slug: "poi"
    },
    type: {
        type: String,
        required:[ true, 'amenities must have a type']
    },
    address: {
        type: String,
        required: [ true, ' amenities must have an address']
    },
    latitude: {
        type: Number,
        
    },
    longitude: {
        type: Number,
        
    },
    brand: {
        type: String,
        required: [true, 'amenities must have a brand']
    },
    tier : {
        type: String,
        required: [true, 'amenities must have a tier']
    }
},
{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
}
);


amenitiesSchema.index({  locations: "2dsphere"  });

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
amenitiesSchema.pre('save', function(next) {
    this.slug = slugify(this.poi, {lower:true});
    next();
});

//QUERY MIDDLEWARE -- use regex to search all type of find
amenitiesSchema.pre(/^find/, function(next) {
    this.find({priorityAmen: {$ne: true}});
    next();
});

amenitiesSchema.plugin(uniqueValidator);

const Amenities = mongoose.model("Amenities", amenitiesSchema, 'amenities');

module.exports = Amenities;