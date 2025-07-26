const expressError = require("./utils/expressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.validateListing = (req, res, next)=>{
  let result = listingSchema.validate(req.body);
  console.log(result);
  if(result.error){
    let errmsg = result.error.details.map((el)=> el.message).join(",");
    throw new expressError(400, errmsg);
  } else{
    next();
  }
};

module.exports.validateReview = (req, res, next)=>{
  let result = reviewSchema.validate(req.body);
  console.log(result);
  if(result.error){
    let errmsg = result.error.details.map((el)=> el.message).join(",");
    throw new expressError(400, errmsg);
  } else{
    next();
  }
};

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        // redirectUrl save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        // redirectUrl save
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("owner");;

    // if (!listing.owner.equals(res.locals.currUser._id)) {
    //     req.flash("error", "You are not the owner of this listing");
    //     return res.redirect(`/listings/${id}`);
    // }
    if (String(listing.owner[0]._id) !== String(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${listing._id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req,res,next)=>{
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
