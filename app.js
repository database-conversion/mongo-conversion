function convertDB() {
	console.log("1");
	var collections = new Array();

	var MongoClient = require('mongodb').MongoClient,
	    format = require('util').format;
	var mysql = require("mysql");
	/**
	 * Starting connection with mysql db
	 */
	// First you need to create a connection to the db
	var con = mysql.createConnection({
		host : json["mysqlhost"],
		user : json["mysqluser"],
		password : json["mysqlpass"]
	});

	con.connect(function(err) {
		if (err) {
			console.log('Error connecting to Db');
			close();
			return;
		}
		console.log('Connection established');
	});

	MongoClient.connect('mongodb://' + json["mongohost"] + ':' + json["mongoport"] + '/' + json["mongodb"], function(err, db) {
		if (err)
			throw err;

		con.query('Create Database ' + json["mongodb"], function(err, rows, fields) {
			if (err)
				throw err;
			console.log("database " + json["mongodb"] + " created");
		});
		db.listCollections().toArray(function(err, collections) {
			//collections = [{"name": "coll1"}, {"name": "coll2"}]
			for (var i = 0; i < collections.length; i++) {
				var c = collections[i];
				console.log(c["name"]);

				con.query('Create Table ' + c["name"], function(err, rows, fields) {
					if (err)
						throw err;
				});
				var cursor = db.collection(c["name"]).find();

				// Execute the each command, triggers for each document
				cursor.each(function(err, item) {
					// If the item is null then the cursor is exhausted/empty and closed
					if (item == null) {
						db.close();
						// you may not want to close the DB if you have more code....
						return;
					}
					// otherwise, do something with the item
				});
				con.end(function(err) {
					// The connection is terminated gracefully
					// Ensures all previously enqueued queries are still
					// before sending a COM_QUIT packet to the MySQL server.
				});

			};
		});
	});

	// db.listCollections().toArray(function(err, collInfos) {
	// // collInfos is an array of collection info objects that look like:
	// // { name: 'test', options: {} }
	// collections = collInfos;
	// });

}

var json = {
	"mongohost" : "localhost",
	"mongoport" : "27017",
	"mongodb" : "testdb",

	"mysqlhost" : "localhost",
	"mysqluser" : "root",
	"mysqlpass" : "root"
};
convertDB();
