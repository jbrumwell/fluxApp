import { BaseStore } from '../';

export default class ReduceStore extends BaseStore {
  _processActionEvent(payload) {
    const state = this.reduce(this.getState(), payload);

    this.replaceState(state);

    return this;
  }

  reduce() {
    throw new Error('Fluxapp:ReduceStore must implement a "reduce" method');
  }
}
