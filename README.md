# Rick and Morty API to HubSpot Integration

This repository contains a Node.js application for migrating data from the Rick and Morty API to HubSpot. The integration includes migrating locations as companies and characters as contacts.

## Prerequisites

- Node.js installed
- HubSpot API key (set as CLIENT_ID_SOURCE in .env file)
- Rick and Morty API access

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repo.git

2. Install dependencies:
- run command:
    npm install

3. Set up environment variables:
- Create a .env file in the root directory and add the following:
CLIENT_ID_SOURCE=your_hubspot_api_key
BASE_URL=https://api.hubapi.com
SCOPES=your_scopes( if any)
CLIENT_SECRET=your_client_secret (if any)

4. Run the application:
- npm start

## Endpoints
* GET /get-locations:
Fetches locations from the Rick and Morty API.
* GET /fetch-characters:
Fetches characters with prime IDs from the Rick and Morty API.
* POST /migrate-locations:
Migrates locations as companies to HubSpot.
* POST /migrate-characters:
Migrates characters to HubSpot.
* POST /sync-characters:
Creates or updates to the mirror platform on Hubspot, a contact with properties defined as the examples below:
- create: 
    {
        "firstname": "prueba 101",
        "lastname": "prueba 1",
        "status_character": "prueba 1",
        "character_species": "prueba 1",
        "character_gender": "prueba 1",
        "associations": []

    }
  
* POST /sync-companies:
Synchronizes locations as companies to HubSpot.

## Usage
* Use the provided endpoints to fetch, migrate, and sync data.

* Check the console logs for migration progress.