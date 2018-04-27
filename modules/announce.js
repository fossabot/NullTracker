//This module houses all of the announce related objects.
var bencoder = require('bencode');
var mysql = require('mysql');
var func = require('./functions.js');
var cache = require('./cache.js');
var reqIp = require('request-ip');

//This function handles the actual announce request.
module.exports.announce = function(req, res) {

    var par = announceGetParameters(req);
    res.set('Content-Type', 'text/plain');

    func.postLog("New connection from " + par.ip);

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
            func.postLog("InfoHash is missing. Terminating connection.", "ANNOUNCE-" + req.ip, 3);
            resp = {
                "failure reason": "info_hash is missing."
            };
        }
        if (par == "f-pim") {
            func.postLog("PeerId is missing. Terminating connection.", "ANNOUNCE-" + req.ip, 3);
            resp = {
                "failure reason": "peer_id is missing."
            };
        }
        if (par == "f-pm") {
            func.postLog("Port is missing. Terminating connection.", "ANNOUNCE-" + req.ip, 3);
            resp = {
                "failure reason": "port is missing."
            };
        }
        if (par == "f-ihl") {
            func.postLog("InfoHash is of incorrect length. Terminating connection.", "ANNOUNCE-" + req.ip, 3);
            resp = {
                "failure reason": "info_hash is not the correct length."
            };
        }
        if (par == "f-pil") {
            func.postLog("PeerID is of incorrect length. Terminating connection.", "ANNOUNCE-" + req.ip, 3);
            resp = {
                "failure reason": "peer_id is not the correct length."
            };
        }
        if (par == "f-pr") {
            func.postLog("Port is of incorrect range. Terminating connection.", "ANNOUNCE-" + req.ip, 3);
            resp = {
                "failure reason": "port is larger than the correct range."
            };
        }
        var bencode = bencoder.encode(resp);
        res.send(bencode);

    } else {

        //Step 1: Initialize the connection.
        func.postLog("Initializing the connection", "ANNOUNCE-" + par.ip);
        var connection = func.newSQLConnection();
        connection.connect();

        //Step 2: Ask if the current user is banned (NOT IMPLEMENTED)

        //Step 3: Insert this user into the cache.
        func.postLog("Copying user to cache", "ANNOUNCE-" + par.ip);
        cache.addToCache(par);

        //Step 4: Assemble the response
        func.postLog("Asking for peers from the database and processing response.", "ANNOUNCE-" + par.ip);

        var peerlimit = par.numwant;
        if (peerlimit > cfg.numwantlimit) peerlimit = cfg.numwantlimit;
        if (peerlimit < 0) peerlimit = 0;

        connection.query("SELECT * FROM tracker.torrents WHERE info_hash=" + mysql.escape(par.info_hash) + " AND event != 'stopped' AND port != 0 LIMIT " + peerlimit + " ORDER BY togo ASC, last_update DESC", function(error, results, fields) {


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
                    if (par.peer_id != results[i].peer_id && par.port != results[i].port && par.ip != results[i].ip) {
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
            func.postLog("Request complete! Complete: " + response.complete + ", Incomplete: " + response.incomplete, "ANNOUNCE-" + par.ip);

            //Step 5: Send response to peer.
            var bencode = bencoder.encode(response);
            res.send(bencode);
            func.postLog("Sent! - " + bencode, "ANNOUNCE-" + par.ip);
            connection.end();

        });
		
		//Step 6: Work to do after requests:
    }
};

//This function cleans up the request parameters and returns them. A string is returned if there is an error.
var announceGetParameters = function (req) {

    var ret = {};

    ret.info_hash 	= 	func.convertToHash(req.query.info_hash);
    ret.peer_id 	=	req.query.peer_id;
    ret.port 		=	req.query.port;
    ret.uploaded 	=	req.query.uploaded;
    ret.downloaded 	= 	req.query.downloaded;
    ret.left 		=	req.query.left;
    ret.no_peer_id 	= 	req.query.no_peer_id;
    ret.event 		=	req.query.event || "started";
    ret.ip 			=	req.query.ip || reqIp.getClientIp(req);
		if (ret.ip == "127.0.0.1" || ret.ip == "localhost") ret.ip = cfg.serverIP;
    ret.numwant 	=	req.query.numwant;
    ret.trackerid 	= 	req.query.trackerid;

    if (!ret.info_hash) return "f-ihm"; // False-InfoHashMissing
    if (!ret.peer_id) return "f-pim"; // False-PeerIdMissing
    if (!ret.port) return "f-pm"; // False-PortMissing

  //  if (ret.info_hash.length != 20) return "f-ihl"; // False-InfoHashLength
	if (ret.info_hash.length != 20 && ret.info_hash.length != 40 ) return "f-ihl";	
    if (ret.peer_id.length != 20) return "f-pil"; // False-PeerIdLength
    if (ret.port > 65535) return "f-pr"; // False-PortRange


    return ret;

}