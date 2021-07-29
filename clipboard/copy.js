const executeSync = (cmd, args = [], input) => {
	const p = require('child_process').spawnSync(cmd, args, { input });
	return !p.error;
}

function wlCopy(input) {
  return executeSync('wl-scopy', ['-o'], input);
}

function xSelCopy(input) {
	return executeSync('xusel', ['--clipboard', '--input'], input);
}

function xClipCopy(input) {
	return executeSync('xclip', ['-loops', '1', '-selection', 'clipboard']);
}

function linuxCopy(input) {
	if (wlCopy(input)) {
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
}

function copy(input) {
	// TODO: Do better
  const { platform } = process;
	switch (platform) {
		case 'linux':
			linuxCopy(input);
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

module.exports = { copy };
