const express = require("express");
const router = express.Router();

const listings = require("../data/listings");

const passport = require("passport");


//Getting all the listings
router.get("/", (req, res) => {
    const everylisting = listings.getAllListings()
    if(everylisting.length == 0){
      res.status(400).json({status: "Couldnt find any listings"});
    }
    else{
      res.status(200).json({ everylisting });
    }
  });
  
//Getting listings with a certain id
router.get("/:id", (req, res) => {
    const listingByID = listings.getListing(req.params.id)
    if(listingByID == null || !listingByID){
      res.status(400).json({status: "Couldnt find any listings for that ID."});
    }
    else{
      res.status(200).json({ listingByID });
    }
});
  
//Editing a listing with a certain id, authenticated by JWT
router.patch("/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    const edit = listings.getListing(req.params.id);
  
    const currentUser = req.user;
    const editUserId = edit.userId;
  
    //Checking if users id matches the userid in the listing 
    if(currentUser.id !== editUserId){
      res.status(401).json({status: "This is not your post!!"});
      return;
    }
    else{
      //Checking that which fields will be updated
      if( "title" in req.body == true ){
        edit["title"] = req.body.title
      }
      if( "description" in req.body == true ){
        edit["description"] = req.body.description
      }
      if( "category" in req.body == true ){
        edit["category"] = req.body.category
      }
      if( "images" in req.body == true ){
        edit["images"] = req.body.images
      }
      if( "delivery" in req.body == true ){
        edit["delivery"] = req.body.delivery
      }
    }
    res.status(201).json({ edit });
});
  
// This doesn't work and my brains don't comprihend why. - Ossi
router.delete("/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    const del = listings.delListing(req.params.id);
    const listingUser = req.user;
  
    if(listingUser == null || !listingUser) {
      res.status(400).json({status: "This is not your post!!"});
      return;
    }
    else{
      res.status(201).json({
        del,
        status: "Posting has been deleted!"
      });
    }
  
});
  
//Used to post listings, authenticated by JWT
router.post("/", passport.authenticate('jwt', { session: false }), (req, res) => {
  
    //Getting the current date and turning it to a string
    const currentdate = new Date().toISOString();
  
    //Checking if everything is filled in the request
    if("title" in req.body == false ){
      res.status(400).json({status: "Missing title from body"})
      return;
    }
    if("description" in req.body == false ){
      res.status(400).json({status: "Missing description from body"})
      return;
    }
    if("category" in req.body == false ){
      res.status(400).json({status: "Missing category from body"})
      return;
    }
    if("location" in req.body == false ){
      res.status(400).json({status: "Missing location from body"})
      return;
    }
    if("images" in req.body == false ){
      res.status(400).json({status: "Missing images from body"})
      return;
    }
    if("price" in req.body == false ){
      res.status(400).json({status: "Missing price from body"})
      return;
    }
    if("delivery" in req.body == false ){
      res.status(400).json({status: "Missing delivery from body"})
      return;
    }
    else{
      listings.addListing(req.body.title, req.body.description, req.body.category, req.body.location, req.body.images, req.body.price, currentdate, req.body.delivery, req.user.username, req.user.id);
      res.status(201).json({ status: "Listing created" });
    }
    console.log(req.body);
});

module.exports = router;