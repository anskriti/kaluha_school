const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8090');

async function run() {
  try {
    await pb.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');
    const list = await pb.collection('teacher_auth').getFullList();
    
    // Find the record for Manabendra Mondal
    const record = list.find(r => r.email === 'manabendra@gmail.com');
    if (record) {
      await pb.collection('teacher_auth').update(record.id, {
        username: 'manabendra1'
      });
      console.log("Successfully set username to 'manabendra1' for Manabendra Mondal in teacher_auth!");
    } else {
      console.log("Record for manabendra@gmail.com not found.");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
run();
