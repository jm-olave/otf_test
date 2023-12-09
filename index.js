const hubspot = require('@hubspot/api-client');
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 8080;
require('dotenv').config();
const { CLIENT_ID, BASE_URL, SCOPES, CLIENT_SECRET } = process.env;
const REDIRECT_URL = `${BASE_URL}/oauth/callback`;

/**
 *  code
 */
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
    // total characters according to the api doc
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

const getLocations = async () =>{
  try {
    const response = await axios.get('https://rickandmortyapi.com/api/location');
    const locations = response.data.results;
    return locations;
  } catch (error) {
    console.error('Error fetching data from Rick and Morty API:', error.message);
    throw error; // Rethrow the error to be caught by the calling function
  }
};
// endpoint logic 
app.get('/get-locations', async (req, res) => {
  try {
    const locations = await getLocations();
    res.json({ locations: locations });
  } catch (error) {
    console.error('Error fetching data from Rick and Morty API:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  app.get('/fetch-characters', async (req, res) => {
    try {
      const characters = await fetchPrimeCharacters();
      res.json({ characters: characters });
    } catch (error) {
      console.error('Error fetching data from Rick and Morty API:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
// migrations

const hubspotApiKey = CLIENT_ID;
const hubspotClient = new hubspot.Client({"accessToken":hubspotApiKey});

// function to migrate locations to hubspot
const migrateLocationAsCompaniesToHubspot = async(location) =>{
  const company = {
    inputs: [
      {properties : {
        name: location.name,
        location_type: location.type,
        dimension: location.dimension,
        creation_date: location.created
      }}
    ]
  };

  try {
    const apiResponse = await hubspotClient.crm.companies.batchApi.create(company);
    console.log(JSON.stringify(apiResponse, null, 2));
    return apiResponse;
  } catch (error) {
    console.error('Error migrating to HubSpot:', error.message);
    throw error;
  }
};
// Function to migrate character to HubSpot
const migrateToHubSpot = async (character) => {

  let namePartition = character.name.split(" ");
  let firstname = namePartition[0];
  let lastname = namePartition[1];
  console.log("names",firstname, lastname);
  try {
    // Implement HubSpot API requests here
    const hubspotResponse = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/contacts/batch/create',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hubspotApiKey}`,
        },
        data : {
          inputs: [
            // {properties : {
            //   name: location.name,
            //   type: location.type,
            //   dimension: location.dimension,
            //   created: location.created
            // }}
          ]
        }
      }
    );
    return hubspotResponse.data;
  } catch (error) {
    console.error('Error migrating to HubSpot:', error.message);
    throw error;
  }
};
// migrate locations as companies
app.post('/migrate-locations', async (req, res) => {
  try {
    const locations = await getLocations();
    for (const location of locations) {
      migrateLocationAsCompaniesToHubspot(location);
    }
  } catch (error) {
    console.error('Error migrating locations to HubSpot:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Route to migrate characters to HubSpot
app.post('/migrate-characters', async (req, res) => {
  try {
    const characters = await fetchPrimeCharacters();
    // Migrate each character to HubSpot
    for (const character of characters) {
      migrateToHubSpot(character);
    }
  } catch (error) {
    console.error('Error migrating characters to HubSpot:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


