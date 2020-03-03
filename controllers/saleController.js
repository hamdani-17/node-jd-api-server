const fs = require('fs');
const Sale = require('./../models/saleModel');
const Hood = require('./../models/hoodModel');
const catchAsync = require('./../utils/catchAsync');
//const AppError = require('./../utils/appError');
const factory = require ('./handlerFactory');
const APIFeatures = require('./../utils/apiFeatures');

//Aliasing
exports.expensive = async (req, res, next) => {
  req.query.limit = 20;
  req.query.sort = '-price';
  next();
};

exports.cheap = async (req, res, next) => {
  req.query.limit = 20;
  req.query.sort = 'price';
  next();
};

exports.bestValue = async (req, res, next) => {
  req.query.limit = 20;
  req.query.sort = '-var';
  next();
};

exports.worstValue = async (req, res, next) => {
  req.query.limit = 20;
  req.query.sort = 'var';
  next();
};

exports.bestValuePct = async (req, res, next) => {
  req.query.limit = 20;
  req.query.sort = '-var_pct';
  next();
};

exports.worstValuePct = async (req, res, next) => {
  req.query.limit = 20;
  req.query.sort = 'var_pct';
  next();
};

exports.getAllSales = catchAsync( async (req, res) => {
  let filter = {};
  if(req.params.saleId) filter = { sale: req.params.saleId };

    // EXECUTE QUERY
    const features = new APIFeatures(Sale.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    const sales = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: sales.length,
      data: {
        sales

      }
    });
}) 


exports.getSaleNeigborhood =catchAsync( async (req, res) => {
  const hood = await Sale.find(req.params); //dapat harta mas

  res.status(200).json({
    status: 'success',
    results: hood.length,
    data: {
      hood
    }
  });

})

//use monggoose paginate
// exports.getAllSales =  async (req, res) => {
    
//   // to allo nested GET view on sale
  
//   const option={
//     page: parseInt(req.query.page) || 1,
//     limit: parseInt(req.query.limit) || 5000,
//   };

//   const doc = await Sale.paginate({}, option);
  
//   res.status(200).json({ 
//     status: 'success',
//     count: doc.length,
//     data: {
//       data:doc
//     }
//   });

  
// };

//exports.getAllSales = factory.getAll(Sale);

exports.getSale = factory.getOne(Sale,{ path: 'reviews'} );

exports.createSale = factory.createOne(Sale);

exports.updateSale = factory.updateOne(Sale);

exports.deleteSale = factory.deleteOne(Sale);


