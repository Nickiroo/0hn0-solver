// Game Logic for 0h n0 Web Interface

class Game {
    constructor() {
        this.currentPuzzle = null;
        this.userPuzzle = null;
        this.puzzleSize = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.generator = null;
        this.solver = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Main menu
        document.getElementById('play-btn').addEventListener('click', () => this.showScreen('size-selection'));
        document.getElementById('solve-btn').addEventListener('click', () => this.showScreen('solve-screen'));
        
        // Size selection
        document.querySelectorAll('.size-btn[data-size]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = parseInt(e.target.dataset.size);
                this.startGame(size);
            });
        });
        
        document.getElementById('custom-size-btn').addEventListener('click', () => {
            const size = parseInt(document.getElementById('custom-size-input').value);
            if (size >= 3 && size <= 12) {
                this.startGame(size);
            } else {
                alert('Please enter a size between 3 and 12');
            }
        });
        
        // Back buttons
        document.getElementById('back-to-menu').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('back-to-size').addEventListener('click', () => {
            this.stopTimer();
            this.showScreen('size-selection');
        });
        document.getElementById('back-from-solve').addEventListener('click', () => this.showScreen('main-menu'));
        
        // Game controls
        document.getElementById('check-btn').addEventListener('click', () => this.checkSolution());
        document.getElementById('new-puzzle-btn').addEventListener('click', () => this.startGame(this.puzzleSize));
        
        // Modal buttons
        document.getElementById('new-puzzle-modal').addEventListener('click', () => {
            this.hideModal('victory-modal');
            this.startGame(this.puzzleSize);
        });
        document.getElementById('back-menu-modal').addEventListener('click', () => {
            this.hideModal('victory-modal');
            this.showScreen('main-menu');
        });
        document.getElementById('close-error').addEventListener('click', () => {
            this.hideModal('error-modal');
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    showLoading() {
        document.getElementById('loading').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading').classList.remove('active');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    async startGame(size) {
        this.puzzleSize = size;
        this.showLoading();
        
        // Small delay to show loading animation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
            // Generate puzzle
            this.generator = new PuzzleGenerator(size, 0);
            this.currentPuzzle = this.generator.generate();
            
            // Copy puzzle for user interaction
            this.userPuzzle = this.copyPuzzleForUser();
            
            // Setup solver
            this.solver = new PuzzleSolver(this.currentPuzzle);
            
            // Display puzzle
            this.renderPuzzle();
            
            // Start timer
            this.startTimer();
            
            // Update UI
            document.getElementById('puzzle-size').textContent = `${size}×${size}`;
            
            this.hideLoading();
            this.showScreen('game-screen');
        } catch (error) {
            console.error('Error generating puzzle:', error);
            alert('Error generating puzzle. Please try again.');
            this.hideLoading();
        }
    }

    copyPuzzleForUser() {
        const copy = [];
        for (let i = 0; i < this.currentPuzzle.length; i++) {
            const row = [];
            for (let j = 0; j < this.currentPuzzle[i].length; j++) {
                const tile = this.currentPuzzle[i][j];
                row.push(new Tile(tile.value, tile.x, tile.y, tile.type));
            }
            copy.push(row);
        }
        return copy;
    }

    renderPuzzle() {
        const grid = document.getElementById('puzzle-grid');
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${this.puzzleSize}, 1fr)`;
        
        // Calculate cell size based on screen size
        const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5);
        const cellSize = Math.floor(maxSize / this.puzzleSize);
        
        for (let i = 0; i < this.puzzleSize; i++) {
            for (let j = 0; j < this.puzzleSize; j++) {
                const tile = this.userPuzzle[i][j];
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.fontSize = `${cellSize * 0.5}px`;
                
                // Set initial state
                if (tile.type === 'wall') {
                    cell.classList.add('wall', 'given');
                } else if (tile.value !== -1) {
                    cell.classList.add('blue', 'given');
                    // Show the number for given clues
                    cell.textContent = tile.value;
                }
                
                // Add click handler for interactive cells
                if (!cell.classList.contains('given')) {
                    cell.addEventListener('click', (e) => this.handleCellClick(e));
                }
                
                grid.appendChild(cell);
            }
        }
    }

    handleCellClick(event) {
        const cell = event.currentTarget;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const tile = this.userPuzzle[row][col];
        
        // Cycle through states: empty -> blue (no number shown) -> wall -> empty
        if (tile.type === 'empty' && tile.value === -1) {
            // Make it blue but don't show the number
            const sees = this.generator.tileSees(row, col, this.userPuzzle);
            tile.setValue(sees);
            tile.setType('empty');
            cell.classList.add('blue');
            // Don't set textContent - leave it empty
        } else if (tile.type === 'empty' && tile.value !== -1) {
            // Change to wall
            tile.setType('wall');
            tile.setValue(0);
            cell.classList.remove('blue');
            cell.classList.add('wall');
            cell.textContent = '';
        } else if (tile.type === 'wall') {
            // Change back to empty
            tile.setType('empty');
            tile.setValue(-1);
            cell.classList.remove('wall');
            cell.textContent = '';
        }
        
        // Auto-check solution after each move
        this.autoCheckSolution();
    }

    autoCheckSolution() {
        // Silently check if puzzle is complete
        let isComplete = true;
        for (let i = 0; i < this.puzzleSize; i++) {
            for (let j = 0; j < this.puzzleSize; j++) {
                const tile = this.userPuzzle[i][j];
                if (tile.value === -1 && tile.type !== 'wall') {
                    isComplete = false;
                    break;
                }
            }
            if (!isComplete) break;
        }
        
        // Only validate if complete
        if (!isComplete) {
            return;
        }
        
        // Validate the solution
        const result = this.solver.validateSolution(this.userPuzzle);
        
        if (result.valid) {
            this.stopTimer();
            this.showVictory();
        }
        // If there's an error, do nothing - timer keeps running
    }

    checkSolution() {
        // Manual check (from check button)
        // First check if puzzle is complete
        let isComplete = true;
        for (let i = 0; i < this.puzzleSize; i++) {
            for (let j = 0; j < this.puzzleSize; j++) {
                const tile = this.userPuzzle[i][j];
                if (tile.value === -1 && tile.type !== 'wall') {
                    isComplete = false;
                    break;
                }
            }
            if (!isComplete) break;
        }
        
        if (!isComplete) {
            this.showError('Puzzle is not complete yet!');
            return;
        }
        
        // Validate the solution
        const result = this.solver.validateSolution(this.userPuzzle);
        
        if (result.valid) {
            this.stopTimer();
            this.showVictory();
        } else {
            this.showError(result.error);
            
            // Highlight error cell if position is available
            if (result.position) {
                const cell = document.querySelector(
                    `.cell[data-row="${result.position.i}"][data-col="${result.position.j}"]`
                );
                if (cell) {
                    cell.classList.add('error');
                    setTimeout(() => cell.classList.remove('error'), 1000);
                }
            }
        }
    }

    showVictory() {
        const elapsedTime = this.getElapsedTime();
        document.getElementById('completion-time').textContent = `Time: ${elapsedTime}`;
        this.showModal('victory-modal');
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        this.showModal('error-modal');
    }

    startTimer() {
        this.startTime = Date.now();
        this.updateTimer();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        const elapsed = this.getElapsedTime();
        document.getElementById('timer').textContent = elapsed;
    }

    getElapsedTime() {
        if (!this.startTime) return '0:00';
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
