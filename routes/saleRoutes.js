const express = require('express');
const saleController = require('./../controllers/saleController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');


const router = express.Router();

// router.param('id', saleController.checkID);



// POST /sale/234fd/reviews
// GET /sale/234fd/reviews  




router.use('/:saleId/reviews', reviewRouter);

//Alias
router
  .route('/expensive')
  .get(saleController.expensive, saleController.getAllSales); // includes middleware

router.route('/cheap').get(saleController.cheap, saleController.getAllSales); // includes middleware

router
  .route('/bestvalue')
  .get(saleController.bestValue, saleController.getAllSales); // includes middleware
router
  .route('/worstvalue')
  .get(saleController.worstValue, saleController.getAllSales); // includes middleware
router
  .route('/bestvaluepct')
  .get(saleController.bestValuePct, saleController.getAllSales); // includes middleware
router
  .route('/worstvaluepct')
  .get(saleController.worstValuePct, saleController.getAllSales); // includes middleware

router.route('/getstat').get(saleController.getStat);
router.route('/getPlaceList').get(saleController.getStatPlace);
router.route('/aggtest').get(saleController.gettest);
router.route('/trainType').get(saleController.getTrainType);
router.route('/trainLine').get(saleController.getTrainLine);

router.route('/getsummary').get(saleController.getSummary);
router.route('/:neighborhood').get(saleController.getSaleNeigborhood);
router.route('/train_type/:train_type').get(saleController.getTrainType_place);
//authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'),

router
   .route('/distance/:unit')
   .get( saleController.getDistances);

router
  .route('/sales-within/:latlng')
  .get( saleController.getSalesNear);

router
  .route('/')
  .get( saleController.getAllSales)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'),saleController.createSale);

router
  .route('/:id')
  .get(authController.protect,authController.protect,saleController.getSale)
  .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), saleController.updateSale)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), saleController.deleteSale);


module.exports = router;

