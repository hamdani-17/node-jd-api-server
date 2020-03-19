const express = require('express');
const amenController = require('./../controllers/amenController');


const router = express.Router();

router.route('/hood/:hood').get(amenController.getAmenInHoodPolygon)

router.route('/near/:latlng').get( amenController.getAmenitiesNear);

router.route('/line/getAmenities').get( amenController.getAmenLinestring);

router  
  .route('/')
  .get( amenController.getAllAmens)
  .post(amenController.createAmen);

router
  .route('/:id')
  .get( amenController.getAmen)
  .patch(  amenController.updateAmen)
  .delete(  amenController.deleteAmen);

module.exports = router;