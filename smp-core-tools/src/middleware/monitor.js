
global.requestCounter = {
  count: 1,
  update: function () {
    this.count++;
  }
}

global.heartbeat = {
  lastPing: Date.now(),
  interval: 5000,
  timeOut: 10000,
  timeOutCount: 0,
  heartbeat: 1,
  maxTimeOut: 5,
  updateHeartbeat: function () {
    this.lastPing = Date.now();
    this.heartbeat++;
  },
  getHeartbeat: function () {
    return this.heartbeat;
  }

}

function requestCounter(req, res, next) {
  global.requestCounter.update();
  next(); // pass to the next middleware
}

export { requestCounter };