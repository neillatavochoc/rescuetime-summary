const _ = require('lodash');
const moment = require('moment');
const axios = require('axios');
const { Command } = require('commander');
const { logger } = require('./logger.js');
const { styled } = require('@neilllandman/library');

const OUTPUT_PIPED = !process.stdout.isTTY;

if (OUTPUT_PIPED) {
	logger.setLogger(console);
} else {
	logger.setLogger(styled);
}

const RESCUE_TIME_URL = 'https://www.rescuetime.com/anapi/daily_summary_feed';

let debugEnabled = false;

function debug(str) {
	if (debugEnabled) {
		logger.debug(str);
	}
}

const PERCENTAGES = [
  'software_development_percentage',
  'communication_and_scheduling_percentage',
  'reference_and_learning_percentage',
  'business_percentage',
  'uncategorized_percentage',
  'utilities_percentage',
  'shopping_percentage',
  'social_networking_percentage',
  'design_and_composition_percentage',
  'entertainment_percentage',
  'news_percentage',
  // 'total_duration_formatted',
];


const getData = async (date, key) => {
	const params = { key };
	if(moment(date, moment.ISO_8601).isValid()) {
		params.date = moment(date).format('YYYY-MM-DD');
	} else {
		logger.error(`Error: Invalid date`);
		return null;
	}
	if (!key) {
		logger.error('Error: api key is required');
		return null;
	}

	const { data } = await axios.get(RESCUE_TIME_URL, { params }).catch(({response}) => {
		if (response.status === 400) {
			logger.error('Unauthorized response: Please set RESCUE_TIME_API_KEY (see https://github.com/neillatavochoc/rescuetime-summary)');
		} else {
			logger.error(`Rescuetime API error: ${response.statusText}`);
		}
		return { data: [] };
	});
	return data.filter((d) => d.date === params.date)[0];
};

const getNameFromKey = (key) => key.replace(/(_percentage|_)/g, ' ').trim().replace(/\b./g, (c) => c.toUpperCase());

const cleanData = (data) => {
	const results = [];
	Object.keys(data).forEach(key => {
		if (PERCENTAGES.includes(key) || key === 'total_duration_formatted' || key === 'productivity_pulse') {
			let value = data[`${key}`];
			if (typeof value === 'number') {
				value = Math.round(value);
				if (value < 1) {
					return;
				}
			}
			results.push({ key, name: getNameFromKey(key), value });
		}
	});
	return _.orderBy(results, ['value'], ['desc']);
};

const bold = (str) => {
	if (OUTPUT_PIPED) {
		return str;
	}
	return `*${str}*`;
	const escape = '\u001b[';
	const base = `${escape}0m`;
	const boldCode = 1;
	return `${escape}${boldCode}m${str}${base}`;
};

let output = '';

function write(str, level = 'log') {
	logger[level](str);
	output += `${str}\n`;
}

const printHeader = (date) => {
	if (!OUTPUT_PIPED) {
		const dateString = bold(moment(date).format('ddd, MMM DD YYYY'));
		logger.info(dateString);
		logger.log('-'.repeat(dateString.length));
	}	
}

function copyToClipboard(input) {
	// TODO: Do better
	const execute = (cmd, args = []) => {
		const p = require('child_process').spawnSync(cmd, args, { input });
		return !p.error;
	}

  const { platform } = process;
	switch (platform) {
		case 'linux':
			if (execute('wl-scopy', ['-o'])) {
				logger.info('copied to clipboard (linux: wl-copy)');
			} else {
				if (execute('xusel', ['--clipboard', '--input'])) {
					logger.info('copied to clipboard (linux: xsel)');
				} else {
					if (execute('xclip', ['-loops', '1', '-selection', 'clipboard'])) {
						logger.info('copied to clipboard (linux: xclip)');
					} else {
						logger.warn('Could not copy to clipboard');
					}
				}
			}
			break;
		case 'darwin':
			const r = require('child_process').spawn('pbcopy');
			r.on('spawn', () => {
				r.stdin.write(data);
				r.stdin.end();
				logger.info('copied to clipboard (darwin: pbcopy)');
			});
			r.on('error', () => {
				debug('darwin: pbcopy failed');
			});
			break;
		case 'windows':
			const s = require('child_process').spawn('clip');
			s.on('spawn', () => {
				s.stdin.write(data);
				s.stdin.end();
				logger.info('copied to clipboard (windows: clip)');
			});
			s.on('error', () => {
				debug('windows: clip failed');
			});
			break;
		default:
			debug(`unsupported platform ${platform}`);
			break;
	}
}

const printFormatted = async ({ date, key, debug, clipboard }) => {
	debugEnabled = debug;
	const data = await getData(date, key);
	if (!data) {
		if(!OUTPUT_PIPED) {
			write(`No data found for ${date}`);
		}
		return;
	}
	const results = cleanData(data);
	printHeader(date);
	write(`Yesterday I logged ${bold(results.find(r => r.key === 'total_duration_formatted').value)}`);
	write('Breakdown:');
	results.forEach(r => {
		if (PERCENTAGES.includes(r.key)) {
			write(`${bold(r.value + '%')} ${r.name}`);
		}
	});
	write(`Productivity Pulse: ${bold(results.find(r => r.key === 'productivity_pulse').value + '%')}`);
	if (clipboard) {
		copyToClipboard(output);
	}
};

module.exports = { printFormatted, getData };

