const express = require('express');
const history = require('connect-history-api-fallback');
const path = require('path');

const app = express();

// API routes
app.use('/api', (req, res, next) => {
  // Handle API requests
  // You'll need to implement your API logic here
  next();
});

// Middleware to handle browser history routing
app.use(history());

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});