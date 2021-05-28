import { parse } from '../src/syntax-parser';

describe('syntax-parser', () => {

  test('parse sequential timers', () => {
    expect(parse('p1 p2')).toStrictEqual([
      { timeSec: 60 },
      { timeSec: 120 }
    ]);
  });

  test('parse loop timers', () => {
    expect(parse('(p1 p2)2')).toStrictEqual([
      { childNodes: [
          { timeSec: 60 },
          { timeSec: 120 }
        ], loop: 2
      }
    ]);
  });

  test('parse multiple loop timers', () => {
    expect(parse('(p1)1 (p1)1')).toStrictEqual([
      { childNodes: [
          { timeSec: 60 }
        ], loop: 1
      },
      { childNodes: [
          { timeSec: 60 }
        ], loop: 1
      },
    ]);
  });

  test('parse nested loop timers and single timer', () => {
    expect(parse('(p1 (p2 p3)1)2')).toStrictEqual([
      { childNodes: [
          { timeSec: 60 },
          { childNodes: [
              { timeSec: 120 },
              { timeSec: 180 }
            ], loop: 1
          }
        ], loop: 2
      },
    ]);
  });

  test('parse longest loop timers', () => {
    expect(parse('(p1)')).toStrictEqual([
      { childNodes: [
          { timeSec: 60 }
        ], loop: 0
      }
    ]);
  });
});
