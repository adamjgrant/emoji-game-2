// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// For testing purposes, we'll use our static file
const gameDate = '2025-03-10';

// Game state
let gameData = null;
let currentRound = 0;
let triesRemaining = 3;
let gameResults = [];

// DOM elements
const loadingElement = document.getElementById('loading');
const gameElement = document.getElementById('game');

// Load game data
async function loadGameData() {
    try {
        const response = await fetch(`data/${gameDate}.json`);
        if (!response.ok) {
            throw new Error('Failed to load game data');
        }
        
        gameData = await response.json();
        console.log('Game data loaded:', gameData);
        
        // Hide loading, show game container
        loadingElement.style.display = 'none';
        gameElement.style.display = 'block';
        
        // Start the game
        startGame();
        
    } catch (error) {
        console.error('Error loading game data:', error);
        loadingElement.textContent = 'Error loading game data. Please try again later.';
    }
}

// Start the game
function startGame() {
    // Reset game state
    currentRound = 0;
    gameResults = [];
    
    // Create game UI
    createGameUI();
    
    // Start first round
    startRound();
}

// Create the game UI
function createGameUI() {
    gameElement.innerHTML = `
        <div id="game-header">
            <div id="round-indicator">Round 1 of ${gameData.length}</div>
            <div id="tries-indicator">
                <span class="try active"></span>
                <span class="try active"></span>
                <span class="try active"></span>
            </div>
        </div>
        <div id="equation-container"></div>
        <div id="options-container"></div>
        <div id="feedback-container"></div>
        <div id="rationale-container"></div>
    `;
}

// Start a new round
function startRound() {
    if (currentRound >= gameData.length) {
        endGame();
        return;
    }
    
    // Reset tries for new round
    triesRemaining = 3;
    updateTriesIndicator();
    
    // Update round indicator
    document.getElementById('round-indicator').textContent = `Round ${currentRound + 1} of ${gameData.length}`;
    
    // Get current round data
    const roundData = gameData[currentRound];
    
    // Display equation
    displayEquation(roundData);
    
    // Display options
    displayOptions(roundData);
    
    // Clear feedback and rationale
    document.getElementById('feedback-container').innerHTML = '';
    document.getElementById('rationale-container').innerHTML = '';
}

// Display the equation with missing part
function displayEquation(roundData) {
    const equationContainer = document.getElementById('equation-container');
    equationContainer.innerHTML = '';
    
    roundData.equation.forEach((item, index) => {
        const element = document.createElement('div');
        element.classList.add('equation-item');
        
        if (index === roundData.missingIndex) {
            element.classList.add('missing-slot');
            element.textContent = '?';
        } else {
            element.textContent = item;
        }
        
        equationContainer.appendChild(element);
    });
}

// Display the options
function displayOptions(roundData) {
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    // Shuffle options
    const shuffledOptions = [...roundData.options].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        
        // Add click event
        optionElement.addEventListener('click', () => handleOptionClick(option, roundData));
        
        optionsContainer.appendChild(optionElement);
    });
}

// Handle option click
function handleOptionClick(selectedOption, roundData) {
    // If no tries left, ignore clicks
    if (triesRemaining <= 0) return;
    
    const correctOption = roundData.options[0];
    const isCorrect = selectedOption === correctOption;
    
    if (isCorrect) {
        // Show correct feedback
        showFeedback(true);
        
        // Record result
        gameResults.push({
            round: currentRound + 1,
            triesUsed: 3 - triesRemaining + 1,
            correct: true
        });
        
        // Show correct answer in equation
        updateEquationWithAnswer(roundData, correctOption);
        
        // Disable options
        disableOptions();
        
        // Move to next round after delay
        setTimeout(() => {
            currentRound++;
            startRound();
        }, 2000);
    } else {
        // Show incorrect feedback
        showFeedback(false);
        
        // Reduce tries
        triesRemaining--;
        updateTriesIndicator();
        
        // If no tries left
        if (triesRemaining <= 0) {
            // Record result
            gameResults.push({
                round: currentRound + 1,
                triesUsed: 3,
                correct: false
            });
            
            // Show correct answer in equation
            updateEquationWithAnswer(roundData, correctOption);
            
            // Show rationale
            showRationale(roundData);
            
            // Disable options
            disableOptions();
            
            // Move to next round after delay
            setTimeout(() => {
                currentRound++;
                startRound();
            }, 4000); // Longer delay to allow reading the rationale
        }
    }
}

