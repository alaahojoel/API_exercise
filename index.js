const express = require("express");
const app = express();
const port = 3000;

const listings = require("./data/listings");
const users = require("./data/users");
const SecretKey = require("./data/jwt-key.json");

const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const BasicStrategy = require("passport-http").BasicStrategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

app.use(bodyParser.json());

//-------------------------------------- User registration and login ----------------------------------// 

//Configuring the basic passport strategy to check if user credentials are correct
passport.use(new BasicStrategy(
  function(username, password, done) {

    const user = users.getUserByName(username);

    //Checking if username can be found
    if(user == undefined) {
      return done(null, false, { message: "User not found" });
    }

    //Checking if input password matches hashed password
    if(bcrypt.compareSync(password, user.password) == false) {
      return done(null, false, { message: "Invalid password" });
    }

    return done(null, user);
  }
));

//Necessary JSON WEB TOKEN configurations below
let options = {} //Creating an object to store necessary configurations

options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //Extract JWT from Authorization header in a request

options.secretOrKey = SecretKey.secret; //Secret key used to sign the JWT token (or to decode it)

//Configuring the JWT passport strategy with the options from above
passport.use(new JwtStrategy(options, function(payload, done) {
  console.log("Processing JWT payload for token content:");
  console.log(payload);

  const now = Date.now() / 1000;
  if(payload.exp > now) {
    done(null, payload.user);
  }
  else {// expired
    done(null, false);
  }
}));

app.get("/login", passport.authenticate("basic", { session: false }), (req, res) => {

  const body = {
    id: req.user.id,
    username : req.user.username
  };

  const payload = {
    user : body
  };

  const options = {
    expiresIn: "60s"
  }

  const token = jwt.sign(payload, SecretKey.secret, options);

  return res.json({ token });
});

app.get('/testJWT', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json(
      {
        status: "It works!!!",
        user: req.user
      }
    );
  }
);

app.post("/register", (req, res) => {

  if("username" in req.body == false ){
    res.status(400);
    res.json({status: "Missing username from body"})
    return;
  }
  if("password" in req.body == false ){
    res.status(400);
    res.json({status: "Missing password from body"})
    return;
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 6);
  console.log(hashedPassword);
  users.addUser(req.body.username, hashedPassword);

  res.status(201).json({ status: "created" });
});

app.get("/users", (req, res) => {
  const everyuser = users.getAllUsers()
  res.status(200).json({ everyuser });
});

//------------ Listing calls ---------------------------//

app.get("/listings", (req, res) => {
  const everylisting = listings.getAllListings()
  if(everylisting.length == 0){
    res.status(400).json({status: "Couldnt find any listings"});
  }
  else{
    res.status(200).json({ everylisting });
  }
});

app.get("/listings/:id", (req, res) => {
  const listingByID = listings.getListing(req.params.id)
  if(listingByID == null || !listingByID){
    res.status(400).json({status: "Couldnt find any listings for that ID."});
  }
  else{
    res.status(200).json({ listingByID });
  }
});

app.patch("/listings/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  const edit = listings.getListing(req.params.id);
  const currentUser = req.user;
  const editUserId = edit.userId;

  console.log("edit" + editUserId);
  console.log("current" + currentUser.id);

  if(currentUser.id !== editUserId){
    res.status(401).json({status: "This is not your post!!"});
    return;
  }
  else{
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

app.delete("/listings/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.get("/listingsearch", (req, res) => {
  const cat = listings.getListingsByCategory(req.body.category);
  const loc = listings.getListingsByLocation(req.body.location);
  const dat = listings.getListingsByDate(req.body.date);

  if("category" in req.body == true ){
    if(cat == null){
      res.status(400).json({status: "Couldnt find listings from that category."});
      return;
    }
    else{
      res.status(200).json({ cat });
    }
  }

  if("location" in req.body == true ){
    if(loc == null){
      res.status(400).json({status: "Couldnt find listings from that location."});
      return;
    }
    else{
      res.status(200).json({ loc });
    }
  }

  if("date" in req.body == true ){
    if(dat == null){
      res.status(400).json({status: "Couldnt find listings from that date."});
      return;
    }
    else{
      res.status(200).json({ dat });
    }
  }
});

app.post("/listings", passport.authenticate('jwt', { session: false }), (req, res) => {

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
    listings.addListing(req.body.title, req.body.description, req.body.category, req.body.location, req.body.images, req.body.price, currentdate, req.body.delivery, req.user.username);
    res.status(201).json({ status: "Listing created" });
  }
  console.log(req.body);
});

app.listen(port, () => {
    console.log("Listening to requests on http://localhost:${port}");
});