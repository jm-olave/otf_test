/*
  Author: Joshua Olave
  Description: This API migrates Rick and Morty characters to HubSpot contacts.
*/

const hubspot = require("@hubspot/api-client");
const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());
const PORT = 8080;
require("dotenv").config();
const { CLIENT_ID_SOURCE, CLIENT_ID_MIRROR, BASE_URL, SCOPES, CLIENT_SECRET } =
  process.env;
const hubspotApiKey = CLIENT_ID_SOURCE;
const hubspotApiKeyMirror = CLIENT_ID_MIRROR;
const hubspotClient = new hubspot.Client({ accessToken: hubspotApiKey });
const hubspotClientMirror = new hubspot.Client({
  accessToken: hubspotApiKeyMirror,
});
app.listen(PORT, () => console.log(`its alive uwu on ${PORT}`));



/**
 *  code
 */


// fetch logic
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
  const maxCharacterId = 826;
  // agrega a rick
  const character1Response = await axios.get(
    "https://rickandmortyapi.com/api/character/1"
  );
  primeCharacters.push(character1Response.data);
  // todos los primos
  for (let i = 2; i <= maxCharacterId; i++) {
    if (isPrime(i)) {
      const response = await axios.get(
        `https://rickandmortyapi.com/api/character/${i}`
      );
      primeCharacters.push(response.data);
    }
  }

  return primeCharacters;
};
const getLocations = async () => {
  try {
    const response = await axios.get(
      "https://rickandmortyapi.com/api/location"
    );
    const locations = response.data.results;
    return locations;
  } catch (error) {
    console.error(
      "Error fetching data from Rick and Morty API:",
      error.message
    );
    throw error; // Rethrow the error to be caught by the calling function
  }
};



/**
 *  Part of the step 1 of the test
 *  Implementation of the migration to Hubspot Source PLatform
 */

let companiesMigrated = [];
// function to migrate locations to hubspot on source platform
const migrateLocationAsCompaniesToHubspot = async (location) => {
  const company = {
    inputs: [
      {
        properties: {
          name: location.name,
          location_type: location.type,
          dimension: location.dimension,
          creation_date: location.created,
        },
      },
    ],
  };
  try {
    const apiResponse = await hubspotClient.crm.companies.batchApi.create(
      company
    );
    console.log(apiResponse);
    const responseObj = apiResponse;
    const companyforMigration = responseObj.results.map((result) => [
      result.id,
      result.properties.name,
    ]);
    companiesMigrated.push(companyforMigration);
    // console.log(JSON.stringify(apiResponse, null, 2));
    return apiResponse;
  } catch (error) {
    console.error("Error migrating Company to HubSpot:", error.message);
    throw error;
  }
};

// function to migrate locations to hubspot on mirror platform

// Function to migrate character to HubSpot

const migrateCharactersToHubSpot = async (character) => {
  let namePartition = character.name.split(" ");
  let firstname = " ";
  let lastname = " ";
  if (namePartition.length < 3) {
    firstname = namePartition[0];
    lastname = namePartition[1];
  } else {
    firstname = character.name;
  }
  // association to location
  const matchingLocation = companiesMigrated.find(
    (tuple) => tuple[0] && tuple[0][1] === character.location?.name
  );
  const idToAssociate = matchingLocation ? matchingLocation[0][0] : null;

  let contact = {
    inputs: [
      {
        properties: {
          firstname: firstname,
          lastname: lastname,
          status_character: character.status,
          character_species: character.species,
          character_gender: character.gender,
        },
      },
    ],
  };

  if (idToAssociate !== null && idToAssociate !== undefined) {
    // Include association only if idToAssociate is valid
    contact.inputs[0].associations = [
      {
        to: {
          id: idToAssociate,
        },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 279,
          },
        ],
      },
    ];
    console.log("contact being migrated:", contact);
  }

  try {
    const apiResponse = await hubspotClient.crm.contacts.batchApi.create(
      contact
    );
    // console.log(JSON.stringify(apiResponse, null, 2));
    return apiResponse;
  } catch (error) {
    console.error("Error migrating Contact to HubSpot:", error.message);
    throw error;
  }
};
/***
 *  Step 2 Integration: implementation oof the integration proces on the mirror platform
 */
