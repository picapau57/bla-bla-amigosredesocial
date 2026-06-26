import { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  Gamepad2, Award, RefreshCw, Trophy, Users, CheckCircle, HelpCircle, 
  Sparkles, X, ChevronRight, Volume2, VolumeX, Flame, Heart, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GamesSectionProps {
  currentUser: User;
  users: User[];
  onViewProfile?: (user: User) => void;
}

// Retro Sound effects using Web Audio API
const playTone = (type: 'click' | 'success' | 'fail' | 'victory' | 'streak', muted: boolean) => {
  if (muted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'fail') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.setValueAtTime(147, ctx.currentTime + 0.1); // D3
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'streak') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.08); // G5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.16); // D6
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'victory') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    // Browser audio context blocked before interaction
  }
};

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const TRIVIA_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Qual é o famoso prato típico de Goiás feito com arroz, pedaços de frango desfiado ou inteiro e o fruto aromático do cerrado de sabor marcante?",
    options: ["Pamonha Recheada", "Empadão Goiano", "Galinhada com Pequi", "Manjar Caipira"],
    correctAnswer: 2,
    explanation: "A Galinhada com Pequi é uma das maiores referências culinárias do estado de Goiás. O pequi possui um sabor intenso, cor amarela marcante e espinhos internos!"
  },
  {
    id: 2,
    question: "Goiânia foi uma cidade planejada por Attilio Corrêa Lima e fundada oficialmente em qual década?",
    options: ["Década de 1910", "Década de 1930", "Década de 1950", "Década de 1970"],
    correctAnswer: 1,
    explanation: "Goiânia foi oficialmente fundada em 24 de outubro de 1933 pelo Dr. Pedro Ludovico Teixeira, em meio ao movimento da Marcha para o Oeste."
  },
  {
    id: 3,
    question: "Qual charmosa cidade histórica do interior de Goiás é mundialmente conhecida por suas ruas de pedra, casarões coloniais e a encenação das Cavalhadas?",
    options: ["Caldas Novas", "Pirenópolis", "Anápolis", "Rio Verde"],
    correctAnswer: 1,
    explanation: "Pirenópolis (ou 'Piri') é famosa por seu patrimônio histórico colonial, as Cavalhadas que ocorrem na Festa do Divino Espírito Santo e dezenas de cachoeiras deslumbrantes."
  },
  {
    id: 4,
    question: "Qual é o nome do maior e mais famoso rio de lazer de Goiás, onde famílias acampam e formam belas praias fluviais temporárias na época de estiagem (julho)?",
    options: ["Rio Corumbá", "Rio Meia Ponte", "Rio Araguaia", "Rio Paranaíba"],
    correctAnswer: 2,
    explanation: "O Rio Araguaia é um verdadeiro oásis turístico em Goiás, atraindo milhares de visitantes todo ano para acampamentos em suas areias brancas."
  },
  {
    id: 5,
    question: "Qual parque nacional goiano abriga deslumbrantes formações de quartzo cristalino, canions de tirar o fôlego e o famoso Vale da Lua?",
    options: ["Parque Nacional da Chapada dos Veadeiros", "Parque Nacional das Emas", "Parque Estadual da Serra Dourada", "Parque Ecológico de Goiânia"],
    correctAnswer: 0,
    explanation: "O Parque Nacional da Chapada dos Veadeiros, localizado no nordeste do estado (Alto Paraíso, São Jorge), é reconhecido como Patrimônio Mundial da UNESCO."
  },
  {
    id: 6,
    question: "Qual poetisa e doceira goiana, famosa por retratar o cotidiano e os becos de sua amada cidade natal, morou na icônica 'Casa da Ponte'?",
    options: ["Clarice Lispector", "Cecília Meireles", "Cora Coralina", "Nélida Piñon"],
    correctAnswer: 2,
    explanation: "Cora Coralina (Ana Lins dos Guimarães Peixoto Bretas) é uma das maiores vozes poéticas do Brasil, escrevendo e fazendo doces na antiga Cidade de Goiás."
  }
];

