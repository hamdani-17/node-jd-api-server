const crypto = require ('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');


const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    
      expires:new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true // in production
    
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions );

  // remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    passwordResetExpires: req.body. passwordResetExpires,
    passwordResetToken: req.body. passwordResetToken,
    active: req.body. active
   

  });

  createSendToken(newUser, 201, res);

});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check email n password exist
  if (!email || !password) {
    next(new AppError('pleaase provide email and password!!', 400));
  }

  // 2) check user exist n password is corrext
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }

  // 3) if all ok, send token to client
  createSendToken(user, 200, res);
  
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) getting token and check of its thre
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('you are not logged in! please logged in', 401));
  }
  //2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) check if users still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('the token belonging to this user does no longer exist', 401)
    );
  }

  // 4) check if user chnge password after jwt wss issued
  if (
    currentUser.passwordChangedAt &&
    (await currentUser.changedPasswordAfter(decoded.iat))
  ) {
    return next(
      new AppError(
        'user recently changed the password, please log in again!',
        401
      )
    );

    // if (await currentUser.changedPasswordAfter(decoded.iat)) {
    //   return next(
    //     new AppError('user recently changed! please log in again', 401)
    //   );
  }
  req.user = currentUser;
  next();
});

// middleware to ristrict the route..only admin can access
exports.restrictTo = (...roles) => {
  return (req,res, next)=> {
    // roles [admin , lead-guide]
    if(!roles.includes(req.user.role)){
      return next(new AppError('you do not have permissions to perform this action', 403))
    };

    next();
  };
};

exports.forgotPassword = catchAsync(async(req, res, next) =>{
  // 1) get user on post email
  const user = await User.findOne({ email: req.body.email});
  if(!user){
    return next(new AppError('there is no user with email address', 404));
  }

  // 2) generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });


  // 3) send it to user email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `forgot your password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n if you didnt forget your password, please ignore this email!!`;

  try{

  
    await sendEmail({
      email: user.email,
      subject: 'your password reset token(valid in 10 minits)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'token sent to email'
    });

  }catch(err){
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('there was an error sendinf the email..try again letter'), 500);
  }
});
exports.resetPassword = catchAsync( async (req, res, next) => {
  // 1) get user based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}
  });

  // 2) if token not expired and there is user, set the new password
  if (!user){
    return next(new AppError('token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) update changePasswordAt property

  // 4) log user in, sent jwt
  createSendToken(user, 200, res);
  
});

exports.updatePassword = catchAsync( async (req,res, next) => {
  // 1) get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) check if posted current pasword is correct
  if(! (await user.correctPassword(req.body.passwordCurrent, user.password))){
    return next(new AppError('your current password is wrong', 401));
  }

  // 3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log user in, send jwt 
  createSendToken(user, 200, res);
  
})
