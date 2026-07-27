const PocketBase = require('pocketbase').default;
const fs = require('fs');
const path = require('path');

const pb = new PocketBase('http://127.0.0.1:8090');

async function run() {
  try {
    console.log("Authenticating as superuser...");
    const authData = await pb.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');
    console.log("Authenticated successfully!");

    console.log("Reading pb_schema.json...");
    const schemaContent = fs.readFileSync(path.join(__dirname, 'pb_schema.json'), 'utf8');
    const collections = JSON.parse(schemaContent);

    console.log("Importing schema to PocketBase...");
    await pb.collections.import(collections, false);
    console.log("SCHEMA IMPORT SUCCESSFUL!");
  } catch (err) {
    console.error("IMPORT ERROR:", err.message);
    if (err.data) {
      console.error("ERROR DATA:", JSON.stringify(err.data));
    }
  }
}

run();
