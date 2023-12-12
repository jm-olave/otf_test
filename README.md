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
```json
    {   "source_id":"101",
        "firstname": "Rick",
        "lastname": "Sanchez",
        "status_character": "Alive",
        "character_species": "Humanoid",
        "character_gender": "Male"

    }
```
 given the source_id the API will search for a proper match on contact id on source platform, in this case if it does not find a contact that matches the id it will create the contact with properties defined in the body of the petition. if it finds one it will update the contact with given values.
* POST /sync-companies:
Creates or updates to the mirror platform on Hubspot, a company with properties defined as the examples below:
```json
    {   "source_id": "183",
        "name": "Bepis 9",
        "type": "Planet",
        "dimension": "multiverse",
        "created": "2017-11-10T12:42:04.162Z"
    }
```
   given the source_id the API will search for a proper match on company id on source platform, in this case if it does not find a company that matches the id it will create the company with properties defined in the body of the petition. if it finds one it will update the company with given values.

## Usage
* Use the provided endpoints to fetch, migrate, and sync data, all described endpoints work as specified on the deployment server of the solution.
## Link to server
* the server was deployed using Render host services, the following is the url for accesing the defined endpoints.
[Link Text](https://otf-testapi.onrender.com)

## Check the solution using POSTMAN or oother software for testing, and managing APIs.
