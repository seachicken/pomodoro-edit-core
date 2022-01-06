import { tokenType, tokenize } from '../src/syntax-tokenizer';

describe('syntax-tokenizer', () => {

  test('tokenize the time in hours', () => {
    expect(tokenize('1h')).toStrictEqual([
      {
        type: tokenType.TIME,
        seconds: 60 * 60 * 1
      }
    ]);
  });

  test('tokenize the time in minutes', () => {
    expect(tokenize('1m')).toStrictEqual([
      {
        type: tokenType.TIME,
        seconds: 60 * 1
      }
    ]);

    expect(tokenize('p1')).toStrictEqual([
      {
        type: tokenType.TIME,
        seconds: 60 * 1
      }
    ]);
  });

  test('tokenize the time in seconds', () => {
    expect(tokenize('1s')).toStrictEqual([
      {
        type: tokenType.TIME,
        seconds: 1
      }
    ]);
  });

  test('tokenize the loop syntax', () => {
    expect(tokenize('(1m 2m)2')).toStrictEqual([
      {
        type: tokenType.OPEN_PARENTHESIS
      },
      {
        type: tokenType.TIME,
        seconds: 60 * 1
      },
      {
        type: tokenType.TIME,
        seconds: 60 * 2
      },
      {
        type: tokenType.CLOSE_PARENTHESIS,
        loop: 2
      }
    ]);
  });

  test('tokenize the loop syntax', () => {
    expect(tokenize('(p1 p2)2')).toStrictEqual([
      {
        type: tokenType.OPEN_PARENTHESIS
      },
      {
        type: tokenType.TIME,
        seconds: 60 * 1
      },
      {
        type: tokenType.TIME,
        seconds: 60 * 2
      },
      {
        type: tokenType.CLOSE_PARENTHESIS,
        loop: 2
      }
    ]);
  });

  test('tokenize the time with a symbol', () => {
    expect(tokenize('p1✍️')).toStrictEqual([
      {
        type: tokenType.TIME,
        seconds: 60 * 1,
        symbol: '✍️'
      }
    ]);
  });

  test('tokenize times with a symbol', () => {
    expect(tokenize('(p1✍️ p2☕️)2')).toStrictEqual([
      {
        type: tokenType.OPEN_PARENTHESIS
      },
      {
        type: tokenType.TIME,
        seconds: 60 * 1,
        symbol: '✍️'
      },
      {
        type: tokenType.TIME,
        seconds: 60 * 2,
        symbol: '☕️'
      },
      {
        type: tokenType.CLOSE_PARENTHESIS,
        loop: 2
      }
    ]);
  });

  test('returns empty when there is a syntax error', () => {
    expect(tokenize('p1 (p1 pa)')).toHaveLength(0);
  });
});
