const LOOP_REGEX = /\)(?:\d+|)/;
const TIME_REGEX = /\d+[hms]/;
const P_REGEX = /p\d+/;

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
        const pSyntax = getStrBeforeReservedWord(syntax, i);
        const found = pSyntax.match(P_REGEX);
        if (found) {
          const seconds = pSyntax.substring(1, found[0].length);
          i += found[0].length - 1;

          const token = {
            type: tokenType.TIME,
            seconds: parseInt(seconds) * 60
          };

          const symbol = getStrBeforeReservedWord(syntax, i + 1);
          if (symbol) {
            i += symbol.length;
            token['symbol'] = symbol;
          }

          tokens.push(token);
        }
        break;
      }
      case ' ':
        continue;
      default: {
        const substr = getStrBeforeReservedWord(syntax, i);
        const found = substr.match(TIME_REGEX);
        if (found) {
          const timeWithUnit = substr.substring(0, found[0].length);
          i += found[0].length - 1;

          const time = timeWithUnit.substring(-1);
          const unit = timeWithUnit.substring(time.length - 1);

          let ratio;
          switch (unit) {
            case 'h':
              ratio = 60 * 60;
              break;
            case 'm':
              ratio = 60;
              break;
            case 's':
              ratio = 1;
              break;
          }

          const token = {
            type: tokenType.TIME,
            seconds: parseInt(time) * ratio
          };

          const symbol = getStrBeforeReservedWord(syntax, i + 1);
          if (symbol) {
            i += symbol.length;
            token['symbol'] = symbol;
          }

          tokens.push(token);
        } else {
          return [];
        }
      }
    }
  }
  return tokens;
}

function getStrBeforeReservedWord(syntax, i) {
  return syntax.substring(i).split(/ |\)/)[0];
}
