const express = require('express');

const app = express();
const PORT = 3000;

// Fast endpoint
app.get('/fast', (req, res) => {
  res.json({
    message: 'Fast response',
  });
});

// Slow endpoint - 100ms delay
app.get('/slow', (req, res) => {
  setTimeout(() => {
    res.json({
      message: 'Slow response',
    });
  }, 100);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});