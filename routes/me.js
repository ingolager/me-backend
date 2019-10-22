var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    const data = {
        data: {
            msg: "Jag heter Ingvar Lagerlöf och går andra året på BTH:s distansprogram Webbprogrammering. Jag arbetar också som webbredaktör på Botkyrka kommun och vet inte vad jag vill bli när jag blir stor."
        }
    };

    res.json(data);
});

module.exports = router;
