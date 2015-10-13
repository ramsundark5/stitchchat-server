"use strict";
var levelup = require("levelup");
var sublevel = require("level-sublevel");

class DBHelper{
    constructor(){
        let dbHandle    = levelup('./stitchchatdb', { encoding: 'json' });
        this.db          = sublevel(dbHandle);
    }

    getDB(){
        return this.db;
    }

}
module.exports = new DBHelper();