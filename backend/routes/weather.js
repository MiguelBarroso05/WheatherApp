require('dotenv').config();
const express = require('express');
const axios = require('axios');
const knex = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    const { location, lat, lon } = req.query;

    let query;
    if (lat && lon) {
        query = `${lat},${lon}`; // Usa latitude e longitude
    } else if (location) {
        query = location; // Usa o nome da cidade se fornecido
    } else {
        return res.status(400).json({ error: 'Localização ou coordenadas são obrigatórias.' });
    }

    try {
        const apiKey = process.env.WEATHER_API_KEY;
        const currentWeather = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}`);
        const forecast = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=4`);

        res.json({
            currentWeather: currentWeather.data,
            forecast: forecast.data
        });
    } catch (error) {
        console.error('Erro ao buscar dados da API de previsão:', error);
        res.status(500).json({ error: 'Erro ao buscar previsão do tempo' });
    }
});
module.exports = router;
