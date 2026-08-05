const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8090');

async function run() {
  try {
    console.log("Authenticating as superuser...");
    await pb.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');
    console.log("Authenticated!");

    // 1. Get teacher_auth collection
    console.log("Fetching teacher_auth collection schema...");
    const coll = await pb.collections.getOne('teacher_auth');
    
    // 2. Add username field if not exists
    const hasUsername = coll.fields.some(f => f.name === 'username');
    if (!hasUsername) {
      console.log("Adding username field...");
      coll.fields.push({
        name: 'username',
        type: 'text',
        required: true,
        min: 3,
        max: 100,
        pattern: '^[a-zA-Z0-9_]+$'
      });
    } else {
      console.log("username field already exists in schema.");
    }
    
    // Add unique index constraint for username
    const usernameIndexStr = `CREATE UNIQUE INDEX \`idx_username_pbc_${coll.id.replace('pbc_', '')}\` ON \`${coll.name}\` (\`username\`)`;
    if (!coll.indexes.includes(usernameIndexStr)) {
      console.log("Adding username unique index constraint...");
      coll.indexes.push(usernameIndexStr);
    }

    // 3. Update passwordAuth configuration to include username
    console.log("Updating passwordAuth identityFields...");
    coll.passwordAuth = {
      enabled: true,
      identityFields: ['email', 'username']
    };
    
    // 4. Save collection
    await pb.collections.update(coll.id, coll);
    console.log("Successfully updated teacher_auth collection schema in DB!");
  } catch (error) {
    console.error("Error updating schema:", error.message);
    if (error.data) {
      console.error("Error details:", JSON.stringify(error.data));
    }
  }
}

run();
