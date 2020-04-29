export default class Core {
  constructor() {
    this._runningPtext;
    this._runningFileId;
    this._callbacks;
    this._interval;
    this._remaining;
    this._isPaused;
  }

  findAndStartTimer(text, fileId, callbacks = {}) {
    this._callbacks = callbacks;
    const ptext = this._findPomodoroText(text, fileId);
    if (this._runningPtext
        && ptext.operator === this._runningPtext.operator
        && ptext.time === this._runningPtext.time
        && ptext.extraTime === this._runningPtext.extraTime
        && ptext.content === this._runningPtext.content
        && this._runningFileId === fileId) {
      return;
    }
    
    if (ptext) {
      const intervalCallback = remaining => {
        this._remaining = remaining;
        callbacks.interval && callbacks.interval(remaining, ptext);
      }

      if (!this._runningPtext
          || ptext.time !== this._runningPtext.time
          || ptext.content !== this._runningPtext.content
          || this._runningFileId !== fileId) {

        if (this._interval) {
          clearInterval(this._interval);
          this._interval = null;
          callbacks.cancel && callbacks.cancel();
        }
        const time = ptext.time + (ptext.extraTime || 0);
        this._remaining = time;

        callbacks.start && callbacks.start(ptext);
        this._startTimer(time, intervalCallback)
          .then(() => callbacks.finish && callbacks.finish(ptext));
      } else if (this._runningPtext && ptext.extraTime !== this._runningPtext.extraTime) {
        clearInterval(this._interval);
        const time = this._remaining + (ptext.extraTime || 0) - (this._runningPtext.extraTime || 0);
        if (time > 0) {
          this._startTimer(time, intervalCallback)
            .then(() => callbacks.finish && callbacks.finish(ptext));
        } else {
          intervalCallback(0);
          callbacks.finish && callbacks.finish(ptext);
        }
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
    for (const line of lines) {
      const found = line.match(/(?:^|^ *(?:-|\*) |^ *(?:-|\*) \[ \] )\[(-|)p([0-9]+)(\+[0-9]+|)\] *(.+)/);
      if (found) {
        if (parseInt(found[2]) <= 0) continue;

        const checkboxRegex = /^ *(?:-|\*) \[/g;
        const checkboxCh = checkboxRegex.test(line) ? checkboxRegex.lastIndex : 0;
        const extraTimeRegex = /\[(?:-|)p[0-9]+/g;
        const extraTimeCh = extraTimeRegex.test(line) ? extraTimeRegex.lastIndex : 0;
        const extraTime = found[3] ? parseInt(found[3]) * 60 : 0;
        return {
          id,line: lineNumber, checkboxCh, extraTimeCh,
          operator: found[1], time: parseInt(found[2]) * 60, extraTime, content: found[4]
        };
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
    this._remaining = 0;
    this._isPaused = false;
  }
  
  stopTimer() {
    if (this._runningPtext == null) return;

    this._runningPtext = null;
    this._clearTimer();
    this._callbacks.cancel && this._callbacks.cancel();
  }

  retryLatest() {
    if (!this._runningPtext) return;

    this._clearTimer();

    this._callbacks.start && this._callbacks.start(this._runningPtext);
    const intervalCallback = remaining => {
      this._remaining = remaining;
      this._callbacks.interval && this._callbacks.interval(remaining, this._runningPtext);
    }
    const time = this._runningPtext.time + (this._runningPtext.extraTime || 0);
    this._remaining = time;
    this._startTimer(time, intervalCallback)
      .then(() => this._callbacks.finish && this._callbacks.finish(this._runningPtext));

    if (this._runningPtext.operator === '-') {
      this._isPaused = true;
    }
  }
}
