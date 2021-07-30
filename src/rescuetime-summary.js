#!/usr/bin/env node
const { Command } = require('commander');
const moment = require('moment');
const index = require('../index');
const packageInfo = require('../package.json');

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

program
  .usage('[options]')
  .description('Print rescuetime summary of the previous week day in avochoc format')
  .option(
    '-k, --key <string>',
    'Rescuetime api key. Default is value of env RESCUE_TIME_API_KEY',
    process.env.RESCUE_TIME_API_KEY
  )
  .option(
    '-d, --date <string>',
    'Date for summary in moment recognized format.',
    date.format('YYYY-MM-DD')
  )
  .option(', --debug', 'Print debug logs', false)
  .option('-c, --clipboard', 'Add output to clipboard', false)
  .action(async () => {
    await index.printFormatted(program.opts());
  });

program.parse(process.argv);
