
class HanoiGame {
    constructor() {
        this.towers = [[], [], []];
        this.diskCount = 4;
        this.moves = 0;
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isDragging = false;
        this.draggedDisk = null;
        this.dragSourceTower = null;
        this.isAutoDemo = false;
        this.autoDemoInterval = null;
        this.isPaused = false;
        this.gameMode = 'play'; 
        
        this.screens = {};
        this.elements = {};
        
        this.initElements();
        this.bindEvents();
        this.showScreen('home');
    }
    
    initElements() {
        this.screens.home = document.getElementById('home-screen');
        this.screens.game = document.getElementById('game-screen');
        this.screens.pause = document.getElementById('pause-screen');
        this.screens.result = document.getElementById('result-screen');
        this.elements.diskCountInput = document.getElementById('disk-count');
        this.elements.playModeBtn = document.getElementById('play-mode-btn');
        this.elements.demoModeBtn = document.getElementById('demo-mode-btn');
        this.elements.startBtn = document.getElementById('start-btn');
        
        this.elements.gameArea = document.getElementById('game-area');
        this.elements.towerElements = [
            document.getElementById('tower-0'),
            document.getElementById('tower-1'),
            document.getElementById('tower-2')
        ];
        this.elements.diskContainers = [
            this.elements.towerElements[0].querySelector('.disks-container'),
            this.elements.towerElements[1].querySelector('.disks-container'),
            this.elements.towerElements[2].querySelector('.disks-container')
        ];
        this.elements.dropIndicator = document.getElementById('drop-indicator');
        this.elements.timerElement = document.getElementById('timer');
        this.elements.moveCountElement = document.getElementById('move-count');
        this.elements.backHomeBtn = document.getElementById('back-home-btn');
        this.elements.pauseBtn = document.getElementById('pause-btn');
        
        this.elements.resumeBtn = document.getElementById('resume-btn');
        this.elements.quitBtn = document.getElementById('quit-btn');
        
        this.elements.finalTimeElement = document.getElementById('final-time');
        this.elements.finalMovesElement = document.getElementById('final-moves');
        this.elements.finalDisksElement = document.getElementById('final-disks');
        this.elements.playAgainBtn = document.getElementById('play-again-btn');
        this.elements.homeBtn = document.getElementById('home-btn');
    }
    
    bindEvents() {
        this.elements.playModeBtn.addEventListener('click', () => this.selectMode('play'));
        this.elements.demoModeBtn.addEventListener('click', () => this.selectMode('demo'));
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        
        this.elements.backHomeBtn.addEventListener('click', () => this.backToHome());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseGame());
        
        this.elements.resumeBtn.addEventListener('click', () => this.resumeGame());
        this.elements.quitBtn.addEventListener('click', () => this.quitGame());
        
