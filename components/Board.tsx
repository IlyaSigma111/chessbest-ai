import React, { useState, useEffect, useCallback } from 'react';
import { ChessInstance, Square, Color } from '../types';
import PieceIcon from './PieceIcon';
import { Chess } from 'https://esm.sh/chess.js@1.0.0-beta.8';

interface BoardProps {
  game: ChessInstance;
  onMove: (from: string, to: string) => void;
  disabled: boolean;
  lastMove: { from: string; to: string } | null;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const Board: React.FC<BoardProps> = ({ game, onMove, disabled, lastMove }) => {
  const [boardState, setBoardState] = useState<(Square | null)[][]>(game.board());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<{ square: string } | null>(null);

  // Sync board visual state
  useEffect(() => {
    setBoardState(game.board());
  }, [game, lastMove]); // Re-render when game instance changes or last move updates

  // Calculate possible moves for a square
  const getMovesForSquare = useCallback((square: string) => {
    const moves = game.moves({ square, verbose: true });
    return moves.map((m: any) => m.to);
  }, [game]);

  const handleSquareClick = (square: string) => {
    if (disabled) return;

    // If clicking the same square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // Attempting to move
    if (selectedSquare) {
      if (possibleMoves.includes(square)) {
        onMove(selectedSquare, square);
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else {
        // If clicked on another own piece, select it instead
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
          setPossibleMoves(getMovesForSquare(square));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    } else {
      // Selecting a piece
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        setPossibleMoves(getMovesForSquare(square));
      }
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, square: string) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    const piece = game.get(square);
    if (!piece || piece.color !== game.turn()) {
      e.preventDefault();
      return;
    }
    
    setDraggedPiece({ square });
    // Highlight moves immediately on drag start
    setSelectedSquare(square);
    setPossibleMoves(getMovesForSquare(square));
    
    e.dataTransfer.effectAllowed = 'move';
    // Create a transparent drag image or customize it
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent pixel
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    if (draggedPiece) {
       if (possibleMoves.includes(targetSquare)) {
         onMove(draggedPiece.square, targetSquare);
       }
       setDraggedPiece(null);
       setSelectedSquare(null);
       setPossibleMoves([]);
    }
  };

  const handleDragEnd = () => {
    setDraggedPiece(null);
    // Note: We might want to keep selection if move was invalid, 
    // but clearing it feels cleaner for UI reset
    // setSelectedSquare(null); 
    // setPossibleMoves([]);
  };

  // Check state
  const isCheck = game.inCheck();
  const kingSquare = isCheck ? findKing(game.board(), game.turn()) : null;

  return (
    <div className="relative p-2 bg-white/30 backdrop-blur-md rounded-lg shadow-neumorph border border-white/20">
       <div className="grid grid-cols-8 grid-rows-8 w-full max-w-[600px] aspect-square border-4 border-slate-600 rounded-sm overflow-hidden select-none">
         {RANKS.map((rank, rankIndex) => (
           FILES.map((file, fileIndex) => {
             const squareName = `${file}${rank}`;
             const isLight = (rankIndex + fileIndex) % 2 === 0;
             const piece = game.get(squareName);
             
             // Highlighting Logic
             const isSelected = selectedSquare === squareName;
             const isLastMoveFrom = lastMove?.from === squareName;
             const isLastMoveTo = lastMove?.to === squareName;
             const isPossibleMove = possibleMoves.includes(squareName);
             const isKingInCheck = squareName === kingSquare;

             let bgClass = isLight ? 'bg-board-light' : 'bg-board-dark';
             
             if (isKingInCheck) bgClass = 'bg-red-500/80';
             else if (isSelected) bgClass = 'bg-yellow-200';
             else if (isLastMoveFrom || isLastMoveTo) bgClass = 'bg-lime-200';
             
             return (
               <div
                 key={squareName}
                 className={`relative w-full h-full flex items-center justify-center ${bgClass} transition-colors duration-100`}
                 onClick={() => handleSquareClick(squareName)}
                 onDragOver={handleDragOver}
                 onDrop={(e) => handleDrop(e, squareName)}
               >
                 {/* Rank/File Labels (Optional, aesthetic) */}
                 {fileIndex === 0 && (
                    <span className={`absolute top-0.5 left-1 text-[8px] md:text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-200'}`}>
                      {rank}
                    </span>
                 )}
                 {rankIndex === 7 && (
                    <span className={`absolute bottom-0 right-1 text-[8px] md:text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-200'}`}>
                      {file}
                    </span>
                 )}

                 {/* Move Hint Dot */}
                 {isPossibleMove && !piece && (
                   <div className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-slate-800/20 pointer-events-none" />
                 )}
                 
                 {/* Capture Hint Ring */}
                 {isPossibleMove && piece && (
                   <div className="absolute w-full h-full border-[4px] md:border-[6px] border-slate-800/10 rounded-full pointer-events-none" />
                 )}

                 {piece && (
                   <div 
                    className={`w-full h-full p-1 cursor-${disabled ? 'default' : 'grab'} active:cursor-grabbing hover:scale-105 transition-transform`}
                    draggable={!disabled}
                    onDragStart={(e) => handleDragStart(e, squareName)}
                    onDragEnd={handleDragEnd}
                    style={{ opacity: draggedPiece?.square === squareName ? 0 : 1 }}
                   >
                     <PieceIcon type={piece.type} color={piece.color} />
                   </div>
                 )}
               </div>
             );
           })
         ))}
       </div>
    </div>
  );
};

// Helper to find King for check highlighting
function findKing(board: (Square | null)[][], turn: Color): string | null {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const p = board[i][j];
      if (p && p.type === 'k' && p.color === turn) {
        const file = FILES[j];
        // Rank in board array 0 is 8, 7 is 1
        const rank = RANKS[i]; 
        return `${file}${rank}`;
      }
    }
  }
  return null;
}

export default Board;