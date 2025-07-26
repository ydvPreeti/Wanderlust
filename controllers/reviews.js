const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res)=>{
  let listing = await Listing.findById(req.params.id);
  let newrev = new Review(req.body.review);

  newrev.author = req.user._id;
  listing.reviews.push(newrev);
  await newrev.save();
  await listing.save();

  req.flash("success","New review created!");
  res.redirect(`/listings/${listing._id}`);
  // res.redirect("/listings/:_id");
};

module.exports.destroyReview = async (req,res)=>{
  let {id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","Review deleted!");
  res.redirect(`/listings/${id}`);
};