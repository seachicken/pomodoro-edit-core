export default class Core {
  constructor() {
    this._runningPtext;
    this._runningFileId;
    this._callbacks;
    this._interval;
    this._isPaused;
  }

  findAndCountPomodoroText(text, fileId, callbacks = {}) {
    this._callbacks = callbacks;
    const ptext = this._findPomodoroText(text, fileId);
    if (this._runningPtext
        && ptext.operator === this._runningPtext.operator
        && ptext.time === this._runningPtext.time
        && ptext.content === this._runningPtext.content
        && this._runningFileId === fileId) {
      return;
    }
    
    if (ptext) {
      if (!this._runningPtext
          || ptext.time !== this._runningPtext.time
          || ptext.content !== this._runningPtext.content
          || this._runningFileId !== fileId) {

        if (this._interval) {
          clearInterval(this._interval);
          this._interval = null;
          callbacks.cancel && callbacks.cancel();
        }

        callbacks.start && callbacks.start(ptext);
        const intervalCallback = remaining => {
          callbacks.interval && callbacks.interval(remaining, ptext);
        }
        this._startTimer(ptext.time, intervalCallback)
          .then(() => callbacks.finish && callbacks.finish(ptext));
      }

      this._runningPtext = ptext;
      this._runningFileId = fileId;

      if (ptext.operator === '-') {
        this._isPaused = true;
        return;
      } else if (this._isPaused) {
        this._isPaused = false;
        return;
      }
    } else {
      this._runningPtext = null;

      if (!this._runningFileId || fileId === this._runningFileId) {
        this._clearTimer();
        callbacks.cancel && callbacks.cancel();
      }
    }
  }

  _findPomodoroText(text, id) {
    const lines = text.split('\n');
    let lineNumber = 0;
    let found;
    for (const line of lines) {
      found = line.match(/(?:^|^ *(?:-|\*) |^ *(?:-|\*) \[ \] )\[(-|)p([0-9].*)\] *(.+)/);
      if (found) {
        const checkboxRegex = /^ *(?:-|\*) \[/g;
        const chNumber = checkboxRegex.test(line) ? checkboxRegex.lastIndex : 0;
        return { id, line: lineNumber, ch: chNumber, operator: found[1], time: parseInt(found[2]) * 60, content: found[3] };
      }
      lineNumber++;
    }
    return false;
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
  
  stopTimer() {
    if (this._runningPtext == null) return;

    this._runningPtext = null;
    this._clearTimer();
    this._callbacks.cancel && this._callbacks.cancel();
  }

  retryLatest() {
    if (this._runningPtext == null) return;

    this._clearTimer();

    this._callbacks.start && this._callbacks.start(this._runningPtext);
    const intervalCallback = remaining => {
      this._callbacks.interval && this._callbacks.interval(remaining, this._runningPtext);
    }
    this._startTimer(this._runningPtext.time, intervalCallback)
      .then(() => this._callbacks.finish && this._callbacks.finish(this._runningPtext));

    if (this._runningPtext.operator === '-') {
      this._isPaused = true;
    }
  }
}
