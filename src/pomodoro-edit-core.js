export default class Core {
  constructor() {
    this._runningPtext;
    this._runningFilePath;
    this._interval;
    this._isPaused;
  }

  findAndCountPomodoroText(text, filePath, callbacks) {
    const ptext = this._findPomodoroText(text);
    if (this._runningPtext
        && ptext.operator === this._runningPtext.operator
        && ptext.time === this._runningPtext.time
        && ptext.content === this._runningPtext.content
        && this._runningFilePath === filePath) {
      return;
    }
    
    if (ptext) {
      this._runningPtext = ptext;
      this._runningFilePath = filePath;

      if (ptext.operator === '-') {
        this._isPaused = true;
        return;
      } else if (this._isPaused) {
        this._isPaused = false;
        return;
      }

      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
        callbacks.cancel && callbacks.cancel();
      }

      callbacks.start && callbacks.start();
      function intervalCallback(remaining) {
        callbacks.interval && callbacks.interval(remaining, ptext);
      }
      this._startTimer(ptext.time, intervalCallback)
        .then(() => callbacks.finish && callbacks.finish(ptext));
    } else {
      if (!this._runningFilePath || filePath === this._runningFilePath) {
        this._clearTimer();
        callbacks.cancel && callbacks.cancel();
      }
    }
  }
  
  _findPomodoroText(text) {
    const found = text.match(/(?:^|^ *- |^ *- \[ \] )\[(-|)p([0-9].*)\] *(.+)/m);
    const ptext = found == null ? false : { operator: found[1], time: parseInt(found[2]) * 60, content: found[3] };
    return ptext;
  }
  
  _startTimer(timeSec, callback) {
    return new Promise(resolve => {
      this._interval = setInterval(() => {
        if (this._isPaused) return;

        callback(--timeSec);

        if (timeSec <= 0) {
          clearInterval(this._interval);
          this._interval = null;
          
          resolve();
        }
      }, 1000);
    });
  }
  
  _clearTimer() {
    clearInterval(this._interval);
    this._interval = null;
    this._isPaused = false;
  }
}