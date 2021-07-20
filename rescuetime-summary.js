#!/usr/bin/env node
const { Command } = require('commander');
const moment = require('moment');
const index = require('./index');
const packageInfo = require('./package.json');

const program = new Command();
program.version = packageInfo.version;

const currentDay = moment().day();

let date = moment();
// if monday, move to previous friday
if (date.day() === 1) {
  date.subtract(3, 'd');
} else {
  date.subtract(1, 'd');
}

program.usage('rescuetime-summary [options]')
.description('Print rescuetime summary of the previous week day in avochoc format')
.option('-k, --key <string>', 'Rescuetime api key. Default is value of env RESCUE_TIME_API_KEY', process.env.RESCUE_TIME_API_KEY)
.option('-d, --date <string>', 'Date for summary in moment recognized format.', date.format('YYYY-MM-DD'))
.action(async () => {
	const opts = program.opts();
  await index.printFormatted(opts.date, opts.key);
});

program.parse(process.argv);


