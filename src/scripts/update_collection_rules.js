const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8090');

async function run() {
  try {
    console.log("Authenticating as superuser...");
    await pb.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');
    console.log("Authenticated!");

    // 1. Configure teacher_directory rules
    console.log("Configuring teacher_directory rules...");
    const dirColl = await pb.collections.getOne('teacher_directory');
    dirColl.listRule = "";
    dirColl.viewRule = "";
    dirColl.createRule = null;
    dirColl.updateRule = null; // Only admin can update teacher_directory directly
    dirColl.deleteRule = null; // Only admin can delete
    await pb.collections.update(dirColl.id, dirColl);
    console.log("Successfully updated teacher_directory rules!");

    // 2. Configure teacher_auth rules
    console.log("Configuring teacher_auth rules...");
    const authColl = await pb.collections.getOne('teacher_auth');
    authColl.listRule = "";
    authColl.viewRule = "";
    authColl.createRule = ""; // Allow anyone to register (create unverified accounts)
    authColl.updateRule = "@request.auth.id != '' && id = @request.auth.id"; // Only self update
    authColl.deleteRule = null; // Only admin can delete accounts
    await pb.collections.update(authColl.id, authColl);
    console.log("Successfully updated teacher_auth rules!");

  } catch (error) {
    console.error("Error updating rules:", error.message);
    if (error.data) {
      console.error("Error details:", JSON.stringify(error.data));
    }
  }
}

run();
