const express = require('express'); // For CommonJS modules
  // OR
  // import express from 'express'; // For ES Modules (requires "type": "module" in package.json and .mjs extension)

  const app = express();
  const port = process.env.PORT || 3000; // Define a port for your server