//This module houses all of the general functions.
var mysql = require('mysql');
var cfg = require('../config.js');



module.exports.newSQLConnection = function() {
    return mysql.createConnection({
        host: cfg.sqladdress,
        port: cfg.sqlport,
        user: cfg.sqluser,
        password: cfg.sqlpass,
        database: cfg.database
    });
};


//info_hash cleaner. Essentially converts the whole thing to hex (making it 40 characters instead of 20). Makes it easy to manage.
module.exports.convertToHash = function(str)
{
	if (str === undefined || str === null || !str)
	{
		return "";
	}
	//str is temp var
	var ret = "";
	//DoWork
	var iterator = 0;
	while (iterator<1000) // never make infinite loops
	{
		if (str.startsWith("%"))
		{
			ret += str.substring(1,3);
			str = str.substring(3)
		}
		else
		{
			ret+= str.charCodeAt(0).toString(16);
			str = str.substring(1);
		}
		if (str.length == 0)
		{
			break;
		}
		
		iterator++;
	}
	return ret;
}



//Logger
module.exports.postLog = function (logdata, key, type) {
    if (!key) key = "GENERAL";
    if (!type) type = 0; //0 = normal/info, 1 = debug, 2 = warning, 3 = error
    if (type === 0) {
        console.log("[" + module.exports.epoch() + "]-[" + key + "](INFO): " + logdata);
    } else if (type == 1 && cfg.debugLog) {
        console.log("[" + module.exports.epoch() + "]-[" + key + "](DEBUG): " + logdata);
    } else if (type == 2) {
        console.log("[" + module.exports.epoch() + "]-[" + key + "](WARN): " + logdata);
    } else if (type == 3) {
        console.log("[" + module.exports.epoch() + "]-[" + key + "](ERROR): " + logdata);
    }
}

//UNIX Epoch
module.exports.epoch = (function() {
    return new Date().getTime();
});


/*
  This function provides a time (in milliseconds) to ban a peer for misconduct.

  strikes required int - number of strikes of a peer. n >= 1
  probation required bool - true/false indicating that this is a probation calculation;
*/
module.exports.getBanTime = function (strikes, probation) {
    //205x^2-555x+380
    if (strikes >= 1) {
        if (probation) //indicates that the tracker is calculating a probation time based on the current strikes
            return 2 * ((205 * strikes) ^ 2 - (555 * strikes) + 380) * 60 * 1000;

        else //calculating ban time normally
            return 1 * ((205 * strikes) ^ 2 - (555 * strikes) + 380) * 60 * 1000;

    } else {

        strikes = 1;
        return 1 * ((205 * strikes) ^ 2 - (555 * strikes) + 380) * 60 * 1000;

    }
}