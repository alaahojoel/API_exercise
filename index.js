const express = require("express");
const app = express();
const port = 3000;

const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const listings = require("./data/listings");
const users = require("./data/users");

const passport = require("passport");
const BasicStrategy = require("passport-http").BasicStrategy;
const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const SecretKey = require("./data/jwt-key.json");

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(200).send("Just a test");
  });

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

    //If everything is correct, 
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


  /* Here you could do some processing based on the JWT payload.
  For example check if the key is still valid based on expires property.
  */
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

  /* Sign the token with payload, key and options.
      Detailed documentation of the signing here:
      https://github.com/auth0/node-jsonwebtoken#readme */
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


//------------ User registration and login -------------//

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
  res.json({
    everyuser
  });
});

//------------ Listing calls ---------------------------//

app.get("/listings", (req, res) => {
  const everylisting = listings.getAllListings()
  res.json({
    everylisting
  });
});

app.patch("/listings/:id", (req, res) => {
  const edit = listings.getListing(req.params.id);
  
  const editUserId = edit.userId;

  edit["seller"] = req.body.key;

  /*if(editUserId == req.user.id){

  }
  else{
    res.status(400).json({status: "This is not your post!!"});
    return;
  }*/

  res.json({
    edit
  });
});

app.delete("/listings/:id", (req, res) => {
  const del = listings.getListing(req.params.id);
  
  const editUserId = edit.userId;

  if(editUserId == req.user.id){

  }
  else{
    res.status(400).json({status: "This is not your post!!"});
    return;
  }

  //const edit123 = listings.editListing(req.body);
  res.json({
    del
  });
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
      res.json({
        cat
      });
    }
  }

  if("location" in req.body == true ){
    if(loc == null){
      res.status(400).json({status: "Couldnt find listings from that location."});
      return;
    }
    else{
      res.json({
        loc
      });
    }
  }

  if("date" in req.body == true ){
    if(dat == null){
      res.status(400).json({status: "Couldnt find listings from that date."});
      return;
    }
    else{
      res.json({
        dat
      });
    }
  }

  console.log("cat " + req.body.category);
  console.log("loc " + req.body.location);
  console.log("dat " + req.body.date);

});

app.post("/createListing", (req, res) => {

  const currentdate = new Date().toISOString();

  if("title" in req.body == false ){
    res.status(400).json({status: "Missing title from body"})
    return;
  }
  
  console.log(req.body);

  listings.addListing(req.body.title, req.body.description, req.body.category, req.body.location, req.body.images, req.body.price, currentdate, req.body.delivery, req.body.seller);
  res.status(201).json({ status: "Listing created" });
});

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});