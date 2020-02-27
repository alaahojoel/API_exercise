const express = require("express");
const app = express();
const port = 3000;

const users = require("./data/users");
const listings = require("./data/listings");
const SecretKey = require("./data/jwt-key.json");
const imageupload = require("./data/imageupload");
const listingmethods = require("./components/listingmethods")

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
passport.use(new BasicStrategy(function(username, password, done) {

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
  else {
    done(null, false);
  }
}));

//Login method authenticated by basic strategy
app.get("/login", passport.authenticate("basic", { session: false }), (req, res) => {

  //Constructing payload for the token including user id and username
  const body = {
    id: req.user.id,
    username : req.user.username
  };

  const payload = {
    user : body
  };

  //Constructing options for the token to use, this time only using expiration time
  const options = {
    expiresIn: "600s"
  }

  //Constructing a JWT with payload, the secret key and the expiration time
  const token = jwt.sign(payload, SecretKey.secret, options);

  return res.status(201).json({ token });
});

//Register method for users to create accounts
app.post("/register", (req, res) => {

  //Checking if the request body includes username
  if("username" in req.body == false ){
    res.status(400).json({status: "Missing username from body"})
    return;
  }
  //Checking if the request body includes password
  if("password" in req.body == false ){
    res.status(400).json({status: "Missing password from body"})
    return;
  }
  else{
    //Hashing the input password using bcrypt
    const hashedPassword = bcrypt.hashSync(req.body.password, 6);
    users.addUser(req.body.username, hashedPassword);

    res.status(201).json({ status: "User created" });
  }
});


//------------------------------------------------ Listing calls ---------------------------------------//

app.use("/listings", listingmethods)

//Search for listings using categories, location or date
app.get("/listingsearch", (req, res) => {
  const cat = listings.getListingsByCategory(req.body.category);
  const loc = listings.getListingsByLocation(req.body.location);
  const dat = listings.getListingsByDate(req.body.date);

  //Checking that which search category was used
  if("category" in req.body == true ){
    if(cat == ""){
      res.status(400).json({status: "Couldnt find listings from that category."});
      return;
    }
    else{
      res.status(200).json({ cat });
    }
  }

  if("location" in req.body == true ){
    if(loc == ""){
      res.status(400).json({status: "Couldnt find listings from that location."});
      return;
    }
    else{
      res.status(200).json({ loc });
    }
  }

  if("date" in req.body == true ){
    if(dat == ""){
      res.status(400).json({status: "Couldnt find listings from that date."});
      return;
    }
    else{
      res.status(200).json({ dat });
    }
  }
});

//-------------------------------------------------Image upload----------------------------------------//

app.use("/imageupload", imageupload);

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});