const integrateLocationToHubspotMirrorCreate = async (location) => {
  const company = {
    inputs: [
      {
        properties: {
          name: location.name,
          location_type: location.type,
          dimension: location.dimension,
          creation_date: location.created,
        },
      },
    ],
  };
  try {
    const apiResponse = await hubspotClientMirror.crm.companies.batchApi.create(
      company
    );
    console.log(apiResponse);
    const responseObj = apiResponse;
    const companyforMigration = responseObj.results.map((result) => [
      result.id,
      result.properties.name,
    ]);
    companiesMigrated.push(companyforMigration);
    // console.log(JSON.stringify(apiResponse, null, 2));
    return apiResponse;
  } catch (error) {
    console.error("Error migrating Company to HubSpot:", error.message);
    throw error;
  }
};
// update company
const integrateLocationToHubspotMirrorUpdate = async (location, id) => {
  console.log(location, id);
  const company = {
    inputs: [
      {
        id: id,
        properties: {
          ...(location.name && { name: location.name }),
          ...(location.type && { location_type: location.type }),
          ...(location.dimension && { dimension: location.dimension }),
          ...(location.created && { creation_date: location.created }),
        },
      },
    ],
  };
  try {
    const apiResponse = await hubspotClientMirror.crm.companies.batchApi.update(
      company
    );
    console.log(JSON.stringify(apiResponse, null, 2));
    console.log(company);
    // console.log(JSON.stringify(apiResponse, null, 2));
    return apiResponse;
  } catch (error) {
    console.error("Error migrating Company to HubSpot:", error.message);
    throw error;
  }
};
// integration character logic
const integrateCharactersToHubSpotMirrorCreate = async (character) => {
  const contact = {
    inputs: [
      {
        properties: {
          firstname: character.firstname,
          lastname: character.lastname,
          status_character: character.status,
          character_species: character.species,
          character_gender: character.gender,
        },
        ...(character.associations && { associations: character.associations }),
      },
    ],
  };
  try {
    const apiResponse = await hubspotClientMirror.crm.contacts.batchApi.create(
      contact
    );
    console.log(JSON.stringify(apiResponse, null, 2));
    return apiResponse;
  } catch (error) {
    console.error("Error migrating Contact to HubSpot:", error.message);
    throw error;
  }
};
const integrateCharactersToHubSpotMirrorUpdate = async (character, id) => {
  const contact = {
    inputs: [
      { id: id,
        properties: {
          firstname: character.firstname,
          lastname: character.lastname,
          status_character: character.status,
          character_species: character.species,
          character_gender: character.gender,
        },
        ...(character.associations && { associations: character.associations }),
      },
    ],
  };
  try {
    const apiResponse = await hubspotClientMirror.crm.contacts.batchApi.update(
      contact
    );
    // console.log(JSON.stringify(apiResponse, null, 2));
    return apiResponse;
  } catch (error) {
    console.error("Error migrating Contact to HubSpot:", error.message);
    throw error;
  }
};


/**
 *  Endpoint declaration and logic
 */

// endpoints
app.get("/get-locations", async (req, res) => {
  try {
    const locations = await getLocations();
    res.json({ locations: locations });
  } catch (error) {
    console.error(
      "Error fetching data from Rick and Morty API:",
      error.message
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/fetch-characters", async (req, res) => {
  try {
    const characters = await fetchPrimeCharacters();
    res.json({ characters: characters });
  } catch (error) {
    console.error(
      "Error fetching data from Rick and Morty API:",
      error.message
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// migrate locations as companies
app.post("/migrate-locations", async (req, res) => {
  try {
    const locations = await getLocations();
    for (const location of locations) {
      migrateLocationAsCompaniesToHubspot(location);
    }
    return res
      .status(200)
      .json({ message: "completed migration for characters" });
  } catch (error) {
    console.error("Error migrating locations to HubSpot:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Route to migrate characters to HubSpot
app.post("/migrate-characters", async (req, res) => {
  try {
    const characters = await fetchPrimeCharacters();
    // Migrate each character to HubSpot
    for (const character of characters) {
      migrateCharactersToHubSpot(character);
    }
    return res
      .status(200)
      .json({ message: "completed migration for characters" });
  } catch (error) {
    console.error("Error migrating characters to HubSpot:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/sync-locations", async (req, res) => {
  try {
    const location = {
      name: req.body.name,
      type: req.body.type,
      dimension: req.body.dimension,
      created: req.body.created,
    };
    if (!req.body.id) {
      integrateLocationToHubspotMirrorCreate(location);
    } else {
      console.log("pasa el if de actualizacion");
      integrateLocationToHubspotMirrorUpdate(location, req.body.id);
    }

    return res
      .status(200)
      .json({ message: "completed integratioon of locations" });
  } catch (error) {
    console.error("Error integrating too hubspot:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/sync-characters", async (req, res) => {
  try {
    const contact = {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          status_character: req.body.status,
          character_species: req.body.species,
          character_gender: req.body.gender,
          associations: req.body.associations,
    };
    if (!req.body.id) {
      integrateCharactersToHubSpotMirrorCreate(contact);
    } else {
      console.log("pasa el if de actualizacion");
      integrateCharactersToHubSpotMirrorUpdate(contact, req.body.id);
    }

    return res
      .status(200)
      .json({ message: "completed integratioon of locations" });
  } catch (error) {
    console.error("Error integrating too hubspot:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
