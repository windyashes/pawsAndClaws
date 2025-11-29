const express = require('express'); // For CommonJS modules
const app = express();
const port = process.env.PORT || 5005; // Define a port for your server

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for development (allows Vite dev server to connect)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes
const adminRouter = require('./Routes/admin.router');
app.use('/api/admin', adminRouter);

const listingsRouter = require('./Routes/listings.router');
app.use('/api/listings', listingsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
