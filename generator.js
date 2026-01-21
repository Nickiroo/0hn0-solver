// Puzzle Generation Logic for 0h n0

class Tile {
    constructor(value, x, y, type = null) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.type = type;
    }

    setValue(z) {
        this.value = z;
    }

    setType(z) {
        this.type = z;
    }
}

class PuzzleGenerator {
    constructor(size, debugLevel = 0) {
        this.n = size;
        this.debugLevel = debugLevel;
    }

    freeSpace(x, y, puz) {
        const puzSize = puz.length;
        
        let up = 0;
        for (let i = 0; i < x; i++) {
            if (puz[x - i - 1][y].type === "wall" || puz[x - i - 1][y].value === -1) break;
            up++;
        }
        
        let right = 0;
        for (let i = 0; i < puzSize - y - 1; i++) {
            if (puz[x][y + i + 1].type === "wall" || puz[x][y + i + 1].value === -1) break;
            right++;
        }
        
        let down = 0;
        for (let i = 0; i < puzSize - x - 1; i++) {
            if (puz[x + i + 1][y].type === "wall" || puz[x + i + 1][y].value === -1) break;
            down++;
        }
        
        let left = 0;
        for (let i = 0; i < y; i++) {
            if (puz[x][y - 1 - i].type === "wall" || puz[x][y - 1 - i].value === -1) break;
            left++;
        }
        
        return { up, right, down, left };
    }

    tileSees(x, y, puz) {
        const { up, right, down, left } = this.freeSpace(x, y, puz);
        return up + down + left + right;
    }

    generateBlank() {
        const grid = [];
        for (let i = 0; i < this.n; i++) {
            const row = [];
            for (let j = 0; j < this.n; j++) {
                row.push(new Tile(0, i, j, "empty"));
            }
            grid.push(row);
        }
        return grid;
    }

