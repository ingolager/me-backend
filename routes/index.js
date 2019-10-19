var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    const data = {
        data: {
            msg: "Hello World again"
        }
    };

    res.json(data);
});

// router.get('/', function(req, res, next) {
//     res.send("hello world")
// });

module.exports = router;
