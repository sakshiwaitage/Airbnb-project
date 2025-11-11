const express = require("express");
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
const Review = require("../models/review.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../contollers/review.js");

//create review
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//delete review
router.delete("/:reviewId", isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;