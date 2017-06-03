#!/bin/env node

//LIBRARIES
var express = require('express');
var tracker = express();
var fs = require('fs');
var mysql = require('mysql');
var bencoder = require('bencode');
var mysql = require('mysql');
var reqIp = require('request-ip');
//VARIABLES

//Base
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

//Other User Stuff
var cacheTime = 15; //How many seconds until the cache is sent to MySQL for writing. Ex: shorter times means a more up-to-date response for peers. downside of this is the amount of mysql connections you are spamming. longer times fix the sql spam, but too long means that peers won't get up-to-date information. Default 15 seconds.
var debugLog = true; //If enabled, debug log entries will be shown in the log along with normal entries. If disabled, log will operate normally. Default false.

//Sql
var sqluser = process.env.OPENSHIFT_MYSQL_USERNAME || "Admin";    //Do not fear. I don't use Openshift anymore so this
var sqlpass = process.env.OPENSHIFT_MYSQL_PASSWORD || "password"; //is not a security issue on my part.
var sqladdress = process.env.OPENSHIFT_MYSQL_DB_HOST || "127.0.0.1";
var sqlport = process.env.OPENSHIFT_MYSQL_DB_PORT || 45436;

var newSQLConnection = function() {
    return mysql.createConnection({
        host: sqladdress,
        port: sqlport,
        user: sqluser,
        password: sqlpass,
        database: 'tracker'
    });
};



// connection.connect();
//
// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   postLog('The solution is: ', results[0].solution);
// });
//
// connection.end();


/*
  These functions cleans up the get parameters from the client. They return an object with each of them if it worked successfully. It returns a string if there is an error.
*/
function announceGetParameters(req) {

    var ret = {};

    ret.info_hash = req.query.info_hash;
    ret.peer_id = req.query.peer_id;
    ret.port = req.query.port;
    ret.uploaded = req.query.uploaded;
    ret.downloaded = req.query.downloaded;
    ret.left = req.query.left;
    ret.no_peer_id = req.query.no_peer_id;
    ret.event = req.query.event;
    ret.ip = req.query.ip || reqIp.getClientIp(req);
    ret.numwant = req.query.numwant;
    ret.trackerid = req.query.trackerid;

    if (!ret.info_hash) return "f-ihm"; // False-InfoHashMissing
    if (!ret.peer_id) return "f-pim"; // False-PeerIdMissing
    if (!ret.port) return "f-pm"; // False-PortMissing

    if (ret.info_hash.length != 20) return "f-ihl"; // False-InfoHashLength
    if (ret.peer_id.length != 20) return "f-pil"; // False-PeerIdLength
    if (ret.port > 65535) return "f-pr"; // False-PortRange


    return ret;

}

function scrapeGetParameters(req) {

    var ret = [];

}


/*
  These functions act as a gateway for the Cache

*/
var cache = [];
var cacheEmpty = 0;

function addToCache(obj) {
    cache.push(obj);
}

