const LOOP_REGEX = /\)(?:[0-9]+|)/;
const P_REGEX = /p[0-9]+/;

export const tokenType = {
  TIME: 1,
  OPEN_PARENTHESIS: 2,
  CLOSE_PARENTHESIS: 3
}

export function tokenize(syntax) {
  const tokens = [];

  for (let i = 0; i < syntax.length; i++) {
    const ch = syntax.charAt(i);
    switch (ch) {
      case '(':
        tokens.push({ type: tokenType.OPEN_PARENTHESIS });
        break;
      case ')': {
        const loopSyntax = syntax.substring(i);
        const found = loopSyntax.match(LOOP_REGEX);
        if (found) {
          const loop = found[0].length === 1
            ? 0
            : parseInt(loopSyntax.substring(1, found[0].length));
          tokens.push({
            type: tokenType.CLOSE_PARENTHESIS,
            loop
          });
          i += found[0].length - 1;
        }
        break;
      }
      case 'p': {
        const pSyntax = syntax.substring(i);
        const found = pSyntax.match(P_REGEX);
        if (found) {
          const timeMin = pSyntax.substring(1, found[0].length);
          i += found[0].length - 1;

          const time = {
            type: tokenType.TIME,
            timeMin: parseInt(timeMin)
          };

          const symbol = syntax.substring(i + 1).split(/ |\)/)[0];
          if (symbol) {
            i += symbol.length;
            time['symbol'] = symbol;
          }

          tokens.push(time);
        }
        break;
      }
      case ' ':
        continue;
      default:
        return [];
    }
  }
  return tokens;
}
