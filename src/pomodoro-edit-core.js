export default class Core {
  constructor() {
    this._previousPtext;
    this._interval;
  }

  findAndCountPomodoroText(text, callbacks) {
    const ptext = this._findPomodoroText(text);
    if (this._previousPtext
        && ptext.time === this._previousPtext.time
        && ptext.content === this._previousPtext.content) {
      return;
    }
    this._previousPtext = ptext;
    
    if (ptext) {
      this._startTimer(ptext.time, callbacks.interval)
        .then(() => {
          if (callbacks.hasOwnProperty('finish')) {
            callbacks.finish(ptext);
          }
        });
    } else {
      this._stopTimer();
      callbacks.stop();
    }
  }
  
  _findPomodoroText(text) {
    const found = text.match(/(?:^|^ *- |^ *- \[ \] )\[p([0-9].*)\] *(.+)/m);
    const ptext = found == null ? false : { time: found[1], content: found[2] };
    return ptext;
  }
  
  _startTimer(timeText, callback = () => {}) {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    
    let timeSec = parseInt(timeText) * 60;

    return new Promise(resolve => {
      this._interval = setInterval(() => {
        callback(--timeSec);

        if (timeSec <= 0) {
          clearInterval(this._interval);
          this._interval = null;
          
          resolve();
        }
      }, 1000);
    });
  }
  
  _stopTimer() {
    clearInterval(this._interval);
    this._interval = null;
  }
}