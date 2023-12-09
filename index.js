const hubspot = require('@hubspot/api-client');
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 8080;
const { CLIENT_ID, BASE_URL, SCOPES, CLIENT_SECRET } = process.env;
const REDIRECT_URL = `${BASE_URL}/oauth/callback`;

app.listen(
    PORT,
    () => console.log(`its alive uwu on ${PORT}`)
);

// fetch characters with id = primer number
const isPrime = (num) => {
    if (num <= 1) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;
  
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0) return false;
    }
  
    return true;
  };
  // Function to fetch characters with prime IDs
  const fetchPrimeCharacters = async () => {
    const primeCharacters = [];
    const maxCharacterId =826; 
    // agrega a rick
    const character1Response = await axios.get('https://rickandmortyapi.com/api/character/1');
    primeCharacters.push(character1Response.data);
    // todos los primos
    for (let i = 2; i <= maxCharacterId; i++) {
      if (isPrime(i)) {
        const response = await axios.get(`https://rickandmortyapi.com/api/character/${i}`);
        primeCharacters.push(response.data);
      }
    }
  
    return primeCharacters;
  };
  
  app.get('/fetch-characters', async (req, res) => {
    try {
      const characters = await fetchPrimeCharacters();
  
      res.json({ characters: characters });
    } catch (error) {
      console.error('Error fetching data from Rick and Morty API:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

const hubspotApiKey = CLIENT_ID;

// Function to migrate character to HubSpot
const migrateToHubSpot = async (character) => {
  try {
    // Implement HubSpot API requests here
    // Example: Create a contact using the HubSpot API
    const hubspotResponse = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      character,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hubspotApiKey}`,
        },
      }
    );

    return hubspotResponse.data;
  } catch (error) {
    console.error('Error migrating to HubSpot:', error.message);
    throw error;
  }
};

// Route to migrate characters to HubSpot
app.post('/migrate-characters', async (req, res) => {
  try {
    const characters = await fetchPrimeCharacters();

    // Migrate each character to HubSpot
    const migratedCharacters = [];
    for (const character of characters) {
      const migratedCharacter = await migrateToHubSpot(character);
      migratedCharacters.push(migratedCharacter);
    }

    res.json({ migratedCharacters: migratedCharacters });
  } catch (error) {
    console.error('Error migrating characters to HubSpot:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


