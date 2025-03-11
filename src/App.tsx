"use client";

import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent as ReactKeyboardEvent,
  ChangeEvent,
} from "react";
import { RotateCcw, Eraser, Lightbulb } from "lucide-react";

type SudokuBoard = (number | null)[][];
type Difficulty = "easy" | "medium" | "hard" | "expert";
type GameState = "playing" | "solved";
type Position = [number, number];

interface GameMessageProps {
  type: "success" | "error" | "info";
  title: string;
  detail?: string;
}

function GameMessage({ type, title, detail }: GameMessageProps) {
  const baseClasses =
      "p-3 text-center rounded-md border text-sm my-2 transition-all duration-300 ";
  const typeClassMap: Record<typeof type, string> = {
    success:
        "bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-100 border-green-200 dark:border-green-700/60",
    error:
        "bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-100 border-red-200 dark:border-red-700/60",
    info:
        "bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-100 border-blue-200 dark:border-blue-700/60",
  };

  return (
      <div className={baseClasses + typeClassMap[type]} role="alert">
        <strong className="block font-medium">{title}</strong>
        {detail && <span className="block text-xs mt-1 opacity-90">{detail}</span>}
      </div>
  );
}

interface SudokuCellProps {
  value: number | null;
  row: number;
  col: number;
  isGiven: boolean;
  isSelected: boolean;
  isRelated: boolean;
  hasError: boolean;
  onClick: () => void;
  disabled: boolean;
}

function SudokuCell({
                      value,
                      row,
                      col,
                      isGiven,
                      isSelected,
                      isRelated,
                      hasError,
                      onClick,
                      disabled,
                    }: SudokuCellProps) {
  // CHANGED: conditionally apply hover/pointer only if not given
  const interactiveClasses = !isGiven
      ? "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/50"
      : "cursor-default"; // no pointer or hover effect for given cells

  const classes = [
    "aspect-square flex items-center justify-center text-base font-semibold select-none",
    "transition-colors duration-300 focus:outline-none focus:ring-2",
    interactiveClasses, // CHANGED
    isGiven
        ? "text-blue-800 dark:text-blue-300 font-extrabold"
        : "text-blue-700 dark:text-blue-300",
    isSelected
        ? "bg-blue-200 dark:bg-blue-800 ring-blue-500 dark:ring-blue-300 ring-2"
        : isRelated
            ? "bg-[#eff6fe]" // CHANGED: replaced yellow highlight with #eff6fe
            : "bg-white dark:bg-gray-800",
    hasError
        ? "bg-red-100 dark:bg-red-800/40 border border-red-400"
        : "",
    disabled ? "cursor-not-allowed opacity-60" : "",
  ]
      .filter(Boolean)
      .join(" ");

  return (
      <button
          type="button"
          className={classes}
          onClick={onClick}
          disabled={disabled || isGiven} // CHANGED: also disable if isGiven
          aria-label={`Row ${row + 1}, Column ${col + 1}`}
          aria-selected={isSelected}
      >
        {value || ""}
      </button>
  );
}

function canPlace(board: SudokuBoard, row: number, col: number, val: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === val) return false;
  }
  // Check col
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === val) return false;
  }
  // Check box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let rr = boxRow; rr < boxRow + 3; rr++) {
    for (let cc = boxCol; cc < boxCol + 3; cc++) {
      if (board[rr][cc] === val) return false;
    }
  }
  return true;
}