    populateReds(top, bottom, puz) {
        const redDotNum = Math.floor(Math.random() * ((this.n * this.n) * top - (this.n * this.n) * bottom + 1)) + 
                          Math.round((this.n * this.n) * bottom);
        
        let currentRedCount = 0;
        while (currentRedCount < redDotNum) {
            const x = Math.floor(Math.random() * this.n);
            const y = Math.floor(Math.random() * this.n);
            
            if (puz[x][y].type !== "wall") {
                puz[x][y].setType("wall");
                currentRedCount++;
            }
        }
        
        // Fill holes
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                const { up, right, down, left } = this.freeSpace(i, j, puz);
                if (up === 0 && right === 0 && down === 0 && left === 0) {
                    puz[i][j].setType("wall");
                }
            }
        }
    }

    fillHoles(puz) {
        let filledHoles = 0;
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                if (puz[i][j].type !== "wall") {
                    const { up, right, down, left } = this.freeSpace(i, j, puz);
                    if (up === 0 && right === 0 && down === 0 && left === 0) {
                        puz[i][j].setType("wall");
                        filledHoles++;
                    }
                }
            }
        }
        return filledHoles;
    }

    enforceMaxSees(puz) {
        const maxIterations = 1000;
        let iteration = 0;
        
        while (iteration < maxIterations) {
            let violationFound = false;
            
            for (let i = 0; i < this.n; i++) {
                for (let j = 0; j < this.n; j++) {
                    if (puz[i][j].type !== "wall") {
                        const sees = this.tileSees(i, j, puz);
                        
                        if (sees > this.n) {
                            violationFound = true;
                            const { up, right, down, left } = this.freeSpace(i, j, puz);
                            
                            const directions = [
                                { count: up, wallX: up > 0 ? i - up : null, wallY: j },
                                { count: right, wallX: i, wallY: right > 0 ? j + right : null },
                                { count: down, wallX: down > 0 ? i + down : null, wallY: j },
                                { count: left, wallX: i, wallY: left > 0 ? j - left : null }
                            ];
                            
                            directions.sort((a, b) => b.count - a.count);
                            
                            for (let dir of directions) {
                                if (dir.count > 0 && dir.wallX !== null && dir.wallY !== null) {
                                    if (dir.wallX >= 0 && dir.wallX < this.n && dir.wallY >= 0 && dir.wallY < this.n) {
                                        if (puz[dir.wallX][dir.wallY].type !== "wall") {
                                            puz[dir.wallX][dir.wallY].setType("wall");
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            if (!violationFound) break;
            iteration++;
        }
        
        this.fillHoles(puz);
    }

    populateSees(puz) {
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                if (puz[i][j].type !== "wall") {
                    puz[i][j].setValue(this.tileSees(i, j, puz));
                }
            }
        }
    }

    copyPuzzle(puz) {
        const newPuz = [];
        for (let i = 0; i < puz.length; i++) {
            const row = [];
            for (let j = 0; j < puz[0].length; j++) {
                const oldTile = puz[i][j];
                row.push(new Tile(oldTile.value, oldTile.x, oldTile.y, oldTile.type));
            }
            newPuz.push(row);
        }
        return newPuz;
    }

    getTileImportance(i, j, puz) {
        let importance = 0;
        const { up, right, down, left } = this.freeSpace(i, j, puz);
        const totalVisibility = up + right + down + left;
        
        if (totalVisibility <= 2) importance += 3;
        else if (totalVisibility <= 4) importance += 2;
        else importance += 1;
        
        if (i === 0 || i === this.n - 1 || j === 0 || j === this.n - 1) {
            importance += 2;
        }
        
        let adjacentWalls = 0;
        if (i > 0 && puz[i - 1][j].type === "wall") adjacentWalls++;
        if (i < this.n - 1 && puz[i + 1][j].type === "wall") adjacentWalls++;
        if (j > 0 && puz[i][j - 1].type === "wall") adjacentWalls++;
        if (j < this.n - 1 && puz[i][j + 1].type === "wall") adjacentWalls++;
        
        importance += adjacentWalls;
        return importance;
    }

    countSolutions(puz, maxSolutions = 2) {
        const workPuz = this.copyPuzzle(puz);
        
        const unknowns = [];
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                if (workPuz[i][j].value === -1 && workPuz[i][j].type === "empty") {
                    unknowns.push({ i, j });
                }
            }
        }
        
        if (unknowns.length === 0) {
            // Check if current state is valid
            for (let i = 0; i < this.n; i++) {
                for (let j = 0; j < this.n; j++) {
                    const tile = workPuz[i][j];
                    if (tile.type !== "wall" && tile.value !== -1) {
                        const sees = this.tileSees(i, j, workPuz);
                        if (sees !== tile.value) return 0;
                    }
                }
            }
            return 1;
        }
        
        // For larger puzzles, don't check exhaustively (too slow)
        if (unknowns.length > 20) return 1;
        
        let solutionsFound = 0;
        
        const isConsistent = () => {
            for (let i = 0; i < this.n; i++) {
                for (let j = 0; j < this.n; j++) {
                    const tile = workPuz[i][j];
                    if (tile.type === "wall") continue;
                    
                    // Skip unknowns
                    if (tile.value === -1) continue;
                    
                    // For clues, check if they can still be satisfied
                    const currentSees = this.tileSees(i, j, workPuz);
                    
                    // Can't see more than the clue says
                    if (currentSees > tile.value) return false;
                }
            }
            return true;
        };
        
        const isSolution = () => {
            for (let i = 0; i < this.n; i++) {
                for (let j = 0; j < this.n; j++) {
                    const tile = workPuz[i][j];
                    
                    // All tiles must be determined
                    if (tile.value === -1 && tile.type === "empty") return false;
                    
                    // Check all clue tiles
                    if (tile.type !== "wall" && tile.value !== -1) {
                        const currentSees = this.tileSees(i, j, workPuz);
                        if (currentSees !== tile.value) return false;
                    }
                    
                    // Check no tile sees 0
                    if (tile.type !== "wall") {
                        const sees = this.tileSees(i, j, workPuz);
                        if (sees === 0) return false;
                    }
                }
            }
            return true;
        };
        
        const solve = (idx) => {
            if (solutionsFound >= maxSolutions) return;
            
            if (idx >= unknowns.length) {
                if (isSolution()) {
                    solutionsFound++;
                }
                return;
            }
            
            const { i, j } = unknowns[idx];
            
            // Try making it a wall
            workPuz[i][j].setType("wall");
            workPuz[i][j].setValue(0);
            
            if (isConsistent()) {
                solve(idx + 1);
            }
            
            if (solutionsFound >= maxSolutions) {
                workPuz[i][j].setType("empty");
                workPuz[i][j].setValue(-1);
                return;
            }
            
            // Try making it a numbered tile
            workPuz[i][j].setType("empty");
            const seesValue = this.tileSees(i, j, workPuz);
            workPuz[i][j].setValue(seesValue);
            
            if (isConsistent()) {
                solve(idx + 1);
            }
            
            // Backtrack
            workPuz[i][j].setType("empty");
            workPuz[i][j].setValue(-1);
        };
        
        solve(0);
        return solutionsFound;
    }

    hasUniqueSolution(puz) {
        return this.countSolutions(puz, 2) === 1;
    }

    puzzleStrip(puz, targetClueRatio = 0.35, targetWallRatio = 0.30) {
        console.log("Starting puzzle strip with uniqueness checking...");
        
        // Strip values
        const tilesWithValues = [];
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                if (puz[i][j].type !== "wall" && puz[i][j].value !== -1) {
                    const importance = this.getTileImportance(i, j, puz);
                    tilesWithValues.push({ importance, i, j });
                }
            }
        }
        
        tilesWithValues.sort((a, b) => a.importance - b.importance);
        const targetKeep = Math.max(Math.floor(tilesWithValues.length * targetClueRatio), 3);
        let removedValueCount = 0;
        let keptForUniqueness = 0;
        
        for (let item of tilesWithValues) {
            if (tilesWithValues.length - removedValueCount <= targetKeep) break;
            
            const originalValue = puz[item.i][item.j].value;
            puz[item.i][item.j].setValue(-1);
            
            const unique = this.hasUniqueSolution(puz);
            
            if (unique) {
                removedValueCount++;
            } else {
                puz[item.i][item.j].setValue(originalValue);
                keptForUniqueness++;
            }
        }
        
        console.log(`Values: Removed ${removedValueCount}, kept ${keptForUniqueness} for uniqueness`);
        
        // Strip walls
        const wallTiles = [];
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                if (puz[i][j].type === "wall") {
                    const importance = this.getTileImportance(i, j, puz);
                    wallTiles.push({ importance, i, j });
                }
            }
        }
        
        wallTiles.sort((a, b) => a.importance - b.importance);
        const targetKeepWalls = Math.max(Math.floor(wallTiles.length * targetWallRatio), 2);
        let removedWallCount = 0;
        let keptWallsForUniqueness = 0;
        
        for (let item of wallTiles) {
            if (wallTiles.length - removedWallCount <= targetKeepWalls) break;
            
            const originalType = puz[item.i][item.j].type;
            puz[item.i][item.j].setType("empty");
            puz[item.i][item.j].setValue(-1);
            
            const unique = this.hasUniqueSolution(puz);
            
            if (unique) {
                removedWallCount++;
            } else {
                puz[item.i][item.j].setType(originalType);
                puz[item.i][item.j].setValue(0);
                keptWallsForUniqueness++;
            }
        }
        
        console.log(`Walls: Removed ${removedWallCount}, kept ${keptWallsForUniqueness} for uniqueness`);
        
        // Final verification
        const finalCheck = this.countSolutions(puz, 2);
        console.log(`Final uniqueness check: ${finalCheck} solution(s)`);
    }

    generate() {
        const puzzle = this.generateBlank();
        this.populateReds(0.35, 0.2, puzzle);
        this.enforceMaxSees(puzzle);
        this.populateSees(puzzle);
        this.puzzleStrip(puzzle);
        
        return puzzle;
    }
}

// Export for browser use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PuzzleGenerator, Tile };
}
