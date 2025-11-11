const express = require("express");
const Listing = require("../models/listing"); 
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing,} = require("../middleware.js");
const listingController = require("../contollers/listing.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

//create route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

//search
router.get("/search", wrapAsync(async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) {
    return res.redirect("/listings");
  }

  const listings = await Listing.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
      { country: { $regex: query, $options: "i" } },
    ],
  });

  res.render("listings/index", {
    allListings: listings,
    searchQuery: query,
    category: null,
    message: listings.length === 0 ? `No results found for "${query}".` : null,
  });
}));


//show //delete
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn,isOwner,upload.single('listing[image]'), validateListing,wrapAsync(listingController.updateListing))
  .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

//edit route
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(listingController.editListing));


module.exports = router;
