var winston = require('winston');

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            level: 'debug',
            prettyPrint: true,
            colorize: true,
            showLevel: false
        }),
        new (winston.transports.File)({
            filename: 'stitchchat_server.log'
        })
    ],
    exitOnError: true
});

module.exports = logger;