// 0h n0 Puzzle Generator in JavaScript
// Converts the Python implementation to JS

const readline = require('readline');

const debugLevel = 1;
let n = 0; // Global puzzle size

// ============================================================================
// TILE CLASS
// ============================================================================

class Tile {
    constructor(value, x, y, type = null) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.type = type;
    }

    displayInfo() {
        console.log(`This tile is located at (${this.x},${this.y}) and is a ${this.type} tile with a value of ${this.value})`);
    }

    setValue(z) {
        this.value = z;
    }

    setType(z) {
        this.type = z;
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function printLineBreak() {
    console.log("-------------------------------------------------");
}

function printPuzzle(puz) {
    for (let row of puz) {
        let line = "";
        for (let element of row) {
            // Replace wall tiles with a standout symbol
            if (element.type === "wall") {
                line += " ■ " + "  ";
            } else if (element.value === -1) {
                // Display unknown tiles with a dot
                line += " · " + "  ";
            } else {
                // Format each element to take up 3 characters for proper alignment
                line += String(element.value).padStart(3, ' ') + "  ";
            }
        }
        console.log(line);
    }
}

function howManyFilled(puz) {
    let filled = 0;
    for (let row of puz) {
        for (let element of row) {
            if (element.type === "wall") {
                filled++;
            }
        }
    }
    return filled;
}

function borderBools(x, y) {
    let top = false, left = false, bottom = false, right = false;
    
    if (x === 0) top = true;
    if (y === 0) left = true;
    if (x === n - 1) bottom = true;
    if (y === n - 1) right = true;
    
    return { top, left, bottom, right };
}

function checkCorner(a, b, c, d) {
    let cornerstatus = 0;
    if (a && b) cornerstatus = 1;
    if (a && d) cornerstatus = 2;
    if (b && c) cornerstatus = 3;
    if (c && d) cornerstatus = 4;
    return cornerstatus;
}

function borderStatus(x, y) {
    const { top, left, bottom, right } = borderBools(x, y);
    const cornval = checkCorner(top, left, bottom, right);
    
    if (cornval > 0) return cornval;
    if (cornval === 0 && top) return 5;
    if (cornval === 0 && left) return 6;
    if (cornval === 0 && bottom) return 7;
    if (cornval === 0 && right) return 8;
    return 0;
}

function freeSpace(x, y, puz) {
    const puzSize = puz.length;
    
    // Up space
    let up = 0;
    for (let i = 0; i < x; i++) {
        if (puz[x - i - 1][y].type === "wall" || puz[x - i - 1][y].value === -1) break;
        up++;
    }
    
    // Right space
    let right = 0;
    for (let i = 0; i < puzSize - y - 1; i++) {
        if (puz[x][y + i + 1].type === "wall" || puz[x][y + i + 1].value === -1) break;
        right++;
    }
    
    // Down space
    let down = 0;
    for (let i = 0; i < puzSize - x - 1; i++) {
        if (puz[x + i + 1][y].type === "wall" || puz[x + i + 1][y].value === -1) break;
        down++;
    }
    
    // Left space
    let left = 0;
    for (let i = 0; i < y; i++) {
        if (puz[x][y - 1 - i].type === "wall" || puz[x][y - 1 - i].value === -1) break;
        left++;
    }
    
    return { up, right, down, left };
}

function tileSees(x, y, puz) {
    const { up, right, down, left } = freeSpace(x, y, puz);
    return up + down + left + right;
}

// ============================================================================
// PUZZLE GENERATION FUNCTIONS
// ============================================================================

function generateBlank(size) {
    n = size;
    console.log(`Generating a puzzle of size ${n} by ${n}`);
    
    // Create a 2D array and populate with tile objects
    const grid = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            row.push(new Tile(0, i, j, "empty"));
        }
        grid.push(row);
    }
    return grid;
}

