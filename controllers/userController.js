const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
} ;

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync( async(req, res, next) => {
  // 1) create error if user posted password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('this route is not for password update,,please use /updateMyPassword', 
    400)
    );
  }

  // 2) fitered out unwanted fields name
  const filteredbody = filterObj(req.body, 'name', 'email');

  // 3) update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredbody, {new:true, runValidators:true});

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser
    }
  });
});

exports.deleteMe = catchAsync( async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false});

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! please use signup instead'
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
// do not update password

exports.updateUser = factory.updateOne(User); // only admin can do
exports.deleteUser = factory.deleteOne(User);



