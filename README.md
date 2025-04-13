# TechIT - Music Library Application

A music library application built with Express.js and MongoDB, following the MVC (Model-View-Controller) architecture pattern.

## Features

- **Home Page**: Browse music by categories
- **Search**: Find music by title, description, or category
- **My Library**: View all your music in one place
- **Liked Songs**: Collection of songs you've liked
- **Settings**: Customize your experience

## Architecture

This application follows the Model-View-Controller (MVC) architecture:

### Models

Located in the `/models` directory:
- `Music.js` - Schema for music entries
- `Category.js` - Schema for music categories
- `Settings.js` - Schema for user preferences

### Views

Located in the `/views` directory:
- `/layouts` - Common layout templates
  - `main.ejs` - Main layout with navigation
- `/pages` - Page-specific templates
  - `home.ejs` - Home page with categories
  - `search.ejs` - Search page
  - `library.ejs` - Library page
  - `liked.ejs` - Liked songs page
  - `settings.ejs` - Settings page

### Controllers

Located in the `/controllers` directory:
- `homeController.js` - Handles home page rendering and category data
- `searchController.js` - Handles search functionality
- `libraryController.js` - Manages library page and data
- `likedController.js` - Controls liked songs functionality
- `settingsController.js` - Manages user settings

### Public Assets

Located in the `/public` directory:
- `/css` - Stylesheets
  - `styles.css` - Main stylesheet
- `/js` - JavaScript files
  - `common.js` - Common functions used across pages
  - `home.js` - Home page functionality
  - `search.js` - Search page functionality
  - `library.js` - Library page functionality
  - `liked.js` - Liked songs page functionality
  - `settings.js` - Settings page functionality

### Routes

Located in the `/routes` directory:
- `pageRoutes.js` - Routes for page rendering
- `musicRoutes.js` - API routes for music data

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. Run the application:
   ```
   npm run dev
   ```

## Dependencies

- Express.js - Web framework
- MongoDB/Mongoose - Database and ORM
- EJS - Templating engine
- Multer - File upload handling
- CORS - Cross-origin resource sharing

## License

This project is licensed under the MIT License. 
