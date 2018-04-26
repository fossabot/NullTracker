#!/bin/env node

//LIBRARIES
var express = require('express');
var tracker = express();
var fs = require('fs');
const exitHook = require('exit-hook');
var cfg = require('./config.js');
	cfg.version = 1.00;

	
//Exit handler
exitHook(() =>
	{
		//I use nodemon for development, so the cache needs to be flushed before exit.
		cache.doCacheWork();
	
	});

//Load Modules
var func 	= require('./modules/functions.js');
var ann 	= require('./modules/announce.js');
var scr 	= require('./modules/scrape.js');
var cache	= require('./modules/cache.js');
var st		= require('./modules/stats.js');


//Web Stuff
//Static Objects
tracker.use(express.static("static"));


//Bind URL Locations
tracker.get('/announce', ann.announce);
//tracker.get('/scrape', scr.scrape);
tracker.get('/stats',  st.stats);


//Run web server
tracker.listen(cfg.port, cfg.ipaddress, function() {
    func.postLog('Tracker started.');
    if (cfg.debugLog) {
        func.postLog('Debugging is enabled. Debugs will appear like this:');
        func.postLog('This is a debugging statement, and is likely very nasty--consisting mostly of raw data', "ANNOUNCE", 1);
    }
});