import { ChessInstance, PieceType, Color, Difficulty } from '../types';
import { PIECE_VALUES, PST } from '../constants';
import { Chess } from 'https://esm.sh/chess.js@1.0.0-beta.8';

// Recreate a clean instance for AI calculations
const cloneBoard = (fen: string): ChessInstance => {
  return new Chess(fen);
};

// Count active material to detect endgame
const countMaterial = (board: any[][]): number => {
  let count = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const p = board[i][j];
      if (p && p.type !== 'k' && p.type !== 'p') {
        count += PIECE_VALUES[p.type];
      }
    }
  }
  return count;
};

// Evaluate the board position
const evaluateBoard = (game: ChessInstance): number => {
  let totalEvaluation = 0;
  const board = game.board();

  // 1. Material & Position (PST)
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const value = PIECE_VALUES[piece.type] || 0;
        const pstValue = PST[piece.color][piece.type][i][j];
        
        if (piece.color === 'w') {
          totalEvaluation += (value + pstValue);
        } else {
          totalEvaluation -= (value + pstValue);
        }
      }
    }
  }

  // 2. Mobility (Number of legal moves)
  // This helps AI avoid cramped positions.
  // We use a small weight (5 centipawns) to avoid over-prioritizing random moves.
  const moves = game.moves();
  const mobility = moves.length;
  
  if (game.turn() === 'w') {
    totalEvaluation += mobility * 5;
  } else {
    totalEvaluation -= mobility * 5;
  }

  return totalEvaluation;
};

// Quiescence Search
const quiescence = (
  game: ChessInstance, 
  alpha: number, 
  beta: number, 
  isMaximizingPlayer: boolean
): number => {
  // Simplified eval for Q-search (no mobility calculation to save speed)
  let standPat = 0;
  const board = game.board();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const val = (PIECE_VALUES[piece.type] || 0) + PST[piece.color][piece.type][i][j];
        standPat += (piece.color === 'w' ? val : -val);
      }
    }
  }

  if (isMaximizingPlayer) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  // Explore only captures
  const moves = game.moves({ verbose: true }).filter((m: any) => 
    m.flags.includes('c') || m.flags.includes('e')
  );

  moves.sort((a: any, b: any) => {
    const valA = (PIECE_VALUES[a.captured || 'p'] || 0) * 10 - (PIECE_VALUES[a.piece] || 0);
    const valB = (PIECE_VALUES[b.captured || 'p'] || 0) * 10 - (PIECE_VALUES[b.piece] || 0);
    return valB - valA;
  });

  for (const move of moves) {
    game.move(move);
    const score = quiescence(game, alpha, beta, !isMaximizingPlayer);
    game.undo();

    if (isMaximizingPlayer) {
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    } else {
      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
  }

  return isMaximizingPlayer ? alpha : beta;
};

const minimax = (
  game: ChessInstance,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean,
  useQuiescence: boolean
): number => {
  if (depth === 0) {
    if (useQuiescence) {
      return quiescence(game, alpha, beta, isMaximizingPlayer);
    }
    return evaluateBoard(game);
  }
  
  if (game.isGameOver()) {
    if (game.isCheckmate()) {
       return isMaximizingPlayer ? -100000 - depth : 100000 + depth;
    }
    return 0; 
  }

  const moves = game.moves({ verbose: true });
  
  // Advanced Move Ordering
  moves.sort((a: any, b: any) => {
      let scoreA = 0;
      let scoreB = 0;

      // Prioritize captures
      if (a.flags.includes('c') || a.flags.includes('e')) scoreA += 100;
      if (b.flags.includes('c') || b.flags.includes('e')) scoreB += 100;

      // Prioritize checks
      if (a.san.includes('+')) scoreA += 50;
      if (b.san.includes('+')) scoreB += 50;
      
      return scoreB - scoreA;
  });

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const ev = minimax(game, depth - 1, alpha, beta, false, useQuiescence);
      game.undo();
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const ev = minimax(game, depth - 1, alpha, beta, true, useQuiescence);
      game.undo();
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const getBestMove = (game: ChessInstance, difficulty: Difficulty): Promise<string | null> => {
  return new Promise((resolve) => {
    // 50ms delay to allow UI to render "Thinking..." state
    setTimeout(() => {
      const fen = game.fen();
      const aiGame = cloneBoard(fen);
      const possibleMoves = aiGame.moves({ verbose: true });

      if (possibleMoves.length === 0) {
        resolve(null);
        return;
      }

      // Easy: Chance of random error
      if (difficulty === Difficulty.EASY) {
        if (Math.random() > 0.4) {
            const randomIndex = Math.floor(Math.random() * possibleMoves.length);
            resolve(possibleMoves[randomIndex].san); 
            return;
        }
      }

      let bestMove = null;
      let bestValue = aiGame.turn() === 'w' ? -Infinity : Infinity;
      const isMaximizing = aiGame.turn() === 'w';
      
      let depth = 2;
      let useQuiescence = false;

      // Smart Difficulty Configuration
      if (difficulty === Difficulty.EASY) {
          depth = 1;
      } else if (difficulty === Difficulty.MEDIUM) {
          depth = 2;
          useQuiescence = true;
      } else if (difficulty === Difficulty.HARD) {
          // Dynamic Depth: Deepen search in endgame when piece count is low
          const material = countMaterial(aiGame.board());
          const isEndgame = material < 1200; // Roughly 2 Rooks + Knight
          depth = isEndgame ? 4 : 3;
          useQuiescence = true;
      }

      // Shuffle moves slightly to avoid deterministic repetition in equal positions
      possibleMoves.sort((a: any, b: any) => {
        const scoreA = (a.flags.includes('c') || a.flags.includes('e')) ? 10 : 0;
        const scoreB = (b.flags.includes('c') || b.flags.includes('e')) ? 10 : 0;
        return (scoreB + Math.random()) - (scoreA + Math.random()); 
      });

      for (const move of possibleMoves) {
        aiGame.move(move);
        const boardValue = minimax(
          aiGame, 
          depth - 1, 
          -Infinity, 
          Infinity, 
          !isMaximizing,
          useQuiescence
        );
        aiGame.undo();

        if (isMaximizing) {
          if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
          }
        } else {
          if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = move;
          }
        }
      }

      const chosenMove = bestMove || possibleMoves[0];
      resolve(chosenMove.san); 
    }, 50);
  });
};