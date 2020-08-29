var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;

router.post("/", function(req, res) {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/texts.sqlite');
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, function(err, hash) {
        if(err)throw err;
        db.run("INSERT INTO users (email, password) VALUES (?, ?);",
        [req.body.email,
        hash], (err) => {
            if (err) {
                res.json(err)
            } else {
                res.json("success");
            }
        })
    })
});


module.exports = router;
