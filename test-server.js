const express = require('express');
const app = express();
const PORT = 5051;

app.get('/api/health', (req, res) => {
  res.json({ message: 'Test server is running!' });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});