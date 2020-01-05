import Core from '../src/pomodoro-edit-core';

describe('pomodoro-edit-core', () => {
  let core = null;

  beforeEach(() => {
    core = new Core();
  });
  
  describe('findAndCountPomodoroText', () => {

    describe('callback start', () => {
      test('can call a start callback when PomodoroText is found', done => {
        core.findAndCountPomodoroText('[p1] xxx', {
          start: () => done()
        });
      });
    });

    describe('callback finish', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });
      
      test('can find "[p1] xxx"', done => {
        core.findAndCountPomodoroText('[p1] xxx', {
          finish: actual => {
            expect(actual.time).toBe(1 * 60);
            expect(actual.content).toBe('xxx');
            done();
          }
        });
        jest.advanceTimersByTime(60 * 1000);
      });
      
      test('can find "- [p1] xxx"', done => {
        core.findAndCountPomodoroText('- [p1] xxx', {
          finish: actual => {
            expect(actual.time).toBe(1 * 60);
            expect(actual.content).toBe('xxx');
            done();
          }
        });
        jest.advanceTimersByTime(60 * 1000);
      });
      
      test('can find "  - [p1] xxx"', done => {
        core.findAndCountPomodoroText('  - [p1] xxx', {
          finish: actual => {
            expect(actual.time).toBe(1 * 60);
            expect(actual.content).toBe('xxx');
            done();
          }
        });
        jest.advanceTimersByTime(60 * 1000);
      });
      
      test('can find "- [ ] [p1] xxx"', done => {
        core.findAndCountPomodoroText('- [ ] [p1] xxx', {
          finish: actual => {
            expect(actual.time).toBe(1 * 60);
            expect(actual.content).toBe('xxx');
            done();
          }
        });
        jest.advanceTimersByTime(60 * 1000);
      });
      
      test('can find "  - [ ] [p1] xxx"', done => {
        core.findAndCountPomodoroText('  - [ ] [p1] xxx', {
          finish: actual => {
            expect(actual.time).toBe(1 * 60);
            expect(actual.content).toBe('xxx');
            done();
          }
        });
        jest.advanceTimersByTime(60 * 1000);
      });
      
      test('ignores when spaces before content', done => {
        core.findAndCountPomodoroText('[p1]  xxx', {
          finish: actual => {
            expect(actual.time).toBe(1 * 60);
            expect(actual.content).toBe('xxx');
            done();
          }
        });
        jest.advanceTimersByTime(60 * 1000);
      });
      
      test('does not reset timer when PomodoroText is the same as last time', done => {
        core.findAndCountPomodoroText('[p1] xxx', {
          finish: actual => done()
        });
          
        jest.advanceTimersByTime(30 * 1000);
        
        core.findAndCountPomodoroText('[p1] xxx', {});
        
        jest.advanceTimersByTime(30 * 1000);
      });
      
      test('reset timer when PomodoroText is the difference as last time', done => {
        core.findAndCountPomodoroText('[p1] xxx', {});
          
        jest.advanceTimersByTime(30 * 1000);
        
        core.findAndCountPomodoroText('[p1] yyy', {
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
        
        core.findAndCountPomodoroText('[p1] xxx', {
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

        core.findAndCountPomodoroText('[p1] xxx', {
          interval: remaining => actual = remaining,

          finish: () => done()
        });

        jest.advanceTimersByTime(10 * 1000);

        core.findAndCountPomodoroText('[-p1] xxx', {});

        // not counted here
        jest.advanceTimersByTime(10 * 1000);

        expect(actual).toBe(50);

        core.findAndCountPomodoroText('[p1] xxx', {});

        jest.advanceTimersByTime(50 * 1000);
      });

      test('can count the timer from the beginning when the timer paused and cancelled', done => {
        // Arrange
        core.findAndCountPomodoroText('[p1] xxx', {});
        core.findAndCountPomodoroText('[-p1] xxx', {});
        core.findAndCountPomodoroText('', {});

        // Act
        let actual = 0;
        core.findAndCountPomodoroText('[p1] xxx', {
          interval: remaining => actual = remaining
        });

        jest.advanceTimersByTime(10 * 1000);

        // Assert
        expect(actual).toBe(50);

        core.findAndCountPomodoroText('', {
          cancel: () => done()
        });
      });
    });

    describe('callback cancel', () => {
      test('return false when PomodoroText is not found', done => {
        core.findAndCountPomodoroText('', {
          cancel: () => done()
        });
      });
      
      test('return false when empty content', done => {
        core.findAndCountPomodoroText('[p1]', {
          cancel: () => done()
        });
      });
      
      test('return false when empty content have next lines', done => {
        core.findAndCountPomodoroText('[p1]\nxxx', {
          cancel: () => done()
        });
      });

      test('can call a cancel callback when PomodoroText changed', done => {
        core.findAndCountPomodoroText('[p1] xxx', {});

        core.findAndCountPomodoroText('[p1] yyy', {
          cancel: () => done()
        });
      });
    });
  });
});
