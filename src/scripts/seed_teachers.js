const PocketBase = require('pocketbase').default;

const pb = new PocketBase('http://127.0.0.1:8090');

const OFFICIAL_TEACHERS = [
  {
    employee_id: "EMP001",
    name: "MANABENDRA MONDAL",
    designation: "HEAD MASTER",
    qualification: "M.A., B.Ed.",
    subject_role: "School Administration & Leadership",
    is_active: true
  },
  {
    employee_id: "EMP002",
    name: "PRIYOJYOTI BHATTACHARYYA",
    designation: "ASSISTANT TEACHER",
    qualification: "M.A., B.Ed.",
    subject_role: "English",
    is_active: true
  },
  {
    employee_id: "EMP003",
    name: "SOMESHWAR MURMU",
    designation: "ASSISTANT TEACHER",
    qualification: "B.A. (Hons.), B.Ed.",
    subject_role: "History",
    is_active: true
  },
  {
    employee_id: "EMP004",
    name: "DEBDULAL BHATTACHARYYA",
    designation: "ASSISTANT TEACHER",
    qualification: "B.A., B.Ed.",
    subject_role: "Bengali",
    is_active: true
  },
  {
    employee_id: "EMP005",
    name: "SANDIP CHOUDHURY",
    designation: "ASSISTANT TEACHER",
    qualification: "M.Sc., B.Ed.",
    subject_role: "Life Science",
    is_active: true
  },
  {
    employee_id: "EMP006",
    name: "PARTHO PROTIM DAS",
    designation: "ASSISTANT TEACHER",
    qualification: "B.A. (Hons.), B.Ed.",
    subject_role: "Mathematics",
    is_active: true
  },
  {
    employee_id: "EMP007",
    name: "MD ARIF",
    designation: "ASSISTANT TEACHER",
    qualification: "B.A./M.A., B.Ed.",
    subject_role: "English",
    is_active: true
  },
  {
    employee_id: "EMP008",
    name: "TOTON LET",
    designation: "ASSISTANT TEACHER",
    qualification: "B.A., B.Ed.",
    subject_role: "Sanskrit",
    is_active: true
  },
  {
    employee_id: "EMP009",
    name: "NABA KUMAR SAHA",
    designation: "ASSISTANT TEACHER",
    qualification: "M.Sc., B.Ed.",
    subject_role: "Physical Science",
    is_active: true
  },
  {
    employee_id: "EMP010",
    name: "TARAK NATH MONDAL",
    designation: "ASSISTANT TEACHER",
    qualification: "B.A., P.P.Ed., B.Ed.",
    subject_role: "Physical Education",
    is_active: true
  },
  {
    employee_id: "EMP011",
    name: "GOPAL CHANDRA MANDAL",
    designation: "ASSISTANT TEACHER",
    qualification: "M.Sc., B.Ed.",
    subject_role: "Mathematics",
    is_active: true
  },
  {
    employee_id: "EMP012",
    name: "SRIKANTA MONDAL",
    designation: "Group D Staff",
    qualification: "Higher Secondary",
    subject_role: "General Support Staff",
    is_active: true
  },
  {
    employee_id: "EMP013",
    name: "ANAMIKA CHATTERJEE",
    designation: "PARA TEACHER",
    qualification: "B.A.",
    subject_role: "Bengali",
    is_active: true
  },
  {
    employee_id: "EMP014",
    name: "HASINA KHAUN",
    designation: "PARA TEACHER",
    qualification: "B.Sc., D.El.Ed.",
    subject_role: "Science",
    is_active: true
  },
  {
    employee_id: "EMP015",
    name: "HAIDER ALI",
    designation: "PARA TEACHER",
    qualification: "B.A., D.El.Ed.",
    subject_role: "Geography",
    is_active: true
  },
  {
    employee_id: "EMP016",
    name: "MD NISAR",
    designation: "COMPUTER TEACHER",
    qualification: "M.A. (Computer)",
    subject_role: "Computer Science",
    is_active: true
  }
];

async function run() {
  try {
    console.log("Authenticating as superuser...");
    await pb.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');
    console.log("Authenticated!");

    // 1. Create teacher_directory collection if it doesn't exist
    let teacherDirectoryId = "";
    try {
      const coll = await pb.collections.getOne('teacher_directory');
      console.log("teacher_directory collection already exists.");
      teacherDirectoryId = coll.id;
    } catch {
      console.log("Creating teacher_directory collection...");
      const coll = await pb.collections.create({
        name: 'teacher_directory',
        type: 'base',
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'designation', type: 'text', required: true },
          { name: 'subject_role', type: 'text', required: true },
          { name: 'qualification', type: 'text', required: true },
          { name: 'email', type: 'text', required: false },
          { name: 'employee_id', type: 'text', required: true },
          { 
            name: 'photo', 
            type: 'file', 
            required: false, 
            options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] } 
          },
          { name: 'is_active', type: 'bool', required: false }
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: ""
      });
      teacherDirectoryId = coll.id;
      console.log("Created teacher_directory!");
    }

    // 2. Create teacher_auth collection if it doesn't exist
    try {
      await pb.collections.getOne('teacher_auth');
      console.log("teacher_auth collection already exists.");
    } catch {
      console.log("Creating teacher_auth collection...");
      await pb.collections.create({
        name: 'teacher_auth',
        type: 'auth',
        schema: [
          {
            name: 'directory_record',
            type: 'relation',
            required: true,
            options: {
              collectionId: teacherDirectoryId,
              maxSelect: 1
            }
          },
          {
            name: 'approval_status',
            type: 'select',
            required: true,
            options: {
              maxSelect: 1,
              values: ["Pending", "Approved", "Rejected"]
            }
          },
          {
            name: 'profile_photo',
            type: 'file',
            required: false,
            options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] }
          },
          {
            name: 'phone',
            type: 'text',
            required: false
          }
        ],
        options: {
          allowEmailAuth: true,
          allowOAuth2Auth: false,
          allowUsernameAuth: true,
          requireEmail: true
        },
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: ""
      });
      console.log("Created teacher_auth!");
    }

    // 3. Seed teachers into teacher_directory
    console.log("Seeding teacher records...");
    for (const teacher of OFFICIAL_TEACHERS) {
      // Check if teacher already exists by employee_id or name
      try {
        await pb.collection('teacher_directory').getFirstListItem(`employee_id = "${teacher.employee_id}" || name = "${teacher.name}"`);
        console.log(`Teacher already exists: ${teacher.name}`);
      } catch {
        await pb.collection('teacher_directory').create(teacher);
        console.log(`Created teacher record for: ${teacher.name}`);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during setup & seeding:", error.message);
    if (error.data) {
      console.error("Error details:", JSON.stringify(error.data));
    }
  }
}

run();
