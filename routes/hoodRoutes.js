  const express = require('express');
const hoodController = require('./../controllers/hoodController');
//const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/hood/:hood')
  .get(hoodController.getHoodLocation)

router
  .route('/sale/:place')
  .get(hoodController.pointInPolygon)

router
  .route('/rental/:place')
  .get(hoodController.rentalInPolygon)

router
  .route('/amenities/:poi')
  .get(hoodController.amenInPolygon)

router
  .route('/area/:hood')
  .get(hoodController.areaOfPolygon)


router
  .route('/getArea')
  .get(hoodController.getHoodInArea );

router
  .route('/distane/getdistance/:mi')
  .get(hoodController.getDistances );

router
  .route('/:hood')
  .get(hoodController.getSaleInHoodPolygon);

router
  .route('/')
  .get(hoodController.getAllHoods);

router
  .route('/getStat/map/:hood')
  .get(hoodController.getMaps)

router
  .route('/getStat/p_type/:area_group')
  .get(hoodController.getPtypeList)


  //.post( hoodController.createHood);
// router
//   .route('/:id')
//   .get(hoodController.getIdHood)
// router
// .route('/getHoodPolygon')
// .get(hoodController.getHoodPolygon)


  //.get(hoodController.getHoodLocation)
  //.get(hoodController.getHood)

// router
//   .route('/:hood/:daerah')
//   .get(hoodController.getHoodStreet) 



  // .patch( hoodController.updateHood)
  // .delete(hoodController.deleteHood);

// router
// .route('/hood/area/state')


module.exports = router;