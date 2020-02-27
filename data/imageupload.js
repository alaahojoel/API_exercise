const fs = require('fs');
const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: "images/" });


router.post('/', upload.single('images'), (req, res)=>{

    console.log(req.file);

    fs.rename(req.file.path, './images/' + req.file.originalname, function (err){
        if (err) throw err;
        console.log('File has been renamed!');
        res.send("Image has been uploaded!");
    });
});


module.exports = router;