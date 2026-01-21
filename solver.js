// Puzzle Solving and Validation Logic for 0h n0

class PuzzleSolver {
    constructor(puzzle) {
        this.puzzle = puzzle;
        this.n = puzzle.length;
    }

    freeSpace(x, y, puz) {
        const puzSize = puz.length;
        
        let up = 0;
        for (let i = 0; i < x; i++) {
            if (puz[x - i - 1][y].type === "wall") break;
            up++;
        }
        
        let right = 0;
        for (let i = 0; i < puzSize - y - 1; i++) {
            if (puz[x][y + i + 1].type === "wall") break;
            right++;
        }
        
        let down = 0;
        for (let i = 0; i < puzSize - x - 1; i++) {
            if (puz[x + i + 1][y].type === "wall") break;
            down++;
        }
        
        let left = 0;
        for (let i = 0; i < y; i++) {
            if (puz[x][y - 1 - i].type === "wall") break;
            left++;
        }
        
        return { up, right, down, left };
    }

    tileSees(x, y, puz) {
        const { up, right, down, left } = this.freeSpace(x, y, puz);
        return up + down + left + right;
    }

    validateSolution(userPuzzle) {
        console.log("Validating solution...");
        
        // Check if all tiles are filled
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                const tile = userPuzzle[i][j];
                
                // Check if tile is still unknown
                if (tile.value === -1 && tile.type !== "wall") {
                    console.log(`Incomplete at (${i},${j})`);
                    return { valid: false, error: "Puzzle is not complete", position: { i, j } };
                }
                
                // Check if non-wall tiles have correct sees values
                if (tile.type !== "wall" && tile.value !== -1) {
                    const actualSees = this.tileSees(i, j, userPuzzle);
                    console.log(`Tile (${i},${j}): claims ${tile.value}, actually sees ${actualSees}`);
                    if (actualSees !== tile.value) {
                        return { 
                            valid: false, 
                            error: `Tile at row ${i+1}, col ${j+1} should see ${tile.value} but sees ${actualSees}`,
                            position: { i, j }
                        };
                    }
                }
                
                // Check that non-wall tiles see at least 1
                if (tile.type !== "wall") {
                    const sees = this.tileSees(i, j, userPuzzle);
                    if (sees === 0) {
                        return {
                            valid: false,
                            error: `Tile at row ${i+1}, col ${j+1} cannot see any other tiles`,
                            position: { i, j }
                        };
                    }
                }
            }
        }
        
        console.log("Solution is valid!");
        return { valid: true, error: null };
    }

    checkProgress(userPuzzle) {
        const errors = [];
        
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                const tile = userPuzzle[i][j];
                
                // Only check tiles that have clues
                if (tile.type !== "wall" && tile.value !== -1) {
                    const currentSees = this.tileSees(i, j, userPuzzle);
                    
                    // If user has placed walls, check if they violate the clue
                    if (currentSees < tile.value) {
                        // This tile can't possibly see enough
                        errors.push({
                            position: { i, j },
                            message: `This tile needs to see ${tile.value} but can only see ${currentSees}`
                        });
                    }
                }
            }
        }
        
        return errors;
    }

    getHint(userPuzzle) {
        // Find a tile that can be logically deduced
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                const tile = userPuzzle[i][j];
                
                // Skip if already determined
                if (tile.type === "wall" || tile.value !== -1) continue;
                
                // Check if this tile is surrounded (must be a wall)
                const { up, right, down, left } = this.freeSpace(i, j, userPuzzle);
                if (up === 0 && right === 0 && down === 0 && left === 0) {
                    return {
                        position: { i, j },
                        action: "wall",
                        reason: "This tile is completely surrounded and must be a wall"
                    };
                }
                
                // Check if adjacent clues force this to be a wall or number
                // (More complex logic can be added here)
            }
        }
        
        return null;
    }
}

// Export for browser use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PuzzleSolver };
}
