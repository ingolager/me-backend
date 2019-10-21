var express = require('express');
var router = express.Router();

router.get('/me', function(req, res, next) {
    const data = {
        data: {
            msg: "Hello World me"
        }
    };

    res.json(data);
});

module.exports = router;