var doCacheWork = function() {
    //Create a workable copy
    var tempCache = cache;
    //Reset the cache
    cache = [];

    //We only need to do work if the cache is not empty
    if (tempCache.length > 0) {
        cacheEmpty = 0;
        postLog("Processing " + tempCache.length + " objects!", "CACHE");



        postLog("Building the query and creating a connection", "CACHE");

        //Need 2 commands - an initializer, and an updater. They are executed back to back in a single query.
        var queryI = "INSERT IGNORE INTO tracker.torrents (id,info_hash,peer_id) VALUES ";
        var queryU = "";
        for (var i = 0; i < tempCache.length; i++) {

            //Local edits
            if (!tempCache[i].uploaded || !tempCache.downloaded) {
                tempCache[i].uploaded = 0;
                tempCache[i].downloaded = 0;
                tempCache[i].ratio = 0;
            } else {
                tempCache[i].ratio = tempCache[i].uploaded / tempCache.downloaded;
            }




            //Insert
            queryI += "(" + mysql.escape(tempCache[i].info_hash + "-" + tempCache[i].peer_id) + "," + mysql.escape(tempCache[i].info_hash) + "," + mysql.escape(tempCache[i].peer_id) + ")";
            if (i + 1 < tempCache.length) {
                queryI += ",";
            } else {
                queryI += ";";
            }

            //Update
            if (tempCache[i].event) {
                queryU += "UPDATE tracker.torrents SET port=" + mysql.escape(tempCache[i].port) + ",uploaded=" + mysql.escape(tempCache[i].uploaded) + ",downloaded=" + mysql.escape(tempCache[i].downloaded) + ",togo=" + mysql.escape(tempCache[i].left) + ",ip=" + mysql.escape(tempCache[i].ip) + ",last_update=" + mysql.escape(epoch()) + ",connected_time='0',ratio=" + mysql.escape(tempCache[i].ratio) + " WHERE id=" + mysql.escape(tempCache[i].info_hash + "-" + tempCache[i].peer_id) + ";";
            } else {
                queryU += "UPDATE tracker.torrents SET port=" + mysql.escape(tempCache[i].port) + ",uploaded=" + mysql.escape(tempCache[i].uploaded) + ",downloaded=" + mysql.escape(tempCache[i].downloaded) + ",togo=" + mysql.escape(tempCache[i].left) + ",event=" + mysql.escape(tempCache[i].event) + ",ip=" + mysql.escape(tempCache[i].ip) + ",last_update=" + mysql.escape(epoch()) + ",connected_time='0',ratio=" + mysql.escape(tempCache[i].ratio) + " WHERE id=" + mysql.escape(tempCache[i].info_hash + "-" + tempCache[i].peer_id) + ";";
            }


        }

        postLog("Insert: " + queryI, "CACHE-MYSQL", 1);
        postLog("Update: " + queryU, "CACHE-MYSQL", 1);

        var connection = newSQLConnection();
        connection.connect();
        connection.query(queryI, function(error, results, fields) {
            connection.query(queryU, function(error, results, fields) {
                //Nothing should happen here except close the connection.
                if (error) {
                    postLog(error, "CACHE-MYSQL", 3);
                }
                postLog("Cache has sent the query to the database.", "CACHE");
                connection.end();
            });
        });

    } else {
        cacheEmpty += 1;
        if (cacheEmpty < 3) {
            postLog("Cache is empty. " + cacheEmpty + "/3.", "CACHE");
        }
        if (cacheEmpty == 3) {
            postLog("Cache is empty. " + cacheEmpty + "/3. Silencing this log until something happens.", "CACHE");
        }

        //Unlikely, but a problem could arise if we just let this increment indefinitely. Setting a hard limit at 1000.
        if (cacheEmpty > 1000) cacheEmpty = 1000;
    }

};

//doCacheWork Periodically.
setInterval(doCacheWork, 1000 * cacheTime);


