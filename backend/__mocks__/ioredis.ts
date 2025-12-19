export default class Redis {
  constructor() {}
  connect() { return Promise.resolve(); }
  on(event, callback) { return this; }
  get() { return Promise.resolve(null); }
  set() { return Promise.resolve('OK'); }
  del() { return Promise.resolve(1); }
  quit() { return Promise.resolve(); }
  disconnect() { return Promise.resolve(); }
  status = 'ready';
  subscribe() { return Promise.resolve(); }
  publish() { return Promise.resolve(); }
  eval() { return Promise.resolve(); }
  evalsha() { return Promise.resolve(); }
  pipeline() { return { exec: () => Promise.resolve([]) }; }
  multi() { return { exec: () => Promise.resolve([]) }; }
};
