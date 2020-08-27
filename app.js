const express = require("express");
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = 1337;
const aboutme = require('./routes/aboutme');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const images = './public/images/';
const bodyParser = require("body-parser");
const publicDir = require('path').join(__dirname,'/public');

app.use(express.static(publicDir));
app.use(cors());

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

// This is middleware called for all routes.
// Middleware takes three parameters.
app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.path);
    next();
});

app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json

app.use('/aboutme', aboutme);


app.get('/reports/week/:msg', function(req, res, next) {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/texts.sqlite');
    const sql = "SELECT report FROM reports WHERE week = ?;";
    const data = req.params.msg;
    db.get(sql, data, (err, row) => {
        if (err) {
            res.json(err)
        }
        res.json(Object.values(row))
    })
});

app.post("/reports",
    (req, res, next) => checkToken(req, res, next),
    (req, res) => addReport(res, req));

app.put("/reports",
    (req, res, next) => checkToken(req, res, next),
    (req, res) => editReport(res, req));

function checkToken(req, res, next) {
    const token = req.body.token;

    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
        if (err) {
            res.json(err)
        }
        res.json(token)
        next();
    });
}

function addReport(res, req) {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/texts.sqlite');
    const sql = "INSERT INTO reports (week, report) VALUES (?, ?);";
    const week = req.body.selectedWeek.value;
    const text = req.body.reportText;

    db.run(sql, [week, text], (err) => {
        if (err) {
            res.json(err)
        }
    });
};

function editReport(res, req) {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/texts.sqlite');
    const sql = "UPDATE reports SET report = ? WHERE week = ?;";
    const msg = req.body.week;
    const report = req.body.value;
    db.run(sql, [report, msg], (err) => {
        if (err) {
            res.json(err)
        }
    });
};


app.post("/register", function(req, res) {
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

app.post("/login", function(req, res)  {
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

// Testing routes with method
app.get("/user", (req, res) => {
    res.json({
        data: {
            msg: "Got a GET request, sending back default 200"
        }
    });
});

app.post("/user", (req, res) => {
    res.status(201).json({
        data: {
            msg: "Got a POST request, sending back 201 Created"
        }
    });
});

app.put("/user", (req, res) => {
    // PUT requests should return 204 No Content
    res.status(204).send();
});

app.delete("/user", (req, res) => {
    // DELETE requests should return 204 No Content
    res.status(204).send();
});

app.use((req, res, next) => {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        "errors": [
            {
                "status": err.status,
                "title":  err.message,
                "detail": err.message
            }
        ]
    });
});

// Start up server
app.listen(port, () => console.log(`Example API listening on port ${port}!`));
