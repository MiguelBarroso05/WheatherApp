const express = require('express');
const cors = require('cors');
const weatherRouter = require("./routes/weather.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/weather', weatherRouter);

// Inicializa o servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
