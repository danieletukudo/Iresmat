# Construction Materials Search Frontend

A modern, professional web interface for the Construction Materials Search System with dual functionality: AI-powered text search and Excel file processing.

## Features

### 🔍 Text Search
- **Semantic Search**: Use natural language descriptions to find matching construction materials
- **AI-Powered**: Leverages GPT-4o (OpenAI) for intelligent material matching with reasoning
- **Real-time Progress**: Watch the AI work with live progress updates
- **Adjustable Results**: Control the number of results (1-20) with an intuitive slider
- **Similarity Scoring**: See how well each material matches your search with percentage scores

### 📁 File Upload
- **Drag & Drop**: Intuitive file upload with drag-and-drop support
- **Multiple Output Formats**:
  - Standard: Materials with codes
  - Text Only: Just descriptions, no codes
  - Full Details: Complete information including prices
- **File Validation**: Automatic validation for file type and size
- **Real-time Preview**: See selected file details before processing

### 💎 User Experience
- **Modern Design**: Clean, professional interface following contemporary UX best practices
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Feedback**: Loading indicators and status alerts keep you informed
- **Keyboard Accessible**: Full keyboard navigation support
- **Downloadable Results**: Export results as text files with one click

## Getting Started

### 1. Start the API Server

```bash
python api.py
```

The server will start on `http://localhost:5001`

### 2. Open the Frontend

Open your browser and navigate to:

```
http://localhost:5001
```

The frontend will be served automatically by the Flask API.

## Usage Guide

### Text Search

1. Click the **"Text Search"** tab (default)
2. Enter a description of the construction material or work you're looking for
   - Example: "limpieza de alicatado cerámico"
   - Example: "demolición de aplacado pétreo"
3. Adjust the number of results using the slider (1-20)
4. Click **"Search Materials"**
5. View your results with similarity scores
6. Download results as a text file using the **"Download"** button

### File Upload

1. Click the **"Upload File"** tab
2. Upload your Excel file (.xlsx or .xls) by:
   - Clicking the upload area and selecting a file
   - Dragging and dropping a file onto the upload area
3. Select the output type:
   - **Standard**: Get materials with their codes
   - **Text Only**: Get just the descriptions
   - **Full Details**: Get complete details including prices
4. Click **"Process File"**
5. View all extracted materials
6. Download results using the **"Download"** button

## Design Philosophy

### Visual Design
- **No Rounded Corners**: Clean, sharp edges for a professional appearance
- **Consistent Spacing**: Systematic spacing system for visual harmony
- **Color Palette**: Blue primary colors with neutral grays for clarity
- **Typography**: System fonts for optimal readability and performance

### UX Principles
1. **Progressive Disclosure**: Show information when needed
2. **Immediate Feedback**: Loading states and success/error alerts
3. **Error Prevention**: File validation before upload
4. **Clear Affordances**: Buttons and interactive elements are obvious
5. **Efficient Workflow**: Minimal clicks to accomplish tasks

### Accessibility
- Semantic HTML for screen readers
- ARIA labels on icon buttons
- Keyboard navigation support
- High contrast ratios for text
- Focus indicators on interactive elements

## Technical Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No framework dependencies for optimal performance

### Key Features
- **Async/Await**: Modern JavaScript for API calls
- **FormData API**: For file uploads
- **CSS Variables**: For consistent theming
- **CSS Animations**: Smooth transitions and micro-interactions
- **Responsive Grid**: Mobile-first responsive design

## File Structure

```
RAG/
├── index.html              # Main HTML structure
├── static/
│   ├── styles.css         # All styles (separate file)
│   └── app.js             # All JavaScript functionality
└── api.py                 # Flask API backend
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Performance

- **First Paint**: < 1s
- **Interactive**: < 2s
- **No Framework Overhead**: Vanilla JS for optimal load times
- **CSS Grid Layout**: Hardware-accelerated rendering
- **Optimized Assets**: Minimal CSS and JS footprint

## Customization

### Changing Colors

Edit the CSS variables in `static/styles.css`:

```css
:root {
    --primary-600: #2563eb;  /* Primary color */
    --success: #10b981;       /* Success color */
    --error: #ef4444;         /* Error color */
    /* ... more variables ... */
}
```

### Adjusting Layout

The responsive breakpoints can be adjusted in the media queries at the bottom of `static/styles.css`.

## Troubleshooting

### Upload Not Working
- Ensure the file is .xlsx or .xls format
- Check file size is under 16MB
- Verify the API server is running

### Search Not Returning Results
- The RAG system needs to be initialized (happens on first search)
- Check that the database file exists at the configured path
- Verify ChromaDB is properly installed

### Styling Issues
- Clear browser cache
- Check browser console for CSS loading errors
- Ensure `static/styles.css` exists and is accessible

## Future Enhancements

Potential improvements for future versions:

- [ ] Dark mode toggle
- [ ] Advanced filters for search results
- [ ] Bulk file processing
- [ ] Export to multiple formats (CSV, JSON, Excel)
- [ ] Search history
- [ ] Favorites/bookmarks system
- [ ] Material comparison view
- [ ] Print-friendly result layouts

## Credits

Designed and developed with a focus on user experience, accessibility, and modern web standards.

---

For API documentation, visit `/api/docs` or see `API_README.md`

