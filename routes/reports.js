var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');

router.get('/week/:msg', function(req, res, next) {
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

router.post("/",
    (req, res, next) => checkToken(req, res, next),
    (req, res) => addReport(res, req));

router.put("/",
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



module.exports = router;
