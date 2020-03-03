module.exports = fn => {
  //fn return promises
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
