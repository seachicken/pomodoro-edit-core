import { tokenType, tokenize } from '../src/syntax-tokenizer';

describe('syntax-tokenizer', () => {

  test('tokenize the loop syntax', () => {
    expect(tokenize('(p1 p2)2')).toStrictEqual([
      {
        type: tokenType.OPEN_PARENTHESIS
      },
      {
        type: tokenType.TIME,
        timeMin: 1
      },
      {
        type: tokenType.TIME,
        timeMin: 2
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
        timeMin: 1,
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
        timeMin: 1,
        symbol: '✍️'
      },
      {
        type: tokenType.TIME,
        timeMin: 2,
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
