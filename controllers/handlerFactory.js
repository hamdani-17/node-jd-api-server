const catchAsync = require('./../utils/catchAsync');
const AppError = require ('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');


exports.deleteOne = Model => 
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        // if(!doc){
        //     return next(new AppError('no documents found with that ID', 404));
        // }

        res.status(204).json({
            status: 'success',
            data: doc
        });
});

exports.updateOne = Model => 
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
        });
    
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

exports.createOne = Model => 
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);
        // console.log(req.body);
    
        res.status(201).json({
        status: 'success',
        data: {
           data: doc
        }
        });
    });


exports.getOne = (Model, popOptions) => 
catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions);
    const doc = await query;

    // if (!doc) {
    // return next(new AppError('no sale find with that ID', 404));
    // }

    res.status(200).json({
    status: 'success',
    data: {
        data: doc
    }
    });

    console.log(req);

});

exports.getAll = Model => catchAsync(async (req, res, next) => {
    
    // to allow nested GET view on sale
    let filter = {};
    if(req.params.saleId) filter = { sale: req.params.saleId };


    const features = new APIFeatures(Model.find( filter ), req.query)
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
    console.log(saleId);
});



