import Core from '../src/pomodoro-edit-core';

describe('pomodoro-edit-core', () => {
  let core = null;

  beforeEach(() => {
    core = new Core();
  });
  
  describe('findAndCountPomodoroText', () => {
    describe('callback finish', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });
      
      test('can find "[p1] xxx"', done => {
        core.findAndCountPomodoroText('[p1] xxx', {
          finish: actual => {
            expect(actual).toStrictEqual({ time: '1', content: 'xxx' });
            done();
          }
        });
        jest.advanceTimersByTime(60 * 1000);
      });
      
      test('can find "- [p1] xxx"', done => {
        core.findAndCountPomodoroText('- [p1] xxx', {
          finish: actual => {
            expect(actual).toStrictEqual({ time: '1', content: 'xxx' });
            done();
          }
        });
        jest.advanceTimersByTime(60 * 1000);
      });
      
      test('can find "  - [p1] xxx"', done => {
        core.findAndCountPomodoroText('  - [p1] xxx', {
          finish: actual => {
            expect(actual).toStrictEqual({ time: '1', content: 'xxx' });
            done();
          }
        });
        jest.advanceTimersByTime(60 * 1000);
      });
      
      test('can find "- [ ] [p1] xxx"', done => {
        core.findAndCountPomodoroText('- [ ] [p1] xxx', {
          finish: actual => {
            expect(actual).toStrictEqual({ time: '1', content: 'xxx' });
            done();
          }
        });
        jest.advanceTimersByTime(60 * 1000);
      });
      
      test('can find "  - [ ] [p1] xxx"', done => {
        core.findAndCountPomodoroText('  - [ ] [p1] xxx', {
          finish: actual => {
            expect(actual).toStrictEqual({ time: '1', content: 'xxx' });
            done();
          }
        });
        jest.advanceTimersByTime(60 * 1000);
      });
      
      test('ignores if spaces before content', done => {
        core.findAndCountPomodoroText('[p1]  xxx', {
          finish: actual => {
            expect(actual).toStrictEqual({ time: '1', content: 'xxx' });
            done();
          }
        });
        jest.advanceTimersByTime(60 * 1000);
      });
      
      test('does not reset timer if PomodoroText is the same as last time', done => {
        core.findAndCountPomodoroText('[p1] xxx', {
          finish: actual => {
            expect(actual).toStrictEqual({ time: '1', content: 'xxx' });
            done();
          }
        });
          
        jest.advanceTimersByTime(30 * 1000);
        
        core.findAndCountPomodoroText('[p1] xxx', {});
        
        jest.advanceTimersByTime(30 * 1000);
      });
      
      test('reset timer if PomodoroText is the difference as last time', done => {
        core.findAndCountPomodoroText('[p1] xxx', {});
          
        jest.advanceTimersByTime(30 * 1000);
        
        core.findAndCountPomodoroText('[p1] yyy', {
          finish: actual => {
            expect(actual).toStrictEqual({ time: '1', content: 'yyy' });
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
      
      test('can count remaining time', done => {
        let expected = 60;
        
        core.findAndCountPomodoroText('[p1] xxx', {
          interval: actual =>
            expect(actual).toBe(--expected),  // counts 59, 58, ..., 0
            
          finish: () => done()
        });
        jest.advanceTimersByTime(60 * 1000);
      });
    });
    
    describe('callback stop', () => {
      test('return false if no match', done => {
        core.findAndCountPomodoroText('', {
          stop: () => done()
        });
      });
      
      test('return false if empty content', done => {
        core.findAndCountPomodoroText('[p1]', {
          stop: () => done()
        });
      });
      
      test('return false if empty content have next lines', done => {
        core.findAndCountPomodoroText('[p1]\nxxx', {
          stop: () => done()
        });
      });
    });
  });
});
