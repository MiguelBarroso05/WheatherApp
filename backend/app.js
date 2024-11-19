const express = require('express');
const cors = require('cors');
const weatherRouter = require("./routes/weather.js");
const topSearchedCity = require("./routes/mostSearchedCity.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/weather', weatherRouter);
app.use('/api/mostSearchedCity', topSearchedCity);

// Inicializa o servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
