const express = require('express');
const rentalController = require('./../controllers/rentalController');
const Rental = require('./../models/rentalModel');


const router = express.Router();

router.route('/near/:latlng').get( rentalController.getRentalNear);

router.route('/line/getRental').get( rentalController.getRentalLinestring);

router.route('/distance/:unit').get( rentalController.getDistances);




router  
  .route('/')
  .get( rentalController.getAllRentals)
  .post(rentalController.createRental);

router
  .route('/:id')
  .get( rentalController.getRental)
  .patch(  rentalController.updateRental)
  .delete(  rentalController.deleteRental);

module.exports = router;