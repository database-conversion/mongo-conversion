Conversion/migration of mongo db to sql databases using only the basic configurations for mongo db location and destination db info.

Mongo migration is written in nodejs. Currently It can convert any mongodb database to mysql database. It needs json object which will contain the connection configuration information for both mongodb and mysql. It will connect to source mongodb and create the destination mysql database, tables(from mongodb collections). Also will get all data from mongo collections and add to the respective mysql tables created during migration. 
