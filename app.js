// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date for display (e.g., "March 10, 2025")
function getFormattedDate() {
    const date = new Date(gameDate.replace(/-/g, '/'));
    return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
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
const dateSubtitleElement = document.getElementById('date-subtitle');

// Load game data
async function loadGameData() {
    try {
        // Display the date subtitle
        dateSubtitleElement.textContent = `The ${getFormattedDate()} Edition`;
        
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
            element.innerHTML = `<span class="question-mark">?</span>`;
        } else if (item.text) {
            // For operators like +, =
            element.textContent = item.text;
        } else {
            // For emoji items
            element.innerHTML = createEmojiHTML(item);
        }
        
        equationContainer.appendChild(element);
    });
}

// Create HTML for an emoji with coefficient, superscript, and caption
function createEmojiHTML(item) {
    let html = '';
    
    // Add coefficient if present
    if (item.coefficient) {
        html += `<span class="coefficient">${item.coefficient}</span>`;
    }
    
    // Add emoji
    html += `<span class="emoji">${item.emoji}</span>`;
    
    // Add superscript if present
    if (item.superscript) {
        html += `<span class="superscript">${item.superscript}</span>`;
    }
    
    // Add caption if present
    if (item.caption) {
        html += `<div class="caption">${item.caption}</div>`;
    }
    
    return html;
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
        
        // Create a simple object for the emoji
        const emojiObj = { emoji: option };
        
        // For the missing water with superscript in round 7
        if (option === "💧" && roundData.id === 7) {
            emojiObj.superscript = "2";
        }
        
        // For the brandy with caption in round 6
        if (option === "🥃" && roundData.id === 6) {
            emojiObj.caption = "BRANDY";
        }
        
        optionElement.innerHTML = createEmojiHTML(emojiObj);
        
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
        updateEquationWithAnswer(roundData, selectedOption);
        
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
    
    // Find the correct equation item from the data
    const correctItem = roundData.equation[roundData.missingIndex];
    
    // Create a copy of the correct item but with the emoji replaced
    const answerItem = { ...correctItem, emoji: correctOption };
    
    missingItem.innerHTML = createEmojiHTML(answerItem);
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
        let equationText = round.equation.map(item => {
            if (item.text) return item.text;
            
            let text = '';
            if (item.coefficient) text += item.coefficient;
            text += item.emoji;
            if (item.superscript) text += `<sup>${item.superscript}</sup>`;
            if (item.caption) text += `<small>(${item.caption})</small>`;
            
            return text;
        }).join(' ');
        
        resultsHTML += `
            <div class="equation-review ${gameResults[index].correct ? 'correct' : 'incorrect'}">
                <div class="equation-text">${equationText}</div>
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
    let shareText = `Emoji Game ${gameDate}\n`;
    
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
    
    // Add URL to the share text
    shareText += `\n\n${window.location.href}`;
    
    // Display share text in the UI
    const shareTextElement = document.getElementById('share-text');
    shareTextElement.textContent = shareText;
    shareTextElement.style.display = 'block';
    
    // Use Web Share API
    if (navigator.share) {
        navigator.share({
            title: 'Emoji Game Results',
            text: shareText,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
        // If Web Share API is not available, just show the share text
        console.log('Web Share API not supported');
    }
}

// Load game data when the page loads
document.addEventListener('DOMContentLoaded', loadGameData); 