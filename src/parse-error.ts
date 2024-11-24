export type ErrorType =
  | 'ExpectedArgumentsList'
  | 'ExpectedAsterisk'
  | 'ExpectedColon'
  | 'ExpectedComma'
  | 'ExpectedFunctionName'
  | 'ExpectedOpenBrace'
  | 'ExpectedOpenBracket'
  | 'ExpectedStringKey'
  | 'InvalidFunctionName'
  | 'InvalidIdentifier'
  | 'InvalidNumberLiteral'
  | 'InvalidStringLiteral'
  | 'MissingEpilogue'
  | 'TrailingTokens'
  | 'UnexpectedEndOfInput'
  | 'UnexpectedToken';

export interface ParseError {
  start: number;
  end?: number;
  type: ErrorType;
}