function populateReds(top, bottom, puz) {
    const fillRedTopTh = top;
    const fillRedBottomTh = bottom;
    
    // Generate random red dots
    const redDotNum = Math.floor(Math.random() * ((n * n) * fillRedTopTh - (n * n) * fillRedBottomTh + 1)) + 
                      Math.round((n * n) * fillRedBottomTh);
    
    if (debugLevel > 3) console.log(`The goal red dot count is ${redDotNum}`);
    
    let currentRedCount = 0;
    while (currentRedCount < redDotNum) {
        const x = Math.floor(Math.random() * n);
        const y = Math.floor(Math.random() * n);
        const tileType = puz[x][y].type;
        
        if (tileType !== "wall") {
            puz[x][y].setType("wall");
            currentRedCount++;
        }
    }
    
    // Fill holes - any tile surrounded on all sides by walls
    const shapex = puz.length;
    const shapey = puz[0].length;
    for (let i = 0; i < shapex; i++) {
        for (let z = 0; z < shapey; z++) {
            const { up: a, right: b, down: c, left: d } = freeSpace(i, z, puz);
            if (a === 0 && b === 0 && c === 0 && d === 0) {
                puz[i][z].setType("wall");
            }
        }
    }
    
    if (debugLevel >= 1) {
        console.log(`There are ${howManyFilled(puz)} red dots in the puzzle.`);
    }
}

function fillHoles(puz) {
    const shapex = puz.length;
    const shapey = puz[0].length;
    let filledHoles = 0;
    
    for (let i = 0; i < shapex; i++) {
        for (let j = 0; j < shapey; j++) {
            if (puz[i][j].type !== "wall") {
                const { up, right, down, left } = freeSpace(i, j, puz);
                if (up === 0 && right === 0 && down === 0 && left === 0) {
                    puz[i][j].setType("wall");
                    filledHoles++;
                    if (debugLevel >= 2) {
                        console.log(`Filled hole at (${i},${j}) - was completely surrounded`);
                    }
                }
            }
        }
    }
    
    if (debugLevel >= 1 && filledHoles > 0) {
        console.log(`Filled ${filledHoles} holes to ensure minimum sees value of 1`);
    }
    
    return filledHoles;
}

