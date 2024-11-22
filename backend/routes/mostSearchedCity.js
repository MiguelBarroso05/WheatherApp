require("dotenv").config();
const express = require("express");
const knex = require("../db");
const router = express.Router();


// Route to add or update a city in the search history
router.get("/insert", async (req, res) => {
  let { city } = req.query;

  if (!city)
    return res.status(400).send({ error: "City is required." });  // 400 Bad Request

  city = city.trim().toLowerCase().replace(/\s+/g, "_");

  try {
    // Check if the city already exists in the database
    const existingCity = await knex("search_history").where({ city }).first();

    if (existingCity) {
      // Increment the search count if the city exists
      await knex("search_history")
        .where({ city })
        .increment("search_count", 1);
    } 
    else {
      // Insert a new record if the city does not exist
      await knex("search_history").insert({ city, search_count: 1 });
    }

    res.status(200).send({ success: "City successfully added/updated." }); // 200 OK
  } 
  catch (error) {
    // Return a 500 Internal Server Error for unexpected issues
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
});

// Route to retrieve the top 10 most searched cities
router.get("/top-cities", async (req, res) => {
  try {
    // Fetch the top 10 cities ordered by search count in descending order
    const topCities = await knex("search_history")
      .select("*")
      .orderBy("search_count", "desc")
      .limit(10);

    res.status(200).send(topCities);
  } 
  catch (error) {
    // Return a 500 Internal Server Error for unexpected issues
    res.status(500).json({ error: "An error occurred while fetching the most searched cities." });
  }
});

module.exports = router;