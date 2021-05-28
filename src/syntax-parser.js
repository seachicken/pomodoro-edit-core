import { tokenType, tokenize } from './syntax-tokenizer';

export function parse(syntax) {
  return parseTokens(tokenize(syntax));
}

function parseTokens(tokens) {
  const ast = [];
  while(tokens.length) {
    const token = tokens.shift();
    if (token.type === tokenType.CLOSE_PARENTHESIS) {
      return { ast, token };
    } else if (token.type === tokenType.OPEN_PARENTHESIS) {
      const childResult = parseTokens(tokens);
      ast.push(toLoopNode(childResult.ast, childResult.token));
      continue;
    }
    ast.push(toTimeNode(token));
  }
  return ast;
}

function toTimeNode(timeToken) {
  return { timeSec: timeToken.timeMin * 60 };
}

function toLoopNode(childNodes, loopToken) {
  return { childNodes, loop: loopToken.loop };
}
