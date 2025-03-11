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
        
        // Hide loading, show game container (but it will be empty)
        loadingElement.style.display = 'none';
        gameElement.style.display = 'block';
        
        // Display a message indicating data is loaded
        const messageElement = document.createElement('div');
        messageElement.textContent = 'JSON data loaded successfully. Check the console for details.';
        messageElement.style.padding = '20px';
        messageElement.style.textAlign = 'center';
        gameElement.appendChild(messageElement);
        
    } catch (error) {
        console.error('Error loading game data:', error);
        loadingElement.textContent = 'Error loading game data. Please try again later.';
    }
}

// Load game data when the page loads
document.addEventListener('DOMContentLoaded', loadGameData); 