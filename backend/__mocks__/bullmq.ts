export const Queue = class {
  constructor() {}
  add() { return Promise.resolve(); }
  process() {}
  on() {}
  emit() {}
  close() { return Promise.resolve(); }
};

export const Worker = class {
  constructor() {}
  on() {}
  close() { return Promise.resolve(); }
};

export const QueueScheduler = class {
  constructor() {}
  close() { return Promise.resolve(); }
};
