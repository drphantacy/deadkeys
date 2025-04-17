# DeadKeys Frontend Documentation

## Overview
**DeadKeys** is a real-time zombie typing game built with ReactJS for the frontend and a Linera smart contract written in Rust for the backend. The game allows players to test their typing skills while competing against others on a global leaderboard.

## Features
- Real-time gameplay with zombie characters.
- Player state management, including high scores and total games played.
- Global leaderboard displaying the top 10 players.
- Integration with Linera blockchain for secure player data management.

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd DeadKeys/frontend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

### Running the Application
To start the development server, run:
```
npm start
```
This will launch the application in your default web browser at `http://localhost:3000`.

### Building for Production
To create a production build, run:
```
npm run build
```
The build artifacts will be stored in the `build` directory.

## File Structure
- **public/index.html**: Main HTML entry point for the React application.
- **src/components/**: Contains React components for the game, leaderboard, and player state.
- **src/hooks/**: Custom hooks for managing player state.
- **src/utils/**: Utility functions for API calls to the backend.
- **src/App.tsx**: Main application component.
- **src/index.tsx**: Entry point for the React application.
- **src/styles/**: CSS styles for the application.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.