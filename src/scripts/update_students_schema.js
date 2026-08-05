const PocketBase = require('pocketbase').default;
const pb = new PocketBase('http://127.0.0.1:8090');

async function run() {
  try {
    console.log("Authenticating as superuser...");
    await pb.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');
    console.log("Authenticated!");

    // 1. Get students collection
    console.log("Fetching students collection schema...");
    const coll = await pb.collections.getOne('students');
    
    // 2. Add approval_status field if not exists
    const hasApproval = coll.fields.some(f => f.name === 'approval_status');
    if (!hasApproval) {
      console.log("Adding approval_status field to students collection...");
      coll.fields.push({
        name: 'approval_status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ["Pending", "Approved", "Rejected"]
      });
      
      // Update collection schema
      await pb.collections.update(coll.id, coll);
      console.log("Successfully updated students collection schema in DB!");
    } else {
      console.log("approval_status field already exists in students schema.");
    }

     // 3. Update all existing students to "Approved"
     console.log("Fetching all student records...");
     const students = await pb.collection('students').getFullList();
     console.log(`Found ${students.length} student records. Setting approval_status to 'Approved'...`);
     for (const student of students) {
       if (student.approval_status !== 'Approved') {
         await pb.collection('students').update(student.id, {
           approval_status: 'Approved',
           name: student.name || student.username || "Student"
         });
         console.log(`Approved student: ${student.username || student.email}`);
       }
     }
     console.log("All existing students approved successfully!");

  } catch (error) {
    console.error("Error updating students schema:", error.message);
    if (error.data) {
      console.error("Error details:", JSON.stringify(error.data));
    }
  }
}

run();
