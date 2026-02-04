import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'https://esm.sh/chess.js@1.0.0-beta.8';
import Board from './components/Board';
import { GameStats, Difficulty, Color } from './types';
import { getBestMove } from './services/ai';

type GameMode = 'ai' | 'friend';

const App: React.FC = () => {
  // Game Logic State
  const [game, setGame] = useState(new Chess());
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [gameStatus, setGameStatus] = useState<GameStats>({
    status: 'playing',
    turn: 'w',
    inCheck: false,
    history: [],
  });
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Status for rendering
  const isAiThinking = useRef(false);
  const [aiThinkingDisplay, setAiThinkingDisplay] = useState(false);

  // Update game status
  const updateStatus = (gameInstance: any) => {
    let status: GameStats['status'] = 'playing';
    if (gameInstance.isCheckmate()) status = 'checkmate';
    else if (gameInstance.isDraw()) status = 'draw';
    else if (gameInstance.isStalemate()) status = 'stalemate';

    setGameStatus({
      status,
      turn: gameInstance.turn(),
      inCheck: gameInstance.inCheck(),
      history: gameInstance.history(),
      winner: status === 'checkmate' ? (gameInstance.turn() === 'w' ? 'b' : 'w') : undefined,
    });
  };

  // Handle User Move
  const onMove = (from: string, to: string) => {
    // If AI is thinking, block interaction
    if (isAiThinking.current) return;
    if (game.isGameOver()) return;

    try {
      const move = game.move({ from, to, promotion: 'q' }); // Auto-promote to Queen for simplicity
      if (move) {
        setGame(new Chess(game.fen())); // Trigger re-render with new instance state
        setLastMove({ from, to });
        updateStatus(game);
      }
    } catch (e) {
      // Invalid move
      return;
    }
  };

  // AI Turn Effect
  useEffect(() => {
    if (gameMode !== 'ai') return;
    if (gameStatus.status !== 'playing' || game.turn() === 'w') return;

    const makeAiMove = async () => {
      isAiThinking.current = true;
      setAiThinkingDisplay(true);

      const bestMove = await getBestMove(game, difficulty);
      
      if (bestMove) {
        // Handle verbose move object or string string
        const moveDetails = typeof bestMove === 'string' 
           ? { from: bestMove.slice(0, 2), to: bestMove.slice(2, 4), promotion: 'q' } 
           : bestMove; 

        // Apply logic
        game.move(bestMove);
        setGame(new Chess(game.fen()));
        setLastMove({ from: moveDetails.from, to: moveDetails.to });
        updateStatus(game);
      }

      isAiThinking.current = false;
      setAiThinkingDisplay(false);
    };

    makeAiMove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus.turn, gameStatus.status, gameMode]); // Added gameMode dependency

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setLastMove(null);
    updateStatus(newGame);
    isAiThinking.current = false;
    setAiThinkingDisplay(false);
  };

  const getStatusText = () => {
    if (gameStatus.status === 'checkmate') {
      return `Мат! Победили ${gameStatus.winner === 'w' ? 'Белые' : 'Черные'}`;
    }
    if (gameStatus.status === 'draw') return 'Ничья!';
    if (gameStatus.status === 'stalemate') return 'Пат! Ничья.';
    if (gameStatus.inCheck) return 'ШАХ!';
    return gameStatus.turn === 'w' ? 'Ход Белых' : 'Ход Черных';
  };

  // Determine if board interaction is disabled
  const isBoardDisabled = () => {
    if (gameStatus.status !== 'playing') return true;
    if (aiThinkingDisplay) return true;
    if (gameMode === 'ai' && game.turn() === 'b') return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 gap-8 font-sans bg-gradient-to-br from-slate-200 to-slate-300">
      
      {/* Sidebar / Controls */}
      <div className="order-2 md:order-1 flex flex-col gap-6 w-full md:w-80 bg-white/50 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/40">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Chess<span className="text-indigo-600">AI</span></h1>
          <p className="text-slate-500 text-sm mt-1">
            {gameMode === 'ai' ? 'Играйте против умного бота' : 'Режим для двух игроков'}
          </p>
        </div>

        {/* Status Card */}
        <div className={`p-4 rounded-xl text-center border transition-colors duration-300 ${gameStatus.inCheck ? 'bg-red-100 border-red-300 text-red-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-xl font-bold">
            {getStatusText()}
          </div>
          {aiThinkingDisplay && (
             <div className="mt-2 text-sm text-indigo-600 animate-pulse font-medium">
               ИИ думает...
             </div>
          )}
        </div>

        {/* Game Mode Selector */}
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${gameMode === 'ai' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setGameMode('ai'); resetGame(); }}
          >
            Против ИИ
          </button>
          <button 
             className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${gameMode === 'friend' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
             onClick={() => { setGameMode('friend'); resetGame(); }}
          >
            С Другом
          </button>
        </div>

        {/* Difficulty Select (Only for AI mode) */}
        {gameMode === 'ai' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Сложность ИИ</label>
            <select 
              className="p-3 rounded-lg bg-white border border-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              disabled={gameStatus.history.length > 0 && gameStatus.status === 'playing'}
            >
              <option value={Difficulty.EASY}>Легкий (Новичок)</option>
              <option value={Difficulty.MEDIUM}>Средний (Любитель)</option>
              <option value={Difficulty.HARD}>Сложный (Мастер)</option>
            </select>
          </div>
        )}

        {/* Actions */}
        <button 
          onClick={resetGame}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          Новая Игра
        </button>

        {/* History Snippet */}
        <div className="bg-slate-100/50 rounded-lg p-3 max-h-40 overflow-y-auto text-xs text-slate-600 font-mono">
            <h3 className="font-bold mb-2 text-slate-500 uppercase tracking-wider">История</h3>
            <div className="grid grid-cols-2 gap-x-2">
              {gameStatus.history.reduce((result: any[], move, index) => {
                if (index % 2 === 0) {
                  result.push([`${(index/2)+1}. ${move}`]);
                } else {
                  result[result.length - 1].push(move);
                }
                return result;
              }, []).map((pair, i) => (
                <React.Fragment key={i}>
                  <span>{pair[0]}</span>
                  <span>{pair[1] || ''}</span>
                </React.Fragment>
              ))}
            </div>
            {gameStatus.history.length === 0 && <span className="opacity-50">Ходов нет</span>}
        </div>
      </div>

      {/* Chess Board Area */}
      <div className="order-1 md:order-2 flex flex-col items-center gap-4">
        {/* Opponent Info */}
        <div className="flex items-center gap-3 w-full px-2 opacity-80">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold shadow-md">
            {gameMode === 'ai' ? 'AI' : 'B'}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">
              {gameMode === 'ai' ? 'Black (Computer)' : 'Black (Player 2)'}
            </span>
            {gameMode === 'ai' && (
              <span className="text-xs text-slate-600">Level: {difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : 'Hard'}</span>
            )}
          </div>
        </div>

        <Board 
          game={game} 
          onMove={onMove} 
          disabled={isBoardDisabled()}
          lastMove={lastMove}
        />

        {/* Player Info */}
        <div className="flex items-center gap-3 w-full px-2">
           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 font-bold shadow-md border">
            {gameMode === 'ai' ? 'You' : 'W'}
           </div>
           <div className="flex flex-col">
            <span className="font-bold text-slate-800">
              {gameMode === 'ai' ? 'White (Player)' : 'White (Player 1)'}
            </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;