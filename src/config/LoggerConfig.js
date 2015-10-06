var winston = require('winston');

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            json: false,
            level: 'debug'
        }),
        new (winston.transports.File)({
            filename: 'stitchchat.log'
        })
    ],
    exitOnError: false
});

module.exports = logger;