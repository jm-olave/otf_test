const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 8080;

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
    console.log(character1Response);
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


