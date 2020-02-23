const express = require("express");
const app = express();
const port = 3000;

const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const listings = require("./data/listings");
const users = require("./data/users");

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(200).send("Just a test");
  });

//------------ User registration and login -------------//

app.post("/register", (req, res) => {

  if("username" in req.body == false )
  {
    res.status(400);
    res.json({status: "Missing username from body"})
    return;
  }
  if("password" in req.body == false )
  {
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

app.post("/createListing", (req, res) => {

    const currentdate = new Date().toISOString();

    if("title" in req.body == false )
    {
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