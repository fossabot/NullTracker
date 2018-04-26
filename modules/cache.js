//Handles the caching system.
var mysql = require('mysql');
var func = require('./functions.js');

/*
  These functions act as a gateway for the Cache

*/
module.exports.cache = [];
var cacheEmpty = 0;

module.exports.addToCache = function (obj) {
    module.exports.cache.push(obj);
}

module.exports.doCacheWork = function() {
    //Create a workable copy
    var tempCache = module.exports.cache;
    //Reset the cache
    module.exports.cache = [];

    //We only need to do work if the cache is not empty
    if (tempCache.length > 0) {
        cacheEmpty = 0;
        func.postLog("Processing " + tempCache.length + " objects!", "CACHE");



        func.postLog("Building the query and creating a connection", "CACHE");

        //Need 2 commands - an initializer, and an updater. They are executed back to back in a single query.
        var queryI = "INSERT IGNORE INTO tracker.torrents (id,info_hash,peer_id) VALUES ";
		var queryUArray = [];
		    queryUArray.push("SET SQL_SAFE_UPDATES = 0; ");
        for (var i = 0; i < tempCache.length; i++) {

            //Local edits
            if (!tempCache[i].uploaded || !tempCache.downloaded) {
                tempCache[i].uploaded = 0;
                tempCache[i].downloaded = 0;
                tempCache[i].ratio = 0;
            } else {
                tempCache[i].ratio = tempCache[i].uploaded / tempCache.downloaded;
            }




            //INSERT
            queryI += "("+mysql.escape(tempCache[i].info_hash+"#"+tempCache[i].peer_id)+"," + mysql.escape(tempCache[i].info_hash) + "," + mysql.escape(tempCache[i].peer_id) + ")";
            if (i + 1 < tempCache.length) {
                queryI += ",";
            } else {
                queryI += ";";
            }

			//UPDATE
            queryUArray.push("UPDATE tracker.torrents SET event="+mysql.escape(tempCache[i].event)+",port=" + mysql.escape(tempCache[i].port) + ",uploaded=" + mysql.escape(tempCache[i].uploaded) + ",downloaded=" + mysql.escape(tempCache[i].downloaded) + ",togo=" + mysql.escape(tempCache[i].left) + ",ip=" + mysql.escape(tempCache[i].ip) + ",last_update=" + mysql.escape(func.epoch()) + ",connected_time='0',ratio=" + mysql.escape(tempCache[i].ratio) + " WHERE id="+mysql.escape(tempCache[i].info_hash+"#"+tempCache[i].peer_id)+";");


        }
		 queryUArray.push("SET SQL_SAFE_UPDATES = 1; ");

		 
		 
        func.postLog("Insert: " + queryI, "CACHE-MYSQL", 1);
        func.postLog("Update: " + queryUArray, "CACHE-MYSQL", 1);

        var connection = func.newSQLConnection();
        connection.connect();
        connection.query(queryI, function(error, results, fields) {
			for (var i=0; i< queryUArray.length;i++){
            connection.query(queryUArray[i], function(error, results, fields) {
                //Nothing should happen here except close the connection.
                if (error) {
                    func.postLog(error, "CACHE-MYSQL", 3);
                }
             
            });
			}
			   func.postLog("Cache has sent the query to the database.", "CACHE");
                connection.end();
        });

    } else {
        cacheEmpty += 1;
        if (cacheEmpty < 3) {
            func.postLog("Cache is empty. " + cacheEmpty + "/3.", "CACHE");
        }
        if (cacheEmpty == 3) {
            func.postLog("Cache is empty. " + cacheEmpty + "/3. Silencing this log until something happens.", "CACHE");
        }

        //Unlikely, but a problem could arise if we just let this increment indefinitely. Setting a hard limit at 1000.
        if (cacheEmpty > 1000) cacheEmpty = 1000;
    }

};

//doCacheWork Periodically.
setInterval(module.exports.doCacheWork, 1000 * cfg.cacheTime);