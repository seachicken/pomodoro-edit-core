import { parse } from './syntax-parser';

const LONGEST_LOOP = 99;

export default class Core {

  constructor() {
    this._runningPtext;
    this._runningFileId;
    this._callbacks;
    this._interval;
    this._isPaused;
    this._timerCallbacks = {
      interval: (remainingSec, durationSec, stepNos) => {
        this._callbacks.interval && this._callbacks.interval(remainingSec, durationSec, stepNos, this._runningPtext);
      },
      step: () => this._callbacks.step && this._callbacks.step(this._runningPtext)
    };
  }

  findAndStartTimer(text, fileId, callbacks = {}) {
    this._callbacks = callbacks;
    const ptext = this._findPomodoroText(text, fileId);
    if (this._runningPtext
        && ptext.operator === this._runningPtext.operator
        && ptext.syntax === this._runningPtext.syntax
        && ptext.content === this._runningPtext.content
        && fileId === this._runningFileId) {
      return;
    }
    
    if (ptext) {
      if (!this._runningPtext
          || ptext.content !== this._runningPtext.content
          || ptext.syntax !== this._runningPtext.syntax
          || fileId !== this._runningFileId) {

        if (this._interval) {
          clearInterval(this._interval);
          this._interval = null;
          callbacks.cancel && callbacks.cancel();
        }

        callbacks.start && callbacks.start(ptext);
        this._startTimer(ptext.ast, this._timerCallbacks)
          .then(() => callbacks.finish && callbacks.finish(ptext));
      }

      this._runningPtext = ptext;
      this._runningFileId = fileId;

      if (ptext.operator === '-') {
        this._isPaused = true;
      } else if (this._isPaused) {
        this._isPaused = false;
      }
    } else {
      if (!this._runningFileId || fileId === this._runningFileId) {
        this._runningPtext = null;
        this._clearTimer();
        callbacks.cancel && callbacks.cancel();
      }
    }
  }

  _findPomodoroText(text, id) {
    const lines = text.split('\n');
    let lineNumber = 0;
    for (const line of lines) {
      const found = line.match(/^ *(?:- |\* |)(?:\[ \] |)\[(-|)([p0-9() ]+)\] *(.+)/);
      if (found) {
        const syntax = found[2];
        if (syntax.trim().length === 0) {
          continue;
        }
        const ast = parse(syntax);
        if (ast.length === 0) {
          return false;
        }
        const operator = found[1];
        const content = found[3];
        const checkboxRegex = /^ *(?:-|\*) \[/g;
        const checkboxOffset = checkboxRegex.test(line) ? checkboxRegex.lastIndex : 0;
        return { id, line: lineNumber, checkboxOffset, operator, syntax, ast, content };
      }
      lineNumber++;
    }
    return false;
  }

  _startTimer(ast, callbacks) {
    const results = [];
    this._convertToPromises(ast, callbacks, results);
    return results
      .reduce((p, n, i) => p.then(() => {
        if (0 < i && i < results.length) {
          callbacks.step();
        }
        return n();
      }), Promise.resolve());
  }

  _convertToPromises(ast, callback, results, stepNos = []) {
    if (ast.length === 0) {
      return;
    }

    ast = JSON.parse(JSON.stringify(ast));
    const timer = ast.shift();

    if (timer.childNodes) {
      stepNos.push(1);
      if (timer.loop === 0) {
        timer.loop = LONGEST_LOOP;
      }
      for (let i = timer.loop; i > 0; i--) {
        stepNos[stepNos.length - 1] = timer.loop - i + 1;
        this._convertToPromises(timer.childNodes, callback, results, stepNos);
      }
      stepNos.pop();
    }

    if (timer.timeSec) {
      const displayStepNos = this._convertToDisplayStepNos(stepNos);
      results.push(() => this._createTimer(timer.timeSec, callback, displayStepNos));
    }

    this._convertToPromises(ast, callback, results, stepNos);
  }

  _convertToDisplayStepNos(stepNos) {
    let result = '';
    if (stepNos.length > 0) {
      for (const [i, stepNo] of stepNos.entries()) {
        result += stepNo;
        if (i + 1 < stepNos.length) {
          result += '-';
        }
      }
    }
    return result;
  }

  _createTimer(timeSec, callbacks, stepNos) {
    return new Promise(resolve => {
      let remainingSec = timeSec;
      this._interval = setInterval(() => {
        if (this._isPaused) return;

        callbacks.interval(--remainingSec, timeSec, stepNos);

        if (remainingSec <= 0) {
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
    if (!this._runningPtext) return;

    this._clearTimer();

    this._callbacks.start && this._callbacks.start(this._runningPtext);
    this._startTimer(this._runningPtext.ast, this._timerCallbacks)
      .then(() => this._callbacks.finish && this._callbacks.finish(this._runningPtext));

    if (this._runningPtext.operator === '-') {
      this._isPaused = true;
    }
  }
}
