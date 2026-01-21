# 0h n0 - Puzzle Generator & Interactive Game

A fully playable web version of [0h n0](https://0hn0.com) with puzzle generation featuring guaranteed unique solutions!

## Features

### 🎮 Interactive Web Game
- **Play in Browser**: Beautiful, responsive web interface styled like the original
- **Multiple Sizes**: Play 4×4 through 9×9 puzzles, or create custom sizes
- **Real-time Validation**: Check your solution and get instant feedback
- **Timer**: Track how fast you can solve each puzzle

### 🧩 Puzzle Generation
- **Unique Solution Guarantee**: Uses proper backtracking solver to ensure each puzzle has exactly one solution
- **Smart Stripping**: Removes clues intelligently while maintaining uniqueness
- **Constraint Enforcement**: No tile can see more than `n` tiles (where n is the puzzle size)
- **No Zero-Sees Tiles**: Ensures all non-wall tiles can see at least 1 other tile

## Quick Start

```bash
# Start the web server
npm start

# Then open your browser to:
# http://localhost:3000
```

## How to Play

1. **Choose a size** - Select from 4×4 to 9×9, or enter a custom size
2. **Click tiles** to change their state:
   - First click: Makes a blue tile with a number (how many tiles it sees)
   - Second click: Makes a red wall (blocks vision)
   - Third click: Returns to empty
3. **Blue dots** can see others in their row and column
4. **Their numbers** tell how many tiles they can see
5. **Red dots (walls)** block their view
6. **Click "Check"** when you think you've solved it!

## File Structure

```
├── index.html      # Main HTML page
├── style.css       # Styling (0h n0 inspired design)
├── game.js         # Web game logic and UI
├── generator.js    # Puzzle generation logic
├── solver.js       # Puzzle validation and solving
├── server.js       # Simple HTTP server
└── package.json    # NPM configuration
```

## How Puzzle Generation Works

1. **Generate blank grid**: Creates an n×n grid of tile objects
2. **Populate walls**: Randomly places walls (red dots) with hole-filling to avoid isolated tiles
3. **Enforce constraints**: Ensures no tile sees more than n tiles
4. **Calculate sees values**: Each tile gets its correct "sees" value
5. **Strip intelligently**: Removes clues and walls while verifying uniqueness after each removal
6. **Verify**: Final check that puzzle has exactly one solution

## Algorithm Details

The uniqueness checker uses a backtracking solver that:
- Tries all possible assignments for unknown tiles (wall vs numbered)
- Counts solutions up to 2 (stops early when multiple solutions found)
- Prunes invalid branches using constraint checking
- Guarantees the puzzle has exactly one valid solution

## Example Output

```
 ■    ■    ·    ·   
 ■    ■    ■     1  
 ·    ·    ·    ·   
  3   ·     3    3  
```

Where:
- `■` = Revealed wall (red dot)
- `·` = Unknown tile (player must solve)
- Numbers = Revealed "sees" clues

## Credits

Inspired by [0h n0](https://0hn0.com) by Martin Kool / Q42