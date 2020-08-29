var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post("/", function(req, res)  {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/texts.sqlite');
    const email = req.body.email;
    const password = req.body.password;

    db.get("SELECT password FROM users WHERE email = ?", email, (err, row) => {
        if (err) {
            res.json(err)
        } else if (!row) {
            const data = {
                result: "finns inte"
            }
            res.json(data)
        } else {
            const hashObj = Object.values(row);
            const hash = hashObj.toString();
            bcrypt.compare(password, hash, function(err, result) {
                const payload = { email: email };
                const secret = process.env.JWT_SECRET;
                const token = jwt.sign(payload, secret, { expiresIn: '1h'});
                if (err) {
                    res.json(err)
                } else if (result === false) {
                    const data = {
                        result: result
                    }
                    res.json(data)
                } else if (result === true) {
                    const data = {
                        result: result,
                        token: token
                    }
                    res.json(data)
                }
            })
        }
    })
});

module.exports = router;
