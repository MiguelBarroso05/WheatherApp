require('dotenv').config();
const express = require('express');
const axios = require('axios');
const knex = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const mostSearchedCity = await knex('search_history').select('*');
        console.log(mostSearchedCity);
        res.status(200).send(mostSearchedCity);
    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
        res.status(500).send({ error: 'Erro ao buscar os dados.' });
    }
});


router.get('/insert', async (req, res) => {
    let { city } = req.query;  

    if (!city) {
        return res.status(400).send({ error: 'City não fornecida.' });
    }

    city = city.trim().toLowerCase().replace(/\s+/g, '_');

    try {
        // Verifica se a cidade já existe
        const existingCity = await knex('search_history').where({ city }).first();  // Modifica 'location' para 'city'

        if (existingCity) {
            // Incrementa o search_count em 1 se a cidade já existir
            await knex('search_history')
                .where({ city })
                .update({ search_count: knex.raw('search_count + 1') });
        } else {
            // Insere uma nova entrada se a cidade não existir
            await knex('search_history').insert({ city, search_count: 1 });
        }

        res.status(200).send({ success: 'Operação concluída com sucesso.' });
    } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        res.status(500).send({ error: 'Erro ao processar a requisição.' });
    }
});



module.exports = router;
