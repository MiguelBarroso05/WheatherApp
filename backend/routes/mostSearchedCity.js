require("dotenv").config();
const express = require("express");
const knex = require("../db");
const router = express.Router();


// Endpoint para adicionar ou atualizar uma cidade no histórico
router.get("/insert", async (req, res) => {
  let { city } = req.query;
  if (!city) {
    return res.status(400).send({ error: "City não fornecida." });
  }

  city = city.trim().toLowerCase().replace(/\s+/g, "_");

  try {
    // Verifica se a cidade já existe
    const existingCity = await knex("search_history").where({ city }).first();

    if (existingCity) {
      // Incrementa o search_count em 1 se a cidade já existir
      await knex("search_history")
        .where({ city })
        .increment("search_count", 1);
    } else {
      // Insere uma nova entrada se a cidade não existir
      await knex("search_history").insert({ city, search_count: 1 });
    }

    res.status(200).send({ success: "Operação concluída com sucesso." });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    res.status(500).send({ error: "Erro ao processar a requisição." });
  }
});

// ** Novo Endpoint para obter as cidades mais pesquisadas ** //
router.get("/top-cities", async (req, res) => {
  try {
    const topCities = await knex("search_history")
      .select("*")
      .orderBy("search_count", "desc")
      .limit(10); // Obtém as 5 cidades mais pesquisadas

    res.status(200).send(topCities);
  } catch (error) {
    console.error("Erro ao buscar as cidades mais pesquisadas:", error);
    res.status(500).send({ error: "Erro ao buscar as cidades mais pesquisadas." });
  }
});

module.exports = router;