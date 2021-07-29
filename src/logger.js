class LoggerInterface {
  constructor(logger) {
    this.setLogger(logger);
  }

  instance() {
    return this._logger;
  }

  log(line) {
    return this._logger.log(line);
  }

  info(line) {
    return this._logger.info(line);
  }

  warn(line) {
    return this._logger.warn(line);
  }

  error(line) {
    return this._logger.error(line);
  }

  critical(line) {
    return this._logger.critical ? this._logger.critical(line) : this._logger.error(line);
  }

  debug(line) {
    return this._logger.debug(line);
  }

  setLogger(logger) {
    this._logger = logger;
  }
}

const logger = new LoggerInterface(console);

module.exports = { LoggerInterface, logger };
