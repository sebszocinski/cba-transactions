const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const moment = require('moment')
const CREDS = require('./creds');
const Push = require( 'pushover-notifications' )

const adapter = new FileSync('db.json')
const db = low(adapter)

const today = moment().format('DD MMM YYYY');
const date = '26 Apr 2018'
const amount = '3.07'

const count = db
	.get('transactions')
	.size()
	.value()

const transactions = db
	.get('transactions')
	.value()

const transaction = db
	.get('transactions')
	.last()
	.value()

const todaysTotal = db
	.get('transactions')
	.filter({ date: today })
	.value()

if (transaction.date === date && transaction.amount === amount) {
	// do nothing
}
else {
	// add transaction
	db.get('transactions')
		.push({ id: count +1, date: date, amount: amount})
		.write()
	console.log('New Tranaction: ' + amount)

	var total = 0;
	for(var i in todaysTotal) {
		total += parseFloat(todaysTotal[i].amount);
	}

	console.log('Spent Today: ' + total)


	var p = new Push( {
		user: CREDS.pushover_user,
		token: CREDS.pushover_token,
	})

	var msg = {
		message: 'Amount: $' + amount + ' (Today: $' + total + ')',	// required
		title: "New Transaction",
		sound: 'magic',
		device: CREDS.pushover_device,
		priority: 1
	}

	p.send( msg, function( err, result ) {
		if ( err ) {
			throw err
		}

		console.log( result )
	})


}
