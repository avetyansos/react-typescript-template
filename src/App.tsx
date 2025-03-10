"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const classes = [
    "aspect-square flex items-center justify-center text-base font-semibold select-none",
    "transition-colors duration-300 focus:outline-none focus:ring-2",
    "hover:bg-gray-200 dark:hover:bg-gray-700/50",

    isGiven
        ? "text-blue-800 dark:text-blue-300 font-extrabold"
        : "text-blue-700 dark:text-blue-300",

    // Use whichever background logic you need:
    isSelected
        ? "bg-blue-200 dark:bg-blue-800 ring-blue-500 dark:ring-blue-300 ring-2"
        : isRelated
            ? "bg-gradient-to-br from-yellow-100/80 to-amber-200/80 dark:bg-gradient-to-br dark:from-yellow-700/60 dark:to-amber-800/60"
            : "bg-white dark:bg-gray-800",

    hasError
        ? "bg-red-100 dark:bg-red-800/40 text-red-800 dark:text-red-100"
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
          disabled={disabled}
          aria-label={`Row ${row + 1}, Column ${col + 1}`}
          aria-selected={isSelected}
      >
        {value || ""}
      </button>
  );
}

function canPlace(board: SudokuBoard, row: number, col: number, val: number): boolean {
  // Row check
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === val) return false;
  }
  // Column check
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === val) return false;
  }
  // 3x3 box check
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

/** Generate a fully solved 9x9 Sudoku board */
function generateFullSolution(): SudokuBoard {
  const board: SudokuBoard = Array.from({ length: 9 }, () => Array(9).fill(null));
  solveSudoku(board);
  return board;
}