// Update equation with correct answer
function updateEquationWithAnswer(roundData, correctOption) {
    const equationItems = document.querySelectorAll('.equation-item');
    const missingItem = equationItems[roundData.missingIndex];
    
    missingItem.textContent = correctOption;
    missingItem.classList.remove('missing-slot');
    missingItem.classList.add('revealed-answer');
}

// Disable options after answer is revealed
function disableOptions() {
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.style.pointerEvents = 'none';
        option.classList.add('disabled');
    });
}

// Show feedback
function showFeedback(isCorrect) {
    const feedbackContainer = document.getElementById('feedback-container');
    feedbackContainer.innerHTML = '';
    
    const feedbackElement = document.createElement('div');
    feedbackElement.classList.add('feedback');
    feedbackElement.classList.add(isCorrect ? 'correct' : 'incorrect');
    feedbackElement.textContent = isCorrect ? 'Correct! 🎉' : 'Try again!';
    
    feedbackContainer.appendChild(feedbackElement);
    
    // Clear feedback after delay if incorrect and tries remaining
    if (!isCorrect && triesRemaining > 0) {
        setTimeout(() => {
            feedbackContainer.innerHTML = '';
        }, 1000);
    }
}

// Show rationale
function showRationale(roundData) {
    const rationaleContainer = document.getElementById('rationale-container');
    rationaleContainer.innerHTML = '';
    
    const rationaleElement = document.createElement('div');
    rationaleElement.classList.add('rationale');
    rationaleElement.textContent = roundData.rationale;
    
    rationaleContainer.appendChild(rationaleElement);
}

// Update tries indicator
function updateTriesIndicator() {
    const triesIndicator = document.getElementById('tries-indicator');
    const tryElements = triesIndicator.querySelectorAll('.try');
    
    tryElements.forEach((element, index) => {
        if (index < triesRemaining) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    });
}

// End game and show results
function endGame() {
    const gameElement = document.getElementById('game');
    
    // Create results HTML
    let resultsHTML = `
        <div class="results-container">
            <h2>Game Complete!</h2>
            <div class="results-summary">
                <p>You got ${gameResults.filter(r => r.correct).length} out of ${gameData.length} correct!</p>
            </div>
            <div class="equations-review">
                <h3>All Equations:</h3>
                <div class="equations-list">
    `;
    
    // Add each equation
    gameData.forEach((round, index) => {
        resultsHTML += `
            <div class="equation-review ${gameResults[index].correct ? 'correct' : 'incorrect'}">
                <div class="equation-text">${round.equation.join(' ')}</div>
                <div class="result-indicator">${gameResults[index].correct ? '✓' : '✗'}</div>
            </div>
        `;
    });
    
    // Add share button
    resultsHTML += `
                </div>
            </div>
            <div class="share-container">
                <button id="share-button">Share Results</button>
                <div id="share-text" class="share-text"></div>
            </div>
            <button id="play-again-button">Play Again</button>
        </div>
    `;
    
    // Set results HTML with animation
    gameElement.innerHTML = '';
    const resultsElement = document.createElement('div');
    resultsElement.innerHTML = resultsHTML;
    resultsElement.classList.add('results-fade-in');
    gameElement.appendChild(resultsElement);
    
    // Add event listeners
    document.getElementById('share-button').addEventListener('click', shareResults);
    document.getElementById('play-again-button').addEventListener('click', startGame);
}

// Share results
function shareResults() {
    // Create share text (similar to Wordle)
    let shareText = `Emoji Math Game ${gameDate}\n`;
    
    // Add emoji representation of results
    gameResults.forEach(result => {
        if (result.correct) {
            // Green square for correct, with number of tries
            shareText += `🟩${result.triesUsed} `;
        } else {
            // Red square for incorrect
            shareText += '🟥 ';
        }
    });
    
    // Display share text
    const shareTextElement = document.getElementById('share-text');
    shareTextElement.textContent = shareText;
    shareTextElement.style.display = 'block';
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareText)
        .then(() => {
            alert('Results copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy results: ', err);
        });
}

// Load game data when the page loads
document.addEventListener('DOMContentLoaded', loadGameData); 