function enforceMaxSees(puz) {
    const shapex = puz.length;
    const shapey = puz[0].length;
    const maxIterations = 1000;
    let iteration = 0;
    
    while (iteration < maxIterations) {
        let violationFound = false;
        
        for (let i = 0; i < shapex; i++) {
            for (let z = 0; z < shapey; z++) {
                if (puz[i][z].type !== "wall") {
                    const sees = tileSees(i, z, puz);
                    
                    if (sees > n) {
                        violationFound = true;
                        const { up, right, down, left } = freeSpace(i, z, puz);
                        
                        const directions = [
                            { name: 'up', count: up, wallX: up > 0 ? i - up : null, wallY: z },
                            { name: 'right', count: right, wallX: i, wallY: right > 0 ? z + right : null },
                            { name: 'down', count: down, wallX: down > 0 ? i + down : null, wallY: z },
                            { name: 'left', count: left, wallX: i, wallY: left > 0 ? z - left : null }
                        ];
                        
                        directions.sort((a, b) => b.count - a.count);
                        
                        for (let dir of directions) {
                            if (dir.count > 0 && dir.wallX !== null && dir.wallY !== null) {
                                if (dir.wallX >= 0 && dir.wallX < shapex && dir.wallY >= 0 && dir.wallY < shapey) {
                                    if (puz[dir.wallX][dir.wallY].type !== "wall") {
                                        puz[dir.wallX][dir.wallY].setType("wall");
                                        if (debugLevel >= 2) {
                                            console.log(`Added wall at (${dir.wallX},${dir.wallY}) to reduce sees count for tile at (${i},${z})`);
                                        }
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
    
    // Fill any holes created
    const holesF = fillHoles(puz);
    
    if (holesF > 0 && iteration < maxIterations - 1) {
        if (debugLevel >= 2) console.log("Rechecking after filling holes...");
    }
    
    if (iteration >= maxIterations) {
        console.log("Warning: Max iterations reached while enforcing sees constraint");
    }
    
    if (debugLevel >= 1) {
        console.log(`Constraint enforcement complete after ${iteration} iterations`);
    }
}

function verifyNoZeros(puz) {
    const shapex = puz.length;
    const shapey = puz[0].length;
    let foundZero = false;
    
    for (let i = 0; i < shapex; i++) {
        for (let j = 0; j < shapey; j++) {
            if (puz[i][j].type !== "wall") {
                const sees = tileSees(i, j, puz);
                if (sees === 0) {
                    if (debugLevel >= 1) {
                        console.log(`ERROR: Tile at (${i},${j}) sees 0 tiles!`);
                    }
                    foundZero = true;
                }
            }
        }
    }
    
    if (!foundZero && debugLevel >= 1) {
        console.log("Verification passed: All tiles see at least 1 tile");
    }
    
    return !foundZero;
}

function populateSees(puz) {
    const shapex = puz.length;
    const shapey = puz[0].length;
    
    for (let i = 0; i < shapex; i++) {
        for (let z = 0; z < shapey; z++) {
            if (puz[i][z].type !== "wall") {
                puz[i][z].setValue(tileSees(i, z, puz));
            }
        }
    }
}

// ============================================================================
// SOLVER AND UNIQUENESS CHECKING
// ============================================================================

function copyPuzzle(puz) {
    const shapex = puz.length;
    const shapey = puz[0].length;
    const newPuz = [];
    
    for (let i = 0; i < shapex; i++) {
        const row = [];
        for (let j = 0; j < shapey; j++) {
            const oldTile = puz[i][j];
            row.push(new Tile(oldTile.value, oldTile.x, oldTile.y, oldTile.type));
        }
        newPuz.push(row);
    }
    
    return newPuz;
}

function isPuzzleValid(puz) {
    const shapex = puz.length;
    const shapey = puz[0].length;
    
    for (let i = 0; i < shapex; i++) {
        for (let j = 0; j < shapey; j++) {
            const currentTile = puz[i][j];
            
            if (currentTile.type === "wall") continue;
            
            if (currentTile.value !== -1) {
                const currentSees = tileSees(i, j, puz);
                if (currentSees < currentTile.value) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

function countSolutions(puz, maxSolutions = 2) {
    const workPuz = copyPuzzle(puz);
    const shapex = workPuz.length;
    const shapey = workPuz[0].length;
    
    // Get all unknown tiles
    const unknowns = [];
    for (let i = 0; i < shapex; i++) {
        for (let j = 0; j < shapey; j++) {
            if (workPuz[i][j].value === -1) {
                unknowns.push({ i, j });
            }
        }
    }
    
    if (unknowns.length === 0) {
        return isPuzzleValid(workPuz) ? 1 : 0;
    }
    
    // Limit for very large puzzles
    if (unknowns.length > 25) {
        if (debugLevel >= 2) {
            console.log(`Warning: ${unknowns.length} unknowns - puzzle may be too complex for full solving`);
        }
        return 1;
    }
    
    let solutionsFound = 0;
    
    function isConsistent() {
        for (let i = 0; i < shapex; i++) {
            for (let j = 0; j < shapey; j++) {
                const tile = workPuz[i][j];
                
                if (tile.value === -1) continue;
                
                if (tile.type !== "wall") {
                    const currentSees = tileSees(i, j, workPuz);
                    if (currentSees > tile.value) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    function isSolution() {
        for (let i = 0; i < shapex; i++) {
            for (let j = 0; j < shapey; j++) {
                const tile = workPuz[i][j];
                
                if (tile.value === -1) return false;
                
                if (tile.type !== "wall") {
                    const currentSees = tileSees(i, j, workPuz);
                    if (currentSees !== tile.value) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    function solve(idx) {
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
        const seesValue = tileSees(i, j, workPuz);
        workPuz[i][j].setValue(seesValue);
        
        if (isConsistent()) {
            solve(idx + 1);
        }
        
        // Backtrack
        workPuz[i][j].setType("empty");
        workPuz[i][j].setValue(-1);
    }
    
    solve(0);
    return solutionsFound;
}

function hasUniqueSolution(puz) {
    const numSolutions = countSolutions(puz, 2);
    
    if (debugLevel >= 3) {
        if (numSolutions === 0) {
            console.log("    -> No solutions");
        } else if (numSolutions === 1) {
            console.log("    -> Unique solution ✓");
        } else {
            console.log(`    -> Multiple solutions (${numSolutions}+) ✗`);
        }
    }
    
    return numSolutions === 1;
}

// ============================================================================
// PUZZLE STRIPPING
// ============================================================================

function getTileImportance(i, j, puz) {
    const shapex = puz.length;
    const shapey = puz[0].length;
    let importance = 0;
    
    const { up, right, down, left } = freeSpace(i, j, puz);
    const totalVisibility = up + right + down + left;
    
    if (totalVisibility <= 2) {
        importance += 3;
    } else if (totalVisibility <= 4) {
        importance += 2;
    } else {
        importance += 1;
    }
    
    // Check if near edges
    if (i === 0 || i === shapex - 1 || j === 0 || j === shapey - 1) {
        importance += 2;
    }
    
    // Check if adjacent to walls
    let adjacentWalls = 0;
    if (i > 0 && puz[i - 1][j].type === "wall") adjacentWalls++;
    if (i < shapex - 1 && puz[i + 1][j].type === "wall") adjacentWalls++;
    if (j > 0 && puz[i][j - 1].type === "wall") adjacentWalls++;
    if (j < shapey - 1 && puz[i][j + 1].type === "wall") adjacentWalls++;
    
    importance += adjacentWalls;
    
    return importance;
}

function puzzleStrip(puz, targetClueRatio = 0.30, targetWallRatio = 0.25) {
    if (debugLevel >= 1) {
        console.log("Starting puzzle strip process with uniqueness verification...");
    }
    
    const shapex = puz.length;
    const shapey = puz[0].length;
    
    // === PART 1: Strip sees values ===
    const tilesWithValues = [];
    for (let i = 0; i < shapex; i++) {
        for (let j = 0; j < shapey; j++) {
            if (puz[i][j].type !== "wall" && puz[i][j].value !== -1) {
                const importance = getTileImportance(i, j, puz);
                tilesWithValues.push({ importance, i, j });
            }
        }
    }
    
    tilesWithValues.sort((a, b) => a.importance - b.importance);
    
    const totalTiles = tilesWithValues.length;
    const targetKeep = Math.max(Math.floor(totalTiles * targetClueRatio), 3);
    
    let removedValueCount = 0;
    let keptForUniqueness = 0;
    
    for (let item of tilesWithValues) {
        const currentKept = totalTiles - removedValueCount;
        if (currentKept <= targetKeep) {
            if (debugLevel >= 2) {
                console.log(`Reached target clue count (${targetKeep}), stopping value strip`);
            }
            break;
        }
        
        const originalValue = puz[item.i][item.j].value;
        puz[item.i][item.j].setValue(-1);
        
        if (debugLevel >= 3) {
            console.log(`Testing removal of value at (${item.i},${item.j})...`);
        }
        
        if (hasUniqueSolution(puz)) {
            removedValueCount++;
            if (debugLevel >= 2) {
                console.log(`  ✓ Removed value from tile at (${item.i},${item.j}) - still unique`);
            }
        } else {
            puz[item.i][item.j].setValue(originalValue);
            keptForUniqueness++;
            if (debugLevel >= 2) {
                console.log(`  ✗ Kept value at (${item.i},${item.j}) - required for unique solution`);
            }
        }
    }
    
    // === PART 2: Strip walls ===
    const wallTiles = [];
    for (let i = 0; i < shapex; i++) {
        for (let j = 0; j < shapey; j++) {
            if (puz[i][j].type === "wall") {
                const importance = getTileImportance(i, j, puz);
                wallTiles.push({ importance, i, j });
            }
        }
    }
    
    wallTiles.sort((a, b) => a.importance - b.importance);
    
    const totalWalls = wallTiles.length;
    const targetKeepWalls = Math.max(Math.floor(totalWalls * targetWallRatio), 2);
    
    let removedWallCount = 0;
    let keptWallsForUniqueness = 0;
    
    for (let item of wallTiles) {
        const currentKeptWalls = totalWalls - removedWallCount;
        if (currentKeptWalls <= targetKeepWalls) {
            if (debugLevel >= 2) {
                console.log(`Reached target wall count (${targetKeepWalls}), stopping wall strip`);
            }
            break;
        }
        
        const originalType = puz[item.i][item.j].type;
        puz[item.i][item.j].setType("empty");
        puz[item.i][item.j].setValue(-1);
        
        if (debugLevel >= 3) {
            console.log(`Testing removal of wall at (${item.i},${item.j})...`);
        }
        
        if (hasUniqueSolution(puz)) {
            removedWallCount++;
            if (debugLevel >= 2) {
                console.log(`  ✓ Removed wall at (${item.i},${item.j}) - still unique`);
            }
        } else {
            puz[item.i][item.j].setType(originalType);
            puz[item.i][item.j].setValue(0);
            keptWallsForUniqueness++;
            if (debugLevel >= 2) {
                console.log(`  ✗ Kept wall at (${item.i},${item.j}) - required for unique solution`);
            }
        }
    }
    
    if (debugLevel >= 1) {
        const keptValues = totalTiles - removedValueCount;
        const keptWalls = totalWalls - removedWallCount;
        console.log("Strip complete:");
        console.log(`  Values: Removed ${removedValueCount}, kept ${keptValues} (${(keptValues / totalTiles * 100).toFixed(1)}%)`);
        console.log(`    (Kept ${keptForUniqueness} specifically for uniqueness)`);
        console.log(`  Walls: Removed ${removedWallCount}, kept ${keptWalls} (${(keptWalls / totalWalls * 100).toFixed(1)}%)`);
        console.log(`    (Kept ${keptWallsForUniqueness} specifically for uniqueness)`);
    }
}

// ============================================================================
// MAIN PUZZLE GENERATOR
// ============================================================================

function puzzleGenerator(size) {
    const blankPuzzle = generateBlank(size);
    const puzzle = blankPuzzle;
    
    printLineBreak();
    console.log("Blank puzzle generated");
    printPuzzle(blankPuzzle);
    printLineBreak();
    
    console.log("Now populating with reds");
    populateReds(0.35, 0.2, puzzle);
    printPuzzle(puzzle);
    printLineBreak();
    
    console.log("Now enforcing constraint: no tile can see more than n tiles");
    enforceMaxSees(puzzle);
    printPuzzle(puzzle);
    printLineBreak();
    
    console.log("Now adding 'sees' values to grid");
    populateSees(puzzle);
    printPuzzle(puzzle);
    printLineBreak();
    
    console.log("Verifying no tiles see 0 (minimum is 1)");
    verifyNoZeros(puzzle);
    printLineBreak();
    
    console.log("Now stripping away most sees values");
    puzzleStrip(puzzle);
    printPuzzle(puzzle);
    printLineBreak();
    
    console.log("** FINAL PUZZLE FOR PLAYER **");
    console.log("(Tiles with -1 need to be solved by the player)");
    
    return puzzle;
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('n = ', (answer) => {
    const size = parseInt(answer);
    if (isNaN(size) || size < 3 || size > 12) {
        console.log("Please enter a valid puzzle size (3-12)");
        rl.close();
        return;
    }
    
    puzzleGenerator(size);
    rl.close();
});