function solveSudoku(board: SudokuBoard): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        for (let val = 1; val <= 9; val++) {
          if (canPlace(board, row, col, val)) {
            board[row][col] = val;
            if (solveSudoku(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateFullSolution(): SudokuBoard {
  const board: SudokuBoard = Array.from({ length: 9 }, () => Array(9).fill(null));
  solveSudoku(board);
  return board;
}

function generatePuzzle(difficulty: Difficulty): SudokuBoard {
  const removalMap: Record<Difficulty, number> = {
    easy: 35,
    medium: 45,
    hard: 55,
    expert: 60,
  };
  const puzzle = generateFullSolution().map((row) => [...row]); // copy
  let cellsToRemove = removalMap[difficulty];

  while (cellsToRemove > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      cellsToRemove--;
    }
  }
  return puzzle;
}

function generatePuzzleAndSolution(difficulty: Difficulty): [SudokuBoard, SudokuBoard] {
  const puzzle = generatePuzzle(difficulty);
  const puzzleCopy: SudokuBoard = puzzle.map((row) => [...row]);
  solveSudoku(puzzleCopy);
  return [puzzle, puzzleCopy];
}

// CHANGED: a helpful default message object to revert to after clearing an error
const defaultPlayingMessage: GameMessageProps = {
  type: "info",
  title: "Instruction",
  detail: "Select a cell, then type 1–9, or press Backspace/Delete to clear",
};

export default function SudokuApp() {
  const [darkMode] = useState(false);

  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const [[board, solutionBoard], setBoards] = useState<[SudokuBoard, SudokuBoard]>(() => {
    const [puzzle, solution] = generatePuzzleAndSolution("medium");
    return [puzzle, solution];
  });

  const [originalBoard, setOriginalBoard] = useState<SudokuBoard>(board);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);

  const [errors, setErrors] = useState<Set<string>>(new Set());

  const [gameState, setGameState] = useState<GameState>("playing");
  const [message, setMessage] = useState<GameMessageProps | null>(defaultPlayingMessage);

  const [time, setTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // CHANGED: ref for hidden input (mobile keyboard)
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState]);

  useEffect(() => {
    // Generate new puzzle whenever difficulty changes
    const [newPuzzle, newSolution] = generatePuzzleAndSolution(difficulty);
    setBoards([newPuzzle, newSolution]);
    setOriginalBoard(newPuzzle);
    setSelectedCell(null);
    setErrors(new Set());
    setTime(0);
    setGameState("playing");
    setMessage({
      type: "info",
      title: "New Game",
      detail: `Difficulty set to ${difficulty}`,
    });
  }, [difficulty]);

  // CHANGED: Keep the existing keydown for desktop/laptop usage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || gameState !== "playing") return;
      const [row, col] = selectedCell;
      if (originalBoard[row][col] !== null) return;

      if (e.key === "Backspace" || e.key === "Delete") {
        clearCell();
      } else if (/^[1-9]$/.test(e.key)) {
        placeNumber(parseInt(e.key, 10));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, board, gameState, originalBoard]);

  // CHANGED: Whenever user selects a cell, focus the hidden input (mobile)
  useEffect(() => {
    if (selectedCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedCell]);

  // CHANGED: handle text input changes from hidden input on mobile
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (!selectedCell || gameState !== "playing") {
      e.target.value = "";
      return;
    }
    const val = e.target.value;
    // If empty => treat as a clear
    // If single digit (1-9) => place that number
    // Then reset input to ""
    if (val === "") {
      clearCell();
    } else if (/^[1-9]$/.test(val)) {
      placeNumber(parseInt(val, 10));
    }
    e.target.value = "";
  }

  function formatTime(sec: number) {
    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }

  function isBoardFull(bd: SudokuBoard): boolean {
    return bd.every((row) => row.every((cell) => cell !== null));
  }

  function isBoardFullyCorrect(bd: SudokuBoard): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (bd[r][c] !== solutionBoard[r][c]) {
          return false;
        }
      }
    }
    return true;
  }

  function handleCellClick(r: number, c: number) {
    // Only allow selection if the cell isn't given and the game is still playing
    if (originalBoard[r][c] === null && gameState === "playing") {
      setSelectedCell([r, c]);
    }
  }

  function clearCell() {
    if (!selectedCell) return;
    const [r, c] = selectedCell;

    if (originalBoard[r][c] !== null) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = null;

    const key = `${r}-${c}`;
    if (errors.has(key)) {
      const newErrors = new Set(errors);
      newErrors.delete(key);
      setErrors(newErrors);
    }

    setBoards([newBoard, solutionBoard]);
  }

  function placeNumber(num: number) {
    if (!selectedCell) return;
    const [r, c] = selectedCell;

    if (originalBoard[r][c] !== null) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;

    const key = `${r}-${c}`;

    if (num !== solutionBoard[r][c]) {
      // Mark as error
      const newErrors = new Set(errors);
      newErrors.add(key);
      setErrors(newErrors);

      setMessage({
        type: "error",
        title: "Incorrect",
        detail: "This number is not correct for this cell.",
      });

      // CHANGED: keep error message for 20s, then revert to default
      setTimeout(() => {
        // Only revert if the game is still playing
        if (gameState === "playing") {
          setMessage(defaultPlayingMessage);
        }
      }, 20000);
    } else {
      // If previously flagged an error, remove it
      if (errors.has(key)) {
        const newErrors = new Set(errors);
        newErrors.delete(key);
        setErrors(newErrors);
      }
      // Hide "incorrect" messages or revert to default if no other errors
      setMessage(null);

      // Check if puzzle is complete and correct
      if (isBoardFull(newBoard) && isBoardFullyCorrect(newBoard)) {
        setGameState("solved");
        setMessage({
          type: "success",
          title: "Sudoku Solved!",
          detail: `Finished in ${formatTime(time)}`,
        });
      }
    }

    setBoards([newBoard, solutionBoard]);
  }

  function resetGame() {
    const [newPuzzle, newSolution] = generatePuzzleAndSolution(difficulty);
    setBoards([newPuzzle, newSolution]);
    setOriginalBoard(newPuzzle);
    setSelectedCell(null);
    setErrors(new Set());
    setTime(0);
    setGameState("playing");
    setMessage({
      type: "info",
      title: "Game Reset",
      detail: `Puzzle refreshed at ${difficulty} difficulty.`,
    });
  }

  function getHint(): string {
    // Search for the first empty cell in user board
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === null) {
          const correctDigit = solutionBoard[r][c];
          return `Row ${r + 1}, Col ${c + 1} must be ${correctDigit}.`;
        }
      }
    }
    return "No hints available! (Board is complete or no empty cells).";
  }

  const [showHint, setShowHint] = useState(false);

  return (
      <div className={darkMode ? "dark" : ""}>
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-lg mx-auto">
            {/* Title */}
            <div className="flex justify-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 bg-white/70 dark:bg-gray-800/60 px-4 py-2 rounded-md shadow-sm">
                SudokuApp
              </h1>
            </div>

            {/* Sudoku Board Section */}
            <div
                className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                role="region"
                aria-label="Sudoku Board"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold">{formatTime(time)}</div>
                {message && <div className="w-1/2" />}
              </div>

              {/* Sudoku Grid */}
              {/* CHANGED: added overflow-hidden to preserve rounded corners */}
              <div
                  className="grid grid-cols-9 gap-px bg-gray-300 dark:bg-gray-700 p-px rounded-md overflow-hidden"
                  role="grid"
                  aria-label="Sudoku Puzzle"
              >
                {board.map((row, r) => (
                    <React.Fragment key={`row-${r}`}>
                      {row.map((cellVal, c) => {
                        const isCellSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                        // highlight if same row, col, or box as selected
                        const isRelated =
                            selectedCell !== null &&
                            (selectedCell[0] === r ||
                                selectedCell[1] === c ||
                                (Math.floor(r / 3) === Math.floor(selectedCell[0] / 3) &&
                                    Math.floor(c / 3) === Math.floor(selectedCell[1] / 3)));

                        const cellKey = `${r}-${c}`;

                        return (
                            <SudokuCell
                                key={cellKey}
                                value={cellVal}
                                row={r}
                                col={c}
                                isGiven={originalBoard[r][c] !== null}
                                isSelected={isCellSelected}
                                isRelated={isRelated}
                                hasError={errors.has(cellKey)}
                                onClick={() => handleCellClick(r, c)}
                                disabled={gameState === "solved"}
                            />
                        );
                      })}
                    </React.Fragment>
                ))}
              </div>

              {/* Possible message (error, conflict, solved, etc.) */}
              {message && <GameMessage {...message} />}

              {/* If there's no message, show default instructions (when playing) */}
              {!message && gameState === "playing" && (
                  <div className="text-sm text-center text-gray-600 dark:text-gray-400 mt-3">
                    Select a cell, then type 1–9, or press Backspace/Delete to clear
                  </div>
              )}

              {/* Hidden input for mobile keyboard */}
              {/* CHANGED: focuses on cell select, handles numeric input */}
              <input
                  ref={inputRef}
                  type="tel"
                  onChange={handleInputChange}
                  className="absolute opacity-0 pointer-events-none"
                  aria-hidden="true"
                  // The input is "hidden" but we rely on it for opening mobile keyboard
              />

              {/* Bottom Controls */}
              <div className="mt-6 space-y-4">
                {/* Difficulty Selector */}
                <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                  <div className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Difficulty:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["easy", "medium", "hard", "expert"] as Difficulty[]).map((lvl) => (
                        <button
                            key={lvl}
                            onClick={() => setDifficulty(lvl)}
                            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                                difficulty === lvl
                                    ? "bg-blue-600 dark:bg-blue-500 text-white font-semibold"
                                    : "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100"
                            }`}
                        >
                          {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                        </button>
                    ))}
                  </div>
                </div>

                {/* Toolbar Buttons */}
                <div
                    className="grid grid-cols-3 gap-4"
                    role="toolbar"
                    aria-label="Sudoku Controls"
                >
                  {/* Clear */}
                  <button
                      onClick={clearCell}
                      disabled={!selectedCell || gameState !== "playing"}
                      className="flex flex-col items-center justify-center gap-1 p-3 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 transition disabled:opacity-40 cursor-pointer"
                  >
                    <Eraser className="w-5 h-5" />
                    <span className="text-sm">Clear</span>
                  </button>

                  {/* Hint */}
                  <div className="relative">
                    {/* CHANGED: move tooltip above -> use bottom-full instead of top-full */}
                    <button
                        onClick={() => setShowHint((prev) => !prev)}
                        disabled={gameState !== "playing"}
                        className="w-full flex flex-col items-center justify-center gap-1 p-3 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 transition disabled:opacity-40 cursor-pointer"
                        aria-expanded={showHint}
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span className="text-sm">Hint</span>
                    </button>
                    {showHint && (
                        <div
                            className="absolute bottom-full mb-2 p-3 rounded-md shadow-md bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 w-64 z-10"
                            role="tooltip"
                        >
                          <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                            Hint:
                          </p>
                          <p>{getHint()}</p>
                        </div>
                    )}
                  </div>

                  {/* Reset */}
                  <button
                      onClick={resetGame}
                      className="flex flex-col items-center justify-center gap-1 p-3 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 transition cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span className="text-sm">Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}