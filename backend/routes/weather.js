require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Default route to fetch weather data
router.get('/', async (req, res) => {
    const { location, lat, lon } = req.query;
    let query;

    // Determine query type based on the request parameters
    if (lat && lon) {
        query = `${lat},${lon}`; // Searched by geolocation
    } 
    else if (location) {
        query = location; // Searched by city name
    } 
    else {
        // If no valid query parameters are provided, return a 400 Bad Request error
        return res.status(400).json({ error: 'Location or coordinates are required.' }); 
    }

    try {
        const apiKey = process.env.WEATHER_API_KEY;
        const currentWeather = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}`); // Fetch current weather data
        const forecast = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=4`); // Fetch forecast data for the next 4 days

        // Return the combined weather and forecast data
        res.status(200).json({
            currentWeather: currentWeather.data,
            forecast: forecast.data
        });
    } 
    catch (error) {
        console.error('Error fetching weather data:', error.message);

        // Handle different errors based on the API response or network issues
        if (error.response) {
            const { status, data } = error.response;

            // Handle specific HTTP status codes from the weather API
            switch (status) {
                case 400:
                    return res.status(400).json({ error: data.error.message || 'Bad Request.' });
                case 401:
                    return res.status(401).json({ error: 'Unauthorized. Check your API key.' });
                case 403:
                    return res.status(403).json({ error: 'Forbidden. Access is denied.' });
                case 404:
                    return res.status(404).json({ error: 'Not Found. Location does not exist.' });
                default:
                    return res.status(status).json({ error: data.error.message || 'An error occurred.' });
            }
        }

        // Handle other unexpected errors
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
    }
});

module.exports = router;