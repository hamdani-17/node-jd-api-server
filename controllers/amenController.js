const Amenities = require('./../models/amenModel');
const Hood = require('./../models/hoodModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const factory = require ('./handlerFactory');



exports.getAllAmens =  catchAsync(async (req, res, next) => {
    
  // to allow nested GET view on sale
  let filter = {};
  if(req.params.amenitiesId) filter = { amenities: req.params.amenitiesId };


  const features = new APIFeatures(Amenities.find( filter ), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  //const doc = await features.query.explain();
  const doc = await features.query;

  res.status(200).json({
    status: 'success',
    // requestedAt : req.requestTime ,
    count: doc.length,
    data: {
      data:doc
    }
  });
 
});

exports.getAmen = catchAsync( async(req, res, next) => {
    
        let query = Amenities.findById(req.params.id);
        //if(popOptions) query = query.populate(popOptions);
        const doc = await query;
        console.log(query);

        res.status(200).json({
          status: 'success',
          data: {
              data: doc
          }
          });
      
    
    
      res.status(404).json({
        status: 'fail',
        message: err
      });
    
    console.log(req);

});

exports.createAmen = catchAsync( async (req, res, next) => {
  
    const doc = await Amenities.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
         data: doc
      }
      });

 
    res.status(404).json({
      status: 'fail',
      message: err
    });
  
});

exports.deleteAmen = catchAsync( async(req,res, next) => {
 
    const doc = await Amenities.findByIdAndDelete(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
         data: doc
       }
      });

 
    res.status(404).json({
      status: 'fail',
      message: err
    });
  
});

exports.updateAmen  = catchAsync(async (req, res, next) => {
        const doc = await Amenities.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        });
        console.log(doc);
    
        // if (!doc) {
        // return next(new AppError('no documents find with that ID', 404));
        // }
    
        res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
        });
});

exports.getStat = catchAsync(async (req, res) => {
  const stats = await Sale.aggregate([
    {
      $match: { price: { $gte: 40000 } } // area = what query?
    },
    {
      $group: {
        _id: '$p_type',
        num: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        sumPrice: { $sum: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
        avgSize: { $avg: '$built_up_sf' },          
        avgPsf: { $avg: '$psf' },
        avgDuration: { $avg: '$duration' },
        avgVar: { $avg: '$var' },
        avgVarPct: { $avg: '$var_pct' }
        //places: { $push: '$area' }
      }
    },
    {
      $sort: { avgPrice: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});


exports.getAmenInHoodPolygon = catchAsync(async (req, res, next) => {

  const poly = await Hood.find(req.params);// dapat kuchai
  const [doc] = poly.map(Hood =>Hood.location.coordinates); 

    const amenities =  await Amenities.find({
      locations : {
          $geoWithin: {
              $geometry:{
                type:"Polygon",
                coordinates: doc
          }
        }
      }
    });
    //console.log( sale);
   
    res.status(200).json({
      status: 'success',
      count: amenities.length,
      data: {
        data: amenities
      }
    });
  
});

exports.pointInPolygon = catchAsync(async(req, res, next) => {
  const poly = await Hood.find(req.params);
  const [doc]= poly.map(Hood =>Hood.location.coordinates);

  const point = await Amenities.find(req.params);
  const [doc1]= point.map(Amenities =>Amenities.location.coordinates)

  await Hood.find({ "polygon":{
    type: "Polygon",
    coordinates: doc
    }
  });

  const result = await Amenities.find({
    polygon:{
      $geoIntersects:{
        $geometry:{
          type:"Point",
          coordinates: doc1
        }
      }
    }
  });

  res.status(200).json({
    status: 'success',
    count: result.length,
    data: {
      data: result
    }
  });

})


exports.getAmenitiesNear = catchAsync(async(req,res,next) => {  

  // const poly = await Amenities.find(req.params);
 
  // const [doc]= poly.map(Amenities =>Amenities.location.coordinates);

  //str=JSON.stringify(doc);

  const {latlng} = req.params;
   
  const [ lat, lng] = latlng.split(',');

        const amen = await Amenities.find({
          location: {
            $near: {
             $maxDistance: 100,
             $geometry: {
              type: "Point",
              coordinates:[ lng, lat]
             },
            }
           }
          })


      res.status(200).json({
        status: 'success',
        results: amen.length,
        data: {
          data: amen
        }
      });
  
});

exports.getAmenLinestring= catchAsync(async(req,res,next) => {  
    const line ={
      type: "LineString",
      coordinates: [
        [
          101.6458511352539,
          3.115148067976796
        ],
        [
          101.70833587646484,
          3.1871368298058167
        ]
      ]
    }

    const area =  await Amenities.find({
      location : {
          $geoIntersects: {
              $geometry:line
               
          }
        }
    })
    
     
    res.status(200).json({
        status: 'success',
        count: area.length,
        data: {
          data: area
        }
      })
    
});


  