const express = require('express');
const axios = require('axios');
const knex = require('../db'); // Importando o knex
const router = express.Router();

router.get('/', async (req, res) => {
    const { location } = req.query;

    try {
        const apiKey = 'ff2c5b0af98847fc9e8203912241511'; // Substitua pela sua chave de API
        const response = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3`);

        // Salvar no histórico de buscas
        const [existingSearch] = await knex('search_history')
            .where('city', location)
            .select('*');

        if (existingSearch) {
            // Se a cidade já existe no histórico, incrementa a contagem
            await knex('search_history')
                .where('id', existingSearch.id)
                .update({ search_count: existingSearch.search_count + 1 });
        } else {
            // Se não existe, insere uma nova entrada
            await knex('search_history').insert({ city: location });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Erro ao buscar dados da API de previsão:', error);
        res.status(500).json({ error: 'Erro ao buscar previsão do tempo' });
    }
});

// Rota para buscar as cidades mais pesquisadas
router.get('/top-searches', async (req, res) => {
    try {
        const topSearches = await knex('search_history')
            .select('city')
            .count('city as count')
            .groupBy('city')
            .orderBy('count', 'desc')
            .limit(5);

        res.json(topSearches);
    } catch (error) {
        console.error('Erro ao buscar as cidades mais pesquisadas:', error);
        res.status(500).json({ error: 'Erro ao buscar as cidades mais pesquisadas.' });
    }
});

module.exports = router;
