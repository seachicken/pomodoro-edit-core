import Core, { getReplacementRange } from '../src/pomodoro-edit-core';
import FakeTimers from "@sinonjs/fake-timers";

describe('pomodoro-edit-core', () => {
  let core;
  let clock;

  beforeEach(() => {
    clock = FakeTimers.install();
    core = new Core();
  });

  afterEach(() => {
    clock.uninstall();
  });
  
  describe('findAndStartTimer', () => {

    describe('callback start', () => {

      test('can find "[p1] xxx"', done => {
        core.findAndStartTimer('[p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });
      
      test('can find "- [p1] xxx"', done => {
        core.findAndStartTimer('- [p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });
      
      test('can find "  - [p1] xxx"', done => {
        core.findAndStartTimer('  - [p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });
      
      test('can find "* [p1] xxx"', done => {
        core.findAndStartTimer('* [p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });
      
      test('can find "- [ ] [p1] xxx"', done => {
        core.findAndStartTimer('- [ ] [p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });
      
      test('can find "  - [ ] [p1] xxx"', done => {
        core.findAndStartTimer('  - [ ] [p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });

      test('can find "* [ ] [p1] xxx"', done => {
        core.findAndStartTimer('* [ ] [p1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });

      test('can find "- [ ] [(p1✍️)1] xxx"', done => {
        core.findAndStartTimer('- [ ] [(p1✍️)1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });

      test('can find "- [ ] [(1m✍️)1] xxx"', done => {
        core.findAndStartTimer('- [ ] [(1m✍️)1] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });

      test('can find "- [ ] [(1m✍️)1] [a] xxx"', done => {
        core.findAndStartTimer('- [ ] [(1m✍️)1] [a] xxx', '', {
          start: actual => {
            expect(actual.content).toBe('[a] xxx');
            done();
          }
        });
      });

      test('can find "- [ ] [1m] yyy" from multiple lines', done => {
        core.findAndStartTimer(
          '- [ ] [a] xxx\n' +
          '  - [ ] [1m] yyy',
          '', {
          start: actual => {
            expect(actual.content).toBe('yyy');
            done();
          }
        });
      });
      
      test('ignores when spaces before content', done => {
        core.findAndStartTimer('[p1]  xxx', '', {
          start: actual => {
            expect(actual.content).toBe('xxx');
            done();
          }
        });
      });

      test('should return id', done => {
        core.findAndStartTimer('[p1] xxx', 'a', {
          start: ptext => {
            expect(ptext.id).toBe('a');
            done();
          }
        });
      });
      
      test('should return number of lines and chracters', done => {
        core.findAndStartTimer('a\n- [ ] [p1] xxx', '', {
          start: ptext => {
            expect(ptext.line).toBe(1);
            expect(ptext.checkboxOffset).toBe(3);
            done();
          }
        });
      });

      test('can call a start callback when uncomment after comment out', done => {
        core.findAndStartTimer('- [p1] xxx', '');

        core.findAndStartTimer('<!-- - [p1] xxx -->', '');

        core.findAndStartTimer('- [p1] xxx', '', {
          start: () => done()
        });
      });
    });

    describe('callback finish', () => {
      
      test('does not reset timer when PomodoroText is the same as last time', done => {
        core.findAndStartTimer('[p1] xxx', '', {
          finish: () => done()
        });

        clock.tickAsync(30 * 1000)
          .then(() => core.findAndStartTimer('[p1] xxx', '', {}))
          .then(() => clock.tickAsync(30 * 1000));
      });
      
      test('reset timer when PomodoroText is the difference as last time', done => {
        core.findAndStartTimer('[p1] xxx', '', {});
          
        clock.tickAsync(30 * 1000)
          .then(() => core.findAndStartTimer('[p1] yyy', '', {
              finish: actual => {
                expect(actual.content).toBe('yyy');
                done();
              }
            }))
          .then(() => clock.tickAsync(60 * 1000));
      });
    });
    
    describe('callback interval', () => {
      
      test('can count remaining time and return found PomodoroText', done => {
        let expected = 60;
        
        core.findAndStartTimer('[p1] xxx', '', {
          interval: (remainingSec, durationSec, stepNo, symbol, ptext) => {
            expect(remainingSec).toBe(--expected);  // counts 59, 58, ..., 0
            expect(ptext.content).toBe('xxx');
          },
            
          finish: () => done()
        });

        clock.tickAsync(60 * 1000);
      });

      test('can pause and resume timer when find the pause symbol', done => {
        let actual = 0;

        core.findAndStartTimer('[p1] xxx', '', {
          interval: remaining => actual = remaining,

          finish: () => done()
        });

        clock.tickAsync(10 * 1000)
          .then(() => core.findAndStartTimer('[-p1] xxx', '', {}))
          .then(() => clock.tickAsync(10 * 1000)) // not counted here
          .then(() => expect(actual).toBe(50))
          .then(() => core.findAndStartTimer('[p1] xxx', '', {}))
          .then(() => clock.tickAsync(50 * 1000));
      });

      test('can count the timer from the beginning when the timer paused and cancelled', done => {
        // Arrange
        core.findAndStartTimer('[p1] xxx', '', {});
        core.findAndStartTimer('[-p1] xxx', '', {});
        core.findAndStartTimer('', '', {});

        // Act
        let actual = 0;
        core.findAndStartTimer('[p1] xxx', '', {
          interval: remaining => actual = remaining
        });

        // Assert
        clock.tickAsync(10 * 1000)
          .then(() => expect(actual).toBe(50))
          .then(() => core.findAndStartTimer('', '', {
            cancel: () => done()
          }));
      });

      test('can count the timer when unpausing PomodoroText that has been paused from the begining', done => {
        core.findAndStartTimer('- [-p1] xxx', '', {});

        core.findAndStartTimer('- [p1] xxx', '', {
          interval: () => done()
        });

        clock.tickAsync(1 * 1000);
      });
    });

    describe('callback step', () => {
      
      test('return the next step number and symbol', done => {
        core.findAndStartTimer('[(p1✍️)2] xxx', '', {
          step: (stepNos, symbol, ptext) => {
            expect(stepNos).toBe('2');
            expect(symbol).toBe('✍️');
          },
            
          finish: () => done()
        });

        clock.tickAsync(60 * 2000);
      });
    });

    describe('callback cancel', () => {

      test('return false when PomodoroText is not found', done => {
        core.findAndStartTimer('', '', {
          cancel: () => done()
        });
      });
      
      test('return false when empty content', done => {
        core.findAndStartTimer('[p1]', '', {
          cancel: () => done()
        });
      });
      
      test('return false when empty content have next lines', done => {
        core.findAndStartTimer('[p1]\nxxx', '', {
          cancel: () => done()
        });
      });

      test('can call a cancel callback when check list has checked', done => {
        core.findAndStartTimer('- [x] [p1] xxx', '', {
          cancel: () => done()
        });
      });

      test('can call a cancel callback when PomodoroText changed', done => {
        core.findAndStartTimer('[p1] xxx', '', {
        });

        clock.tickAsync(1 * 1000)
          .then(() => core.findAndStartTimer('[p1] yyy', '', {
              cancel: () => done()
            })
          );
      });

      test('should cancel the timer when searching in another markdown file has PomodoroText', done => {
        core.findAndStartTimer('[p1] xxx', 'a.md', {});

        clock.tickAsync(1 * 1000)
          .then(() => core.findAndStartTimer('[p1] xxx', 'b.md', {
              cancel: done
            })
          );
      });

      test('should not cancel the timer when searching in another markdown file has paused PomodoroText', done => {
        let cancel = jest.fn();

        core.findAndStartTimer('[p1] xxx', 'a.md', {
          cancel: cancel,
          finish: () => {
            expect(cancel).not.toHaveBeenCalled();
            done();
          }
        });

        core.findAndStartTimer('[-p1] xxx', 'b.md', {
          cancel: () => cancel
        });

        clock.tickAsync(60 * 1000);
     });

      test('should not cancel the timer when searching in another markdown file has not PomodoroText', done => {
        let cancel = jest.fn();

        core.findAndStartTimer('[p1] xxx', 'a.md', {
          cancel: cancel,
          finish: () => {
            expect(cancel).not.toHaveBeenCalled();
            done();
          }
        });

        core.findAndStartTimer('', 'b.md', {
          cancel: () => cancel
        });

        clock.tickAsync(60 * 1000);
      });
    });
  });

  describe('stopTimer', () => {

    test('should called cancel', done => {
      core.findAndStartTimer('[p1] xxx', '', {
        cancel: () => done()
      });

      core.stopTimer();
    });

    test('should reset timer', done => {
      core.findAndStartTimer('[p1] xxx', '');
      clock.tickAsync(10 * 1000)
        .then(() => core.stopTimer())
        .then(() => {
            let interval = jest.fn();
            core.findAndStartTimer('[p1] xxx', '', {
              interval: interval,
              finish: () => {
                expect(interval.mock.calls.length).toBe(60);
                done();
              }
            });
          })
        .then(() => clock.tickAsync(60 * 1000));
    });
  });

  describe('retryLatest', () => {

    test('should called start twice', done => {
      let start = jest.fn();

      core.findAndStartTimer('[p1] xxx', '', {
        start: start,
        finish: () => {
          expect(start.mock.calls.length).toBe(2);
          done();
        }
      });

      core.retryLatest();

      clock.tickAsync(60 * 1000);
    });

    test('if timer is paused, reset timer and pause', done => {
      let interval1 = jest.fn();
      let interval2 = jest.fn();

      core.findAndStartTimer('[p1] xxx', '', {
        interval: interval1,
      });
      
      clock.tickAsync(10 * 1000)
        .then(() => core.findAndStartTimer('[-p1] xxx', ''))
        .then(() => core.retryLatest())
        .then(() => clock.tickAsync(60 * 1000)) // timer is not counted
        .then(() => {
            core.findAndStartTimer('[p1] xxx', '', {
              interval: interval2,
              finish: () => {
                expect(interval1.mock.calls.length).toBe(10);
                expect(interval2.mock.calls.length).toBe(60);
                done();
              }
            });
          })
        .then(() => clock.tickAsync(60 * 1000))
    });
  });
});

describe('getReplacementRange', () => {

  test('get a replacement range of autocomplete when matched candidates', () => {
    const actual = getReplacementRange('- [ ]', { line: 0, ch: 4 }, '-');

    expect(actual).toEqual({
      found: true,
      start: { line: 0, ch: 0 },
      end: { line: 0, ch: 4 }
    });
  });

  test('get a replacement range of autocomplete when does not match candidates', () => {
    const actual = getReplacementRange('- ( )', { line: 0, ch: 4 }, '-');

    expect(actual).toEqual({
      found: false,
      start: { line: 0, ch: 0 },
      end: { line: 0, ch: 0 }
    });
  });
});
