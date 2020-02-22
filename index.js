const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.status(200).send("Just a test");
  });

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
  });