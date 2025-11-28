const express = require('express'); // For CommonJS modules
const app = express();
const port = process.env.PORT || 5005; // Define a port for your server

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
