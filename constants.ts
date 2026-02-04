// Piece values for Minimax evaluation
export const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece Square Tables (PST)
// These define the positional value of a piece on the board.
// Defined from WHITE's perspective (Rank 8 at index 0, Rank 1 at index 7).
// White pawns start at Rank 2 (index 6) and move to Rank 8 (index 0).

// White Pawn Evaluation
// Bonus for advancing (lower index), penalty for staying, bonus for center control.
const pawnEvalWhite = [
  [0,  0,  0,  0,  0,  0,  0,  0],        // Rank 8 (Promotion)
  [50, 50, 50, 50, 50, 50, 50, 50],       // Rank 7
  [10, 10, 20, 30, 30, 20, 10, 10],       // Rank 6
  [5,  5, 10, 25, 25, 10,  5,  5],        // Rank 5
  [0,  0,  0, 20, 20,  0,  0,  0],        // Rank 4
  [5, -5,-10,  0,  0,-10, -5,  5],        // Rank 3
  [5, 10, 10,-20,-20, 10, 10,  5],        // Rank 2 (Start)
  [0,  0,  0,  0,  0,  0,  0,  0]         // Rank 1
];

const knightEvalWhite = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const bishopEvalWhite = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const rookEvalWhite = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const queenEvalWhite = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const kingEvalWhite = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

// Reverses the board array (Rank 1 <-> Rank 8) for Black
const reverseArray = (array: number[][]) => {
  return array.slice().reverse();
};

export const PST = {
  w: {
    p: pawnEvalWhite,
    n: knightEvalWhite,
    b: bishopEvalWhite,
    r: rookEvalWhite,
    q: queenEvalWhite,
    k: kingEvalWhite,
  },
  b: {
    p: reverseArray(pawnEvalWhite),
    n: reverseArray(knightEvalWhite),
    b: reverseArray(bishopEvalWhite),
    r: reverseArray(rookEvalWhite),
    q: reverseArray(queenEvalWhite),
    k: reverseArray(kingEvalWhite),
  }
};