        this.elements.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.elements.homeBtn.addEventListener('click', () => this.backToHome());
        
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }
    
    selectMode(mode) {
        this.gameMode = mode;
        if (mode === 'play') {
            this.elements.playModeBtn.classList.add('selected');
            this.elements.demoModeBtn.classList.remove('selected');
        } else {
            this.elements.demoModeBtn.classList.add('selected');
            this.elements.playModeBtn.classList.remove('selected');
        }
    }
    
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
    }
    
    startGame() {
        this.resetGameState();
        this.diskCount = parseInt(this.elements.diskCountInput.value);
        if (this.diskCount < 3) this.diskCount = 3;
        if (this.diskCount > 8) this.diskCount = 8;
        this.elements.diskCountInput.value = this.diskCount;
        
        this.initializeTowers();
        this.showScreen('game');
        
        if (this.gameMode === 'demo') {
            this.startAutoDemo();
        } else {
            this.startTimer();
        }
    }
    
    resetGameState() {
        this.stopTimer();
        if (this.autoDemoInterval) {
            clearInterval(this.autoDemoInterval);
            this.autoDemoInterval = null;
        }
        
        this.towers = [[], [], []];
        this.moves = 0;
        this.elapsedTime = 0;
        this.isDragging = false;
        this.draggedDisk = null;
        this.dragSourceTower = null;
        this.isPaused = false;
        
        this.elements.diskContainers.forEach(container => container.innerHTML = '');
        this.updateDisplay();
        this.elements.dropIndicator.classList.add('hidden');
    }
    
    initializeTowers() {
        this.towers = [[], [], []];
        this.elements.diskContainers.forEach(container => container.innerHTML = '');
        
        for (let i = this.diskCount; i >= 1; i--) {
            this.towers[0].push(i);
            const disk = this.createDisk(i);
            this.elements.diskContainers[0].appendChild(disk);
        }
    }
    
    createDisk(size) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.dataset.size = size;
        
        const minWidth = 60;
        const maxWidth = 200;
        const width = minWidth + (maxWidth - minWidth) * (size / this.diskCount);
        disk.style.width = width + 'px';
        
        disk.addEventListener('mousedown', (e) => this.handleMouseDown(e, disk));
        
        return disk;
    }
    
    startTimer() {
        this.startTime = Date.now() - this.elapsedTime;
        this.updateDisplay();
        
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.updateTimerDisplay();
        }, 100);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimerDisplay() {
        const elapsed = Math.floor(this.elapsedTime / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        const milliseconds = Math.floor((this.elapsedTime % 1000) / 10).toString().padStart(2, '0');
        this.elements.timerElement.textContent = `时间：${minutes}:${seconds}.${milliseconds}`;
    }
    
    updateDisplay() {
        this.elements.moveCountElement.textContent = ` 移动: ${this.moves}`;
        this.updateTimerDisplay();
    }
    
    handleMouseDown(e, disk) {
        if (this.isAutoDemo || this.isPaused) return;
        
        e.preventDefault();
        this.isDragging = true;
        this.draggedDisk = disk;
        
        for (let i = 0; i < 3; i++) {
            if (this.towers[i].includes(parseInt(disk.dataset.size))) {
                this.dragSourceTower = i;
                break;
            }
        }
        
        const topDisk = this.towers[this.dragSourceTower][this.towers[this.dragSourceTower].length - 1];
        if (topDisk !== parseInt(disk.dataset.size)) {
            this.cancelDrag();
            return;
        }
        
        disk.classList.add('dragging');
        
        this.updateDropIndicator(e.clientX, e.clientY);
    }
    
    cancelDrag() {
        if (this.draggedDisk) {
            this.draggedDisk.classList.remove('dragging');
        }
        this.isDragging = false;
        this.draggedDisk = null;
        this.dragSourceTower = null;
        this.elements.dropIndicator.classList.add('hidden');
    }
    
    handleMouseMove(e) {
        if (!this.isDragging || !this.draggedDisk) return;
        
        this.updateDropIndicator(e.clientX, e.clientY);
    }
    
    updateDropIndicator(x, y) {
        this.elements.dropIndicator.classList.remove('hidden');
        this.elements.dropIndicator.style.left = x + 'px';
        this.elements.dropIndicator.style.top = y + 'px';
        
        let validDrop = false;
        for (let i = 0; i < 3; i++) {
            if (i === this.dragSourceTower) continue;
            
            const towerRect = this.elements.towerElements[i].getBoundingClientRect();
            if (x >= towerRect.left && x <= towerRect.right &&
                y >= towerRect.top && y <= towerRect.bottom) {
                
                const diskSize = parseInt(this.draggedDisk.dataset.size);
                const targetTower = this.towers[i];
                
                if (targetTower.length === 0 || diskSize < targetTower[targetTower.length - 1]) {
                    this.elements.dropIndicator.querySelector('.indicator-icon').className = 'indicator-icon valid';
                    validDrop = true;
                } else {
                    this.elements.dropIndicator.querySelector('.indicator-icon').className = 'indicator-icon invalid';
                }
                break;
            }
        }
        
        if (!validDrop) {
            this.elements.dropIndicator.querySelector('.indicator-icon').className = 'indicator-icon invalid';
        }
    }
    
    handleMouseUp(e) {
        if (!this.isDragging || !this.draggedDisk) return;
        
        this.draggedDisk.classList.remove('dragging');
        this.elements.dropIndicator.classList.add('hidden');
        
        for (let i = 0; i < 3; i++) {
            if (i === this.dragSourceTower) continue;
            
            const towerRect = this.elements.towerElements[i].getBoundingClientRect();
            if (e.clientX >= towerRect.left && e.clientX <= towerRect.right &&
                e.clientY >= towerRect.top && e.clientY <= towerRect.bottom) {
                
                this.moveDisk(this.dragSourceTower, i);
                break;
            }
        }
        
        this.cancelDrag();
    }
    
    moveDisk(fromTower, toTower) {
        const diskSize = this.towers[fromTower][this.towers[fromTower].length - 1];
        const targetTower = this.towers[toTower];
        
        if (targetTower.length > 0 && diskSize >= targetTower[targetTower.length - 1]) {
            return false;
        }
        
        this.towers[fromTower].pop();
        this.towers[toTower].push(diskSize);
        
        const diskElement = this.elements.diskContainers[fromTower].lastElementChild;
        
        requestAnimationFrame(() => {
            this.animateDiskMoveWithClone(diskElement, fromTower, toTower, () => {
                this.elements.diskContainers[fromTower].removeChild(diskElement);
                this.elements.diskContainers[toTower].appendChild(diskElement);
                
                this.moves++;
                this.updateDisplay();
                
                this.checkWin();
            });
        });
        
        return true;
    }
    
    animateDiskMoveWithClone(originalDisk, fromTower, toTower, callback) {
        const fromContainer = this.elements.diskContainers[fromTower];
        const toContainer = this.elements.diskContainers[toTower];
        
        const diskRect = originalDisk.getBoundingClientRect();
        const fromRect = fromContainer.getBoundingClientRect();
        const toRect = toContainer.getBoundingClientRect();
        
        const cloneDisk = originalDisk.cloneNode(true);
        cloneDisk.style.position = 'fixed';
        cloneDisk.style.left = diskRect.left + 'px';
        cloneDisk.style.top = diskRect.top + 'px';
        cloneDisk.style.width = diskRect.width + 'px';
        cloneDisk.style.margin = '0';
        cloneDisk.style.zIndex = '9999';
        cloneDisk.style.pointerEvents = 'none';
        cloneDisk.style.transition = 'none';
        
        originalDisk.style.opacity = '0';
        
        document.body.appendChild(cloneDisk);
        
        const deltaX = toRect.left - fromRect.left;
        const deltaY = toRect.top - fromRect.top;
        const liftHeight = diskRect.height * 2;
        
        cloneDisk.offsetHeight;
        
        cloneDisk.style.transition = 'transform 0.15s ease-out';
        cloneDisk.style.transform = `translate(0, -${liftHeight}px)`;
        
        setTimeout(() => {
            cloneDisk.style.transition = 'transform 0.2s ease-in-out';
            cloneDisk.style.transform = `translate(${deltaX}px, -${liftHeight}px)`;
            
            setTimeout(() => {
                cloneDisk.style.transition = 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
                cloneDisk.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                
                setTimeout(() => {
                    cloneDisk.remove();
                    originalDisk.style.opacity = '';
                    if (callback) callback();
                }, 150);
            }, 200);
        }, 150);
    }
    
    checkWin() {
        if (this.towers[2].length === this.diskCount) {
            this.stopTimer();
            if (this.autoDemoInterval) {
                clearInterval(this.autoDemoInterval);
                this.autoDemoInterval = null;
            }
            setTimeout(() => this.showResult(), 500);
        }
    }
    
    showResult() {
        const elapsed = Math.floor(this.elapsedTime / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        
        this.elements.finalTimeElement.textContent = `${minutes}:${seconds}`;
        this.elements.finalMovesElement.textContent = this.moves;
        this.elements.finalDisksElement.textContent = this.diskCount;
        
        this.showScreen('result');
        this.createConfetti();
    }
    
    createConfetti() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F7DC6F'];
        
        for (let i = 0; i < 150; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.top = '-15px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                
                document.body.appendChild(confetti);
                
                const duration = 2000 + Math.random() * 3000;
                const animation = confetti.animate([
                    { 
                        transform: 'translateY(0) rotate(0deg) scale(1)', 
                        opacity: 1 
                    },
                    { 
                        transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 1080}deg) scale(0.5)`, 
                        opacity: 0 
                    }
                ], {
                    duration: duration,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });
                
                animation.onfinish = () => confetti.remove();
            }, i * 20);
        }
    }
    
    pauseGame() {
        if (this.isAutoDemo) return;
        
        this.isPaused = true;
        this.stopTimer();
        this.showScreen('pause');
    }
    
    resumeGame() {
        this.isPaused = false;
        this.showScreen('game');
        this.startTimer();
    }
    
    quitGame() {
        this.isPaused = false;
        this.backToHome();
    }
    
    backToHome() {
        this.resetGameState();
        this.showScreen('home');
    }
    
    playAgain() {
        this.showScreen('game');
        this.startGame();
    }
    
    startAutoDemo() {
        this.isAutoDemo = true;
        this.elements.pauseBtn.disabled = true;
        this.startTimer();
        
        const moves = [];
        this.generateHanoiMoves(this.diskCount, 0, 2, 1, moves);
        
        let moveIndex = 0;
        this.autoDemoInterval = setInterval(() => {
            if (moveIndex >= moves.length) {
                clearInterval(this.autoDemoInterval);
                this.autoDemoInterval = null;
                this.checkWin();
                return;
            }
            
            const [from, to] = moves[moveIndex];
            this.moveDisk(from, to);
            moveIndex++;
        }, 600);
    }
    
    generateHanoiMoves(n, from, to, aux, moves) {
        if (n === 1) {
            moves.push([from, to]);
            return;
        }
        
        this.generateHanoiMoves(n - 1, from, aux, to, moves);
        moves.push([from, to]);
        this.generateHanoiMoves(n - 1, aux, to, from, moves);
    }
}

const game = new HanoiGame();