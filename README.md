# Emoji Math Game

A web-based game where math equations are made of emojis. Each round presents an equation with a missing part, and the player must choose the correct emoji from multiple options.

## How to Play

1. Each round shows an emoji equation with one part missing (shown as a question mark)
2. Choose the correct emoji from the 9 options provided
3. Get feedback on your answer and see your score at the end
4. Try to get all 5 rounds correct!

## Setup

### Local Development

Simply open the `index.html` file in your browser to play the game locally.

### Hosting on GitHub Pages

This project is designed to work as a static site and can be easily hosted on GitHub Pages:

1. Push this repository to GitHub
2. Go to repository settings
3. Navigate to "Pages" section
4. Select the main branch as the source
5. Your game will be available at `https://[your-username].github.io/emoji-game/`

## Game Data

The game data is stored in JSON files in the `data/` directory. Each file is named by date (YYYY-MM-DD.json) and contains 5 rounds of emoji equations.

## Project Structure

- `index.html` - Main HTML file
- `styles.css` - CSS styles
- `app.js` - Game logic
- `data/` - Directory containing game data JSON files 