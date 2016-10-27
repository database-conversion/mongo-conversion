function convertDB(json) {
	var collections = new Array();

	var MongoClient = require('mongodb').MongoClient,
	    format = require('util').format;

	MongoClient.connect('mongodb://' + json.mongohost + ':' + json.mongoport + '/' + json.mongodb, function(err, db) {
		if (err)
			throw err;
		db.listCollections().toArray(function(err, collections) {
			//collections = [{"name": "coll1"}, {"name": "coll2"}]
			for (var i = 0; i < collectionslength; i++) {
				var c = collections[i];

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

			};
		});
	});

	// db.listCollections().toArray(function(err, collInfos) {
	// // collInfos is an array of collection info objects that look like:
	// // { name: 'test', options: {} }
	// collections = collInfos;
	// });

	var mysql = require("mysql");

	// First you need to create a connection to the db
	var con = mysql.createConnection({
		host : json.mysqlhost,
		user : json.mysqluser,
		password : json.mysqlpass
	});

	con.connect(function(err) {
		if (err) {
			console.log('Error connecting to Db');
			return;
		}
		console.log('Connection established');
	});

	con.query('Create Database ', function(err, rows, fields) {
		if (err)
			throw err;

		console.log('The solution is: ', rows[0].solution);
	});

	con.end(function(err) {
		// The connection is terminated gracefully
		// Ensures all previously enqueued queries are still
		// before sending a COM_QUIT packet to the MySQL server.
	});
}
