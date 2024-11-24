export type ErrorType =
  | "ExpectedArgumentsList"
  | "ExpectedAsterisk"
  | "ExpectedColon"
  | "ExpectedComma"
  | "ExpectedFunctionName"
  | "ExpectedOpenBrace"
  | "ExpectedOpenBracket"
  | "ExpectedStringKey"
  | "InvalidFunctionName"
  | "InvalidIdentifier"
  | "InvalidNumberLiteral"
  | "InvalidStringLiteral"
  | "MissingEpilogue"
  | "TrailingTokens"
  | "UnexpectedEndOfInput"
  | "UnexpectedToken"
  | "ErrorInUserSuppliedFunction";

export interface ParseError {
  start: number;
  end?: number;
  type: ErrorType;
}
