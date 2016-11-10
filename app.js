function convertDB(callback) {
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
			return;
		}
		// console.log('Connection established');
	});

	var tables = new Array();
	var cnames = new Array();
	var query = new Array();

	//Create mysql database
	con.query('Create Database ' + json["mongodb"], function(err, rows, fields) {
		if (err) {
			console.log('Error creating Db: ' + err);
			throw err;
			return;
		}
		// console.log("database " + json["mongodb"] + " created");
	});

	MongoClient.connect('mongodb://' + json["mongohost"] + ':' + json["mongoport"] + '/' + json["mongodb"], function(err, db) {

		if (err)
			throw err;

		var coll = db.listCollections().toArray();
		db.listCollections().toArray(function(err, collections) {
			if (collections)
				collections.forEach(function(c, index) {
					var coll = db.collection(c["name"]);
					cnames.push(c["name"]);
					tables.push(json["mongodb"] + "." + c["name"]);

					coll.findOne(function(err, item) {
						if (err)
							throw err;
						var query1 = "";
						query1 = 'Create Table ' + json["mongodb"] + "." + c["name"] + " (";
						for (var key in Object.keys(item)) {
							if (key != 0)
								query1 = query1 + ",";

							query1 = query1 + " " + Object.keys(item)[key] + " text ";
						}
						query1 = query1 + ");";
						query.push(query1);
						// console.log(query1);
					});
				});
			else
				console.log(err);
			callback(query, tables, cnames);
		});

	});
}

var json = {
	"mongohost" : "localhost",
	"mongoport" : "27017",
	"mongodb" : "testdb",
	"mongouser" : "admin",
	"mongopass" : "admin",

	"mysqlhost" : "localhost",
	"mysqluser" : "root",
	"mysqlpass" : "root"
};

convertDB(function(query, tables, cnames, callback) {
	var MongoClient = require('mongodb').MongoClient,
	    format = require('util').format;
	var mysql = require("mysql");

	con1 = mysql.createConnection({
		host : json["mysqlhost"],
		user : json["mysqluser"],
		password : json["mysqlpass"],
		// database : json["mongodb"]
	});

	con1.connect(function(err) {
		if (err) {
			console.log('Error connecting to Db: ' + err);
			return;
		}
		// console.log('Connection established');
		/**
		 * create mysql table
		 */
		// console.log(tables);
		// console.log(cnames);
		// console.log(query);

		// var i = 0;
		query.forEach(function(query1, index) {
			// console.log(index);
			con1.query(query1, function(err, rows, fields) {
				if (err)
					throw err;
				insertDataInTable(con1, tables[index], cnames[index], function(res) {
					console.log(res);
				});
			});
		});
		// con1.end(function(err) {
		// if (err)
		// console.log(err);
		// // The connection is terminated gracefully
		// // Ensures all previously enqueued queries are still
		// // before sending a COM_QUIT packet to the MySQL server.
		// });
	});
});

// Insert data from collection to table
function insertDataInTable(con, tn, cname, callback) {
	var MongoClient = require('mongodb').MongoClient,
	    format = require('util').format;
	var mysql = require("mysql");

	MongoClient.connect('mongodb://' + json["mongohost"] + ':' + json["mongoport"] + '/' + json["mongodb"], function(err, db) {
		if (err)
			throw err;
		var coll = db.collection(cname);
		coll.find().toArray(function(err, items) {
			items.forEach(function(item, index) {
				var query = con.query('INSERT INTO ' + tn + ' SET ?', item, function(err, result) {
					// Neat!
					if (err) {
						if (err["code"] == 'ER_BAD_FIELD_ERROR') {
							// console.log(err[0]);
							checkwhich(db, con, item, tn, function(which) {
								console.log(which);
								which.forEach(function(one, index) {
									var query = con.query('Alter Table ' + tn + ' add column (' + one + ' text);', item, function(err, res) {
										if (err)
											console.log(err);
										else {

											var q = con.query('INSERT INTO ' + tn + ' SET ?', item, function(err, result) {
												// Neat!
												if (err) {
													console.log(err);
												}
											});
											// console.log(res);
										}
									});
								});
							});
						}
					} else {
						console.log("row inserted");
					}
				});

			});
			// db.close();
		});

	});

}

function checkwhich(db, con, item, tn, callback) {
	var MongoClient = require('mongodb').MongoClient,
	    format = require('util').format;
	var mysql = require("mysql");
	var i = 0;
	var which = new Array();
	var item_keys = Object.keys(item);
	con.query('SHOW COLUMNS FROM ' + tn, function(err, results) {
		getColumnsNames(results, function(fields) {
			// console.log(item_keys);
			// console.log(tn + ": " + item_keys);
			// console.log(tn + ": " + fields);
			fields.forEach(function(field, ind) {
				i = ind;
				if (!(field === item_keys[ind])) {
					which.push(item_keys[ind]);
					if (ind == item_keys.length - 1 && item_keys.length == fields.length - 1) {
						console.log(which);
						callback(which);
					} else if (i == fields.length - 1 && i < item_keys.length - 1) {
						item_keys.forEach(function(key, index) {
							if (index == i) {
								which.push(key);
								// console.log(which);
								i++;
								if (i >= item_keys.length) {
									// console.log(which);
									callback(which);
								}
							}
						});
					}
				}
				if (ind >= fields.length - 1) {
					if (fields.length == item_keys.length) {
						console.log(tn + ": " + which);
						callback(which);
					} else {
						item_keys.forEach(function(key, index) {
							if (index == i + 1) {
								which.push(key);
								i++;
								if (i >= item_keys.length - 1) {
									// console.log("fields: " + fields);
									// console.log(tn + ": " + index + ": " + key);
									// console.log(which);
									callback(which);
								}
							}
						});
					}
				}
			});
		});
	});

}

function getColumnsNames(results, callback) {
	var fields = new Array();
	// console.log(results);
	results.forEach(function(result, index) {
		fields.push(result["Field"]);
		if (index >= results.length - 1) {
			callback(fields);
		}
	});

}
