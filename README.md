# Feeling-AI

A web application designed to help users explore and understand their emotions through various AI-powered tools and features.

## Overview

Feeling-AI aims to provide a supportive and insightful platform for emotional well-being. It offers features such as:

* **AI-Powered Chat:** Engage in dynamic conversations with multiple specialized AI agents (e.g., Empathy Agent, Encouragement Agent, Probing Agent, Mood Booster Agent) orchestrated by a central "Brain Agent." The chat intelligently responds based on sentiment analysis of user input and conversation history. It also features message editing with AI response regeneration.
* **Journaling:** A personal space to record your thoughts and emotions over time.
* **Sentiment Analysis:** Utilizes `puter.ai` (or a similar service) to analyze the sentiment of user messages in the chat, influencing the AI's responses.
* **Chat History:** Allows users to save and revisit previous conversations.
* **Settings:** Customizable options for user preferences.
* **Support:** Resources and information for emotional support.
* **Article Creation & Sharing:** A feature for users to create and potentially share articles related to well-being and emotions.

This project is built using React for the frontend, leveraging a context-based authentication system for user management.

## Technologies Used

* **Frontend:**
    * React
    * React Router (for navigation)
    * Tailwind CSS (for styling)
    * React Icons (for icons)
* **Backend (Assumed):**
    * Node.js with Express (or similar) for API endpoints.
    * Database (e.g., MongoDB, PostgreSQL) for storing user data, articles, and chat history.
* **Authentication:**
    * JSON Web Tokens (JWT) for secure authentication.
    * Context API and `useReducer` or `useState` for managing authentication state.
* **AI Interaction:**
    * Integration with `puter.ai` (or similar AI service) for natural language processing and sentiment analysis.

## Setup and Installation

To run this project locally, you will need to have Node.js and npm (or yarn) installed on your machine.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/NanoGraf31415926535/Feeling-AI.git](https://github.com/NanoGraf31415926535/Feeling-AI.git)
    cd Feeling-AI
    ```

2.  **Install frontend dependencies:**
    ```bash
    cd feeling-ai-app
    npm install   # or yarn install
    ```

3.  **Install backend dependencies (if applicable):**
    ```bash
    cd backend
    npm install   # or yarn install
    ```

4.  **Set up environment variables:**
    * **Frontend:** Create a `.env.local` file in your frontend directory and configure any necessary environment variables (e.g., API endpoint, `puter.ai` API key if needed).
    * **Backend:** Create a `.env` file in your backend directory and configure environment variables such as database connection strings, JWT secret, `puter.ai` API key if needed, etc.

5.  **Run the development servers:**
    * **Frontend:**
        ```bash
        cd feeling-ai-app
        npm run dev   # or yarn dev
        ```
        This will usually start the React development server on `http://localhost:5173` (or a similar port).
    * **Backend:**
        ```bash
        cd backend
        node server.js
        ```
        This will start your backend server, likely on `http://localhost:5001` (or a different port).

## Authentication

The application uses a context-based authentication system.

* Upon successful login (via the `/signin` route), a JWT token is stored in `localStorage`.
* The `AuthContext` manages the authentication state (`isAuthenticated`, `user`, `token`, `loading`).
* The `RequireAuth` component is used to protect certain routes, ensuring that only authenticated users can access them.

## Key Components

* **`App.jsx`:** The main application component that sets up routing and the `AuthProvider`.
* **`contexts/AuthContext.jsx`:** Manages the authentication state and provides `signIn` and `signOut` functions.
* **`components/RequireAuth.jsx`:** A higher-order component that protects routes requiring authentication.
* **`components/MainMenu.jsx`:** The main navigation menu for authenticated users.
* **`components/SignIn.jsx`:** The login form.
* **`components/Register.jsx`:** The user registration form.
* **`components/ChatWindow.jsx`:** The core of the AI interaction. Features:
    * Manages conversation state and display.
    * Orchestrates multiple specialized AI agents (Empathy, Encouragement, Deep Dive, Mood Booster, Probing) via a "Brain Agent."
    * Performs sentiment analysis on user input using `puter.ai` (or similar).
    * Allows users to edit their messages, triggering regeneration of the AI response.
    * Provides a typing indicator during AI response generation.
    * Includes functionality to save and load chat history.
* **`components/Journal.jsx`:** The journaling feature.
* **`components/Settings.jsx`:** User settings.
* **`components/Support.jsx`:** Support resources.
* **`components/CreateArticle.jsx`:** Form for creating new articles.
* **`components/ArticleDetail.jsx`:** Displays the details of a specific article.
* **`components/Articles.jsx`:** Lists the latest articles.
* **`components/Disclaimer.jsx`:** Displays an important disclaimer to the user.
* **`components/ChatHeader.jsx`:** Contains controls for navigation, saving, and clearing the chat.
* **`components/ChatHistoryMenu.jsx`:** Displays and manages the user's saved chat history.
* **`components/MessageBubble.jsx`:** Renders individual messages in the chat, including user and AI messages, and edit controls for user messages.
* **`components/TypingIndicator.jsx`:** Visual animation to indicate when the AI is generating a response.
* **`components/ChatInput.jsx`:** The input field and send button for user messages.

## Contributing

Contributions to this project are welcome. Please fork the repository and submit a pull request with your changes.

## Contact

Artem Sakhniuk
