const Rental = require('./../models/rentalModel');
const Hood = require('./../models/hoodModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.getAllRentals =  catchAsync(async (req, res, next) => {
    
    // to allow nested GET view on sale
    let filter = {};
    if(req.params.rentalId) filter = { rental: req.params.rentalId };
  
  
    const features = new APIFeatures(Rental.find( filter ), req.query)
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

exports.getRental = catchAsync( async(req, res, next) => {
    
    let query = Rental.findById(req.params.id);
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

exports.createRental = catchAsync( async (req, res, next) => {
  
    const doc = await Rental.create(req.body);

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

exports.deleteRental = catchAsync( async(req,res, next) => {
 
    const doc = await Rental.findByIdAndDelete(req.params.id);

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

exports.updateRental  = catchAsync(async (req, res, next) => {
    const doc = await Rental.findByIdAndUpdate(req.params.id, req.body, {
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

exports.getRentalInHood = catchAsync(async (req, res, next) => {

  const poly = await Hood.find(req.params);// dapat kuchai
  const [doc] = poly.map(Hood =>Hood.location.coordinates); 

    const doc1 =  await Rental.find({
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
      count: doc1.length,
      data: {
        data: doc1
      }
    });
  
});

exports.getRentalNear = catchAsync(async(req,res,next) => {  

  const {latlng} = req.params;
   
  const [ lat, lng] = latlng.split(',');
  

        const doc = await Rental.find({
          location: {
            $near: {
            
                $geometry: {
                  type: "Point",
                  coordinates:[ lng, lat]
                },
              
             $maxDistance: 100
            }
           }
          })

      res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
          data: doc
        }
      });
  
});

exports.getRentalLinestring= catchAsync(async(req,res,next) => {  
  const line ={
    type: "LineString",
    coordinates: [
      [
        101.65001392364502,
        3.165626424624076
      ],
      [
        101.6450572013855,
        3.160505853875341
      ],
      [
        101.6531252861023,
        3.161127179707355
      ]
    ]
  }

  const area =  await Rental.find({
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

exports.getDistances = catchAsync(async (req, res, next) => {

  const unit  = req.params;
  const multiplier = unit === 'mi' ? 0.000621371 : 0.1;

    const distances = await Rental.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [  101.70460224151611,
                            3.162134155265517
                        ]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          place: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
}); 




