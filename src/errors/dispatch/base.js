import _ from 'lodash';

export default class DispatchError extends Error {
  constructor(err) {
    super(_.isString(err) ? err : err.message);

    this.originalError = null;

    if (! _.isString(err)) {
      this.originalError = err;
      this.message = err.message;
      this.stack = err.stack || new Error().stack;
    } else {
      this.message = err;
      this.state = new Error().stack;
    }

    this.name = this.constructor.name;
  }
};