/*
  This function provides a time (in milliseconds) to ban a peer for misconduct.

  strikes required int - number of strikes of a peer. n >= 1
  probation required bool - true/false indicating that this is a probation calculation;
*/
function getBanTime(strikes, probation) {
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

function postLog(logdata, key, type) {
    if (!key) key = "GENERAL";
    if (!type) type = 0; //0 = normal/info, 1 = debug, 2 = warning, 3 = error
    if (type === 0) {
        console.log("[" + epoch() + "]-[" + key + "](INFO): " + logdata);
    } else if (type == 1 && debugLog) {
        console.log("[" + epoch() + "]-[" + key + "](DEBUG): " + logdata);
    } else if (type == 2) {
        console.log("[" + epoch() + "]-[" + key + "](WARN): " + logdata);
    } else if (type == 3) {
        console.log("[" + epoch() + "]-[" + key + "](ERROR): " + logdata);
    }
}

var epoch = (function() {
    return new Date().getTime();
});

var announce = function(req, res) {

    var par = announceGetParameters(req);
    res.set('Content-Type', 'text/plain');

    postLog("New connection from " + par.ip);

    if (typeof par == "string") {
        //Something is wrong with the parameters.

        // if (!ret.info_hash) return "f-ihm"; // False-InfoHashMissing
        // if (!ret.peer_id) return "f-pim"; // False-PeerIdMissing
        // if (!ret.port) return "f-pm"; // False-PortMissing
        //
        // if (ret.info_hash.length != 20) return "f-ihl"; // False-InfoHashLength
        // if (ret.peer_id.length != 20) return "f-pil"; // False-PeerIdLength
        // if (ret.port > 65535) return "f-pr"; // False-PortRange
        var resp = "Unknown Error";
        if (par == "f-ihm") {
            postLog("InfoHash is missing. Terminating connection.", "ANNOUNCE-" + req.ip, 3);
            resp = {
                "failure reason": "info_hash is missing."
            };
        }
        if (par == "f-pim") {
            postLog("PeerId is missing. Terminating connection.", "ANNOUNCE-" + req.ip, 3);
            resp = {
                "failure reason": "peer_id is missing."
            };
        }
        if (par == "f-pm") {
            postLog("Port is missing. Terminating connection.", "ANNOUNCE-" + req.ip, 3);
            resp = {
                "failure reason": "port is missing."
            };
        }
        if (par == "f-ihl") {
            postLog("InfoHash is of incorrect length. Terminating connection.", "ANNOUNCE-" + req.ip, 3);
            resp = {
                "failure reason": "info_hash is not the correct length."
            };
        }
        if (par == "f-pil") {
            postLog("PeerID is of incorrect length. Terminating connection.", "ANNOUNCE-" + req.ip, 3);
            resp = {
                "failure reason": "peer_id is not the correct length."
            };
        }
        if (par == "f-pr") {
            postLog("Port is of incorrect range. Terminating connection.", "ANNOUNCE-" + req.ip, 3);
            resp = {
                "failure reason": "port is larger than the correct range."
            };
        }
        var bencode = bencoder.encode(resp);
        res.send(bencode);

    } else {

        //Step 1: Initialize the connection.
        postLog("Initializing the connection", "ANNOUNCE-" + par.ip);
        var connection = newSQLConnection();
        connection.connect();

        //Step 2: Ask if the current user is banned (NOT IMPLEMENTED)

        //Step 3: Insert this user into the cache.
        postLog("Copying user to cache", "ANNOUNCE-" + par.ip);
        addToCache(par);

        //Step 4: Assemble the response
        postLog("Asking for peers from the database and processing response.", "ANNOUNCE-" + par.ip);

        var peerlimit = par.numwant;
        if (peerlimit > 30) peerlimit = 30;
        if (peerlimit < 0) peerlimit = 0;

        connection.query("SELECT * FROM tracker.torrents WHERE info_hash='" + par.info_hash + "' LIMIT " + peerlimit + "", function(error, results, fields) {

            var response = {};
            response.complete = 0;
            var total = 0;
            response.peers = [];

            if (results) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i].left === 0) {
                        response.complete += 1;
                    }
                    //Don't send the peer back to itself
                    if (par.peer_id != results[i].peer_id) {
                        if (response.no_peer_id == "1" || response.no_peer_id == "true") {
                            //Peer doesn't care for peerid
                            response.peers.push({
                                "ip": results[i].ip,
                                "port": results[i].port
                            });
                        } else {
                            response.peers.push({
                                "peer id": results[i].peer_id,
                                "ip": results[i].ip,
                                "port": results[i].port
                            });
                        }
                    }
                    total++;
                }
            }

            response.incomplete = total - response.complete;
            if (response.incomplete < 0 || response.incomplete.isNaN) response.incomplete = 0;
            postLog("Request complete! Complete: " + response.complete + ", Incomplete: " + response.incomplete, "ANNOUNCE-" + par.ip);

            //Step 5: Send response to peer.
            var bencode = bencoder.encode(response);
            res.send(bencode);
            postLog("Sent! - " + bencode, "ANNOUNCE-" + par.ip);
            connection.end();

        });
    }
};


//Web Stuff
//Static Objects
tracker.use(express.static("static"));

//Tracker stuff
tracker.get('/announce', announce);



// tracker.get('/scrape', function(req, res) {
//     res.set('Content-Type', 'text/plain');
// });


//These pages serve no purpose other than testing if things are working properly
tracker.get('/mysqltest', function(req, res) {
    var connection = newSQLConnection();
    connection.connect();
    connection.query("SELECT version()", function(e, r, f) {
        console.log(JSON.stringify(r));
        res.send(JSON.stringify(r));
    });
    connection.end();
});


//Run web server
tracker.listen(port, ipaddress, function() {
    postLog('Tracker started.');
    if (debugLog) {
        postLog('Debugging is enabled. Debugs will appear like this:');
        postLog('This is a debugging statement, and is likely very nasty--consisting mostly of raw data', "ANNOUNCE", 1);
    }
});
