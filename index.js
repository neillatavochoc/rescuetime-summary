const _ = require('lodash');
const moment = require('moment');
const axios = require('axios');

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

const getData = async (date = moment().subtract(1, 'd').format('YYYY-MM-DD')) => {
	const key = process.env.RESCUE_TIME_API_KEY;
	const params = { key };
	if(moment(date).isValid()) {
		params.date = moment(date).format('YYYY-MM-DD');
	}
	const { data } = await axios.get(RESCUE_TIME_URL, { params }).catch(({response}) => {
		if (response.status === 400) {
			console.error('Unauthorized response: Please set RESCUE_TIME_API_KEY (see https://www.rescuetime.com/anapi/manage)');
		} else {
			console.error(`Rescuetime API error: ${response.statusText}`);
		}
		return { data: [] };
	});
	return data.filter((d) => d.date === date)[0];
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
			results.push({ key, name: getNameFromKey(key), value: `${value}`.padStart(2) });
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

const printFormatted = async () => {
	const data = await getData();
	if (!data) {
		return;
	}
	const results = cleanData(data);
	console.log(`Today I logged ${bold(results.find(r => r.key === 'total_duration_formatted').value)}`);
	console.log('Breakdown:');
	results.forEach(r => {
		if (PERCENTAGES.includes(r.key)) {
			console.log(`${bold(r.value)}${bold('%')} ${r.name}`);
		}
	});
	console.log(`Productivity Pulse: ${bold(results.find(r => r.key === 'productivity_pulse').value + '%')}`);
};
 
module.exports = { printFormatted, getData };


