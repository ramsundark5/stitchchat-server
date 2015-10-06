"use strict";

class User{
    constructor(phoneNumber){
        this.id = phoneNumber;
        this.password = '';
        this.displayName = '';
        this.deviceids = [];
        this.devicetype = '';
        this.apnId = '';
        this.gcmId = ''
        this.status = '';
        this.lastSeenTime = 0;
        this.blockedUsers = [];
        this.extra = '';
    }
}
module.exports = User;