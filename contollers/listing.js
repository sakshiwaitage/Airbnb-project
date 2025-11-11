const Listing = require("../models/listing.js");

module.exports.index = async (req,res) => {
    const { category } = req.query; // read category from URL query

    let allListings;

    if (category) {
        // show listings from the selected category only
        allListings = await Listing.find({ category });
    } else {
        // show all listings if no category is selected
        allListings = await Listing.find({});
    }
    res.render("listings/index", {allListings, category});
};


module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate: {path:"author"}}).populate("owner");
    if(!listing){
       req.flash("error", "listing you requested does not exist!");
       return res.redirect("/listings"); 
    }
    console.log(listing)
    res.render("listings/show",{listing});
};

module.exports.createListing = async(req,res,next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    console.log(req.user);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
};

module.exports.editListing = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
       req.flash("error", "listing you requested does not exist!");
       return res.redirect("/listings"); 
    }
    let originalImageUrl = listing.image.url;

    if (originalImageUrl.includes("cloudinary.com")) {
      // Cloudinary transformation
      originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    } 
    else if (originalImageUrl.includes("unsplash.com")) {
      // Unsplash resizing using query params
      if (originalImageUrl.includes("w=")) {
        // Replace existing width parameter
        originalImageUrl = originalImageUrl.replace(/w=\d+/, "w=250");
      } else {
        // Add width parameter if missing
        const joiner = originalImageUrl.includes("?") ? "&" : "?";
        originalImageUrl = `${originalImageUrl}${joiner}w=250`;
      }
    }
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async(req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
     
    if( typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    
    req.flash("success", "listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "listing deleted!");
    res.redirect("/listings");
};