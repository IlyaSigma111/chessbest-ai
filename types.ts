export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  type: PieceType;
  color: Color;
}

export interface Square {
  square: string;
  type: PieceType;
  color: Color;
}

export enum Difficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3
}

export interface GameStats {
  status: 'playing' | 'checkmate' | 'draw' | 'stalemate';
  turn: Color;
  inCheck: boolean;
  history: string[];
  winner?: Color;
}

// Minimal interface for what we need from chess.js
export interface ChessInstance {
  board(): (Square | null)[][];
  move(move: string | { from: string; to: string; promotion?: string }): any;
  moves(options?: { square?: string; verbose?: boolean }): any[];
  turn(): Color;
  isCheck(): boolean;
  isCheckmate(): boolean;
  isDraw(): boolean;
  isStalemate(): boolean;
  isGameOver(): boolean;
  fen(): string;
  reset(): void;
  history(): string[];
  load(fen: string): boolean;
  get(square: string): Square | null;
  undo(): any;
}