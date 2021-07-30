const { exec, spawn, spawnSync } = require('child_process');
const { logger } = require('../logger.js');

const executeSync = (cmd, args = [], input) => {
  const p = spawnSync(cmd, args, { input });
  return !p.error;
};

const pause = (t) => new Promise((resolve) => setTimeout(resolve, t));

function wlCopy(input) {
  return executeSync('wl-copy', ['-o'], input);
}

function xSelCopy(input) {
  return executeSync('xsel', ['--clipboard', '--input'], input);
}

async function xClipCopy(input) {
  const p = exec(`echo "${input}" | xclip -selection clipboard -loops 1`);
}

function pbcopy(input) {
  return executeSync('pbcopy', [], input);
}

function clipCopy(input) {
  const s = require('child_process').spawn('clip');
  s.on('spawn', () => {
    s.stdin.end(input);
    logger.info('copied to clipboard (windows: clip)');
  });
  s.on('error', () => {
    logger.warn('windows: clip failed');
  });
}

function linuxCopy(input) {
  if (wlCopy(input)) {
    logger.info('copied to clipboard (linux: wl-copy)');
  } else {
    if (xSelCopy(input)) {
      logger.info('copied to clipboard (linux: xsel)');
    } else {
      if (xClipCopy(input)) {
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
      if (pbcopy(input)) {
        logger.info('copied to clipboard (darwin: pbcopy)');
      } else {
        logger.warn('could not copy to clipboard');
      }
      break;
    case 'win32':
      clipCopy(input);
      break;
    default:
      logger.warn(`Could not copy to clipboard: unsupported platform ${platform}`);
      break;
  }
}

module.exports = copy;
