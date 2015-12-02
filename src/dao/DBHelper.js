"use strict";
var levelup = require("levelup");
var sublevel = require("level-sublevel");

class DBHelper{
    constructor(){
        this.db    = levelup('./stitchchatdb', { encoding: 'json' });
    }

    getDB(){
        return this.db;
    }

}
module.exports = new DBHelper();