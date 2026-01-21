# 0h-n0 Puzzle Generator

Generates 0h-n0 puzzles with guaranteed unique solutions.

Check out the game that inspired this: https://0hn0.com

## Requirements

- Node.js 12.0.0 or higher

## Features

- **Unique Solution Guarantee**: Uses proper backtracking solver to ensure each puzzle has exactly one solution
- **Configurable Difficulty**: Adjustable clue and wall ratios for easier or harder puzzles
- **Smart Stripping**: Removes clues intelligently while maintaining uniqueness
- **No Zero-Sees Tiles**: Ensures all non-wall tiles can see at least 1 other tile
- **Constraint Enforcement**: No tile can see more than `n` tiles (where n is the puzzle size)

## Usage

```bash
# Run directly
node puzzlegen.js

# Or use npm
npm start
```

When prompted, enter the puzzle size (3-12).

> **Note:** If you have a `venv/` directory from a previous Python version, you can safely delete it: `rm -rf venv/`

## How It Works

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