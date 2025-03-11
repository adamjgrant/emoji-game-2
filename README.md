# Everything.io

A web-based game where math equations are made of emojis. Each round presents an equation with a missing part, and the player must choose the correct emoji from multiple options.

## How to Play

1. Each round shows an emoji equation with one part missing (shown as a question mark)
2. Choose the correct emoji from the 9 options provided
3. You have 2 tries per round
4. After completing all rounds, you'll see your results and can share them

## Features

- Daily puzzles
- Share results with friends
- Responsive design for mobile and desktop
- Educational rationales explaining each equation

## Deployment

1. Fork this repository
2. Enable GitHub Pages in your repository settings
3. Set the source to the main branch
4. Wait a few minutes for the site to deploy
5. Your game will be available at `https://[your-username].github.io/everything-io/`

## Data Structure

The game data is stored in JSON files in the `data/` directory. Each file is named by date (YYYY-MM-DD.json) and contains 5 rounds of emoji equations.

## Project Structure

- `index.html` - Main HTML file
- `styles.css` - CSS styles
- `app.js` - Game logic
- `data/` - Directory containing game data JSON files 