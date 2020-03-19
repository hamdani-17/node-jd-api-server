const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const slugify = require('slugify');


// mongoose.plugin(slug);

const Schema = mongoose.Schema;

const hoodSchema = new Schema({
    hood: {
        type: String,
        trim: true,
        //unique: true,
        required: [true, 'A property must have a project name']
      },
    slug: String,
    area_group:{
        type: String,
        required: [true, 'A property must have a price'],
        // min :[50000, 'Price must be greater than 50K'],
        // max :[100000000, 'Price must be less than 100M']
      },
    voter:{
        type: Number,
        default: 0,
        min: [1, 'rating must above 1.0'],
        max: [5, 'rating must below 5.0'],
        },
    mukim: {
            type: String,
            required:[true, 'A property must have a price'],
        },
    daerah:{
        type: String,
        required:[true, 'A property must have a price'],
    },
    negeri: {
        type: String,
        required:[true, 'A property must have a price'],
    },
    dun: {
        type: String,
        required:[true, 'A property must have a price'],
    },
    parlimen: {
        type: String,
        required:[true, 'A property must have a price'],
    },
    location: { //latitude,longigude information
        type: {
            type: String,
            enum: [ 'Polygon'],
            required: true,
        
           
          },
          
           coordinates:[[[ Number ]]]
          
    },
    sales: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Sale'
        }
    ]
    
},
{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
}
);

//hoodSchema.index({  location: "2dsphere"  });

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
hoodSchema.pre('save', function(next) {
    this.slug = slugify(this.hood, {lower: true});
    next();
});

 //QUERY MIDDLEWARE -- use regex to search all type of find
 hoodSchema.pre(/^find/, function(next) {
    this.find({priorityHood: {$ne: true}});
    next();
  });



hoodSchema.plugin(uniqueValidator);
const Hood = mongoose.model("Hood", hoodSchema, 'hood');
module.exports = Hood;
