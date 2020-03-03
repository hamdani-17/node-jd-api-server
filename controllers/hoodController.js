const Hood = require('./../models/hoodModel');
const Amenities = require('./../models/amenModel');
const Rental = require('./../models/rentalModel');
const Sale = require('./../models/saleModel');
const catchAsync = require('./../utils/catchAsync');
//const turf = require('turf-area');
const d3 = require('d3-polygon');

//<script src="https://d3js.org/d3.v4.min.js"></script>
//const APIFeatures = require('./../utils/apiFeatures');


  
  //difference: require('@turf/difference')


exports.getSaleInHoodPolygon = catchAsync(async (req, res, next) => {

  const poly = await Hood.find(req.params);// dapat kuchai
  
  const [doc] = poly.map(Hood =>Hood.location.coordinates); 
  console.log(doc);

    const sale =  await Sale.find({
      location : {
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
      count: sale.length,
      data: {
        data: sale
      }
    });
  
});

exports.getHoodInArea = catchAsync(async (req, res, next) => {
  // const line ={
  //   type: "LineString",
  //   coordinates: [
  //     [
  //       101.6458511352539,
  //       3.115148067976796
  //     ],
  //     [
  //       101.70833587646484,
  //       3.1871368298058167
  //     ]
  //   ]
  // }

 const poly = {
    type:"Polygon",
   
    coordinates: 
    //area Cheras
    //  [
    //   [
    //     [
    //       101.72666072845459,
    //       3.088965214163403
    //     ],
    //     [
    //       101.72305583953856,
    //       3.0738808543095426
    //     ],
    //     [
    //       101.75039291381836,
    //       3.074266536626021
    //     ],
    //     [
    //       101.7502212524414,
    //       3.0892651850588626
    //     ],
    //     [
    //       101.72666072845459,
    //       3.088965214163403
    //     ]
    //   ]
    // ]
     //area segambut
    [
      [
        [
          101.66340351104736,
          3.189772037829588
        ],
        [
          101.66286706924438,
          3.1800238769096065
        ],
        [
          101.67640686035156,
          3.179723932033985
        ],
        [
          101.67614936828613,
          3.1897291889726334
        ],
        [
          101.66340351104736,
          3.189772037829588
        ]
      ]
    ]
  }

  const area =  await Hood.find({
    location : {
        $geoIntersects: {
            $geometry:poly
             
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

exports.getMaps = catchAsync(async (req, res) => {

  const area = await Hood.find(req.params);
  //console.log(area);
  const [doc]= area.map(Hood =>Hood.hood); 
  console.log(doc);

  const summary = await Sale.aggregate([
    {
      $match: {neighborhood: doc} 
    },

    {
          $group: {
            _id:{ place:'$neighborhood', p_ype:'$p_type', coordinates:"$location.coordinates"},
           // p_type:{$first: 'p_type'},
            num: { $sum: 1 },
            avgSize: { $avg: '$built_up_sf' },
            avgPsf: { $avg: '$psf' },
            avgDuration: { $avg: '$duration' },
            avgVar: { $avg: '$var' },
            avgVarPct: { $avg: '$var_pct' },

          }  
    }
  
    //   $sort: {p_type:, _id:1 }
    // }
  ]);
   //console.log(summary)

 res.status(200).json({
    status: 'success',
    count: summary.length,
    data: {
      summary
    }
  });
});

exports.getPtypeList = catchAsync(async (req, res) => {
  
  const area = await Hood.find(req.params)
  const match = area.map(Hood =>Hood.area_group);
  console.log(match);

  const summary = await Sale.aggregate([
    {
      $match: {area: match} 
    },
  
    {
          $group: {
            _id:{ place:'$p_type'},
            num: { $sum: 1 },
            avgSize: { $avg: '$built_up_sf' },
            avgPsf: { $avg: '$psf' },
            avgDuration: { $avg: '$duration' },
            avgVar: { $avg: '$var' },
            avgVarPct: { $avg: '$var_pct' },
            
            //pd: $sum: 1,
           //p_type: {"$first":"$p_type".count},
           // p_type:{ $p_type},
           //p_type: {$push:'$p_type'},
           
          }  
    }
  
    //   $sort: {p_type:, _id:1 }
    // }
  ]);
   console.log(summary)

 res.status(200).json({
    status: 'success',
    count: summary.length,
    data: {
      summary
    }
  });
});




exports.getHoodLocation = catchAsync( async (req, res) => {

  const doc = await Hood.find(req.params);
  
   let doc1 = doc.map(Hood => Hood.location);
  // //doc2 = 
  // console.log(doc1);
  
  res.status(200).json({
    status: 'success',
    count: doc.length,
    data :{
      doc1
    }
  });
 
 
  // res.status(404).json({
  //   status: 'fail',
  //   message: err
  // });

});


//try to display the page
exports.getAllHoods = catchAsync(async(req,res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2000;

  var query = {};
  
  Hood.find(query)
    
    .sort({ voter: -1 })
    .skip(page * limit) //Notice here
    .limit(limit)
    .exec((err,doc) => {
      
      if (err) {
        return res.json(err);
      }
      Hood.countDocuments(query).exec((count_error, count) => {
        if (err) {
          return res.json(count_error);
        }
        
        res.status(200).json({
         
          total: count,
          total_remain: Math.ceil(count-(limit*page)),
          total_page: Math.ceil(count/limit),
          page_remain: Math.ceil((count/limit)-page),
          page: page,
          total_listing: doc.length,
          Hoods: doc,
         
                  
      },
    );
   
      })
    })

    
});

exports.getDistances = catchAsync(async (req, res, next) => {

  const unit  = req.params;
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

const distances = await Hood.aggregate([
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

exports.pointInPolygon = catchAsync(async(req,res,next) => { 
  
  const point = await Sale.find(req.params);
  
  const [doc] = point.map(Sale =>Sale.location.coordinates);
  console.log(doc);
  


  const polygon = await Hood.find({
    location:{
      $geoIntersects:{
            $geometry:{
              type:"Point",
              coordinates:doc
            }
      }
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      data: polygon
    }
  });

})

exports.amenInPolygon = catchAsync(async(req,res,next) => { //sale
  
  const point = await Amenities.find(req.params);

  const [doc] = point.map(Amenities =>Amenities.locations.coordinates);
  console.log(doc);
  
  const polygon = await Hood.find({
    location:{
      $geoIntersects:{
            $geometry:{
              type:"Point",
              coordinates:doc
            }
      }
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      data: polygon
    }
  });

});

exports.rentalInPolygon = catchAsync(async(req,res,next) => { //sale
  
  const point = await Rental.find(req.params);

  const [doc] = point.map(Rental =>Rental.location.coordinates);
  console.log(doc);
  


  const polygon = await Hood.find({
    location:{
      $geoIntersects:{
            $geometry:{
              type:"Point",
              coordinates:doc
            }
      }
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      data: polygon
    }
  });

});

exports.areaOfPolygon = catchAsync(async(res, req) => {
  // const hood = await Hood.find(req.params);
  // const doc = hood.map(Hood =>Hood.location.coordinates)
  // console.log(doc);
  const polygons = [[103.58692857900994,1.344331180680397],[103.59677782496449,1.344282900062973],[103.60305430522963,1.344186338828125],[103.60290946337736,1.341772307956913],[103.60088167744554,1.33969624140767],[103.59783999854781,1.337089088066761],[103.59320505927509,1.332598990646307],[103.59112899272584,1.329653872983428],[103.58581812480918,1.332695551881155],[103.58210051726752,1.332309306941761],[103.5804589762751,1.335785511396307],[103.57920368022207,1.336895965597064],[103.575099827741,1.337089088066761],[103.57553435329783,1.342206833513731],[103.58272816529403,1.341530904869791],[103.58388690011222,1.343027604009943],[103.5864457728357,1.342931042775094],[103.58692857900994,1.344331180680397]];

console.log(polygons);

const area =d3.polygonArea(polygons);
//const rounded_area = (area*100000);
console.log(area);


  res.status(200).json({
    status: 'success',  
    data: {
      rounded_area 
    }
  });
})


