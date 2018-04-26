const puppeteer = require('puppeteer');
const CREDS = require('./creds');
const moment = require('moment');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

async function run() {
	const browser = await puppeteer.launch({
		headless: false
	});
	const page = await browser.newPage();
	const USERNAME_SELECTOR = '#txtMyClientNumber_field';
	const PASSWORD_SELECTOR = '#txtMyPassword_field';
	const BUTTON_SELECTOR = '#btnLogon_field';

	await page.goto('https://netbank.com.au');

	await page.click(USERNAME_SELECTOR);
	await page.keyboard.type(CREDS.username);

	await page.click(PASSWORD_SELECTOR);
	await page.keyboard.type(CREDS.password);

	await page.click(BUTTON_SELECTOR);

	await page.waitForNavigation();

	const ACCOUNT_SELECTOR = 'a[title="Savings"]'
	await page.click(ACCOUNT_SELECTOR);

	await page.waitFor(5 * 1000);

	await page.screenshot({ path: 'screenshots/screenshot.png' });

	console.log('Saved screenshot.')

	const LIST_DATE_SELECTOR = '#transactionsTableBody tr.pending:not(.pending_header):nth-child(INDEX) td.date';
	const LIST_AMOUNT_SELECTOR = '#transactionsTableBody tr.pending:not(.pending_header):nth-child(INDEX) td.align_right span.currencyUI';

	const LENGTH_SELECTOR_CLASS = '#transactionsTableBody tr.pending:not(.pending_header)';

	let listLength = await page.evaluate((sel) => {
		return document.querySelectorAll(sel).length;
	}, LENGTH_SELECTOR_CLASS);

	console.log('Pending Transactions: ' + listLength);

	for (let i = 2; i <= 2; i++) {
		// change the index to the next child
		let dateSelector = LIST_DATE_SELECTOR.replace("INDEX", i);
		let amountSelector = LIST_AMOUNT_SELECTOR.replace("INDEX", i);

		let date = await page.evaluate((sel) => {
			var element = document.querySelector(sel);
			return element.innerText;
		}, dateSelector);

		let amount = await page.evaluate((sel) => {
			var element = document.querySelector(sel);
			element = element.innerText.split('-$ ').pop();
			return element;
		}, amountSelector);

		var today = moment().format('DD MMM YYYY');
		var transDate = moment(date).format('DD MMM YYYY');

		// console.log('today: ' + today);
		// console.log('transDate: ' + transDate);

		if (today === transDate) {
			console.log(date, ' -> ', amount);
		}

		// TODO save this user
	}

	console.log('done')


	browser.close();
}


run();
