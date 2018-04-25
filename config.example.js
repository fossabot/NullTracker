cfg = {};

//Base
cfg.port = 1337; //Default 1337
cfg.ipaddress = "0.0.0.0"; //Default 0.0.0.0 (all interfaces)

//Other User Stuff
cfg.cacheTime = 15; 	//How many seconds until the cache is sent to MySQL for writing. Default 15 seconds.
cfg.debugLog = true;	//If enabled, debug log entries will be shown in the log along with normal entries. If disabled, log will operate normally. Default false.

//Sql
cfg.sqluser = "tracker"; 	//I recommend you make a user and give it full permissions only to the tracker database. The included
cfg.sqlpass = "PASSWORD";	//CreateDatabase SQL file expects a 'tracker@localhost' user for the pruning event. https://go.nullrebel.com/sqlpass will take you to a secure password generator @ Random.org
cfg.sqladdress = "127.0.0.1";
cfg.sqlport = 3306;
cfg.database = 'tracker';	//The included CreateDatabase SQL file will create the database 'tracker'.

//Tracker Specific
cfg.numwantlimit = 30; // Limit to the amount of peers the tracker will send at a time.



module.exports = cfg;
