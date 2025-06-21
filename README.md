# Audio X - Music Library Management App

A modern, responsive web application for managing your music library with an intuitive interface inspired by popular music streaming platforms.

## 🎵 Features

### Core Functionality
- **Music Library Management**: Add, edit, delete, and organize your music collection
- **Category-based Organization**: 12 predefined categories (Work Out, Techno 90s, Quiet Hours, etc.)
- **Playlist Management**: Create and manage playlists with automatic song counting
- **Like System**: Mark favorite songs and view statistics
- **Advanced Search**: Filter by title, description, or category with real-time results
- **Sort & Filter**: Multiple sorting options and grouping by category

### User Experience
- **Modern UI**: Clean, dark-themed interface with light theme option
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Quick navigation with Ctrl+H (Home), Ctrl+K (Search), Ctrl+L (Library)
- **Real-time Updates**: Instant UI updates and toast notifications
- **Accessibility**: Focus states, screen reader support, and reduced motion options

### Technical Features
- **Modular Architecture**: Organized codebase with separate files for each screen
- **Local Storage**: Persistent data storage with demo data included
- **Theme System**: Dark/Light/System preference themes with custom accent colors
- **Settings Management**: Comprehensive settings with real-time application
- **Error Handling**: Robust validation and user-friendly error messages

## 🏗️ Project Structure

```
audio-x/
├── index.html                 # Main entry point
├── styles/                    # CSS Files
│   ├── main.css              # Global styles and variables
│   ├── components.css        # Reusable UI components
│   └── screens/              # Screen-specific styles
│       ├── home.css          # Home screen styles
│       ├── search.css        # Search screen styles
│       ├── library.css       # Library screen styles
│       ├── liked.css         # Liked songs screen styles
│       └── settings.css      # Settings screen styles
├── scripts/                   # JavaScript Files
│   ├── utils.js              # Utility functions
│   ├── main.js               # Main application logic
│   └── screens/              # Screen-specific functionality
│       ├── home.js           # Home screen manager
│       ├── search.js         # Search screen manager
│       ├── library.js        # Library screen manager
│       ├── liked.js          # Liked songs screen manager
│       └── settings.js       # Settings screen manager
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation
1. **Download or Clone**: Get the project files to your computer
2. **Open**: Simply open `index.html` in your web browser
3. **Start Using**: The app loads with demo data and is ready to use immediately

### Demo Data
The application comes pre-loaded with sample music data including:
- Energetic Workout Mix (Work Out category)
- Classic 90s Techno Vibes (Techno 90s category)
- Peaceful Evening Meditation (Quiet Hours category)
- Urban Hip Hop Collection (Rap category)
- Deep Focus Flow State (Deep Focus category)

## 🎮 Usage Guide

### Navigation
- **Home**: View recent music and browse categories
- **Search**: Find music by title, description, or category
- **My Library**: Access playlists and complete music collection
- **Liked Songs**: View favorite tracks with statistics
- **Settings**: Customize appearance and preferences

### Managing Music
1. **Add Music**: Click "Add Music" button and fill in the details
2. **Edit Music**: Click the edit icon on any music item
3. **Delete Music**: Click the trash icon (confirmation required)
4. **Like/Unlike**: Click the heart icon to add to favorites

### Playlists
- View all 12 playlists in the Library screen
- Click any playlist to filter music by category
- Song counts update automatically as you add/remove music

### Search & Filter
- Use the search bar to find specific music
- Filter results by All, Title, Description, or Category
- Results update in real-time as you type

### Settings
- **Appearance**: Choose Dark, Light, or System theme
- **Accent Color**: Customize the primary color
- **Library Options**: Toggle category grouping and display options
- **Playback**: Configure autoplay and audio quality
- **Account**: View storage usage and clear data

## 🛠️ Technical Details

### Architecture
The application uses a modular ES6 class-based architecture:

- **AudioXApp**: Main application coordinator
- **AudioXUtils**: Utility functions for data manipulation
- **Screen Classes**: Individual managers for each screen (HomeScreen, SearchScreen, etc.)

### Data Management
- **Local Storage**: All data persists between sessions
- **JSON Format**: Music library and settings stored as JSON
- **Validation**: Input validation with user-friendly error messages
- **Backup**: Demo data automatically restored if storage is corrupted

### Styling
- **CSS Custom Properties**: Consistent theming across components
- **Responsive Grid**: CSS Grid and Flexbox for layouts
- **Mobile-First**: Progressive enhancement for larger screens
- **Animations**: Smooth transitions and hover effects

### Browser Support
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 🎨 Customization

### Themes
- Modify CSS custom properties in `styles/main.css`
- Add new themes by extending the theme system
- Custom accent colors available in settings

### Categories
- Edit the categories list in `scripts/utils.js`
- Icons use Unicode emojis for broad compatibility
- Easy to add/remove categories as needed

### Styling
- Each screen has its own CSS file for easy customization
- Component styles are separated for reusability
- Responsive breakpoints defined in `main.css`

## 🔧 Development

### Adding New Features
1. **Screen Features**: Add functionality to respective screen classes
2. **Global Features**: Extend the main AudioXApp class
3. **Utilities**: Add helper functions to AudioXUtils
4. **Styling**: Create component styles in `components.css`

### File Organization
- Keep screen-specific code in their respective files
- Use utils.js for shared functionality
- Maintain the separation of concerns between files

### Best Practices
- Use ES6+ features for modern JavaScript
- Follow the existing naming conventions
- Add proper error handling for new features
- Test on multiple devices and browsers

## 📱 Mobile Experience

The application is fully optimized for mobile devices with:
- Touch-friendly interface elements
- Responsive navigation
- Optimized layouts for small screens
- Fast loading and smooth scrolling

## 🔒 Privacy & Security

- **No External Dependencies**: Runs entirely offline
- **Local Storage Only**: No data sent to external servers
- **XSS Prevention**: Input sanitization implemented
- **No Tracking**: Complete privacy for your music data

## 🤝 Contributing

This is a demonstration project, but contributions are welcome:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Future Enhancements

Potential features for future versions:
- Actual audio file playback
- Cloud synchronization
- Music metadata parsing
- Advanced playlist features
- Social sharing capabilities
- Export/import functionality

---

**Enjoy managing your music library with Audio X!** 🎵 