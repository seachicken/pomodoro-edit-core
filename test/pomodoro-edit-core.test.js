import Core from '../src/pomodoro-edit-core';

describe('pomodoro-edit-core', () => {
  let core = null;

  beforeEach(() => {
    core = new Core();
  });
  
  describe('findAndCountPomodoroText', () => {

    describe('callback start', () => {
      test('can find "[p1] xxx"', done => {
        core.findAndCountPomodoroText('[p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });
      
      test('can find "- [p1] xxx"', done => {
        core.findAndCountPomodoroText('- [p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });
      
      test('can find "  - [p1] xxx"', done => {
        core.findAndCountPomodoroText('  - [p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });
      
      test('can find "* [p1] xxx"', done => {
        core.findAndCountPomodoroText('* [p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });
      
      test('can find "- [ ] [p1] xxx"', done => {
        core.findAndCountPomodoroText('- [ ] [p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });
      
      test('can find "  - [ ] [p1] xxx"', done => {
        core.findAndCountPomodoroText('  - [ ] [p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });

      test('can find "* [ ] [p1] xxx"', done => {
        core.findAndCountPomodoroText('* [ ] [p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });
      
      test('ignores when spaces before content', done => {
        core.findAndCountPomodoroText('[p1]  xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });

      test('can call a start callback when uncomment after comment out', done => {
        core.findAndCountPomodoroText('- [p1] xxx', '');

        core.findAndCountPomodoroText('<!-- - [p1] xxx -->', '');

        core.findAndCountPomodoroText('- [p1] xxx', '', {
          start: () => done()
        });
      });
    });

    describe('callback finish', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });
      
      test('does not reset timer when PomodoroText is the same as last time', done => {
        core.findAndCountPomodoroText('[p1] xxx', '', {
          finish: actual => done()
        });
          
        jest.advanceTimersByTime(30 * 1000);
        
        core.findAndCountPomodoroText('[p1] xxx', '', {});
        
        jest.advanceTimersByTime(30 * 1000);
      });
      
      test('reset timer when PomodoroText is the difference as last time', done => {
        core.findAndCountPomodoroText('[p1] xxx', '', {});
          
        jest.advanceTimersByTime(30 * 1000);
        
        core.findAndCountPomodoroText('[p1] yyy', '', {
          finish: actual => {
            expect(actual.time).toBe(1 * 60);
            expect(actual.content).toBe('yyy');
            done();
          }
        });
        
        jest.advanceTimersByTime(60 * 1000);
      });
    });
    
    describe('callback interval', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });
      
      test('can count remaining time and return found PomodoroText', done => {
        let expected = 60;
        
        core.findAndCountPomodoroText('[p1] xxx', '', {
          interval: (remaining, ptext) => {
            expect(remaining).toBe(--expected);  // counts 59, 58, ..., 0
            expect(ptext.content).toBe('xxx');
          },
            
          finish: () => done()
        });
        jest.advanceTimersByTime(60 * 1000);
      });

      test('can pause and resume timer when find the pause symbol', done => {
        let actual = 0;

        core.findAndCountPomodoroText('[p1] xxx', '', {
          interval: remaining => actual = remaining,

          finish: () => done()
        });

        jest.advanceTimersByTime(10 * 1000);

        core.findAndCountPomodoroText('[-p1] xxx', '', {});

        // not counted here
        jest.advanceTimersByTime(10 * 1000);

        expect(actual).toBe(50);

        core.findAndCountPomodoroText('[p1] xxx', '', {});

        jest.advanceTimersByTime(50 * 1000);
      });

      test('can count the timer from the beginning when the timer paused and cancelled', done => {
        // Arrange
        core.findAndCountPomodoroText('[p1] xxx', '', {});
        core.findAndCountPomodoroText('[-p1] xxx', '', {});
        core.findAndCountPomodoroText('', '', {});

        // Act
        let actual = 0;
        core.findAndCountPomodoroText('[p1] xxx', '', {
          interval: remaining => actual = remaining
        });

        jest.advanceTimersByTime(10 * 1000);

        // Assert
        expect(actual).toBe(50);

        core.findAndCountPomodoroText('', '', {
          cancel: () => done()
        });
      });

      test('can count the timer when unpausing PomodoroText that has been paused from the begining', done => {
        core.findAndCountPomodoroText('- [-p1] xxx', '', {
          interval: () => done()
        });

        core.findAndCountPomodoroText('- [p1] xxx', '');

        jest.advanceTimersByTime(1 * 1000);
      });
    });

    describe('callback cancel', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      test('return false when PomodoroText is not found', done => {
        core.findAndCountPomodoroText('', '', {
          cancel: () => done()
        });
      });
      
      test('return false when empty content', done => {
        core.findAndCountPomodoroText('[p1]', '', {
          cancel: () => done()
        });
      });
      
      test('return false when empty content have next lines', done => {
        core.findAndCountPomodoroText('[p1]\nxxx', '', {
          cancel: () => done()
        });
      });

      test('can call a cancel callback when PomodoroText changed', done => {
        core.findAndCountPomodoroText('[p1] xxx', '', {});

        core.findAndCountPomodoroText('[p1] yyy', '', {
          cancel: () => done()
        });
      });

      test('should cancel the timer when searching in another markdown file has PomodoroText', done => {
        core.findAndCountPomodoroText('[p1] xxx', 'a.md', {});

        core.findAndCountPomodoroText('[p1] xxx', 'b.md', {
          cancel: done
        });
      });

      test('should not cancel the timer when searching in another markdown file has not PomodoroText', done => {
        let cancel = jest.fn();

        core.findAndCountPomodoroText('[p1] xxx', 'a.md', {
          cancel: cancel,
          finish: () => {
            expect(cancel).not.toHaveBeenCalled();
            done();
          }
        });

        core.findAndCountPomodoroText('', 'b.md', {
          cancel: () => cancel
        });

        jest.advanceTimersByTime(60 * 1000);
      });
    });
  });

  describe('stopTimer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    test('should called cancel', done => {
      core.findAndCountPomodoroText('[p1] xxx', '', {
        cancel: () => done()
      });

      core.stopTimer();
    });

    test('should reset timer', done => {
      core.findAndCountPomodoroText('[p1] xxx', '');
      jest.advanceTimersByTime(10 * 1000);

      core.stopTimer();

      let interval = jest.fn();
      core.findAndCountPomodoroText('[p1] xxx', '', {
        interval: interval,
        finish: () => {
          expect(interval.mock.calls.length).toBe(60);
          done();
        }
      });
      jest.advanceTimersByTime(60 * 1000);
    });
  });

  describe('retryLatest', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    test('should called start twice', done => {
      let start = jest.fn();

      core.findAndCountPomodoroText('[p1] xxx', '', {
        start: start,
        finish: () => {
          expect(start.mock.calls.length).toBe(2);
          done();
        }
      });

      core.retryLatest();

      jest.advanceTimersByTime(60 * 1000);
    });

    test('if timer is paused, reset timer and pause', done => {
      let interval1 = jest.fn();
      let interval2 = jest.fn();

      core.findAndCountPomodoroText('[p1] xxx', '', {
        interval: interval1,
      });
      
      jest.advanceTimersByTime(10 * 1000);

      core.findAndCountPomodoroText('[-p1] xxx', '');

      core.retryLatest();

      jest.advanceTimersByTime(60 * 1000); // timer is not counted

      core.findAndCountPomodoroText('[p1] xxx', '', {
        interval: interval2,
        finish: () => {
          expect(interval1.mock.calls.length).toBe(10);
          expect(interval2.mock.calls.length).toBe(60);
          done();
        }
      });

      jest.advanceTimersByTime(60 * 1000);
    });
  });
});