/** Remove cells from a solved board based on difficulty */
function generatePuzzle(difficulty: Difficulty): SudokuBoard {
  const removalMap: Record<Difficulty, number> = {
    easy: 35,
    medium: 45,
    hard: 55,
    expert: 60,
  };
  const puzzle = generateFullSolution().map((row) => [...row]);
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

export default function SudokuApp() {
  const [darkMode] = useState(false);

  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [board, setBoard] = useState<SudokuBoard>(() => generatePuzzle("medium"));
  const [originalBoard, setOriginalBoard] = useState<SudokuBoard>(() => generatePuzzle("medium"));
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [gameState, setGameState] = useState<GameState>("playing");
  const [message, setMessage] = useState<GameMessageProps | null>(null);

  const [time, setTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null; // always reset to null after clearing
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState]);

  useEffect(() => {
    const newPuzzle = generatePuzzle(difficulty);
    setBoard(newPuzzle);
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
  }, [selectedCell, board, gameState]);

  function formatTime(sec: number) {
    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }

  function handleCellClick(r: number, c: number) {
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
    setBoard(newBoard);

    const key = `${r}-${c}`;
    if (errors.has(key)) {
      const newErrors = new Set(errors);
      newErrors.delete(key);
      setErrors(newErrors);
    }
  }

  function placeNumber(num: number) {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (originalBoard[r][c] !== null) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    const key = `${r}-${c}`;
    if (!canPlace(newBoard, r, c, num)) {
      const newErrors = new Set(errors);
      newErrors.add(key);
      setErrors(newErrors);
      setMessage({
        type: "info",
        title: "Conflict",
        detail: "Check row, column, and 3×3 subgrid.",
      });
    } else {
      if (errors.has(key)) {
        const newErrors = new Set(errors);
        newErrors.delete(key);
        setErrors(newErrors);
      }
      if (isBoardFull(newBoard) && verifySolution(newBoard)) {
        setGameState("solved");
        setMessage({
          type: "success",
          title: "Sudoku Solved!",
          detail: `Finished in ${formatTime(time)}`,
        });
      }
    }
  }

  function isBoardFull(bd: SudokuBoard): boolean {
    return bd.every((row) => row.every((cell) => cell !== null));
  }

  function verifySolution(bd: SudokuBoard): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = bd[r][c];
        if (val === null || !canPlace(bd, r, c, val)) return false;
      }
    }
    return true;
  }

  function resetGame() {
    const newPuzzle = generatePuzzle(difficulty);
    setBoard(newPuzzle);
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
    // If there's exactly one candidate in a cell, show that
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === null) {
          const candidates: number[] = [];
          for (let val = 1; val <= 9; val++) {
            if (canPlace(board, r, c, val)) candidates.push(val);
          }
          if (candidates.length === 1) {
            return `Row ${r + 1}, Col ${c + 1} must be ${candidates[0]}.`;
          }
        }
      }
    }
    // Otherwise, show smaller sets of candidates if found
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === null) {
          const candidates: number[] = [];
          for (let val = 1; val <= 9; val++) {
            if (canPlace(board, r, c, val)) candidates.push(val);
          }
          if (candidates.length >= 2 && candidates.length <= 3) {
            return `Possible values at row ${r + 1}, col ${c + 1}: [${candidates.join(", ")}].`;
          }
        }
      }
    }
    return "Try scanning rows & columns for single possible moves!";
  }

  const [showHint, setShowHint] = useState(false);

  return (
      <div className={darkMode ? "dark" : ""}>
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 bg-white/70 dark:bg-gray-800/60 px-4 py-2 rounded-md shadow-sm">
                SudokuApp
              </h1>
            </div>

            <div
                className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                role="region"
                aria-label="Sudoku Board"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold">{formatTime(time)}</div>
                {message && <div className="w-1/2" />}
              </div>

              <div
                  className="grid grid-cols-9 gap-px bg-gray-300 dark:bg-gray-700 p-px rounded-md"
                  role="grid"
                  aria-label="Sudoku Puzzle"
              >
                {board.map((row, r) => (
                    <React.Fragment key={`row-${r}`}>
                      {row.map((cellVal, c) => {
                        const isCellSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                        const isRelated =
                            // If there's no selectedCell, this becomes false automatically
                            isCellSelected ||
                            (selectedCell &&
                                (selectedCell[0] === r || selectedCell[1] === c)) ||
                            (selectedCell &&
                                Math.floor(r / 3) === Math.floor(selectedCell[0] / 3) &&
                                Math.floor(c / 3) === Math.floor(selectedCell[1] / 3));

                        const cellKey = `${r}-${c}`;

                        return (
                            <SudokuCell
                                key={cellKey}
                                value={cellVal}
                                row={r}
                                col={c}
                                isGiven={originalBoard[r][c] !== null}
                                isSelected={isCellSelected}
                                // Pass isRelated directly; it is already a boolean
                                isRelated={!!isRelated}
                                hasError={errors.has(cellKey)}
                                onClick={() => handleCellClick(r, c)}
                                disabled={gameState === "solved"}
                            />
                        );
                      })}
                    </React.Fragment>
                ))}
              </div>

              {message && <GameMessage {...message} />}

              {!message && gameState === "playing" && (
                  <div className="text-sm text-center text-gray-600 dark:text-gray-400 mt-3">
                    Select a cell, then type 1–9, or press Backspace/Delete to clear
                  </div>
              )}

              <div className="mt-6 space-y-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                  <div className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Difficulty:
                  </div>
                  <div className="flex space-x-2">
                    {(["easy", "medium", "hard", "expert"] as Difficulty[]).map((lvl) => (
                        <button
                            key={lvl}
                            onClick={() => setDifficulty(lvl)}
                            className={`px-3 py-1.5 rounded-md transition-colors ${
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

                <div className="grid grid-cols-3 gap-4" role="toolbar" aria-label="Sudoku Controls">
                  <button
                      onClick={clearCell}
                      disabled={!selectedCell || gameState !== "playing"}
                      className="flex flex-col items-center justify-center gap-1 p-3 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 transition disabled:opacity-40"
                  >
                    <Eraser className="w-5 h-5" />
                    <span className="text-sm">Clear</span>
                  </button>

                  <div className="relative">
                    <button
                        onClick={() => setShowHint((prev) => !prev)}
                        disabled={gameState !== "playing"}
                        className="w-full flex flex-col items-center justify-center gap-1 p-3 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 transition disabled:opacity-40"
                        aria-expanded={showHint}
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span className="text-sm">Hint</span>
                    </button>
                    {showHint && (
                        <div
                            className="absolute top-full mt-2 p-3 rounded-md shadow-md bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 w-64 z-10"
                            role="tooltip"
                        >
                          <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                            Hint:
                          </p>
                          <p>{getHint()}</p>
                        </div>
                    )}
                  </div>

                  <button
                      onClick={resetGame}
                      className="flex flex-col items-center justify-center gap-1 p-3 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 transition"
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