const puppeteer = require('puppeteer');
const CREDS = require('./creds');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const moment = require('moment')
const Push = require( 'pushover-notifications' )

const adapter = new FileSync('db.json')
const db = low(adapter)

async function run() {
	const browser = await puppeteer.launch({
		headless: true
	});
	const page = await browser.newPage();
	const USERNAME_SELECTOR = '#txtMyClientNumber_field';
	const PASSWORD_SELECTOR = '#txtMyPassword_field';
	const BUTTON_SELECTOR = '#btnLogon_field';

	await page.goto('https://netbank.com.au');

	await page.click(USERNAME_SELECTOR);
	await page.keyboard.type(CREDS.cba_username);

	await page.click(PASSWORD_SELECTOR);
	await page.keyboard.type(CREDS.cba_password);

	await page.click(BUTTON_SELECTOR);

	await page.waitForNavigation();

	const ACCOUNT_SELECTOR = 'a[title="' + CREDS.cba_account + '"]'
	await page.click(ACCOUNT_SELECTOR);

	await page.waitFor(3 * 1000);

	const LIST_DATE_SELECTOR = '#transactionsTableBody tr.pending:not(.pending_header) td.date';
	const LIST_AMOUNT_SELECTOR = '#transactionsTableBody tr.pending:not(.pending_header) td.align_right span.currencyUI';

	const LENGTH_SELECTOR_CLASS = '#transactionsTableBody tr.pending:not(.pending_header)';

	let date = await page.evaluate((sel) => {
		var element = document.querySelector(sel);
		return element.innerText;
	}, LIST_DATE_SELECTOR);

	let amount = await page.evaluate((sel) => {
		var element = document.querySelector(sel);
		element = element.innerText.split('-$ ').pop();
		return element;
	}, LIST_AMOUNT_SELECTOR);

	console.log(date, ' -> ', amount);

	const today = moment().format('DD MMM YYYY');
	// const date = '26 Apr 2018'
	// const amount = '7.00'

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

		var totalSpent = 0;
		for(var i in todaysTotal) {
			totalSpent += parseFloat(todaysTotal[i].amount);
		}

		console.log('Spent Today: ' + totalSpent)

		var p = new Push( {
			user: CREDS.pushover_user,
			token: CREDS.pushover_token,
		})

		var msg = {
			message: 'Amount: $' + amount + ' (Today: $' + totalSpent + ')',	// required
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

	console.log('done')
	browser.close();
}

run();