interface MemoryCard {
  id: number;
  uniqueId: string;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_ITEMS = [
  { emoji: "🌳", name: "Pequi do Cerrado" },
  { emoji: "🌽", name: "Pamonha Quente" },
  { emoji: "🌸", name: "Ipê Amarelo" },
  { emoji: "🏞️", name: "Rio Araguaia" },
  { emoji: "🏛️", name: "Goiás Velho" },
  { emoji: "🎸", name: "Viola Caipira" }
];

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  game: string;
}

export default function GamesSection({ currentUser, users, onViewProfile }: GamesSectionProps) {
  const [activeGame, setActiveGame] = useState<'trivia' | 'memory' | 'tictactoe'>('trivia');
  const [muted, setMuted] = useState(false);

  // Leaderboard data stored in local storage
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Generate default/mock leaderboard scores for network members
    const defaultScores: LeaderboardEntry[] = [
      { userId: 'user-1', name: 'Carlos Silva', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', score: 95, game: 'Trívia Goiana' },
      { userId: 'user-3', name: 'Marcos Oliveira', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150', score: 80, game: 'Trívia Goiana' },
      { userId: 'user-2', name: 'Ana Souza', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', score: 120, game: 'Memória de Goiás' },
      { userId: 'user-4', name: 'Fernanda Santos', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', score: 140, game: 'Memória de Goiás' },
      { userId: 'user-5', name: 'Roberto Costa', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', score: 70, game: 'Trívia Goiana' }
    ];

    const stored = localStorage.getItem('bb_games_leaderboard');
    if (stored) {
      setLeaderboard(JSON.parse(stored));
    } else {
      localStorage.setItem('bb_games_leaderboard', JSON.stringify(defaultScores));
      setLeaderboard(defaultScores);
    }
  }, []);

  const saveScore = (score: number, gameName: string) => {
    // Update local storage score for current user
    const currentList = [...leaderboard];
    const userIndex = currentList.findIndex(e => e.userId === currentUser.id && e.game === gameName);

    if (userIndex !== -1) {
      if (score > currentList[userIndex].score) {
        currentList[userIndex].score = score;
      }
    } else {
      currentList.push({
        userId: currentUser.id,
        name: currentUser.fullName,
        avatar: currentUser.avatar,
        score: score,
        game: gameName
      });
    }

    currentList.sort((a, b) => b.score - a.score);
    localStorage.setItem('bb_games_leaderboard', JSON.stringify(currentList));
    setLeaderboard(currentList);
  };

  // ==========================================
  // GAME 1: TRIVIA QUIZ STATE & LOGIC
  // ==========================================
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [triviaScore, setTriviaScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [triviaStreak, setTriviaStreak] = useState(0);

  const handleAnswerClick = (optionIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent double answer selection
    setSelectedAnswer(optionIndex);

    const isCorrect = optionIndex === TRIVIA_QUESTIONS[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      const addedPoints = 10 + triviaStreak * 5;
      setTriviaScore(prev => prev + addedPoints);
      setTriviaStreak(prev => prev + 1);
      playTone(triviaStreak >= 2 ? 'streak' : 'success', muted);
    } else {
      setTriviaStreak(0);
      playTone('fail', muted);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    if (currentQuestionIndex < TRIVIA_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      playTone('click', muted);
    } else {
      setQuizFinished(true);
      playTone('victory', muted);
      saveScore(triviaScore, 'Trívia Goiana');
    }
  };

  const resetTrivia = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTriviaScore(0);
    setTriviaStreak(0);
    setQuizFinished(false);
    playTone('click', muted);
  };


  // ==========================================
  // GAME 2: MEMORY MATCH STATE & LOGIC
  // ==========================================
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryScore, setMemoryScore] = useState(150); // Counts down from 150 for efficiency
  const [memoryFinished, setMemoryFinished] = useState(false);

  const initMemoryGame = () => {
    const pairItems = [...MEMORY_ITEMS, ...MEMORY_ITEMS];
    // Fisher-Yates Shuffle
    for (let i = pairItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairItems[i], pairItems[j]] = [pairItems[j], pairItems[i]];
    }

    const generatedCards = pairItems.map((item, idx) => ({
      id: idx,
      uniqueId: `${item.name}-${idx}`,
      emoji: item.emoji,
      name: item.name,
      isFlipped: false,
      isMatched: false
    }));

    setCards(generatedCards);
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryScore(150);
    setMemoryFinished(false);
  };

  useEffect(() => {
    if (activeGame === 'memory') {
      initMemoryGame();
    }
  }, [activeGame]);

  const handleCardClick = (idx: number) => {
    // Guard against already matched or flipped cards
    if (cards[idx].isMatched || cards[idx].isFlipped || flippedIndices.length >= 2) return;

    playTone('click', muted);
    const updatedCards = [...cards];
    updatedCards[idx].isFlipped = true;
    setCards(updatedCards);

    const nextFlipped = [...flippedIndices, idx];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const firstCard = cards[nextFlipped[0]];
      const secondCard = cards[nextFlipped[1]];

      if (firstCard.name === secondCard.name) {
        // MATCH FOUND
        setTimeout(() => {
          const matchedCards = updatedCards.map(c => {
            if (c.name === firstCard.name) {
              return { ...c, isMatched: true, isFlipped: true };
            }
            return c;
          });
          setCards(matchedCards);
          setFlippedIndices([]);
          playTone('success', muted);

          // Check if game complete
          if (matchedCards.every(c => c.isMatched)) {
            setMemoryFinished(true);
            playTone('victory', muted);
            const finalScore = Math.max(10, memoryScore - memoryMoves * 4);
            saveScore(finalScore, 'Memória de Goiás');
          }
        }, 500);
      } else {
        // MATCH FAILED - flip back
        setTimeout(() => {
          const resetFlippedCards = updatedCards.map((c, i) => {
            if (i === nextFlipped[0] || i === nextFlipped[1]) {
              return { ...c, isFlipped: false };
            }
            return c;
          });
          setCards(resetFlippedCards);
          setFlippedIndices([]);
          setMemoryScore(prev => Math.max(10, prev - 5));
          playTone('fail', muted);
        }, 1000);
      }
    }
  };


  // ==========================================
  // GAME 3: TIC-TAC-TOE VS GOIÁSBOT STATE & LOGIC
  // ==========================================
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [tttWinner, setTttWinner] = useState<string | null>(null); // 'X', 'O', or 'Empate'
  const [playerWins, setPlayerWins] = useState(0);
  const [botWins, setBotWins] = useState(0);

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(sq => sq !== null)) return 'Empate';
    return null;
  };

  const handleTttClick = (index: number) => {
    if (board[index] || tttWinner || !isPlayerTurn) return;

    playTone('click', muted);
    const newBoard = [...board];
    newBoard[index] = 'X'; // Player symbol
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setTttWinner(result);
      if (result === 'X') {
        setPlayerWins(prev => prev + 1);
        playTone('victory', muted);
        saveScore((playerWins + 1) * 30, 'Jogo da Velha Cerrado');
      } else {
        playTone('fail', muted);
      }
      return;
    }

    setIsPlayerTurn(false);
  };

  // Bot Smart AI turn simulation
  useEffect(() => {
    if (!isPlayerTurn && !tttWinner) {
      const timer = setTimeout(() => {
        // Find empty squares
        const emptySquares: number[] = [];
        board.forEach((val, idx) => {
          if (val === null) emptySquares.push(idx);
        });

        if (emptySquares.length === 0) return;

        // Smart decision making logic (Defensive / Offensive)
        let chosenSquare = -1;

        // 1. Can Bot win in this turn?
        for (const sq of emptySquares) {
          const testBoard = [...board];
          testBoard[sq] = 'O';
          if (checkWinner(testBoard) === 'O') {
            chosenSquare = sq;
            break;
          }
        }

        // 2. Can Player win in their next turn? If so, block!
        if (chosenSquare === -1) {
          for (const sq of emptySquares) {
            const testBoard = [...board];
            testBoard[sq] = 'X';
            if (checkWinner(testBoard) === 'X') {
              chosenSquare = sq;
              break;
            }
          }
        }

        // 3. Prefer center square if available
        if (chosenSquare === -1 && emptySquares.includes(4)) {
          chosenSquare = 4;
        }

        // 4. Random square otherwise
        if (chosenSquare === -1) {
          chosenSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
        }

        const newBoard = [...board];
        newBoard[chosenSquare] = 'O';
        setBoard(newBoard);
        playTone('fail', muted); // subtle bounce sound

        const result = checkWinner(newBoard);
        if (result) {
          setTttWinner(result);
          if (result === 'O') {
            setBotWins(prev => prev + 1);
            playTone('fail', muted);
          }
        }
        setIsPlayerTurn(true);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, tttWinner]);

  const resetTtt = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setTttWinner(null);
    playTone('click', muted);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 animate-fade-in" id="games-section-container">
      
      {/* LEFT CONTENT COL - THE GAMES */}
      <div className="flex-1 space-y-6">
        
        {/* HERO HEADER */}
        <div className="relative bg-[#121225] border border-white/10 rounded-2xl p-6 overflow-hidden shadow-xl" id="games-header-banner">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-purple-400">
                <Gamepad2 className="w-3.5 h-3.5 animate-bounce" /> Hub de Jogos & Passatempos
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight font-sans">
                Clube de Lazer da Rede
              </h2>
              <p className="text-gray-400 text-xs max-w-xl">
                Divirta-se com jogos interativos baseados na história, cultura e delícias de Goiás. Acumule pontos e suba no ranking da comunidade!
              </p>
            </div>

            {/* Sound Mute Control */}
            <button
              onClick={() => {
                setMuted(!muted);
                playTone('click', !muted);
              }}
              className="p-3 bg-[#1A1A32] hover:bg-[#25254A] border border-white/5 hover:border-purple-500/30 rounded-xl transition-all cursor-pointer text-gray-300 hover:text-white"
              title={muted ? 'Ativar Sons' : 'Desativar Sons'}
            >
              {muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-purple-400 animate-pulse" />}
            </button>
          </div>
        </div>

        {/* SELECTOR DESKTOP/MOBILE TABS */}
        <div className="flex bg-[#121225] border border-white/10 p-1.5 rounded-2xl gap-1.5 shadow-xl" id="games-tab-selector">
          <button
            onClick={() => {
              setActiveGame('trivia');
              playTone('click', muted);
            }}
            className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeGame === 'trivia'
                ? 'bg-[#0A0A14] text-purple-400 border border-purple-500/20 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Trívia Goiana
          </button>
          <button
            onClick={() => {
              setActiveGame('memory');
              playTone('click', muted);
            }}
            className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeGame === 'memory'
                ? 'bg-[#0A0A14] text-[#00E5FF] border border-[#00E5FF]/20 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Memória de Goiás
          </button>
          <button
            onClick={() => {
              setActiveGame('tictactoe');
              playTone('click', muted);
            }}
            className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeGame === 'tictactoe'
                ? 'bg-[#0A0A14] text-[#00E676] border border-[#00E676]/20 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-4.5 h-4.5" /> Jogo da Velha
          </button>
        </div>

        {/* ACTIVE GAME CANVAS CONTAINER */}
        <div className="bg-[#121225] border border-white/10 rounded-2xl p-6 shadow-xl min-h-[380px] flex flex-col justify-between" id="active-game-canvas">
          
          <AnimatePresence mode="wait">
            
            {/* GAME 1: TRIVIA QUIZ */}
            {activeGame === 'trivia' && (
              <motion.div
                key="trivia"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                {!quizFinished ? (
                  <div className="space-y-5">
                    {/* Progress bar */}
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-purple-400 font-bold">Pergunta {currentQuestionIndex + 1} de {TRIVIA_QUESTIONS.length}</span>
                      <span className="bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded text-white flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-yellow-400" /> Pontos: <strong className="text-purple-300 font-mono">{triviaScore}</strong>
                      </span>
                    </div>

                    <div className="w-full bg-[#1A1A32] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300" 
                        style={{ width: `${((currentQuestionIndex + 1) / TRIVIA_QUESTIONS.length) * 100}%` }}
                      />
                    </div>

                    {/* Streak Indicator */}
                    {triviaStreak > 0 && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold font-mono text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full">
                        <Flame className="w-3.5 h-3.5 animate-bounce fill-orange-500/10" /> Combo Acertos: x{triviaStreak} (+{triviaStreak * 5} pts)
                      </div>
                    )}

                    {/* Question text */}
                    <h3 className="text-white font-bold text-sm md:text-base leading-relaxed">
                      {TRIVIA_QUESTIONS[currentQuestionIndex].question}
                    </h3>

                    {/* Options list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {TRIVIA_QUESTIONS[currentQuestionIndex].options.map((opt, oIdx) => {
                        let btnStyle = "bg-[#1A1A32]/60 hover:bg-[#1A1A32] border border-white/5 hover:border-purple-500/30 text-white";
                        const isCorrect = oIdx === TRIVIA_QUESTIONS[currentQuestionIndex].correctAnswer;
                        const isSelected = oIdx === selectedAnswer;

                        if (selectedAnswer !== null) {
                          if (isCorrect) {
                            btnStyle = "bg-[#00E676]/15 border-[#00E676] text-[#00E676] font-bold";
                          } else if (isSelected) {
                            btnStyle = "bg-red-500/15 border-red-500 text-red-400";
                          } else {
                            btnStyle = "bg-[#1A1A32]/30 border-white/5 text-gray-500 cursor-not-allowed";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={selectedAnswer !== null}
                            onClick={() => handleAnswerClick(oIdx)}
                            className={`w-full p-3.5 rounded-xl text-left text-xs transition-all duration-200 cursor-pointer flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {selectedAnswer !== null && isCorrect && <CheckCircle className="w-4 h-4 text-[#00E676] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {selectedAnswer !== null && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0A0A14] border border-white/5 p-4 rounded-xl text-xs space-y-1.5"
                      >
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[#00E5FF] font-mono block">Você Sabia?</span>
                        <p className="text-gray-300 leading-relaxed font-sans">{TRIVIA_QUESTIONS[currentQuestionIndex].explanation}</p>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-5 flex-1 flex flex-col justify-center items-center">
                    <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                      <Trophy className="w-8 h-8 animate-pulse text-yellow-400" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-white font-black text-lg">Desafio de Trívia Concluído!</h3>
                      <p className="text-gray-450 text-gray-400 text-xs">
                        Você concluiu o Desafio de Trívia Goiana com maestria técnica e cultural.
                      </p>
                    </div>

                    <div className="bg-[#1A1A32] border border-white/5 px-6 py-3 rounded-2xl font-mono text-center">
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pontuação Final</div>
                      <div className="text-2xl font-black text-purple-400">{triviaScore} pts</div>
                    </div>

                    <button
                      onClick={resetTrivia}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Jogar Novamente
                    </button>
                  </div>
                )}

                {/* Next button */}
                {selectedAnswer !== null && !quizFinished && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-purple-900/20"
                    >
                      Próxima <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* GAME 2: MEMORY MATCH */}
            {activeGame === 'memory' && (
              <motion.div
                key="memory"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                {/* Stats panel */}
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400">Movimentos: <strong className="text-white font-bold">{memoryMoves}</strong></span>
                  <span className="bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2.5 py-0.5 rounded text-white flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> Score Estimado: <strong className="text-[#00E5FF] font-mono">{Math.max(10, memoryScore - memoryMoves * 4)}</strong>
                  </span>
                </div>

                {!memoryFinished ? (
                  /* Cards Board Grid - 4x3 */
                  <div className="grid grid-cols-4 gap-3 py-4 max-w-md mx-auto w-full">
                    {cards.map((card, idx) => {
                      const isRevealed = card.isFlipped || card.isMatched;

                      return (
                        <div
                          key={card.uniqueId}
                          onClick={() => handleCardClick(idx)}
                          className="aspect-square relative cursor-pointer group"
                        >
                          <div 
                            className={`w-full h-full rounded-xl transition-all duration-300 transform style-preserve-3d relative flex items-center justify-center border ${
                              isRevealed 
                                ? 'bg-[#1A1A32] border-[#00E5FF]/40 rotate-y-180 shadow-lg shadow-[#00E5FF]/5' 
                                : 'bg-gradient-to-br from-[#101026] to-[#1A1A3C] border-white/10 hover:border-purple-500/40'
                            }`}
                          >
                            {isRevealed ? (
                              <div className="flex flex-col items-center justify-center">
                                <span className="text-2xl md:text-3xl filter drop-shadow">{card.emoji}</span>
                                <span className="text-[7px] text-gray-400 font-bold uppercase tracking-tighter mt-1 text-center line-clamp-1 max-w-[55px]">{card.name}</span>
                              </div>
                            ) : (
                              <div className="text-center select-none flex flex-col items-center justify-center gap-1">
                                <Gamepad2 className="w-5 h-5 text-purple-400 opacity-60 group-hover:scale-110 group-hover:text-[#00E5FF] transition-all duration-300" />
                                <span className="text-[6px] font-mono tracking-widest text-gray-500 uppercase font-extrabold">GOIÁS</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-5 flex-1 flex flex-col justify-center items-center">
                    <div className="w-16 h-16 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-full flex items-center justify-center text-[#00E5FF]">
                      <Star className="w-8 h-8 animate-bounce text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-white font-black text-lg">Incrível! Memória de Goiás Completa!</h3>
                      <p className="text-gray-450 text-gray-400 text-xs">
                        Você encontrou todos os pares e demonstrou excelente memorização da cultura goiana.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-[#1A1A32] border border-white/5 px-5 py-2.5 rounded-xl text-center font-mono text-xs">
                        <div className="text-gray-400 text-[10px] uppercase font-bold">Movimentos</div>
                        <div className="text-white font-bold">{memoryMoves}</div>
                      </div>
                      <div className="bg-[#1A1A32] border border-white/5 px-5 py-2.5 rounded-xl text-center font-mono text-xs">
                        <div className="text-gray-400 text-[10px] uppercase font-bold">Pontuação</div>
                        <div className="text-[#00E5FF] font-bold">{Math.max(10, memoryScore - memoryMoves * 4)} pts</div>
                      </div>
                    </div>

                    <button
                      onClick={initMemoryGame}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#00E5FF] to-blue-500 hover:opacity-95 text-[#0A0A14] text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#00E5FF]/15"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Recomeçar Jogo
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* GAME 3: TIC-TAC-TOE */}
            {activeGame === 'tictactoe' && (
              <motion.div
                key="tictactoe"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-5 flex-1 flex flex-col justify-between"
              >
                {/* Score and Turn header */}
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400 flex items-center gap-2">
                    Turno: {tttWinner ? (
                      <span className="text-yellow-400 font-bold">Fim de Jogo</span>
                    ) : isPlayerTurn ? (
                      <span className="text-[#00E5FF] font-bold animate-pulse">Sua vez (X)</span>
                    ) : (
                      <span className="text-purple-400 font-bold animate-pulse">Pensando... (O)</span>
                    )}
                  </span>
                  
                  {/* Scoreboard */}
                  <span className="bg-[#00E676]/10 border border-[#00E676]/20 px-2.5 py-0.5 rounded text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#00E676]" /> {currentUser.fullName}: <strong className="text-green-400">{playerWins}</strong> vs CerradoAI: <strong className="text-purple-400">{botWins}</strong>
                  </span>
                </div>

                {/* Tic-Tac-Toe Grid */}
                <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto w-full py-2">
                  {board.map((cell, cIdx) => (
                    <button
                      key={cIdx}
                      disabled={cell !== null || tttWinner !== null || !isPlayerTurn}
                      onClick={() => handleTttClick(cIdx)}
                      className={`aspect-square rounded-2xl border flex items-center justify-center font-sans text-2xl font-black transition-all duration-300 cursor-pointer ${
                        cell === 'X' 
                          ? 'bg-[#1A1A32] border-[#00E5FF]/35 text-[#00E5FF]'
                          : cell === 'O'
                          ? 'bg-[#1A1A32] border-purple-500/35 text-purple-400'
                          : 'bg-[#121225] border-white/5 hover:border-purple-500/20 hover:bg-[#1A1A32]/40'
                      }`}
                    >
                      {cell}
                    </button>
                  ))}
                </div>

                {/* Winner notice & action button */}
                <div className="text-center pt-2 min-h-[70px]">
                  {tttWinner ? (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-white">
                        {tttWinner === 'X' ? (
                          <span className="text-[#00E676] flex items-center justify-center gap-1"><Trophy className="w-4 h-4" /> Vitória! Parabéns, você ganhou +30 pontos!</span>
                        ) : tttWinner === 'O' ? (
                          <span className="text-red-400">O robô CerradoAI venceu! Tente novamente!</span>
                        ) : (
                          <span className="text-yellow-400">Excelente jogo! Deu Empate!</span>
                        )}
                      </p>
                      <button
                        onClick={resetTtt}
                        className="px-4 py-2 bg-[#1A1A32] hover:bg-[#25254A] border border-white/15 text-xs text-white rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 font-bold"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Jogar Novamente
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-500 italic max-w-xs mx-auto">
                      Dispute contra nossa inteligência artificial do cerrado goiano e domine a arena de Jogo da Velha!
                    </p>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>

      {/* RIGHT SIDEBAR PANEL - HIGH SCORE LEADERBOARD */}
      <div className="w-full xl:w-72 bg-[#121225] border border-white/10 rounded-2xl p-4 shrink-0 shadow-xl space-y-4" id="games-leaderboard-rail">
        <div className="flex items-center gap-2 border-b border-white/15 pb-2.5">
          <Trophy className="w-4.5 h-4.5 text-yellow-400 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Ranking de Goiás</span>
        </div>

        <p className="text-[10px] text-gray-400 leading-relaxed font-sans pb-1">
          Veja os melhores pontuadores da nossa rede local de Goiás. Conecte-se com os perfis clicando nos nomes deles!
        </p>

        <div className="space-y-2.5" id="games-leaderboard-list">
          {leaderboard.length === 0 ? (
            <p className="text-gray-500 text-[10px] italic font-mono text-center">Nenhum score ainda.</p>
          ) : (
            leaderboard.slice(0, 7).map((entry, idx) => {
              const rankColor = 
                idx === 0 ? 'text-yellow-400 font-extrabold' : 
                idx === 1 ? 'text-gray-300' : 
                idx === 2 ? 'text-amber-600' : 'text-gray-500';

              const linkedUser = users.find(u => u.id === entry.userId);

              return (
                <div 
                  key={`${entry.userId}-${entry.game}-${idx}`}
                  onClick={() => linkedUser && onViewProfile && onViewProfile(linkedUser)}
                  className={`bg-[#1A1A32]/60 border border-white/5 hover:border-purple-500/20 p-2 rounded-xl flex items-center justify-between gap-2.5 transition-all ${
                    linkedUser ? 'cursor-pointer hover:bg-[#1A1A32]' : ''
                  } group`}
                  title={linkedUser ? `Ver perfil de ${entry.name}` : undefined}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Rank place */}
                    <span className={`text-xs font-mono w-4 text-center shrink-0 ${rankColor}`}>
                      #{idx + 1}
                    </span>

                    {/* Member photo */}
                    <img 
                      src={entry.avatar} 
                      alt={entry.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform shrink-0" 
                    />

                    {/* Member info details */}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                        {entry.name}
                      </div>
                      <div className="text-[8px] text-gray-500 font-mono truncate uppercase tracking-tighter">
                        {entry.game}
                      </div>
                    </div>
                  </div>

                  {/* score badge */}
                  <span className="bg-[#1A1A32] border border-white/5 text-purple-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded shrink-0">
                    {entry.score} pts
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