exports.getStat = catchAsync(async (req, res) => {
  const stats = await Sale.aggregate([
   
    {
      $match: { state: "Wilayah Persekutuan Kuala Lumpur" } // area = what query?
    },
    // {
    //   $unwind: '$location.coordinates'
    // },
    {
      $group: {
        _id: {p_type:'$p_type', place:'$place', coor: '$location.coordinates'},
        //_id: {coor: '$location.coordinates'},
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
      $sort: {avgPrice: 1,  avgSize: 1}
    },
    {
      // $project: {
      //   _id:1,
      //   place:1,
      //   info:{
      //     avgPrice: { avgPrice: '$price' },
      //     avgSize: '$built_up_sf' 
      //   }
      $project: {avgPrice:1, maxPrice:1 }
      
    },
    {$limit: 100}
    //{ $count: 'total'}
  ]);

  res.status(200).json({
    status: 'success',
    count: stats.length,
    data: {
      stats
    }
  });
});

exports.getStatPlace = catchAsync(async (req, res) => {
  const stats = await Sale.aggregate([
    {
      $match: { price: { $gte: 40000 } } // area = what query?
    },
    {
      $group: {
        _id: '$place',
        num: { $sum: 1 },
        // avgPrice: { $avg: '$price' },
        // sumPrice: { $sum: '$price' },
        // maxPrice: { $max: '$price' },
        // minPrice: { $min: '$price' },
        // avgSize: { $avg: '$built_up_sf' },          
        // avgPsf: { $avg: '$psf' },
        // avgDuration: { $avg: '$duration' },
        // avgVar: { $avg: '$var' },
        // avgVarPct: { $avg: '$var_pct' }
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

exports.getSummary = catchAsync(async (req, res, next) => {
  const summary = await Sale.aggregate([
    {
      $group: {
        _id: null,
        num: { $sum: 1 },
        Price: { $sum: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
        Size: { $sum: '$built_up_sf' },
        Psf: { $sum: '$psf' },
        Duration: { $sum: '$duration' },
        Var: { $sum: '$var' },
        VarPct: { $sum: '$var_pct' }
        //places: { $push: '$area' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      summary
    }
  });

  console.log(this.getSummary);
});

// test learning aggregate
exports.gettest = catchAsync(async (req, res, next) => {
  const summary = await Sale.aggregate([
    // {
    //   $match:{
    //     _id:{}
    //   }
    // },
    {
      $group: {
        _id: {area: "$area", p_type:"$p_type"},
        num: { $sum: 1 },
        Price: { $sum: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
        Size: { $sum: '$built_up_sf' },
        Psf: { $sum: '$psf' },
        Duration: { $sum: '$duration' },
        Var: { $sum: '$var' },
        VarPct: { $sum: '$var_pct' }
        //places: { $push: '$area' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    count: summary.length,
    data: {
      summary
    }
  });

  console.log(this.getSummary);
});

exports.getSalesNear = catchAsync(async(req,res,next) => {  
  
    const { latlng} = req.params;
   
    const [ lat, lng] = latlng.split(',');

          const sales = await Sale.find({
            location: {
              $near: {
               $maxDistance: 100,
               $geometry: {
                type: "Point",
                coordinates: [ lng, lat]
               },
              }
             }
            })
  
        res.status(200).json({
          status: 'success',
          results: sales.length,
          data: {
            data: sales
          }
        });
    
  });

exports.getSalePOI = catchAsync(async(req,res,next) => {  
  
    const point = await Sale.find(req.params);
    const [doc] = point.map(Sale =>Sale.location.coordinates);
   
    //const [ lat, lng] = latlng.split(',');

          const sales = await Sale.find({
            location: {
              $near: {
               $maxDistance: 100,
               $geometry: {
                type: "Point",
                coordinates: doc
               },
              }
             }
            })
  
        res.status(200).json({
          status: 'success',
          results: sales.length,
          data: {
            data: sales
          }
        });
    
});

  
exports.getDistances = catchAsync(async ( req,res,next) => {
  const { latlng, unit} = req.params;
  const [ lat, lng] = latlng.split(',');
  
  const multiplier = unit === 'mi'? 0.000621371 : 0.001;
  const distances = await Sale.aggregate([
    { 
          $geoNear: {
            near:{
              type: 'Point',
              coordinates: [lng * 1,lat *1],
            },
            //distanceField: 'dist.calculated',
            distanceField: 'distance',
            distanceMultiplier: multiplier,
            //spherical: true
          }
    },

    {
      $project: {
        distance: 1,
        name: 1
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

exports.getDistances = catchAsync(async (req, res, next) => {

  const unit  = req.params;
  const multiplier =unit===  Math.round('mi') ? 0.000621371 : 0.1;

    const distances = await Sale.aggregate([
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
          area: 1,
          neighborhood:1
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

exports.getTrainType = catchAsync(async (req, res, next) => {
  const doc = await Sale.aggregate([

    {
      $group: {
        _id: {train_type: "$train_type", train_line: "$train_line"},
        num: { $sum: 1 },

      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    count: doc.length,
    data: {
      doc
    }
  });

  console.log(this.getSummary);
});

exports.getTrainLine = catchAsync(async (req, res, next) => {
  const doc = await Sale.aggregate([

    {
      $group: {
        _id: {train_line: "$train_line", train_type:"$train_type"},
        num: { $sum: 1 },
        
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    count: doc.length,
    data: {
      doc
    }
  });

  console.log(this.getSummary);
});

// const area = await Hood.find(req.params)
//   const match = area.map(Hood =>Hood.area_group);
//   console.log(match);

//   const summary = await Sale.aggregate([
//     {
//       $match: {area: match} 
//     },
exports.getTrainType_place = catchAsync(async (req, res, next) => {

  const train = req.params

  console.log(train);

  const doc = await Sale.aggregate([
    {
      $match: train
    },
    {
      $group: {
        _id: {train_line: "$train_line"},
        num: { $sum: 1 },
        
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    count: doc.length,
    data: {
      doc
    }
  });

  console.log(this.getSummary);
});
  //'/sales-within/:distance/center/:latlng/unit/:unit', saleController.getSaleWithin
  // 
 // /sales-within/233/center/1.995633, 102.949982/unit/mi

// exports.getSalesWithin = catchAsync( async (req,res,next) => {
//   const { distance, latlng, unit } = req.params;
//   const [ lat, lng] = latlng.split(',');

//   const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

//   if( !lat || !lng){
//     next(
//       new AppError(
//         'please provide latitude and longitude in the format lat,lng', 400
//       )
//     );
//   }

//   const sales = await Sale.find({
//  location: { $geoWithin: { $centerSphere: [ [ lng, lat], radius] } }
//   });

  
//   res.status(200).json({
//     status: 'success',
//     results: sales.length,
//     data: {
//       data: sales
//     }
//   });
// });





 // const multiplier = unit === 'mi'? 0.000621371 : 0.001;

  // if( !lat || !lng){
  //   next(
  //     new AppError(
  //       'please provide latitude and longitude in the format lat,lng', 400
  //     )
  //   );
  // }
 

  // const distances = await Sale.aggregate([
  //   {
  //     $geoNear :{
  //         near: {
  //           type: 'Point',
  //           coordinates : [ lng * 1, lat * 1]
  //         },
  //         distanceField: 'distance',
  //         distanceMultiplier: multiplier
  //     }
  //   },

