import { useState, useEffect, useRef } from 'react'
import './SnakeGame.css'

type Position = { x: number; y: number }
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 100

export function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Direction>('RIGHT')
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT')
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Generate random food position
  const generateFood = (): Position => {
    let newFood: Position = { x: 0, y: 0 }
    let isOnSnake = true

    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
      isOnSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
    }

    return newFood
  }

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setNextDirection('UP')
          e.preventDefault()
          break
        case 'ArrowDown':
          if (direction !== 'UP') setNextDirection('DOWN')
          e.preventDefault()
          break
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setNextDirection('LEFT')
          e.preventDefault()
          break
        case 'ArrowRight':
          if (direction !== 'LEFT') setNextDirection('RIGHT')
          e.preventDefault()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction])

  // Game loop
  useEffect(() => {
    if (gameOver) return

    gameLoopRef.current = setInterval(() => {
      setSnake((prevSnake) => {
        setDirection(nextDirection)

        const head = prevSnake[0]
        let newHead: Position

        switch (nextDirection) {
          case 'UP':
            newHead = { x: head.x, y: head.y - 1 }
            break
          case 'DOWN':
            newHead = { x: head.x, y: head.y + 1 }
            break
          case 'LEFT':
            newHead = { x: head.x - 1, y: head.y }
            break
          case 'RIGHT':
            newHead = { x: head.x + 1, y: head.y }
            break
        }

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true)
          return prevSnake
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true)
          return prevSnake
        }

        let newSnake = [newHead, ...prevSnake]

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 10)
          setFood(generateFood())
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, INITIAL_SPEED)

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [gameOver, nextDirection, food])

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }])
    setFood({ x: 15, y: 15 })
    setDirection('RIGHT')
    setNextDirection('RIGHT')
    setScore(0)
    setGameOver(false)
  }

  return (
    <div className="snake-game-container">
      <div className="snake-header">
        <h1>Snake Game</h1>
        <div className="score-board">
          <div className="score">Score: {score}</div>
        </div>
      </div>

      <div className="game-board" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
        {/* Render grid cells */}
        {Array.from({ length: GRID_SIZE }).map((_, y) =>
          Array.from({ length: GRID_SIZE }).map((_, x) => {
            const isSnakeHead = snake[0].x === x && snake[0].y === y
            const isSnakeBody = snake.some((segment, idx) => idx !== 0 && segment.x === x && segment.y === y)
            const isFood = food.x === x && food.y === y

            return (
              <div
                key={`${x}-${y}`}
                className={`cell ${isSnakeHead ? 'snake-head' : ''} ${isSnakeBody ? 'snake-body' : ''} ${isFood ? 'food' : ''}`}
                style={{
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
              />
            )
          }),
        )}
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <button onClick={resetGame} className="restart-button">
              Play Again
            </button>
          </div>
        </div>
      )}

      <div className="controls">
        <p>Use arrow keys to move</p>
        <button onClick={resetGame} className="reset-button">
          New Game
        </button>
      </div>
    </div>
  )
}
