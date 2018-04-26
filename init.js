const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const CREDS = require('./creds');

const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ transactions: [], user: {}, count: 0 })
	.write()

db.set('user.name', CREDS.db_user)
	.write()
