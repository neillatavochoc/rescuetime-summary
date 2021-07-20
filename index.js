const _ = require('lodash');
const moment = require('moment');
const axios = require('axios');
const { Command } = require('commander');
const { logger } = require('./logger.js');
const { styled } = require('@neilllandman/library');

logger.setLogger(styled);

const RESCUE_TIME_URL = 'https://www.rescuetime.com/anapi/daily_summary_feed';

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
			results.push({ key, name: getNameFromKey(key), value: `${value}`.padStart(4) });
		}
	});
	return _.orderBy(results, ['value'], ['desc']);
};

const bold = (str) => {
	const escape = '\u001b[';
	const base = `${escape}0m`;
	const boldCode = 1;
	return `${escape}${boldCode}m${str}${base}`;
};

const printFormatted = async (date, key) => {
	const data = await getData(date, key);
	if (!data) {
		return;
	}
	const results = cleanData(data);
	logger.info(bold(moment(data.date).format('ddd, MMM DD YYYY')));
	logger.log(`Today I logged ${bold(results.find(r => r.key === 'total_duration_formatted').value)}`);
	logger.log('Breakdown:');
	results.forEach(r => {
		if (PERCENTAGES.includes(r.key)) {
			logger.log(`${bold(r.value)}${bold('%')} ${r.name}`);
		}
	});
	logger.log(`Productivity Pulse: ${bold(results.find(r => r.key === 'productivity_pulse').value + '%')}`);
};
 
module.exports = { printFormatted, getData };



