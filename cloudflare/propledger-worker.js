/**
 * PropLedger Enterprise - Cloudflare Worker & Edge Mail Routing
 * Host Subdomains:
 * - Public Main Portal: home.propledger.vishalbhutekar.me / propledger.vishalbhutekar.me
 * - Master Admin Console: admin.propledger.vishalbhutekar.me
 * - Inbound Support Desk: support@propledger.vishalbhutekar.me -> vishal.bhutekar1@gmail.com
 * Zone ID: 84d04451d623e1d6885d01c55a89ce3a
 */

const RESEND_API_KEY = typeof globalThis.RESEND_API_KEY !== 'undefined' ? globalThis.RESEND_API_KEY : '';
const FROM_EMAIL = "PropLedger <notifications@vishalbhutekar.me>";
const FALLBACK_FROM_EMAIL = "PropLedger <onboarding@resend.dev>";
const FORWARD_DESTINATION = "vishal.bhutekar1@gmail.com";


const PAYMENT_SUCCESS_LOTTIE = {"v":"5.7.4","fr":60,"ip":0,"op":60,"w":120,"h":120,"nm":"Payment Success","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"Checkmark","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[60,60,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":15,"s":[70,70,100],"h":0},{"t":35,"s":[110,110,100],"h":0},{"t":45,"s":[100,100,100],"h":0}]}},"ao":0,"shapes":[{"ty":"gr","nm":"CheckGroup","it":[{"ty":"sh","nm":"Path","ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[-18,1],[-5,14],[18,-9]],"c":false}}},{"ty":"st","nm":"Stroke","c":{"a":0,"k":[0.06,0.65,0.58,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":6.5},"lc":2,"lj":2},{"ty":"tm","nm":"Trim","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":15,"s":[0],"h":0},{"t":38,"s":[100],"h":0}]},"o":{"a":0,"k":0},"m":1},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":60,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"Circle","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[60,60,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":0,"s":[75,75,100],"h":0},{"t":25,"s":[106,106,100],"h":0},{"t":35,"s":[100,100,100],"h":0}]}},"ao":0,"shapes":[{"ty":"gr","nm":"CircleGroup","it":[{"ty":"el","nm":"Ellipse","p":{"a":0,"k":[0,0]},"s":{"a":0,"k":[88,88]}},{"ty":"st","nm":"Stroke","c":{"a":0,"k":[0.06,0.65,0.58,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":5.5},"lc":2,"lj":2},{"ty":"tm","nm":"Trim","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":0,"s":[0],"h":0},{"t":26,"s":[100],"h":0}]},"o":{"a":0,"k":-90},"m":1},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":60,"st":0,"bm":0}]};
const TOUR_SUCCESS_LOTTIE = {"v":"5.7.4","fr":60,"ip":0,"op":60,"w":120,"h":120,"nm":"Tour Success","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"Checkmark","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[60,65,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":20,"s":[60,60,100],"h":0},{"t":38,"s":[110,110,100],"h":0},{"t":48,"s":[100,100,100],"h":0}]}},"ao":0,"shapes":[{"ty":"gr","nm":"CheckGroup","it":[{"ty":"sh","nm":"Path","ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0]],"v":[[-14,0],[-4,10],[14,-8]],"c":false}}},{"ty":"st","nm":"Stroke","c":{"a":0,"k":[0.14,0.39,0.92,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":5.5},"lc":2,"lj":2},{"ty":"tm","nm":"Trim","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":20,"s":[0],"h":0},{"t":42,"s":[100],"h":0}]},"o":{"a":0,"k":0},"m":1},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":60,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"Calendar","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[60,60,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":0,"s":[80,80,100],"h":0},{"t":20,"s":[104,104,100],"h":0},{"t":30,"s":[100,100,100],"h":0}]}},"ao":0,"shapes":[{"ty":"gr","nm":"CalGroup","it":[{"ty":"rc","nm":"CalRect","p":{"a":0,"k":[0,5]},"s":{"a":0,"k":[64,56]},"r":{"a":0,"k":8}},{"ty":"st","nm":"Stroke","c":{"a":0,"k":[0.14,0.39,0.92,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":4.5},"lc":2,"lj":2},{"ty":"tm","nm":"Trim","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":0,"s":[0],"h":0},{"t":24,"s":[100],"h":0}]},"o":{"a":0,"k":0},"m":1},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":60,"st":0,"bm":0}]};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// ─────────────────────────────────────────────────────────────────────────────
// PROPIDGER EXECUTIVE ADMIN IN-MEMORY & EDGE DATA STORE
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_ADMIN_STORE = {
  properties: [
    {
      id: "PROP-001",
      name: "Oberoi Sky City Residences",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      address: "Western Express Highway, Borivali East",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400066",
      type: "Luxury Residential",
      unitsCount: 24,
      occupiedCount: 23,
      grossRent: 1450000,
      amenities: ["Swimming Pool", "EV Fast Charging", "24/7 Security", "Clubhouse & Gym"],
      status: "Operational"
    },
    {
      id: "PROP-002",
      name: "Prestige Tech Vista Suites",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      address: "Outer Ring Road, Kadubeesanahalli",
      city: "Bengaluru",
      state: "Karnataka",
      zip: "560103",
      type: "Premium Residential",
      unitsCount: 16,
      occupiedCount: 15,
      grossRent: 980000,
      amenities: ["High-Speed Fiber", "100% Power Backup", "Covered Car Parking", "Children Play Area"],
      status: "Operational"
    },
    {
      id: "PROP-003",
      name: "Panchshil Towers",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      address: "Kharadi Riverside Boulevard",
      city: "Pune",
      state: "Maharashtra",
      zip: "411014",
      type: "Luxury Residential",
      unitsCount: 12,
      occupiedCount: 11,
      grossRent: 670000,
      amenities: ["Smart Home Automation", "Landscaped Podium Gardens", "Rooftop Lounge", "Jogging Track"],
      status: "Operational"
    },
    {
      id: "PROP-004",
      name: "DLF Cyber Enclave",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      address: "Golf Course Road, DLF Phase 5",
      city: "Gurugram",
      state: "Haryana",
      zip: "122002",
      type: "Commercial & Executive Suites",
      unitsCount: 8,
      occupiedCount: 7,
      grossRent: 540000,
      amenities: ["Central HVAC", "Conference Suites", "Valet Parking", "Cafeteria"],
      status: "Operational"
    }
  ],
  users: [
    {
      id: "USR-001",
      name: "Vishal Bhutekar",
      email: "vishal.bhutekar1@gmail.com",
      phone: "+91 98200 11223",
      role: "SUPER_ADMIN",
      property: "All Portfolios",
      unit: "Executive Suite",
      rent: 0,
      status: "Active",
      joinedDate: "Jan 15, 2026"
    },
    {
      id: "USR-002",
      name: "Priya Nair",
      email: "priya.nair@propledger.in",
      phone: "+91 98450 33445",
      role: "PROPERTY_MANAGER",
      property: "Prestige Tech Vista Suites",
      unit: "Manager Desk",
      rent: 0,
      status: "Active",
      joinedDate: "Feb 01, 2026"
    },
    {
      id: "USR-003",
      name: "Ananya Iyer",
      email: "ananya.iyer@gmail.com",
      phone: "+91 99201 44556",
      role: "TENANT",
      property: "Oberoi Sky City Residences",
      unit: "Unit 402",
      rent: 65000,
      status: "Active",
      joinedDate: "Apr 10, 2026"
    },
    {
      id: "USR-004",
      name: "Suresh Kumar",
      email: "suresh.kumar@propledger.in",
      phone: "+91 97310 77889",
      role: "MAINTENANCE_TECH",
      property: "Regional Operations",
      unit: "Field Specialist",
      rent: 0,
      status: "Active",
      joinedDate: "Mar 12, 2026"
    },
    {
      id: "USR-005",
      name: "Rajiv Oberoi",
      email: "rajiv.oberoi@capital.in",
      phone: "+91 98200 44556",
      role: "LANDLORD",
      property: "Oberoi Sky City Residences",
      unit: "Owner Equity",
      rent: 0,
      status: "Active",
      joinedDate: "Jan 10, 2026"
    },
    {
      id: "USR-006",
      name: "Rohan Deshmukh",
      email: "rohan.deshmukh@outlook.com",
      phone: "+91 98920 88776",
      role: "TENANT",
      property: "Prestige Tech Vista Suites",
      unit: "Unit 204",
      rent: 52000,
      status: "Active",
      joinedDate: "Jun 01, 2026"
    },
    {
      id: "USR-007",
      name: "Sneha Kulkarni",
      email: "sneha.kulkarni@gmail.com",
      phone: "+91 98223 44112",
      role: "TENANT",
      property: "Panchshil Towers",
      unit: "Unit 108",
      rent: 42000,
      status: "Pending",
      joinedDate: "Sep 05, 2026"
    }
  ],
  financials: {
    grossRevenue: 3640000,
    operatingExpenses: 820000,
    netProfit: 2820000,
    profitMargin: 77.5,
    collectionRate: 97.4,
    overdueAmount: 52000,
    months: [
      { month: "Jan", revenue: 3200000, expenses: 740000, profit: 2460000 },
      { month: "Feb", revenue: 3250000, expenses: 760000, profit: 2490000 },
      { month: "Mar", revenue: 3300000, expenses: 750000, profit: 2550000 },
      { month: "Apr", revenue: 3380000, expenses: 780000, profit: 2600000 },
      { month: "May", revenue: 3420000, expenses: 790000, profit: 2630000 },
      { month: "Jun", revenue: 3480000, expenses: 800000, profit: 2680000 },
      { month: "Jul", revenue: 3520000, expenses: 810000, profit: 2710000 },
      { month: "Aug", revenue: 3580000, expenses: 815000, profit: 2765000 },
      { month: "Sep", revenue: 3640000, expenses: 820000, profit: 2820000 }
    ],
    propertyBreakdown: [
      { name: "Oberoi Sky City Residences", amount: 1450000, percentage: 39.8, color: "#1d4ed8" },
      { name: "Prestige Tech Vista Suites", amount: 980000, percentage: 26.9, color: "#0d9488" },
      { name: "Panchshil Towers", amount: 670000, percentage: 18.4, color: "#7c3aed" },
      { name: "DLF Cyber Enclave", amount: 540000, percentage: 14.9, color: "#ea580c" }
    ]
  },
  tasks: [
    {
      id: "TSK-101",
      title: "AC Servicing & Air Filter Check",
      category: "Electrical & HVAC",
      priority: "MEDIUM",
      status: "in_progress",
      property: "Oberoi Sky City Residences",
      unit: "Floor 4 Central",
      assignee: "Suresh Kumar",
      dueDate: "Today, 4:00 PM",
      createdDate: "Sep 12, 2026"
    },
    {
      id: "TSK-102",
      title: "Bathroom Vanity Water Tap Inspection",
      category: "Plumbing & Water",
      priority: "URGENT",
      status: "in_progress",
      property: "Prestige Tech Vista Suites",
      unit: "Unit 402",
      assignee: "Suresh Kumar",
      dueDate: "Today, 1:00 PM",
      createdDate: "Sep 12, 2026"
    },
    {
      id: "TSK-103",
      title: "11-Month Lease Renewal & Security Deposit Verification",
      category: "Lease Renewal",
      priority: "HIGH",
      status: "backlog",
      property: "Oberoi Sky City Residences",
      unit: "Unit 204",
      assignee: "Priya Nair",
      dueDate: "Sep 15, 2026",
      createdDate: "Sep 11, 2026"
    },
    {
      id: "TSK-104",
      title: "Society Fire Safety & Sprinkler Compliance Audit",
      category: "Safety & Compliance",
      priority: "HIGH",
      status: "review",
      property: "DLF Cyber Enclave",
      unit: "Tower A",
      assignee: "Municipal Safety Officer",
      dueDate: "Sep 14, 2026",
      createdDate: "Sep 10, 2026"
    },
    {
      id: "TSK-105",
      title: "Flat Turnover Painting, Deep Cleaning & RFID Pass Update",
      category: "Unit Turn",
      priority: "MEDIUM",
      status: "completed",
      property: "Panchshil Towers",
      unit: "Unit 102",
      assignee: "Suresh Kumar",
      dueDate: "Completed Today",
      createdDate: "Sep 09, 2026"
    }
  ],
  activity: [
    {
      id: "ACT-01",
      timestamp: "Today, 09:55 AM",
      action: "SSL Activated",
      description: "Cloudflare Dedicated TLS Certificate active and secure for prop portals.",
      category: "security"
    },
    {
      id: "ACT-02",
      timestamp: "Today, 09:42 AM",
      action: "AutoPay Received",
      description: "Unit 402 rent payment (₹65,000.00) processed via UPI AutoPay for Ananya Iyer.",
      category: "financial"
    },
    {
      id: "ACT-03",
      timestamp: "Today, 09:15 AM",
      action: "Work Order Advanced",
      description: "Plumbing ticket #TSK-102 moved to 'In Progress' by Suresh Kumar.",
      category: "task"
    },
    {
      id: "ACT-04",
      timestamp: "Today, 08:30 AM",
      action: "Daily Audit Compiled",
      description: "56/60 units occupied (97.4% collection rate) verified across Mumbai, Bengaluru, and Pune.",
      category: "property"
    }
  ],
  announcements: [
    {
      id: "ANN-001",
      title: "Welcome to PropLedger Resident Hub",
      body: "Your new resident hub is live! You can now pay rent online via UPI, submit maintenance tickets, and download rent receipts directly from this portal.",
      priority: "info",
      postedAt: "Sep 12, 2026",
      expiresAt: null
    },
    {
      id: "ANN-002",
      title: "Scheduled Society Tank Cleaning — Sep 15",
      body: "Overhead water tank cleaning will take place on September 15 from 9:00 AM to 12:00 PM. Water supply will resume normally afterward.",
      priority: "warning",
      postedAt: "Sep 11, 2026",
      expiresAt: "Sep 15, 2026"
    }
  ]
};

// Global in-memory state
let globalAdminStore = JSON.parse(JSON.stringify(DEFAULT_ADMIN_STORE));

function handleAdminApi(url, request) {
  const method = request.method;
  const path = url.pathname;

  // 1. GET Dashboard Data
  if (path === '/api/admin/dashboard-data' && method === 'GET') {
    return new Response(JSON.stringify({ success: true, data: globalAdminStore }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // 2. POST Add Property
  if (path === '/api/admin/properties' && method === 'POST') {
    return request.json().then(body => {
      const newProp = {
        id: "PROP-" + String(globalAdminStore.properties.length + 1).padStart(3, '0'),
        name: body.name || "Untitled Property Asset",
        image: body.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
        address: body.address || "Street Address Pending",
        city: body.city || "Mumbai",
        state: body.state || "Maharashtra",
        zip: body.zip || "400001",
        type: body.type || "Luxury Residential",
        unitsCount: parseInt(body.unitsCount) || 12,
        occupiedCount: parseInt(body.occupiedCount) || Math.max(1, (parseInt(body.unitsCount) || 12) - 1),
        grossRent: parseFloat(body.grossRent) || 450000,
        amenities: Array.isArray(body.amenities) ? body.amenities : (body.amenities ? String(body.amenities).split(',').map(s => s.trim()) : ["24/7 Security", "Covered Parking", "Elevator"]),
        status: "Operational"
      };
      globalAdminStore.properties.unshift(newProp);
      globalAdminStore.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Property Registered",
        description: `New asset '${newProp.name}' (${newProp.unitsCount} units) registered in system.`,
        category: "property"
      });
      return new Response(JSON.stringify({ success: true, property: newProp, data: globalAdminStore }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }).catch(err => new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
  }

  // 3. POST Add User
  if (path === '/api/admin/users' && method === 'POST') {
    return request.json().then(body => {
      const newUser = {
        id: "USR-" + String(globalAdminStore.users.length + 1).padStart(3, '0'),
        name: body.name || "New Resident",
        email: body.email || "user@example.com",
        phone: body.phone || "+1 (512) 555-0199",
        role: body.role || "TENANT",
        property: body.property || "Oberoi Sky City Residences",
        unit: body.unit || "Unit 101",
        rent: parseFloat(body.rent) || 0,
        status: body.status || "Active",
        joinedDate: "Today, Sep 12"
      };
      globalAdminStore.users.unshift(newUser);
      globalAdminStore.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "User Onboarded",
        description: `${newUser.name} registered as ${newUser.role} for ${newUser.property} (${newUser.unit}).`,
        category: "user"
      });
      return new Response(JSON.stringify({ success: true, user: newUser, data: globalAdminStore }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }).catch(err => new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
  }

  // 4. POST Toggle User Status
  if (path.startsWith('/api/admin/users/') && path.endsWith('/toggle-status') && method === 'POST') {
    const parts = path.split('/');
    const userId = parts[4];
    const user = globalAdminStore.users.find(u => u.id === userId);
    if (user) {
      user.status = user.status === 'Active' ? 'Suspended' : 'Active';
      globalAdminStore.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Status Updated",
        description: `Account for ${user.name} (${user.id}) changed to '${user.status}'.`,
        category: "user"
      });
      return new Response(JSON.stringify({ success: true, user, data: globalAdminStore }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  // 5. POST Add Task
  if (path === '/api/admin/tasks' && method === 'POST') {
    return request.json().then(body => {
      const newTask = {
        id: "TSK-" + (100 + globalAdminStore.tasks.length + 1),
        title: body.title || "Routine Property Inspection",
        category: body.category || "General Maintenance",
        priority: body.priority || "MEDIUM",
        status: body.status || "backlog",
        property: body.property || "Oberoi Sky City Residences",
        unit: body.unit || "Common Area",
        assignee: body.assignee || "Marcus Brody",
        dueDate: body.dueDate || "Today, 5:00 PM",
        createdDate: "Sep 12, 2026"
      };
      globalAdminStore.tasks.unshift(newTask);
      globalAdminStore.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Task Created",
        description: `Work order '${newTask.title}' [${newTask.priority}] assigned to ${newTask.assignee}.`,
        category: "task"
      });
      return new Response(JSON.stringify({ success: true, task: newTask, data: globalAdminStore }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }).catch(err => new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
  }

  // 6. POST Advance Task Status
  if (path.startsWith('/api/admin/tasks/') && path.endsWith('/advance') && method === 'POST') {
    const parts = path.split('/');
    const taskId = parts[4];
    const task = globalAdminStore.tasks.find(t => t.id === taskId);
    if (task) {
      const order = ['backlog', 'in_progress', 'review', 'completed'];
      const currentIndex = order.indexOf(task.status);
      const nextStatus = currentIndex < order.length - 1 ? order[currentIndex + 1] : order[0];
      task.status = nextStatus;
      globalAdminStore.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Task Advanced",
        description: `Work order #${task.id} advanced to status '${nextStatus}'.`,
        category: "task"
      });
      return new Response(JSON.stringify({ success: true, task, data: globalAdminStore }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    return new Response(JSON.stringify({ success: false, error: "Task not found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  // 7. POST Reset Data
  if (path === '/api/admin/reset' && method === 'POST') {
    globalAdminStore = JSON.parse(JSON.stringify(DEFAULT_ADMIN_STORE));
    return new Response(JSON.stringify({ success: true, message: "Admin data reset to default seed", data: globalAdminStore }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // 8. POST Add Announcement (admin only)
  if (path === '/api/admin/announcements' && method === 'POST') {
    return request.json().then(body => {
      if (!globalAdminStore.announcements) globalAdminStore.announcements = [];
      const ann = {
        id: "ANN-" + String(globalAdminStore.announcements.length + 1).padStart(3, '0'),
        title: body.title || "Property Notice",
        body: body.body || "",
        priority: body.priority || "info",
        postedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        expiresAt: body.expiresAt || null
      };
      globalAdminStore.announcements.unshift(ann);
      globalAdminStore.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Announcement Posted",
        description: `Notice "${ann.title}" [${ann.priority}] posted to resident portal.`,
        category: "property"
      });
      return new Response(JSON.stringify({ success: true, announcement: ann }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }).catch(err => new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
  }

  // 9. DELETE Announcement
  if (path.startsWith('/api/admin/announcements/') && method === 'DELETE') {
    const annId = path.split('/').pop();
    if (!globalAdminStore.announcements) globalAdminStore.announcements = [];
    const idx = globalAdminStore.announcements.findIndex(a => a.id === annId);
    if (idx !== -1) {
      const removed = globalAdminStore.announcements.splice(idx, 1)[0];
      return new Response(JSON.stringify({ success: true, message: "Announcement removed: " + removed.title }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    return new Response(JSON.stringify({ success: false, error: "Announcement not found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  // 10. GET Maintenance Tickets (tasks with source=maintenance)
  if (path === '/api/admin/maintenance-tickets' && method === 'GET') {
    const tickets = (globalAdminStore.tasks || []).filter(t => t.source === 'maintenance');
    return new Response(JSON.stringify({ success: true, tickets }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // 11. GET Tour Requests (tasks with source=tour)
  if (path === '/api/admin/tour-requests' && method === 'GET') {
    const tours = (globalAdminStore.tasks || []).filter(t => t.source === 'tour');
    return new Response(JSON.stringify({ success: true, tours }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  return null;
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  // 0. PropLedger Executive Admin REST API
  if (url.pathname.startsWith('/api/admin/')) {
    const adminApiResp = await handleAdminApi(url, request);
    if (adminApiResp) return adminApiResp;
  }


  // Both admin.propledger.vishalbhutekar.me and home.propledger.vishalbhutekar.me now have
  // dedicated, active Google Trust Services TLS certificates via Cloudflare Worker Custom Domains.

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  // PUBLIC API: Properties listing (safe subset, no financial data)
  if (url.pathname === '/api/public/properties' && request.method === 'GET') {
    const publicProps = (globalAdminStore.properties || []).map(p => ({
      id: p.id,
      name: p.name,
      image: p.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      address: p.address,
      city: p.city,
      state: p.state,
      type: p.type,
      unitsCount: p.unitsCount,
      availableUnits: Math.max(0, p.unitsCount - p.occupiedCount),
      occupiedCount: p.occupiedCount,
      amenities: p.amenities,
      status: p.status
    }));
    return new Response(JSON.stringify({ success: true, properties: publicProps, total: publicProps.length }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // PUBLIC API: Announcements (read-only)
  if (url.pathname === '/api/public/announcements' && request.method === 'GET') {
    const now = new Date();
    const active = (globalAdminStore.announcements || []).filter(a => {
      if (!a.expiresAt) return true;
      try { return new Date(a.expiresAt) >= now; } catch(e) { return true; }
    }).slice(0, 5);
    return new Response(JSON.stringify({ success: true, announcements: active }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // PUBLIC API: Submit Maintenance Ticket
  if (url.pathname === '/api/public/submit-maintenance' && request.method === 'POST') {
    try {
      const data = await request.json();
      const residentName = data.residentName || 'Unknown Resident';
      const unit = data.unit || 'Unknown';
      const email = data.email || '';
      const category = data.category || 'General Maintenance';
      const urgency = data.urgency || 'Routine';
      const description = data.description || 'No details provided.';
      const property = data.property || 'PropLedger Property';

      // Add to admin task queue
      const ticketId = "TSK-" + (100 + (globalAdminStore.tasks || []).length + 1);
      const newTask = {
        id: ticketId,
        title: category + " — " + (description.length > 50 ? description.slice(0, 50) + '...' : description),
        category: category,
        priority: urgency === 'Emergency' ? 'URGENT' : urgency === 'Urgent' ? 'HIGH' : 'MEDIUM',
        status: 'backlog',
        property: property,
        unit: 'Unit ' + unit,
        assignee: 'Maintenance Team',
        dueDate: urgency === 'Emergency' ? 'Today, ASAP' : 'Within 48 Hours',
        createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        source: 'maintenance',
        residentName: residentName,
        residentEmail: email,
        description: description
      };
      if (!globalAdminStore.tasks) globalAdminStore.tasks = [];
      globalAdminStore.tasks.unshift(newTask);
      globalAdminStore.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Maintenance Request",
        description: `${residentName} (Unit ${unit}) submitted a ${urgency} ${category} request.`,
        category: "task"
      });

      // Send confirmation email to resident
      if (email) {
        const confirmHtml = `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f8fafc;padding:32px"><div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0"><h2 style="color:#1e293b;margin:0 0 8px">Maintenance Request Received</h2><p style="color:#64748b;margin:0 0 24px">Ticket #: <strong>${ticketId}</strong></p><p style="color:#475569">Hi <strong>${residentName}</strong>, your maintenance request has been logged and our team will reach out shortly.</p><div style="background:#f1f5f9;border-radius:12px;padding:16px;margin:16px 0"><strong>Category:</strong> ${category}<br><strong>Priority:</strong> ${urgency}<br><strong>Details:</strong> ${description}</div><p style="color:#94a3b8;font-size:12px">PropLedger Resident Services</p></div></body></html>`;
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: FROM_EMAIL, to: [email], subject: `Maintenance Ticket Confirmed: ${ticketId}`, html: confirmHtml })
        }).catch(() => {});
      }

      return new Response(JSON.stringify({ success: true, ticketId, message: 'Your maintenance request has been submitted. Our team will contact you shortly.' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: 'We could not submit your request. Please try again or call the office.' }), {
        status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }

  // PUBLIC API: Request Statement
  if (url.pathname === '/api/public/request-statement' && request.method === 'POST') {
    try {
      const data = await request.json();
      const residentName = data.residentName || 'Valued Resident';
      const unit = data.unit || 'N/A';
      const email = data.email || '';
      const monthYear = data.monthYear || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      globalAdminStore.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Statement Requested",
        description: `${residentName} (Unit ${unit}) requested a rent statement for ${monthYear}.`,
        category: "financial"
      });

      // Dispatch statement email
      const statHtml = `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f8fafc;padding:32px"><div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0"><h2 style="color:#1e293b">Your Rent Statement</h2><p style="color:#475569">Hi <strong>${residentName}</strong>, here is your rent statement for <strong>${monthYear}</strong>.</p><div style="background:#f1f5f9;border-radius:12px;padding:16px;margin:16px 0;border-left:4px solid #2546A6"><strong>Unit:</strong> ${unit}<br><strong>Period:</strong> ${monthYear}<br><strong>Status:</strong> Statement Dispatched</div><p style="color:#94a3b8;font-size:12px">For detailed breakdown, please contact your property manager. PropLedger Resident Services</p></div></body></html>`;
      if (email) {
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: FROM_EMAIL, to: [email], subject: `Your PropLedger Statement — ${monthYear}`, html: statHtml })
        }).catch(() => {});
      }

      return new Response(JSON.stringify({ success: true, message: 'Your statement for ' + monthYear + ' has been emailed to ' + (email || 'your registered address') + '.' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: 'Could not process your request. Please try again.' }), {
        status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }

  // PUBLIC API: Tour Booking
  if (url.pathname === '/api/public/tour-booking' && request.method === 'POST') {
    try {
      const data = await request.json();
      const name = data.name || 'Prospective Resident';
      const email = data.email || '';
      const phone = data.phone || 'Not provided';
      const unit = data.unit || 'General Inquiry';
      const tourType = data.tourType || 'In-Person Tour';
      const slot = data.slot || 'To be confirmed';

      const taskId = "TSK-" + (100 + (globalAdminStore.tasks || []).length + 1);
      const tourTask = {
        id: taskId,
        title: `Tour: ${name} — ${unit} (${tourType})`,
        category: 'Tour Booking',
        priority: 'MEDIUM',
        status: 'backlog',
        property: 'PropLedger Properties',
        unit: unit,
        assignee: 'Leasing Team',
        dueDate: slot,
        createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        source: 'tour',
        prospectName: name,
        prospectEmail: email,
        prospectPhone: phone,
        tourType: tourType,
        slot: slot
      };
      if (!globalAdminStore.tasks) globalAdminStore.tasks = [];
      globalAdminStore.tasks.unshift(tourTask);
      globalAdminStore.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Tour Booked",
        description: `${name} booked a ${tourType} for ${unit} at ${slot}.`,
        category: "property"
      });

      return new Response(JSON.stringify({ success: true, bookingId: taskId, message: 'Tour confirmed for ' + slot + '. We will send a confirmation to ' + (email || 'your email') + '.' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: 'Could not confirm your tour. Please try again.' }), {
        status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }

  // 1. Zensar Prep Suite Proxy (https://zensar-prep-suite-vishal.netlify.app/)
  if (hostname.includes('zensar-prep')) {
    try {
      const netlifyUrl = new URL(request.url);
      netlifyUrl.hostname = 'zensar-prep-suite-vishal.netlify.app';
      netlifyUrl.protocol = 'https:';
      netlifyUrl.port = '';

      const netlifyResp = await fetch(netlifyUrl.toString(), {
        method: request.method,
        headers: {
          'Host': 'zensar-prep-suite-vishal.netlify.app',
          'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
          'Accept': request.headers.get('accept') || '*/*',
          'Accept-Language': request.headers.get('accept-language') || 'en-US,en;q=0.9',
        }
      });

      const respHeaders = new Headers(netlifyResp.headers);
      respHeaders.set('Access-Control-Allow-Origin', '*');
      return new Response(netlifyResp.body, {
        status: netlifyResp.status,
        statusText: netlifyResp.statusText,
        headers: respHeaders
      });
    } catch (e) {
      return new Response('Netlify Proxy Error: ' + e.message, { status: 502 });
    }
  }

  // API: Health & Status
  if (url.pathname === '/api/status') {
    return new Response(JSON.stringify({
      status: 'operational',
      app: 'PropLedger',
      supportEmail: 'support@propledger.vishalbhutekar.me',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // API: Support Query Forwarding
  if (url.pathname === '/api/support-query' && request.method === 'POST') {
    try {
      const data = await request.json();
      const senderName = data.senderName || 'Resident Inquirer';
      const senderEmail = data.senderEmail || 'support@propledger.vishalbhutekar.me';
      const subject = data.subject || 'General Property Inquiry';
      const message = data.message || 'No inquiry text provided.';
      const colo = request.cf?.colo || 'GLOBAL';

      const supportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>PropLedger Support Ticket</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #080b11; font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #111622; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 32px; overflow: hidden; box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8);">
    <tr>
      <td style="padding: 36px 40px 24px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 46px; height: 46px; background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); border-radius: 18px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: 900; font-size: 20px; line-height: 46px; box-shadow: 0 8px 20px -4px rgba(14, 165, 233, 0.45);">
                    S
                  </td>
                  <td style="padding-left: 14px;">
                    <div style="font-size: 19px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">
                      PropLedger <span style="font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.3); margin-left: 4px; vertical-align: middle;">CONCIERGE</span>
                    </div>
                    <div style="font-size: 12px; color: #64748b; font-weight: 500;">
                      support@propledger.vishalbhutekar.me
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align: right;">
              <span style="display: inline-block; padding: 7px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; background-color: rgba(14, 165, 233, 0.12); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.25);">
                &bull; Inbound Query
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0d14; border: 1px solid #1e2638; border-radius: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 26px 30px 22px 30px;">
              <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                Resident Inquiry Ticket
              </div>
              <div style="font-size: 21px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em; line-height: 1.3;">
                ${subject}
              </div>
              <div style="font-size: 13px; color: #94a3b8; margin-top: 6px;">
                From: <strong style="color: #f1f5f9;">${senderName}</strong> &bull; <span style="font-family: 'JetBrains Mono', monospace; color: #38bdf8;">${senderEmail}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 30px;">
              <div style="border-top: 2px dashed #222c3f; height: 1px; width: 100%;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 30px;">
              <div style="background-color: #121824; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); padding: 20px 22px; margin-bottom: 22px;">
                <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">
                  Message Content
                </div>
                <div style="font-size: 14px; color: #e2e8f0; line-height: 1.65; white-space: pre-wrap;">
${message}
                </div>
              </div>

              <div style="text-align: center;">
                <a href="mailto:${senderEmail}?subject=Re: [PropLedger Support] ${encodeURIComponent(subject)}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 9999px; font-weight: 800; font-size: 13px; box-shadow: 0 6px 16px rgba(2, 132, 199, 0.4);">
                  Reply to ${senderName} &rarr;
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 22px 36px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #64748b; font-family: 'JetBrains Mono', monospace;">
          Forwarded via Cloudflare Edge (${colo}) &bull; Destination: ${FORWARD_DESTINATION}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

      let resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [FORWARD_DESTINATION],
          reply_to: senderEmail,
          subject: `[PropLedger Support] ${subject} (From: ${senderName})`,
          html: supportHtml
        })
      });

      let resData = await resendResp.json();

      if (!resendResp.ok) {
        resendResp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: FALLBACK_FROM_EMAIL,
            to: [FORWARD_DESTINATION],
            reply_to: senderEmail,
            subject: `[PropLedger Support] ${subject} (From: ${senderName})`,
            html: supportHtml
          })
        });
        resData = await resendResp.json();
      }

      return new Response(JSON.stringify({
        success: resendResp.ok,
        messageId: resData.id,
        forwardedTo: FORWARD_DESTINATION,
        targetEmail: 'support@propledger.vishalbhutekar.me',
        message: 'Your query has been forwarded to support administrator Vishal Bhutekar.'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }

  // API: Send Invoice & Registration Email
  if ((url.pathname === '/api/send-invoice' || url.pathname === '/api/admin/dispatch-invoice-email') && request.method === 'POST') {
    try {
      const data = await request.json();
      const recipient = data.recipientEmail || 'vishal.bhutekar1@gmail.com';
      const invoiceNumber = data.invoiceNumber || 'INV-202609-00001';
      const amount = data.amount || '₹65,000.00';
      const property = data.property || 'Oberoi Sky City Residences Luxury Suites - Unit 402';
      const tenant = data.tenant || 'Vishal Bhutekar';

      const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>PropLedger Statement</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #080b11; font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #111622; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 32px; overflow: hidden; box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8);">
    <tr>
      <td style="padding: 36px 40px 24px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 46px; height: 46px; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); border-radius: 18px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: 900; font-size: 21px; line-height: 46px; box-shadow: 0 8px 20px -4px rgba(99, 102, 241, 0.45);">
                    P
                  </td>
                  <td style="padding-left: 14px;">
                    <div style="font-size: 19px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">
                      PropLedger
                    </div>
                    <div style="font-size: 12px; color: #64748b; font-weight: 500;">
                      Commercial Real Estate Operations
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align: right;">
              <span style="display: inline-block; padding: 7px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; background-color: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25);">
                &bull; Active Statement
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0d14; border: 1px solid #1e2638; border-radius: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 26px 30px 22px 30px;">
              <div style="font-size: 11px; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                September 2026 Billing Statement
              </div>
              <div style="font-size: 23px; font-weight: 900; color: #ffffff; letter-spacing: -0.03em;">
                ${invoiceNumber}
              </div>
              <div style="font-size: 13px; color: #94a3b8; margin-top: 5px;">
                ${property}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 30px;">
              <div style="border-top: 2px dashed #222c3f; height: 1px; width: 100%;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #121824; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 22px;">
                <tr>
                  <td style="padding: 18px 22px;">
                    <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px;">
                      Resident & Account Summary
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; width: 110px;">Tenant:</td>
                        <td style="padding: 4px 0; color: #ffffff; font-weight: 700;">${tenant}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Due Date:</td>
                        <td style="padding: 4px 0; color: #f1f5f9; font-family: 'JetBrains Mono', monospace;">October 01, 2026</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Master Admin:</td>
                        <td style="padding: 4px 0; color: #818cf8; font-family: 'JetBrains Mono', monospace;">vishal.bhutekar1@gmail.com</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.14) 0%, rgba(99, 102, 241, 0.08) 100%); border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.3);">
                <tr>
                  <td style="padding: 18px 22px;">
                    <div style="font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.06em;">
                      Total Payable
                    </div>
                    <div style="font-size: 26px; font-weight: 900; color: #34d399; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">
                      ${amount}
                    </div>
                  </td>
                  <td style="text-align: right; padding: 18px 22px;">
                    <a href="https://propledger.vishalbhutekar.me/invoices" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 9999px; font-weight: 800; font-size: 13px; box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);">
                      Pay Online &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 32px 28px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(14, 165, 233, 0.08); border-radius: 20px; border: 1px solid rgba(14, 165, 233, 0.22);">
          <tr>
            <td style="padding: 16px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                    <strong style="color: #38bdf8;">Need assistance?</strong> Submit inquiries directly to <a href="mailto:support@propledger.vishalbhutekar.me" style="color: #38bdf8; text-decoration: none; font-weight: 700; font-family: 'JetBrains Mono', monospace;">support@propledger.vishalbhutekar.me</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 500;">
          PropLedger Technologies &bull; Automated Enterprise Operations
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

      let resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [recipient],
          subject: `PropLedger Statement: ${invoiceNumber} - ${property}`,
          html: emailHtml
        })
      });

      let resData = await resendResp.json();

      if (!resendResp.ok) {
        resendResp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: FALLBACK_FROM_EMAIL,
            to: [recipient],
            subject: `PropLedger Statement: ${invoiceNumber} - ${property}`,
            html: emailHtml
          })
        });
        resData = await resendResp.json();
      }

      return new Response(JSON.stringify({
        success: resendResp.ok,
        messageId: resData.id,
        recipient,
        invoiceNumber,
        status: resendResp.ok ? 'DELIVERED' : 'ERROR',
        details: resData
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({
        success: false,
        error: err.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }

  // Subdomain Routing Engine:
  // - admin.propledger.vishalbhutekar.me / admin.vishalbhutekar.me (or /admin) -> Master Admin Console
  // - home.propledger.vishalbhutekar.me / propledger.vishalbhutekar.me -> Public Website
  const isAdminHost = hostname.startsWith('admin.') || hostname.startsWith('admin-') || url.pathname.startsWith('/admin');

  if (isAdminHost) {
    return new Response(renderAdminPage(hostname), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }

  return new Response(renderHomePage(hostname), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

// 1. PUBLIC WEBSITE: propledger.vishalbhutekar.me (Koshpal Aesthetic)
function renderHomePage(hostname) {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropLedger – Simple, Modern Property Management & Online Rent</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Figtree', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #ffffff; color: #0f172a; -webkit-font-smoothing: antialiased; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    
    /* Koshpal Signature Blueprint Grid Background */
    .koshpal-bg {
      background-color: #15337C !important;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
        linear-gradient(180deg, #15337C 0%, #173B8D 45%, #1D45A3 100%) !important;
      background-size: 48px 48px, 48px 48px, 100% 100% !important;
      background-repeat: repeat, repeat, no-repeat !important;
    }
    .koshpal-bg-light {
      background-color: #1D45A3 !important;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
        linear-gradient(180deg, #1D45A3 0%, #2546A6 100%) !important;
      background-size: 48px 48px, 48px 48px, 100% 100% !important;
      background-repeat: repeat, repeat, no-repeat !important;
    }
    .koshpal-footer-bg {
      background-color: #15337C !important;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
        linear-gradient(180deg, #1D45A3 0%, #0F2356 60%, #0B1B3D 100%) !important;
      background-size: 48px 48px, 48px 48px, 100% 100% !important;
      background-repeat: repeat, repeat, no-repeat !important;
    }

    /* Koshpal Signature Cards */
    .koshpal-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 28px;
      box-shadow: 0 10px 30px -4px rgba(16, 24, 40, 0.06), 0 4px 10px -2px rgba(16, 24, 40, 0.03);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .koshpal-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 18px 40px -6px rgba(16, 24, 40, 0.1), 0 6px 16px -3px rgba(16, 24, 40, 0.04);
    }
    .pill-btn { border-radius: 9999px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .pill-btn:hover { transform: translateY(-1.5px); }
    
    @keyframes bounceSlow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .animate-bounce-slow {
      animation: bounceSlow 3.5s ease-in-out infinite;
    }
    .active-tab { background-color: #2546A6; color: #ffffff !important; box-shadow: 0 4px 14px 0 rgba(37, 70, 166, 0.35); }
    .inactive-tab { background-color: #f1f5f9; color: #475569; }
    .inactive-tab:hover { background-color: #e2e8f0; color: #0f172a; }
  </style>
</head>
<body class="min-h-screen antialiased bg-white text-slate-900 pb-28">

  <!-- Floating Toast Notification System -->
  <div id="toastContainer" class="fixed top-6 right-6 z-[80] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0"></div>

  <!-- Floating Capsule Navigation Bar -->
  <div class="fixed top-5 inset-x-0 z-50 px-4 flex justify-center pointer-events-none">
    <header class="pointer-events-auto w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-full px-5 sm:px-8 py-3.5 shadow-[0_12px_36px_-4px_rgba(16,24,40,0.12),0_4px_12px_-2px_rgba(16,24,40,0.06)] flex items-center justify-between border border-slate-100 transition-all">
      
      <!-- Brand Logo -->
      <a href="/" class="flex items-center gap-3 group">
        <svg class="w-8 h-8 group-hover:scale-105 transition-transform flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="11" height="11" rx="5.5" fill="#15337C" />
          <rect x="17" y="4" width="11" height="11" rx="5.5" fill="#2563EB" />
          <rect x="4" y="17" width="11" height="11" rx="5.5" fill="#00A896" />
          <rect x="17" y="17" width="11" height="11" rx="5.5" fill="#38BDF8" />
        </svg>
        <div>
          <span class="font-black text-xl tracking-tight text-[#111827]">PropLedger</span>
          <p class="text-[11px] text-slate-500 font-medium tracking-tight -mt-0.5 hidden sm:block">Seamless Property Operations</p>
        </div>
      </a>

      <!-- Center Desktop Navigation Links (No wrapping, perfect spacing) -->
      <nav class="hidden lg:flex items-center gap-6">
        <a href="#overview" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">Overview</a>
        <a href="#what-we-do" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">Features</a>
        <a href="#how-it-works" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">How It Works</a>
        <a href="#dual-experience" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">Live Portals</a>
        <a href="#unit-gallery" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">Apartments</a>
        <a href="#security" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">Security</a>
        <a href="#faq" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">FAQs</a>
        <a href="#resident-hub" onclick="navigateToResidentHub(event)" class="text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-3.5 py-1.5 rounded-full transition shadow-sm">Resident Hub</a>
      </nav>

      <!-- Right Actions (Pay Rent + Tour / Mobile Toggle) -->
      <div class="flex items-center gap-2.5">
        <a href="#unit-gallery" class="hidden sm:inline-flex pill-btn px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition">
          Browse Units
        </a>
        <button onclick="openPaymentModal()" class="pill-btn px-5 sm:px-6 py-2.5 bg-[#2546A6] hover:bg-[#1D367E] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-900/20 transition flex items-center gap-2">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          <span>Pay Rent</span>
        </button>

        <!-- Mobile Hamburger Toggle -->
        <button id="mobileNavBtn" onclick="toggleMobileNav()" class="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none" aria-label="Toggle Navigation Menu">
          <svg id="hamburgerIcon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          <svg id="closeNavIcon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </header>
  </div>

  <!-- Mobile Navigation Drawer Dropdown -->
  <div id="mobileNavDrawer" class="fixed inset-x-4 top-24 z-40 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 shadow-2xl space-y-4 hidden lg:hidden transition-all duration-300 transform scale-95 opacity-0">
    <div class="grid grid-cols-2 gap-3 text-xs font-bold">
      <a href="#overview" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">Overview</a>
      <a href="#what-we-do" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">Features</a>
      <a href="#how-it-works" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">How It Works</a>
      <a href="#dual-experience" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">Live Portals</a>
      <a href="#unit-gallery" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">Apartments</a>
      <a href="#security" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">Security</a>
      <a href="#roi-calculator" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">ROI Calculator</a>
      <a href="#faq" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">FAQs</a>
      <a href="#resident-hub" onclick="toggleMobileNav(); navigateToResidentHub(event);" class="p-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition">Resident Hub</a>
    </div>
    <div class="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
      <button onclick="toggleMobileNav(); openPaymentModal();" class="w-full py-3 rounded-2xl bg-[#2546A6] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md">
        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        <span>Pay Rent Online</span>
      </button>
      <a href="#unit-gallery" onclick="toggleMobileNav()" class="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-center font-bold text-xs hover:bg-slate-50 transition">
        Browse Available Apartments &rarr;
      </a>
    </div>
  </div>

  <!-- HERO SECTION (Koshpal Deep Royal Blue Blueprint Canvas & Signature Card Composition) -->
  <section id="overview" class="relative koshpal-bg pt-32 pb-24 sm:pb-32 px-6 overflow-hidden">
    <!-- Open-Source Architectural Glass High-Rise Background (Unsplash License) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80" alt="Modern Architecture" class="w-full h-full object-cover object-center opacity-15 mix-blend-luminosity filter saturate-150 transform scale-105">
      <div class="absolute inset-0 bg-gradient-to-b from-[#15337C]/85 via-[#15337C]/75 to-[#15337C]"></div>
    </div>
    <!-- Glowing Radial Light Orbs -->
    <div class="absolute -top-24 -right-24 w-[600px] h-[600px] bg-gradient-to-br from-[#00A896]/25 via-[#2563EB]/25 to-transparent rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
      
      <!-- Left Column: Typography & CTAs -->
      <div class="lg:col-span-7 space-y-6 text-left">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-100 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></span>
          <span>Enterprise Cloud Platform &bull; <strong class="text-[#38BDF8]">99.9% Uptime SLA</strong></span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
          Simple, modern<br>
          <span class="text-white">property management</span>
        </h1>

        <p class="text-blue-100/90 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
          PropLedger makes managing rentals effortless. Pay rent online in seconds via UPI, track leases, and manage apartments with zero paperwork or spreadsheets.
        </p>

        <div class="flex flex-wrap items-center gap-3.5 pt-2">
          <button onclick="openTourModal('Oberoi Sky City Luxury Suites', '₹32,000 - ₹1,45,000 / mo', 'Full Portfolio Inventory', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-8 py-4 bg-white hover:bg-slate-50 text-[#15337C] font-extrabold text-sm shadow-xl shadow-blue-950/30 flex items-center gap-2 transition">
            <span>Explore Apartments</span>
            <span>&rarr;</span>
          </button>
          <a href="#dual-experience" class="pill-btn px-7 py-4 border-2 border-white/30 hover:border-white text-white font-bold text-sm backdrop-blur-sm transition flex items-center gap-2">
            <span>Try Live Portals &darr;</span>
          </a>
        </div>

        <!-- Trust Badges -->
        <div class="pt-4 flex flex-wrap items-center gap-6 text-xs text-blue-100/80 font-medium">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-[#00A896]/30 text-[#2DD4BF] flex items-center justify-center font-bold text-[11px]">&check;</span>
            <span>Zero Double-Bookings</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[11px]">&check;</span>
            <span>Automated Monthly Billing</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-[#38BDF8]/30 text-[#38BDF8] flex items-center justify-center font-bold text-[11px]">&check;</span>
            <span>Instant Online Rent Payments</span>
          </div>
        </div>
      </div>

      <!-- Right Column: The Signature Koshpal 3-Card Stack -->
      <div class="lg:col-span-5 relative space-y-4">
        
        <!-- Top Row: Quarter Circle Graphic + White Stat Card -->
        <div class="grid grid-cols-12 gap-4 items-end">
          
          <!-- Quarter-Circle Graphic Card with Glowing Up-Trend Badge -->
          <div class="col-span-5 h-[220px] rounded-tl-[140px] rounded-tr-3xl rounded-b-3xl bg-[#1E3E8F] border border-white/15 p-5 relative flex items-start justify-end shadow-2xl overflow-hidden">
            <div class="w-13 h-13 rounded-full bg-[#0B1E48] border border-white/20 text-[#2DD4BF] p-3 shadow-lg animate-bounce-slow flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
          </div>

          <!-- 85% / 99.2% Stat Card (Clean White Koshpal Style) -->
          <div class="col-span-7 bg-white rounded-[28px] p-6 shadow-2xl space-y-2 border border-slate-100">
            <div class="text-5xl font-black text-slate-900 tracking-tight">
              99.2%
            </div>
            <p class="text-xs text-slate-600 font-medium leading-snug">
              on-time rent collection rate reported across portfolio units
            </p>
            <!-- Cyan Progress Bar -->
            <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-3">
              <div class="w-[94%] h-full bg-[#00A896] rounded-full"></div>
            </div>
          </div>

        </div>

        <!-- Bottom Executive Cutout Card (Koshpal Dark Navy Banner) -->
        <div class="rounded-[28px] p-6 bg-[#0B1D47]/95 backdrop-blur-md border border-white/15 text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
          <div class="space-y-1.5 max-w-[280px] z-10">
            <div class="w-8 h-0.5 bg-blue-400 mb-2"></div>
            <p class="text-[10px] uppercase font-bold tracking-wider text-blue-200">Built for everyday landlords & residents</p>
            <h4 class="text-base font-bold text-white leading-snug">
              Zero paperwork stress. 100% digital clarity across India.
            </h4>
          </div>
          <!-- Person cutout preview / architectural emblem -->
          <div class="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/20 shadow-inner flex-shrink-0">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="Executive" class="w-full h-full object-cover">
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- SECTION 2: WHY PRIORITIZING OPERATIONS MATTERS (Koshpal Blue Section with Donut Cards) -->
  <section id="why-it-matters" class="koshpal-bg-light py-20 px-6 text-white text-center relative">
    <div class="max-w-4xl mx-auto space-y-4 mb-12">
      <h2 class="text-3xl sm:text-5xl font-black tracking-tight">
        Why simple property management matters
      </h2>
      <p class="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
        We turn messy rent collections into smooth, automated payments with instant UPI receipts and calendar-protected bookings.
      </p>
    </div>

    <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      <!-- Card 1 -->
      <div class="bg-[#F0F4FA] rounded-[32px] p-8 sm:p-10 text-slate-900 shadow-xl flex items-center justify-between gap-6">
        <div class="space-y-3">
          <h3 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-snug">
            Save up to 70% in operating costs compared to traditional property software
          </h3>
          <p class="text-xs text-slate-500 font-medium">Independent Property Management Operations Study</p>
        </div>
        <!-- Donut Ring Chart Graphic -->
        <div class="w-16 h-16 rounded-full border-8 border-[#2563EB] border-t-[#00A896] border-r-[#00A896] flex-shrink-0"></div>
      </div>

      <!-- Card 2 -->
      <div class="bg-[#F0F4FA] rounded-[32px] p-8 sm:p-10 text-slate-900 shadow-xl flex items-center justify-between gap-6">
        <div class="space-y-3">
          <h3 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-snug">
            Zero double-bookings with smart automated calendar protection
          </h3>
          <p class="text-xs text-slate-500 font-medium">PropLedger Automated Booking Guarantee</p>
        </div>
        <!-- Donut Ring Chart Graphic -->
        <div class="w-16 h-16 rounded-full border-8 border-[#00A896] border-t-[#2563EB] flex-shrink-0"></div>
      </div>
    </div>
  </section>

  <!-- SECTION 3: WHAT MAKES US DIFFERENT (4 Koshpal Signature Pastel Cards) -->
  <section id="what-we-do" class="py-24 px-6 bg-white">
    <div class="max-w-6xl mx-auto space-y-12">
      
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#2546A6] text-xs font-bold">
          <svg class="w-3.5 h-3.5 text-[#00A896]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
          <span>What Makes Us Different</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Help landlords and tenants take control of rental finances
        </h2>
        <p class="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          PropLedger replaces messy spreadsheets and paper receipts with smart booking protection, clear financial records, and effortless online rent payments.
        </p>
      </div>

      <!-- The 4 Koshpal Pastel Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Pastel 1: Soft Mint Green -->
        <div class="rounded-[28px] p-8 bg-[#E8F5E9] border border-emerald-200/50 space-y-4 hover:-translate-y-1.5 transition-all shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
          </div>
          <h3 class="text-lg font-bold text-emerald-950">Privacy-First Technology</h3>
          <p class="text-xs text-emerald-900/80 leading-relaxed">
            Your financial data is completely protected. We use bank-grade 256-bit encryption and never share sensitive banking credentials.
          </p>
        </div>

        <!-- Pastel 2: Soft Rose / Coral -->
        <div class="rounded-[28px] p-8 bg-[#FDE8E8] border border-rose-200/50 space-y-4 hover:-translate-y-1.5 transition-all shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-700/20">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <h3 class="text-lg font-bold text-rose-950">Real-time Insights</h3>
          <p class="text-xs text-rose-900/80 leading-relaxed">
            Auto-capture lease transitions and billing dispatches so you never miss a payment or accidentally let an apartment sit vacant.
          </p>
        </div>

        <!-- Pastel 3: Soft Ice Blue -->
        <div class="rounded-[28px] p-8 bg-[#E0E7FF] border border-indigo-200/50 space-y-4 hover:-translate-y-1.5 transition-all shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-700/20">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
          <h3 class="text-lg font-bold text-indigo-950">Automated Settlement</h3>
          <p class="text-xs text-indigo-900/80 leading-relaxed">
            Fast, secure 1-click rent payments via bank transfer or credit/debit card with instant digital receipts.
          </p>
        </div>

        <!-- Pastel 4: Soft Amber / Gold -->
        <div class="rounded-[28px] p-8 bg-[#FEF3C7] border border-amber-200/50 space-y-4 hover:-translate-y-1.5 transition-all shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-700/20">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
          </div>
          <h3 class="text-lg font-bold text-amber-950">ROI Tracking</h3>
          <p class="text-xs text-amber-900/80 leading-relaxed">
            See your monthly rental income, track property expenses, and view your profits at a glance with zero manual math.
          </p>
        </div>

      </div>

    </div>
  </section>

  <!-- SECTION 4: HOW PROPLEDGER WORKS? (3-Step Process) -->
  <section id="how-it-works" class="py-24 px-6 bg-slate-50 border-y border-slate-200/80 relative overflow-hidden">
    <!-- Subtle Ambient Blueprint Dot Matrix & Light Accents -->
    <div class="absolute inset-0 pointer-events-none opacity-40" style="background-image: radial-gradient(#2546A6 0.75px, transparent 0.75px); background-size: 24px 24px;"></div>
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl pointer-events-none"></div>
    <div class="max-w-6xl mx-auto space-y-12">
      
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How PropLedger works?
        </h2>
        <p class="text-xs sm:text-sm text-slate-500">Getting started takes less than 2 minutes. No training or technical experience required.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div class="koshpal-card p-8 space-y-4 bg-white">
          <div class="text-xs font-black uppercase text-[#2546A6] tracking-wider font-bold">Step 1</div>
          <h3 class="text-2xl font-black text-[#15337C]">Set Up Instantly</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Go live in one minute. Add your property (e.g. "Oberoi Sky City, Mumbai"), list your flats, and set monthly rents in Rupees.
          </p>
        </div>

        <div class="koshpal-card p-8 space-y-4 bg-white">
          <div class="text-xs font-black uppercase text-[#00A896] tracking-wider font-bold">Step 2</div>
          <h3 class="text-2xl font-black text-[#15337C]">Engage Every Tenant</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Tenants receive clean, itemized rent bills via WhatsApp or Email on the 1st of every month with an instant button to pay via UPI or Card.
          </p>
        </div>

        <div class="koshpal-card p-8 space-y-4 bg-white">
          <div class="text-xs font-black uppercase text-[#2563EB] tracking-wider font-bold">Step 3</div>
          <h3 class="text-2xl font-black text-[#15337C]">Reconcile on Autopilot</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Every payment is logged automatically with instant digital receipts, updated statements, and zero manual bookkeeping.
          </p>
        </div>

      </div>
    </div>
  </section>

  <!-- SECTION 5: INTERACTIVE DUAL EXPERIENCE SWITCHER (LANDLORD VS RESIDENT) -->
  <!-- RESIDENT HUB ANCHOR -->
  <div id="resident-hub" class="scroll-mt-24"></div>
  <section id="dual-experience" class="py-24 px-6 max-w-6xl mx-auto space-y-8">
    <div class="koshpal-card p-8 sm:p-12 space-y-8 bg-gradient-to-b from-white to-slate-50/70 border border-slate-200">
      
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-[#2546A6] text-xs font-bold">
          <svg class="w-3.5 h-3.5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          <span>Interactive App Experience</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Experience Both Sides of PropLedger</h2>
        <p class="text-xs sm:text-sm text-slate-500">Toggle between the Landlord Management Console and the Resident Portal below.</p>
        
        <!-- Toggle Switcher -->
        <div class="inline-flex p-1.5 rounded-full bg-slate-100 border border-slate-200 gap-2 mt-4">
          <button onclick="switchExperience('landlord')" id="tabBtnLandlord" class="pill-btn px-6 py-2.5 text-xs font-bold active-tab flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path></svg>
            <span>Landlord Experience</span>
          </button>
          <button onclick="switchExperience('tenant')" id="tabBtnTenant" class="pill-btn px-6 py-2.5 text-xs font-bold inactive-tab flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>Resident & Tenant Portal</span>
          </button>
        </div>
      </div>

      <!-- VIEW A: LANDLORD CONSOLE PREVIEW -->
      <div id="viewLandlord" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-medium block">Total Monthly Rent Collected</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-2xl font-black text-slate-900 tabular-nums">₹36,40,000.00</span>
              <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">+8.4%</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Settled via UPI & Direct NetBanking</p>
          </div>

          <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-medium block">Occupancy Rate</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-2xl font-black text-slate-900 tabular-nums">99.2%</span>
              <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">56 / 60 Flats</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Only 4 flats available</p>
          </div>

          <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-medium block">Double-Booking Collision Rate</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-2xl font-black text-[#2546A6] tabular-nums">0.00%</span>
              <span class="text-xs font-bold text-[#2546A6] bg-blue-50 px-2 py-0.5 rounded-full">Protected</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Calendar locking active</p>
          </div>
        </div>

        <!-- Landlord Live Units List -->
        <div class="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 class="font-bold text-sm text-slate-900">Current Unit Roster & Lease Tracking</h4>
              <p class="text-xs text-slate-500">Real-time status of all apartments under management</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <input type="text" id="rosterSearchInput" oninput="filterRosterTable()" placeholder="Search unit, tenant, or rent..." class="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2546A6] transition">
              <button onclick="exportRentRollCsv()" class="pill-btn px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition" title="Download Excel/CSV Spreadsheet">
                <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Export CSV</span>
              </button>
              <button onclick="openAddUnitModal()" class="pill-btn px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke-width="2.5" stroke-linecap="round"/></svg>
                <span>Add Unit</span>
              </button>
              <button onclick="dispatchBatchBills()" id="batchDispatchBtn" class="pill-btn px-4 py-2 bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition">
                <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                <span>Send Invoices</span>
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th class="py-2.5">Unit</th>
                  <th class="py-2.5">Type</th>
                  <th class="py-2.5">Tenant</th>
                  <th class="py-2.5">Rent / Month</th>
                  <th class="py-2.5">Lease Status</th>
                  <th class="py-2.5 text-right">Payment</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 101</td>
                  <td class="py-3 text-slate-600">1-Bed Studio</td>
                  <td class="py-3 text-slate-800 font-medium">Sarah Connor</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">$1,650.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-600 font-bold">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 204</td>
                  <td class="py-3 text-slate-600">2-Bed Suite</td>
                  <td class="py-3 text-slate-800 font-medium">Rajesh Patel</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">$2,400.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-600 font-bold">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 402</td>
                  <td class="py-3 text-slate-600">Horizon Penthouse</td>
                  <td class="py-3 text-slate-800 font-medium">Alex Morgan</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">$2,850.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-600 font-bold">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 503</td>
                  <td class="py-3 text-slate-600">Skyline Loft</td>
                  <td class="py-3 text-slate-400 italic">None (Vacant)</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">$3,100.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px]">Available Now</span></td>
                  <td class="py-3 text-right"><button onclick="openTourModal('Unit 503 &bull; Skyline Loft', '$3,100 / mo', '1,850 sq ft &bull; 2 Bed', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')" class="text-[#2546A6] hover:underline font-bold">+ Schedule Tour</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div id="batchDispatchNotice" class="hidden p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-mono"></div>
        </div>
      </div>

      <!-- VIEW B: TENANT CONSOLE PREVIEW -->
      <div id="viewTenant" class="hidden space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div class="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=120&q=80" alt="Apartment" class="w-12 h-12 rounded-2xl object-cover">
              <div>
                <h4 class="font-bold text-sm text-slate-900">Oberoi Sky City Residences</h4>
                <p class="text-xs text-slate-500">Unit 402 &bull; Mumbai Resident Hub</p>
              </div>
            </div>
            
            <div class="space-y-2 pt-2 text-xs border-t border-slate-100">
              <div class="flex justify-between text-slate-600">
                <span>Lease Period:</span>
                <span class="font-medium text-slate-900">Sep 2026 – Aug 2027</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Next Rent Due:</span>
                <span class="font-bold text-[#2546A6]">October 01, 2026</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Parking Bay:</span>
                <span class="font-medium text-slate-900">Covered Bay #14</span>
              </div>
            </div>

            <!-- AutoPay Quick Strip -->
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                </div>
                <div>
                  <p class="text-[11px] font-bold text-slate-900">AutoPay (1st of month)</p>
                  <p id="autopayStatusText" class="text-[10px] text-emerald-600 font-medium">Active &bull; HDFC UPI AutoPay (ananya@okhdfcbank)</p>
                </div>
              </div>
              <button id="autopayToggleBtn" onclick="toggleAutoPay()" role="switch" aria-checked="true" class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-600 transition-colors duration-200 ease-in-out focus:outline-none">
                <span id="autopayToggleKnob" class="translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>

            <button onclick="openPaymentModal()" class="w-full py-3 rounded-2xl bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-xs shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition">
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <span>Pay October Rent (₹65,000.00)</span>
            </button>
          </div>

          <div class="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span class="text-[10px] font-bold text-[#2546A6] uppercase tracking-wider">Transparent Resident Statement</span>
                <h4 class="font-bold text-base text-slate-900">Statement #STM-202609-0402</h4>
              </div>
              <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                &bull; Reconciled & Clear
              </span>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <div>
                  <span class="font-bold text-slate-800 block">Residential Apartment Base Rent</span>
                  <span class="text-slate-500 text-[11px]">Monthly base rent for 3 BHK Unit 402</span>
                </div>
                <span class="font-bold text-slate-900 tabular-nums self-center">₹55,000.00</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <div>
                  <span class="font-bold text-slate-800 block">Reserved Covered Car Parking Bay #14</span>
                  <span class="text-slate-500 text-[11px]">Dedicated stall with remote fob access</span>
                </div>
                <span class="font-bold text-slate-900 tabular-nums self-center">₹3,500.00</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <div>
                  <span class="font-bold text-slate-800 block">Society Maintenance & Clubhouse Amenities</span>
                  <span class="text-slate-500 text-[11px]">24/7 Security, power backup, lifts & gym maintenance</span>
                </div>
                <span class="font-bold text-slate-900 tabular-nums self-center">₹6,500.00</span>
              </div>
            </div>

            <div class="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="text-xs text-slate-500 block">Total Statement Balance</span>
                <span class="text-2xl font-black text-emerald-600 tabular-nums">₹65,000.00</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <button onclick="openMaintenanceModal()" class="pill-btn px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                  <span>Report Repair</span>
                </button>
                <button onclick="openLeaseModal()" class="pill-btn px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <span>View Lease</span>
                </button>
                <button onclick="downloadStatementPdf()" class="pill-btn px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span>Download PDF</span>
                </button>
                <button onclick="openPaymentModal()" class="pill-btn px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition">
                  Pay Now &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- SECTION 6: UNIT GALLERY (APARTMENTS SHOWCASE) -->
  <section id="unit-gallery" class="py-16 px-6 max-w-6xl mx-auto space-y-8">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2546A6] text-xs font-bold mb-2">
          <svg class="w-3.5 h-3.5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path></svg>
          <span>Prime Indian Metropolitan Residencies</span>
        </div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Featured Rental Apartments</h2>
        <p class="text-xs sm:text-sm text-slate-500">Explore verified luxury homes available in Mumbai, Bengaluru, Pune, and Gurugram.</p>
      </div>

      <!-- Search and Filter Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-auto w-full md:w-auto">
        <div class="relative">
          <svg class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="unitSearchInput" oninput="filterUnitsCombined()" placeholder="Search residences..." class="pl-8 pr-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2546A6] transition w-full sm:w-44">
        </div>
        <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200 overflow-x-auto">
          <button onclick="setBedroomFilter('all', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold active-tab">All</button>
          <button onclick="setBedroomFilter('studio', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab">Studio</button>
          <button onclick="setBedroomFilter('2bed', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab">2-Bed</button>
          <button onclick="setBedroomFilter('penthouse', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab">Penthouse</button>
          <button onclick="setBedroomFilter('available', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab">Available</button>
        </div>
      </div>
    </div>
    
    <div class="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
      <span id="unitResultsCount">Showing 4 of 4 Luxury Residences</span>
      <span class="text-emerald-700 font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Live Inventory Guaranteed</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- Unit Card 1 -->
      <div class="koshpal-card overflow-hidden group unit-card" data-status="leased" data-type="studio">
        <div class="relative h-48 overflow-hidden bg-slate-100">
          <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80" alt="Executive Studio" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wide">
            Leased
          </span>
        </div>
        <div class="p-5 space-y-3">
          <div>
            <span class="text-[11px] font-bold text-slate-500 uppercase">Borivali East &bull; Mumbai</span>
            <h3 class="text-base font-bold text-slate-900">1 BHK Executive Modern Studio</h3>
            <p class="text-xs text-slate-500 font-medium mt-0.5">540 sq ft &bull; 1 Bed &bull; 1 Bath &bull; Unit 101</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 block">Monthly Rent</span>
              <span class="text-lg font-black text-[#2546A6] tabular-nums">₹32,000</span>
            </div>
            <button onclick="openTourModal('Unit 101 &bull; 1 BHK Studio &bull; Mumbai', '₹32,000 / mo', '540 sq ft &bull; 1 Bed &bull; 1 Bath', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
              Schedule Tour &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- Unit Card 2 -->
      <div class="koshpal-card overflow-hidden group unit-card" data-status="leased" data-type="2bed">
        <div class="relative h-48 overflow-hidden bg-slate-100">
          <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80" alt="Modern 2-Bedroom" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wide">
            Leased
          </span>
        </div>
        <div class="p-5 space-y-3">
          <div>
            <span class="text-[11px] font-bold text-slate-500 uppercase">Kadubeesanahalli &bull; Bengaluru</span>
            <h3 class="text-base font-bold text-slate-900">2 BHK Modern Tech Park Suite</h3>
            <p class="text-xs text-slate-500 font-medium mt-0.5">1,150 sq ft &bull; 2 Bed &bull; 2 Bath &bull; Unit 204</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 block">Monthly Rent</span>
              <span class="text-lg font-black text-[#2546A6] tabular-nums">₹52,000</span>
            </div>
            <button onclick="openTourModal('Unit 204 &bull; 2 BHK Suite &bull; Bengaluru', '₹52,000 / mo', '1,150 sq ft &bull; 2 Bed &bull; 2 Bath', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
              Schedule Tour &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- Unit Card 3 -->
      <div class="koshpal-card overflow-hidden group unit-card" data-status="leased" data-type="penthouse">
        <div class="relative h-48 overflow-hidden bg-slate-100">
          <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" alt="Horizon Penthouse" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#2546A6] backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wide">
            Penthouse
          </span>
        </div>
        <div class="p-5 space-y-3">
          <div>
            <span class="text-[11px] font-bold text-slate-500 uppercase">Kharadi &bull; Pune</span>
            <h3 class="text-base font-bold text-slate-900">3 BHK Luxury Sky Penthouse</h3>
            <p class="text-xs text-slate-500 font-medium mt-0.5">2,400 sq ft &bull; 3 Bed &bull; 3 Bath &bull; Unit 402</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 block">Monthly Rent</span>
              <span class="text-lg font-black text-[#2546A6] tabular-nums">₹1,25,000</span>
            </div>
            <button onclick="openTourModal('Unit 402 &bull; 3 BHK Penthouse &bull; Pune', '₹1,25,000 / mo', '2,400 sq ft &bull; 3 Bed &bull; 3 Bath', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#2546A6] text-xs font-bold transition">
              Schedule Tour &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- Unit Card 4 -->
      <div class="koshpal-card overflow-hidden group unit-card" data-status="available" data-type="2bed">
        <div class="relative h-48 overflow-hidden bg-slate-100">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" alt="Skyline Loft" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wide animate-pulse">
            Available Now
          </span>
        </div>
        <div class="p-5 space-y-3">
          <div>
            <span class="text-[11px] font-bold text-slate-500 uppercase">Golf Course Road &bull; Gurugram</span>
            <h3 class="text-base font-bold text-slate-900">3 BHK Panoramic Cyber Loft</h3>
            <p class="text-xs text-slate-500 font-medium mt-0.5">1,850 sq ft &bull; 3 Bed &bull; 3 Bath &bull; Unit 503</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 block">Monthly Rent</span>
              <span class="text-lg font-black text-[#2546A6] tabular-nums">₹1,45,000</span>
            </div>
            <button onclick="openTourModal('Unit 503 &bull; 3 BHK High-Rise &bull; Gurugram', '₹1,45,000 / mo', '1,850 sq ft &bull; 3 Bed &bull; 3 Bath', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition">
              Apply / Tour &rarr;
            </button>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- SECTION 7: INTERACTIVE LANDLORD ROI CALCULATOR -->
  <section id="roi-calculator" class="py-20 px-6 max-w-6xl mx-auto relative">
    <div class="relative rounded-[36px] overflow-hidden shadow-2xl border border-slate-200/80">
      <!-- Open-Source Luxury Loft Interior Backdrop (Unsplash License) -->
      <div class="absolute inset-0 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80" alt="Luxury Residence Interior" class="w-full h-full object-cover object-center opacity-15">
        <div class="absolute inset-0 bg-white/92 backdrop-blur-md"></div>
      </div>
      <div class="relative z-10 p-8 sm:p-12 space-y-8">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
          <svg class="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <span>Landlord Profit & Efficiency Calculator</span>
        </div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Calculate Your Time & Money Saved</h2>
        <p class="text-xs sm:text-sm text-slate-500">See how much manual paperwork PropLedger eliminates for your rental portfolio.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
        <!-- Sliders -->
        <div class="space-y-6">
          <div class="space-y-2">
            <div class="flex justify-between text-xs font-bold text-slate-800">
              <span>Total Units You Manage:</span>
              <span id="sliderUnitsVal" class="text-[#2546A6] font-bold text-sm tabular-nums">12 Units</span>
            </div>
            <input type="range" id="sliderUnits" min="1" max="100" value="12" oninput="calculateRoi()" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2546A6]">
            <div class="flex justify-between text-[11px] text-slate-400">
              <span>1 Unit</span>
              <span>50 Units</span>
              <span>100+ Units</span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-xs font-bold text-slate-800">
              <span>Average Rent per Unit:</span>
              <span id="sliderRentVal" class="text-[#2546A6] font-bold text-sm tabular-nums">₹45,000 / mo</span>
            </div>
            <input type="range" id="sliderRent" min="15000" max="250000" step="2500" value="45000" oninput="calculateRoi()" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2546A6]">
            <div class="flex justify-between text-[11px] text-slate-400">
              <span>₹15,000</span>
              <span>₹1,00,000</span>
              <span>₹2,50,000</span>
            </div>
          </div>
        </div>

        <!-- Real-Time Metrics Output (Navy Card) -->
        <div class="p-7 sm:p-8 bg-[#0B1B3D] text-white space-y-4 rounded-[28px] shadow-xl border border-white/10">
          <span class="text-xs font-bold text-[#00A896] uppercase tracking-wider block">Estimated Automated Impact</span>
          
          <div class="space-y-3">
            <div>
              <span class="text-xs text-slate-400 block">Monthly Rental Revenue Managed:</span>
              <p id="outRevenue" class="text-2xl sm:text-3xl font-black text-white tabular-nums">₹5,40,000 / mo</p>
            </div>
            <div class="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-slate-400 block">Hours Saved / Month:</span>
                <p id="outHours" class="text-xl font-bold text-[#2DD4BF] tabular-nums">36 Hours</p>
              </div>
              <div>
                <span class="text-xs text-slate-400 block">Annual Savings:</span>
                <p id="outSavings" class="text-xl font-bold text-[#38BDF8] tabular-nums">₹1,44,000 / yr</p>
              </div>
            </div>
          </div>

          <p class="text-[11px] text-slate-400 leading-relaxed pt-2">
            Eliminates paper receipts, phone rent reminders, bank reconciliation, and spreadsheet formula repairs.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 8: COMMONLY ASKED QUESTIONS (Koshpal Exact Style) -->
  <section id="faq" class="py-20 px-6 bg-slate-50 border-t border-slate-200/80">
    <div class="max-w-4xl mx-auto space-y-8">
      
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#E0E7FF] text-[#1E3A8A] text-xs font-bold">
          <svg class="w-3.5 h-3.5 text-[#1E3A8A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span>Frequently Asked Questions</span>
        </div>
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Commonly asked <span class="text-[#00A896]">questions</span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500">Everything you need to know about getting started with PropLedger.</p>
      </div>

      <!-- FAQ Search Bar -->
      <div class="max-w-md mx-auto relative">
        <svg class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="faqSearchInput" oninput="filterFaqQuestions()" placeholder="Search questions (e.g. payments, leases, deposits, AutoPay)..." class="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#2546A6] focus:ring-1 focus:ring-[#2546A6] shadow-sm transition">
      </div>

      <div class="space-y-3" id="faqAccordionList">
        
        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all" open>
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>Do I need any technical or accounting skills?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            No! PropLedger was built specifically for ordinary landlords and property owners. If you can send a text or open an email, you can manage your properties in PropLedger without any issues.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>How does the system stop double-booked apartments?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            PropLedger has built-in calendar protection. Once an apartment is booked for specific dates (e.g., September 1 to August 31), the system automatically locks the schedule and physically prevents any other booking for that same unit during those dates. You will never experience double-booked units.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>How do tenants receive and pay their rent bills?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            On the 1st of every month, your tenants receive a friendly automated statement by email. It contains an itemized breakdown of rent, parking, and utilities, with a secure 1-click button to pay online via Bank ACH or Card.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>Can residents set up automatic monthly rent payments (AutoPay)?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            Yes! Residents can toggle AutoPay with one click from their resident portal. Rent is automatically cleared on the 1st of each month with instant digital receipts sent to both tenant and landlord.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>How do security deposits and move-out refunds work?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            Security deposits are tracked in a dedicated digital ledger. When a lease finishes and the move-out inspection is completed, refunds can be initiated back to the resident's original bank account with an itemized closing receipt.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>Can I manage multiple properties and buildings at once?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            Yes. PropLedger is built for any size portfolio. You can add unlimited properties, buildings, and apartments. The system tracks each unit individually while giving you an all-in-one financial summary across all your buildings.
          </p>
        </details>

      </div>

    </div>
  </section>

    <!-- SECTION 9: ENTERPRISE SECURITY & RELIABILITY INFOGRAPHICS -->
  <section id="security" class="py-24 px-6 bg-[#0B1736] text-white relative overflow-hidden">
    <!-- Open-Source Architectural Night Skyline Backdrop (Unsplash License) -->
    <div class="absolute inset-0 pointer-events-none">
      <img src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=80" alt="Architectural Skyline" class="w-full h-full object-cover object-center opacity-20 mix-blend-luminosity filter saturate-150">
      <div class="absolute inset-0 bg-gradient-to-b from-[#0B1736]/90 via-[#0B1736]/80 to-[#0B1736]"></div>
    </div>
    <!-- Blueprint Grid overlay -->
    <div class="absolute inset-0 pointer-events-none opacity-20" style="background-image: linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px); background-size: 48px 48px;"></div>
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-[#00A896]/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-6xl mx-auto space-y-16 relative z-10">
      
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto space-y-4">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-200 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></span>
          <span>Enterprise-Grade Security &amp; 99.9% Reliability</span>
        </div>
        <h2 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Protected by <span class="text-[#38BDF8]">Bank-Grade Security</span>
        </h2>
        <p class="text-blue-200/80 text-sm sm:text-base leading-relaxed">
          PropLedger safeguards your rental operations with end-to-end encryption, automated schedule conflict prevention, and 24/7 cloud reliability.
        </p>
      </div>

      <!-- 4 Pillars of Trust Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Pillar 1 -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#38BDF8]/50 transition shadow-lg">
          <div class="w-10 h-10 rounded-xl bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center font-mono font-bold text-base">
            01
          </div>
          <div>
            <span class="text-[10px] text-[#38BDF8] uppercase font-bold tracking-wider block">Data Protection</span>
            <h4 class="text-base font-bold text-white mt-1">256-Bit Bank Encryption</h4>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Encrypted online rent payments</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Private resident personal data</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Secure digital lease document storage</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Strict role-based account access</span></li>
          </ul>
        </div>

        <!-- Pillar 2 -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#2563EB]/50 transition shadow-lg">
          <div class="w-10 h-10 rounded-xl bg-[#2563EB]/20 text-[#60A5FA] flex items-center justify-center font-mono font-bold text-base">
            02
          </div>
          <div>
            <span class="text-[10px] text-[#60A5FA] uppercase font-bold tracking-wider block">Scheduling Accuracy</span>
            <h4 class="text-base font-bold text-white mt-1">Double-Booking Defense</h4>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Automated calendar locks</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Zero overlapping lease dates</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Instant move-in date verification</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>No human double-entry mistakes</span></li>
          </ul>
        </div>

        <!-- Pillar 3 -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#00A896]/50 transition shadow-lg">
          <div class="w-10 h-10 rounded-xl bg-[#00A896]/20 text-[#2DD4BF] flex items-center justify-center font-mono font-bold text-base">
            03
          </div>
          <div>
            <span class="text-[10px] text-[#2DD4BF] uppercase font-bold tracking-wider block">Financial Precision</span>
            <h4 class="text-base font-bold text-white mt-1">Automatic Bookkeeping</h4>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Instant payment matching</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Automated receipts for tenants</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Full audit trail for every dollar</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>One-click tax &amp; profit summaries</span></li>
          </ul>
        </div>

        <!-- Pillar 4 -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-400/50 transition shadow-lg">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-base">
            04
          </div>
          <div>
            <span class="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Cloud Uptime</span>
            <h4 class="text-base font-bold text-white mt-1">99.99% Reliability</h4>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>24/7 online tenant rent portal</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Continuous automatic backups</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Fast loading on phone &amp; desktop</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Instant maintenance alerts</span></li>
          </ul>
        </div>
      </div>

      <!-- Comparison: Traditional Spreadsheets vs PropLedger Protected Platform -->
      <div class="bg-white/5 border border-white/10 rounded-[32px] p-8 sm:p-10 space-y-8">
        <div class="border-b border-white/10 pb-6">
          <span class="text-xs font-bold text-[#00A896] uppercase tracking-wider">Operations Comparison</span>
          <h3 class="text-2xl font-black text-white mt-1">Traditional Property Methods vs. PropLedger Protected Platform</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- The Old Way -->
          <div class="bg-red-950/20 border border-red-500/20 rounded-2xl p-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold">&times;</div>
              <h4 class="text-base font-bold text-red-200">The Old Way (Spreadsheets &amp; Paper Receipts)</h4>
            </div>
            <ul class="text-xs text-red-300/90 space-y-2.5">
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Tenants forget payment dates, requiring awkward manual reminders</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Risk of double-booking an apartment between different managers</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Hours spent every month manually calculating expenses and matching bank statements</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Lost paper checks, missing receipts, and stressful tax season audits</span></li>
            </ul>
          </div>

          <!-- The PropLedger Way -->
          <div class="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">&check;</div>
              <h4 class="text-base font-bold text-emerald-200">The PropLedger Way (Automated &amp; Protected)</h4>
            </div>
            <ul class="text-xs text-emerald-300 space-y-2.5">
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Automated friendly statements sent on the 1st of every month</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Smart calendar protection physically prevents any overlapping bookings</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Rent clears online with instant digital receipts for both tenant and landlord</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Clear, exportable financial statements ready anytime with zero manual math</span></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Trust Metrics & Badges -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-1.5 shadow-lg">
          <div class="text-3xl sm:text-4xl font-black text-white tabular-nums">99.99%</div>
          <div class="text-xs text-[#00A896] font-bold uppercase tracking-wider">Uptime SLA</div>
          <p class="text-[11px] text-slate-400">Always available for residents</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-1.5 shadow-lg">
          <div class="text-3xl sm:text-4xl font-black text-[#38BDF8] tabular-nums">0.00%</div>
          <div class="text-xs text-[#38BDF8] font-bold uppercase tracking-wider">Double-Booking Rate</div>
          <p class="text-[11px] text-slate-400">Protected calendar locks</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-1.5 shadow-lg">
          <div class="text-3xl sm:text-4xl font-black text-emerald-400 tabular-nums">256-Bit</div>
          <div class="text-xs text-emerald-400 font-bold uppercase tracking-wider">Bank Security</div>
          <p class="text-[11px] text-slate-400">Encrypted financial processing</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-1.5 shadow-lg">
          <div class="text-3xl sm:text-4xl font-black text-[#F59E0B] tabular-nums">24/7</div>
          <div class="text-xs text-[#F59E0B] font-bold uppercase tracking-wider">Automated Billing</div>
          <p class="text-[11px] text-slate-400">Effortless rent collection</p>
        </div>
      </div>

      <!-- Customer Callout Card -->
      <div class="p-8 rounded-3xl bg-gradient-to-r from-[#15337C] to-[#1D45A3] border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div class="space-y-1 text-center sm:text-left">
          <h4 class="text-xl font-black text-white">Ready to simplify your rental operations?</h4>
          <p class="text-xs text-blue-100">See how easy it is to manage your properties, collect rent online, and maintain crystal-clear financial records.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button onclick="openTourModal('Oberoi Sky City Luxury Suites', '₹32,000 - ₹1,45,000 / mo', 'Full Portfolio Inventory', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-6 py-3 bg-white text-[#15337C] hover:bg-slate-100 font-black text-xs shadow-lg transition flex items-center gap-1.5">
            <span>Request a Free Demo</span>
            <span>&rarr;</span>
          </button>
          <a href="#concierge" class="pill-btn px-5 py-3 border border-white/40 hover:border-white text-white font-bold text-xs transition">
            Contact Support
          </a>
        </div>
      </div>

    </div>
  </section>

  <!-- SECTION 10: RESIDENT SUPPORT & CONCIERGE DESK -->
  <section id="concierge" class="py-24 px-6 relative overflow-hidden bg-slate-900">
    <!-- Open-Source Luxury Concierge Lounge Backdrop (Unsplash License) -->
    <div class="absolute inset-0 pointer-events-none">
      <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=80" alt="Luxury Concierge Lounge" class="w-full h-full object-cover object-center opacity-25">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-950"></div>
    </div>
    <div class="max-w-4xl mx-auto relative z-10">
      <div class="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 sm:p-12 space-y-7 shadow-2xl border border-white/20">
      <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
        <div class="w-10 h-10 rounded-2xl bg-blue-50 text-[#2546A6] flex items-center justify-center font-bold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900">Contact Resident Support & Concierge</h2>
          <p class="text-xs text-slate-500">Inquiries route directly to our dedicated property operations desk</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Your Name</label>
          <input id="pubName" type="text" placeholder="John Doe" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:bg-white focus:border-[#2546A6] focus:outline-none transition">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Your Email</label>
          <input id="pubEmail" type="email" placeholder="john@example.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:bg-white focus:border-[#2546A6] focus:outline-none transition">
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Subject</label>
        <input id="pubSubject" type="text" value="Question about rental management" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:bg-white focus:border-[#2546A6] focus:outline-none transition">
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Message</label>
        <textarea id="pubMessage" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:bg-white focus:border-[#2546A6] focus:outline-none transition">Hello, I would like to learn more about setting up PropLedger for my rental property.</textarea>
      </div>

      <button id="pubBtn" onclick="submitPublicQuery()" class="w-full py-3.5 px-6 rounded-2xl bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        <span>Send Inquiry to Concierge Team</span>
      </button>

      <div id="pubStatus" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
      
      <!-- VIP Concierge Service Guarantees -->
      <div class="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-slate-600">
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-bold text-slate-900">&check; 2-Hour Response</p>
          <p class="text-[10px] text-slate-500">Dedicated desk</p>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-bold text-slate-900">&check; Private Tours</p>
          <p class="text-[10px] text-slate-500">In-person &amp; virtual</p>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-bold text-slate-900">&check; Zero Paperwork</p>
          <p class="text-[10px] text-slate-500">100% digital leases</p>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-bold text-slate-900">&check; Escrow Protection</p>
          <p class="text-[10px] text-slate-500">Safe security deposits</p>
        </div>
      </div>
    </div>
  </section>

  <!-- KOSHPAL DEEP NAVY BLUEPRINT FOOTER -->
  <footer class="koshpal-footer-bg py-16 px-6 text-white border-t border-white/10 mt-16">
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
      
      <!-- Brand column -->
      <div class="space-y-4 md:col-span-2">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="11" height="11" rx="5.5" fill="#38BDF8" />
            <rect x="17" y="4" width="11" height="11" rx="5.5" fill="#2563EB" />
            <rect x="4" y="17" width="11" height="11" rx="5.5" fill="#00A896" />
            <rect x="17" y="17" width="11" height="11" rx="5.5" fill="#ffffff" />
          </svg>
          <span class="font-black text-2xl tracking-tight text-white">PropLedger</span>
        </div>
        <p class="text-xs text-blue-200/80 leading-relaxed max-w-sm">
          Where property operations and financial clarity make sense. Smart booking protection, automated monthly billing, and effortless rent collection.
        </p>
        <p class="text-xs text-slate-400 font-medium">
          Inquiries: support@propledger.vishalbhutekar.me
        </p>
      </div>

      <!-- Links Column 1 -->
      <div class="space-y-2.5 text-xs">
        <p class="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Navigation</p>
        <p><a href="#overview" class="text-blue-200 hover:text-white transition">Overview</a></p>
        <p><a href="#why-it-matters" class="text-blue-200 hover:text-white transition">Why It Matters</a></p>
        <p><a href="#what-we-do" class="text-blue-200 hover:text-white transition">What We Do</a></p>
        <p><a href="#dual-experience" class="text-blue-200 hover:text-white transition">Dual Experience</a></p>
        <p><a href="#roi-calculator" class="text-blue-200 hover:text-white transition">ROI Calculator</a></p>
      </div>

      <!-- Links Column 2 -->
      <div class="space-y-2.5 text-xs">
        <p class="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Trust &amp; Platform</p>
        <p><a href="#security" class="text-blue-200 hover:text-white transition flex items-center gap-1"><span class="text-[#00A896]">&bull;</span><span>Enterprise Security</span></a></p>
        <p><a href="#unit-gallery" class="text-blue-200 hover:text-white transition">Luxury Residences</a></p>
        <p><a href="#roi-calculator" class="text-blue-200 hover:text-white transition">Savings Calculator</a></p>
        <p><a href="#faq" class="text-blue-200 hover:text-white transition">Knowledge Base &amp; FAQ</a></p>
        <p><a href="#concierge" class="text-blue-200 hover:text-white transition">Contact Concierge</a></p>
      </div>

    </div>

    <div class="max-w-6xl mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300/70">
      <p>&copy; 2026 PropLedger Technologies. All rights reserved. Built for modern property owners and residents.</p>
      <p class="text-blue-300/50">TLS 1.3 Protected &bull; 99.9% Cloud Uptime</p>
    </div>
  </footer>

  <!-- Floating Quick-Action Capsule Dock (Koshpal Style) -->
  <div class="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
    <div class="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-full px-5 py-2.5 shadow-[0_12px_36px_-4px_rgba(16,24,40,0.14)] flex items-center gap-2 sm:gap-4 transition hover:scale-[1.02]">
      <button onclick="openPaymentModal()" class="flex items-center gap-1.5 text-xs font-bold text-white bg-[#2546A6] hover:bg-[#1D367E] px-4 py-2 rounded-full shadow-sm transition">
        <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
        <span>Pay Rent</span>
      </button>
      <button onclick="openTourModal('Oberoi Sky City Luxury Suites', '₹32,000 - ₹1,45,000 / mo', 'Full Suite Inventory', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80')" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span class="hidden sm:inline">Schedule Tour</span>
        <span class="sm:hidden">Tour</span>
      </button>
      <button onclick="openMaintenanceModal()" class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        <span>Resident Desk</span>
      </button>
      <a href="#faq" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>FAQ</span>
      </a>
      <a href="#concierge" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span class="hidden sm:inline">Concierge</span>
      </a>
    </div>
  </div>

  <!-- 1. INTERACTIVE PAYMENT MODAL & DIGITAL RECEIPT -->
  <div id="paymentModal" onclick="if(event.target === this) closePaymentModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-[#2546A6] flex items-center justify-center font-black">
            <svg class="w-5 h-5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Secure Rent Settlement</h3>
            <p class="text-xs text-slate-500 font-medium">Oberoi Sky City Residences &bull; Unit 402</p>
          </div>
        </div>
        <button onclick="closePaymentModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm">
          &times;
        </button>
      </div>

      <!-- Main Payment Flow Container -->
      <div id="paymentFlowContainer" class="space-y-5">
        <!-- Payment Method Switcher -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Select Payment Method</label>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <button onclick="setPayMethod('upi')" id="pmUpi" class="p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition">
              UPI / QR (0% Fee)
            </button>
            <button onclick="setPayMethod('netbanking')" id="pmNetbanking" class="p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition">
              NetBanking
            </button>
            <button onclick="setPayMethod('card')" id="pmCard" class="p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition">
              Debit / Card
            </button>
          </div>
        </div>

        <!-- Dynamic Payment Method Details -->
        <div id="payDetailsUpi" class="p-4 rounded-2xl space-y-3 bg-slate-50 border border-slate-200/80">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wide">Instant UPI Transfer</span>
            <span class="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full font-mono">&check; Instant Settlement</span>
          </div>
          <div class="space-y-2">
            <label class="block text-[11px] font-bold text-slate-700 uppercase">Enter Virtual Payment Address (VPA / UPI ID)</label>
            <div class="flex items-center gap-2">
              <input type="text" id="upiInputId" value="ananya@okhdfcbank" class="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono font-medium focus:outline-none focus:border-[#2546A6]">
              <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">&check; Verified</span>
            </div>
          </div>
          <div class="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span>Supported: <strong>GPay, PhonePe, Paytm, BHIM</strong></span>
            <span>Zero Processing Fees</span>
          </div>
        </div>

        <div id="payDetailsNetbanking" class="hidden p-4 rounded-2xl space-y-3 bg-slate-50 border border-slate-200/80">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wide">Select Your Bank</span>
            <span class="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 font-semibold px-2 py-0.5 rounded-full font-mono">NEFT / RTGS</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button type="button" class="p-2 rounded-xl border-2 border-[#2546A6] bg-white text-xs font-bold text-slate-800 text-center">HDFC Bank</button>
            <button type="button" class="p-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 text-center hover:border-slate-300">ICICI Bank</button>
            <button type="button" class="p-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 text-center hover:border-slate-300">SBI</button>
            <button type="button" class="p-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 text-center hover:border-slate-300">Axis Bank</button>
          </div>
        </div>

        <div id="payDetailsCard" class="hidden p-4 rounded-2xl space-y-3 bg-slate-50 border border-slate-200/80">
          <div class="space-y-1">
            <label class="block text-[11px] font-bold text-slate-700 uppercase">Cardholder Name</label>
            <input type="text" value="Ananya Iyer" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium">
          </div>
          <div class="space-y-1">
            <label class="block text-[11px] font-bold text-slate-700 uppercase">RuPay / Visa / MasterCard Number</label>
            <input type="text" value="4524 •••• •••• 9821" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 font-medium">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Expires</label>
              <input type="text" value="08 / 29" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 font-medium">
            </div>
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">CVV</label>
              <input type="text" value="•••" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 font-medium">
            </div>
          </div>
        </div>

        <!-- Itemized Balance Display -->
        <div class="p-4 rounded-2xl space-y-2 text-xs bg-slate-50 border border-slate-200/80">
          <div class="flex justify-between text-slate-600">
            <span>Base Apartment Rent (Unit 402):</span>
            <span class="font-bold text-slate-800 tabular-nums">₹55,000.00</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Reserved Covered Parking Bay #14:</span>
            <span class="font-bold text-slate-800 tabular-nums">₹3,500.00</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Society Maintenance & Clubhouse Amenities:</span>
            <span class="font-bold text-slate-800 tabular-nums">₹6,500.00</span>
          </div>
          <div class="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
            <span class="text-slate-900">Total Cleared Balance:</span>
            <span class="text-emerald-600 tabular-nums text-base font-black">₹65,000.00</span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="space-y-3">
          <button id="paySubmitBtn" onclick="processTestPayment()" class="w-full py-3.5 rounded-2xl bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-sm shadow-md shadow-blue-900/25 flex items-center justify-center gap-2 transition">
            <span>Confirm & Pay ₹65,000.00</span>
            <span>&rarr;</span>
          </button>
          <p class="text-[11px] text-center text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>256-Bit Bank Grade Encryption &bull; Instant Payment Confirmation</span>
          </p>
        </div>
      </div>

      <!-- Success Receipt View -->
      <div id="paymentReceiptContainer" class="hidden space-y-5">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black mx-auto shadow-inner">
            &check;
          </div>
          <h4 class="text-xl font-black text-slate-900">Payment Settled & Reconciled!</h4>
          <p class="text-xs text-slate-500">Funds transferred and registered in PropLedger subledger.</p>
        </div>

        <div class="p-5 rounded-2xl space-y-3.5 bg-slate-50 border border-slate-200 text-xs font-mono">
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Transaction ID:</span>
            <span class="font-bold text-slate-900">TXN-2026-UPI-98214</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Cleared Amount:</span>
            <span class="font-bold text-emerald-600 text-sm">₹65,000.00 INR</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Resident / Unit:</span>
            <span class="font-bold text-slate-900">Ananya Iyer &bull; Unit 402, Oberoi Sky City</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Settlement Method:</span>
            <span class="font-bold text-slate-900" id="receiptMethodText">Automated Bank ACH (Chase)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Timestamp:</span>
            <span class="text-slate-700" id="receiptTimestamp">Sep 12, 2026 &bull; Real-time</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <button onclick="window.print()" class="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition">
            <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Print Receipt</span>
          </button>
          <button onclick="downloadStatementPdf()" class="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition">
            <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Download PDF</span>
          </button>
          <button onclick="closePaymentModal()" class="flex-1 py-3 rounded-xl bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition">
            <span>Done</span>
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- 2. INTERACTIVE SCHEDULE TOUR & APPLICATION MODAL -->
  <div id="tourModal" onclick="if(event.target === this) closeTourModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-[#2546A6] flex items-center justify-center font-black">
            <svg class="w-5 h-5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Schedule Private Tour & Apply</h3>
            <p class="text-xs text-slate-500 font-medium" id="tourModalSubtitle">Oberoi Sky City Residences Luxury Suites</p>
          </div>
        </div>
        <button onclick="closeTourModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm">
          &times;
        </button>
      </div>

      <!-- Unit Preview Snapshot -->
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
        <img id="tourUnitImg" src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=160&q=80" alt="Apartment preview" class="w-16 h-16 rounded-xl object-cover">
        <div>
          <h4 id="tourUnitTitle" class="font-bold text-sm text-slate-900">Unit 503 &bull; Panoramic Skyline Loft</h4>
          <p id="tourUnitSpecs" class="text-xs text-slate-500 font-medium">1,850 sq ft &bull; 2 Bed &bull; 2.5 Bath</p>
          <p id="tourUnitRent" class="text-xs font-black text-[#2546A6] tabular-nums mt-0.5">₹75,000 / mo</p>
        </div>
      </div>

      <div id="tourFormContainer" class="space-y-4">
        <!-- Tour Type Toggle -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Tour Experience</label>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button type="button" onclick="setTourType('person')" id="ttPerson" class="p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path></svg>
              <span>In-Person Tour</span>
            </button>
            <button type="button" onclick="setTourType('video')" id="ttVideo" class="p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center hover:border-slate-300 flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              <span>4K Virtual Walkthrough</span>
            </button>
          </div>
        </div>

        <!-- Preferred Time Slot -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Preferred Date & Time</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button type="button" onclick="setTourTime(this)" class="p-2 rounded-xl border-2 border-[#2546A6] bg-blue-50/40 font-bold text-[#2546A6] text-center">
              Tomorrow 10:30 AM
            </button>
            <button type="button" onclick="setTourTime(this)" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300">
              Tomorrow 2:00 PM
            </button>
            <button type="button" onclick="setTourTime(this)" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300">
              Saturday 11:00 AM
            </button>
            <button type="button" onclick="setTourTime(this)" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300">
              Sunday 3:30 PM
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Your Full Name</label>
            <input id="tourName" type="text" placeholder="Rajesh Patel" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
            <input id="tourPhone" type="tel" placeholder="+1 (555) 019-2834" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
          </div>
        </div>

        <div class="text-xs">
          <label class="block font-bold text-slate-700 uppercase mb-1">Email Address for Tour Invitation</label>
          <input id="tourEmail" type="email" placeholder="alex@example.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
        </div>

        <button id="tourSubmitBtn" onclick="submitTourRequest()" class="w-full py-3.5 rounded-2xl bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-xs shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition">
          <span>Confirm Tour & Receive Application Packet &rarr;</span>
        </button>
      </div>

      <div id="tourSuccessCard" class="hidden space-y-4 text-center py-4">
        <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mx-auto">
          &check;
        </div>
        <h4 class="text-lg font-bold text-slate-900">Tour Reservation Confirmed!</h4>
        <p class="text-xs text-slate-600 max-w-sm mx-auto" id="tourSuccessMsg">
          A calendar invite and application link have been forwarded to your email. Our concierge desk will meet you at the primary lobby.
        </p>
        <button onclick="closeTourModal()" class="pill-btn px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold">
          Close Window
        </button>
      </div>
    </div>
  </div>

  <!-- 3. INTERACTIVE RESIDENT MAINTENANCE & REPAIR MODAL -->
  <div id="maintenanceModal" onclick="if(event.target === this) closeMaintenanceModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
            <svg class="w-5 h-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Resident Maintenance Desk</h3>
            <p class="text-xs text-slate-500 font-medium">Unit 402 &bull; Ananya Iyer</p>
          </div>
        </div>
        <button onclick="closeMaintenanceModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm">
          &times;
        </button>
      </div>

      <div id="maintFormContainer" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Your Full Name</label>
            <input id="maintResidentName" type="text" value="Ananya Iyer" placeholder="Enter your full name" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Your Email (for updates)</label>
            <input id="maintResidentEmail" type="email" value="ananya.iyer@gmail.com" placeholder="email@example.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Flat / Unit Number</label>
          <input id="maintResidentUnit" type="text" value="Unit 402, Oberoi Sky City" placeholder="e.g. Unit 402" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
        </div>

        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Issue Category</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button type="button" onclick="setMaintCategory(this, 'Plumbing & Water')" class="p-2 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-left flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
              <span>Plumbing / Leak</span>
            </button>
            <button type="button" onclick="setMaintCategory(this, 'HVAC & Climate')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"></path></svg>
              <span>HVAC / A/C</span>
            </button>
            <button type="button" onclick="setMaintCategory(this, 'Electrical & Lighting')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>Electrical</span>
            </button>
            <button type="button" onclick="setMaintCategory(this, 'Kitchen Appliance')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="4" y1="10" x2="20" y2="10"></line><line x1="15" y1="4" x2="15" y2="6"></line><line x1="15" y1="14" x2="15" y2="18"></line></svg>
              <span>Appliances</span>
            </button>
            <button type="button" onclick="setMaintCategory(this, 'Lock & Keycard')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-1.5 1.5L14 9l-3-3-4 4 3 3-5 5a2.12 2.12 0 0 0 3 3l5-5 3 3 4-4-3-3 3.5-3.5L22 4z"></path><circle cx="7.5" cy="16.5" r="1.5"></circle></svg>
              <span>Key & Fob</span>
            </button>
            <button type="button" onclick="setMaintCategory(this, 'General Repair')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              <span>Other Repair</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Urgency Level</label>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" onclick="setMaintUrgency(this, 'Routine')" class="p-2 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center">
              Routine (48h)
            </button>
            <button type="button" onclick="setMaintUrgency(this, 'Priority')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300">
              Priority (24h)
            </button>
            <button type="button" onclick="setMaintUrgency(this, 'Emergency')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300">
              Emergency (24/7)
            </button>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Problem Details</label>
          <textarea id="maintDescription" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none" placeholder="Describe the issue (e.g. Master bathroom sink pressure is low)...">Master bathroom sink hot water valve has minor dripping.</textarea>
        </div>

        <div class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-pointer hover:bg-slate-100 transition">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <span>Attach Photo or Video (Optional)</span>
        </div>

        <button id="maintSubmitBtn" onclick="submitMaintenanceTicket()" class="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition">
          <span>Submit Maintenance Ticket &rarr;</span>
        </button>
      </div>

      <div id="maintSuccessCard" class="hidden space-y-4 text-center py-4 font-mono">
        <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mx-auto">
          &check;
        </div>
        <h4 class="text-base font-bold text-slate-900">Work Order Created: TKT-2026-402-918</h4>
        <p class="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
          Assigned to: <strong>Maintenance Specialist Suresh Kumar</strong><br>
          A technician has been assigned to Unit 402. Email updates will be delivered via Resend notifications.
        </p>
        <button onclick="closeMaintenanceModal()" class="pill-btn px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-sans">
          Close Window
        </button>
      </div>
    </div>
  </div>

  <!-- 3. ADD APARTMENT UNIT MODAL (Landlord Tool) -->
  <div id="addUnitModal" onclick="if(event.target === this) closeAddUnitModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 modal-card-animate overflow-hidden">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke-width="2.5" stroke-linecap="round"/></svg>
          </div>
          <div>
            <h4 class="font-bold text-base text-slate-900">Add New Apartment</h4>
            <p class="text-xs text-slate-500">Register a unit into your property roster</p>
          </div>
        </div>
        <button onclick="closeAddUnitModal()" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>

      <div class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-slate-700 uppercase mb-1">Unit Identifier</label>
          <input type="text" id="newUnitId" placeholder="e.g. Unit 305" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Floor Plan</label>
            <select id="newUnitType" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
              <option value="1-Bed Studio">1-Bed Studio</option>
              <option value="1-Bed Luxury">1-Bed Luxury</option>
              <option value="2-Bed Suite" selected>2-Bed Suite</option>
              <option value="3-Bed Townhome">3-Bed Townhome</option>
              <option value="Penthouse">Penthouse</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Monthly Rent (₹)</label>
            <input type="number" id="newUnitRent" placeholder="45000" value="45000" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 uppercase mb-1">Assigned Resident Name (Optional)</label>
          <input type="text" id="newUnitTenant" placeholder="Leave blank if currently vacant" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
        </div>
      </div>

      <div class="pt-2 flex items-center justify-end gap-2.5">
        <button onclick="closeAddUnitModal()" class="pill-btn px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition">Cancel</button>
        <button onclick="submitNewUnit()" class="pill-btn px-5 py-2.5 bg-[#2546A6] hover:bg-[#1D367E] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5">
          <span>Save to Property Roster</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 4. VIEW LEASE AGREEMENT MODAL (Resident & Landlord Tool) -->
  <div id="leaseModal" onclick="if(event.target === this) closeLeaseModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 modal-card-animate overflow-hidden max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-[#2546A6] flex items-center justify-center font-bold">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <div>
            <h4 class="font-bold text-base text-slate-900">Residential Lease Agreement</h4>
            <p class="text-xs text-slate-500">Contract #LSE-2026-402-01 &bull; Active</p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
          &check; Digitally Signed
        </span>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs leading-relaxed">
        <div class="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/60">
          <div>
            <span class="text-slate-500 block">Property &amp; Unit:</span>
            <span class="font-bold text-slate-900">Oberoi Sky City &bull; Unit 402, Mumbai</span>
          </div>
          <div>
            <span class="text-slate-500 block">Primary Resident:</span>
            <span class="font-bold text-slate-900">Ananya Iyer</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/60">
          <div>
            <span class="text-slate-500 block">Lease Term:</span>
            <span class="font-bold text-slate-900">Sep 01, 2026 – Aug 31, 2027</span>
          </div>
          <div>
            <span class="text-slate-500 block">Monthly Rent:</span>
            <span class="font-bold text-emerald-600">₹65,000.00 / month</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pb-2">
          <div>
            <span class="text-slate-500 block">Security Deposit:</span>
            <span class="font-bold text-slate-900">₹1,50,000.00 (Security Deposit in Escrow)</span>
          </div>
          <div>
            <span class="text-slate-500 block">Parking Stall:</span>
            <span class="font-bold text-slate-900">Assigned Bay #14</span>
          </div>
        </div>
      </div>

      <div class="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 text-blue-900 text-xs flex items-center gap-2.5">
        <svg class="w-4 h-4 text-[#2546A6] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>This lease is locked into the schedule. Overlapping bookings are permanently prevented.</span>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-100">
        <button onclick="window.print()" class="pill-btn px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          <span>Print Agreement</span>
        </button>
        <button onclick="closeLeaseModal()" class="pill-btn px-6 py-2 bg-[#2546A6] hover:bg-[#1D367E] text-white text-xs font-bold transition">Done</button>
      </div>
    </div>
  </div>

  <script>

    // ── Toast Notification System ──────────────────────────────────
    function showToast(title, message, type) {
      type = type || 'success';
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const toast = document.createElement('div');
      const isSuccess = type === 'success';
      const bgClass = 'bg-white border-slate-200 text-slate-800';
      const iconColor = isSuccess ? 'text-emerald-600 bg-emerald-50' : 'text-[#2546A6] bg-blue-50';
      const iconSvg = isSuccess 
        ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/></svg>';
      
      toast.className = 'pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 transform translate-y-2 opacity-0 transition-all duration-300 ' + bgClass;
      toast.innerHTML = '<div class="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ' + iconColor + '">' + iconSvg + '</div>' +
        '<div class="flex-1 min-w-0"><p class="text-xs font-bold text-slate-900">' + title + '</p><p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">' + message + '</p></div>' +
        '<button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 text-base font-bold ml-1">&times;</button>';
      
      container.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      });
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-4');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // ── Mobile Navigation Drawer Toggle ────────────────────────────
    let mobileNavOpen = false;
    function toggleMobileNav() {
      mobileNavOpen = !mobileNavOpen;
      const drawer = document.getElementById('mobileNavDrawer');
      const hamIcon = document.getElementById('hamburgerIcon');
      const closeIcon = document.getElementById('closeNavIcon');
      if (!drawer) return;

      if (mobileNavOpen) {
        drawer.classList.remove('hidden');
        requestAnimationFrame(() => {
          drawer.classList.remove('scale-95', 'opacity-0');
          drawer.classList.add('scale-100', 'opacity-100');
        });
        if (hamIcon) hamIcon.classList.add('hidden');
        if (closeIcon) closeIcon.classList.remove('hidden');
      } else {
        drawer.classList.remove('scale-100', 'opacity-100');
        drawer.classList.add('scale-95', 'opacity-0');
        setTimeout(() => drawer.classList.add('hidden'), 250);
        if (hamIcon) hamIcon.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
      }
    }

    // ── Export Rent Roll as CSV Spreadsheet ────────────────────────
    function exportRentRollCsv() {
      const rows = [
        ['Unit', 'Floor Plan Type', 'Resident Name', 'Monthly Rent (USD)', 'Lease Status', 'Payment Status'],
        ['Unit 101', '1-Bed Studio', 'Sarah Connor', '1650.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 204', '2-Bed Suite', 'Rajesh Patel', '2400.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 402', 'Horizon Penthouse', 'Alex Morgan', '2850.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 503', 'Skyline Loft', 'Vacant', '3100.00', 'Available Now', 'Unoccupied']
      ];
      
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join(String.fromCharCode(10));
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'PropLedger_RentRoll_September2026.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Rent Roll Exported', 'Downloaded PropLedger_RentRoll_September2026.csv successfully.');
    }

    // ── Add Unit Modal Logic ───────────────────────────────────────
    function openAddUnitModal() {
      const m = document.getElementById('addUnitModal');
      if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
      }
    }

    function closeAddUnitModal() {
      const m = document.getElementById('addUnitModal');
      if (m) {
        m.classList.add('hidden');
        m.classList.remove('flex');
      }
    }

    function submitNewUnit() {
      const unitId = (document.getElementById('newUnitId') ? document.getElementById('newUnitId').value : '') || 'Unit 305';
      const unitType = (document.getElementById('newUnitType') ? document.getElementById('newUnitType').value : '2-Bed Suite');
      const rent = (document.getElementById('newUnitRent') ? document.getElementById('newUnitRent').value : '') || '2200';
      const tenant = (document.getElementById('newUnitTenant') ? document.getElementById('newUnitTenant').value.trim() : '') || 'None (Vacant)';
      const isVacant = tenant === 'None (Vacant)';

      const tbody = document.querySelector('#viewLandlord table tbody');
      if (tbody) {
        const tr = document.createElement('tr');
        tr.className = 'border-t border-slate-100 bg-emerald-50/30 transition';
        const formattedRent = '₹' + parseFloat(rent).toLocaleString('en-IN', { minimumFractionDigits: 2 });
        tr.innerHTML = '<td class="py-3 font-bold text-slate-900">' + unitId + '</td>' +
          '<td class="py-3 text-slate-600">' + unitType + '</td>' +
          '<td class="py-3 ' + (isVacant ? 'text-slate-400 italic' : 'text-slate-800 font-medium') + '">' + tenant + '</td>' +
          '<td class="py-3 font-bold text-slate-900">' + formattedRent + '</td>' +
          '<td class="py-3"><span class="px-2.5 py-1 rounded-full ' + (isVacant ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700') + ' font-semibold text-[11px]">' + (isVacant ? 'Available Now' : 'Active Lease') + '</span></td>' +
          '<td class="py-3 text-right"><span class="' + (isVacant ? 'text-amber-600' : 'text-emerald-600') + ' font-bold text-[11px]">' + (isVacant ? 'Vacant' : 'Active (Oct 01)') + '</span></td>';
        tbody.appendChild(tr);
      }

      closeAddUnitModal();
      showToast('Unit Added to Roster', unitId + ' (' + unitType + ') registered at ₹' + parseFloat(rent).toLocaleString('en-IN') + '/mo.');
    }

    // ── Filter Landlord Roster in Real Time ────────────────────────
    function filterRosterTable() {
      const q = (document.getElementById('rosterSearchInput') ? document.getElementById('rosterSearchInput').value.toLowerCase() : '');
      document.querySelectorAll('#viewLandlord table tbody tr').forEach(tr => {
        const text = tr.innerText.toLowerCase();
        tr.style.display = text.includes(q) ? '' : 'none';
      });
    }

    // ── AutoPay Enrollment Switch ──────────────────────────────────
    let autoPayEnabled = true;
    function toggleAutoPay() {
      autoPayEnabled = !autoPayEnabled;
      const btn = document.getElementById('autopayToggleBtn');
      const knob = document.getElementById('autopayToggleKnob');
      const statusText = document.getElementById('autopayStatusText');

      if (autoPayEnabled) {
        if (btn) btn.className = 'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-600 transition-colors duration-200 ease-in-out focus:outline-none';
        if (knob) knob.className = 'translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out';
        if (statusText) {
          statusText.innerText = 'Active • HDFC UPI AutoPay (ananya@okhdfcbank)';
          statusText.className = 'text-[10px] text-emerald-600 font-medium';
        }
        showToast('AutoPay Activated', 'Monthly rent ($3,250.00) will be automatically cleared on the 1st of every month.');
      } else {
        if (btn) btn.className = 'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-300 transition-colors duration-200 ease-in-out focus:outline-none';
        if (knob) knob.className = 'translate-x-0 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out';
        if (statusText) {
          statusText.innerText = 'Paused • Manual monthly payment required';
          statusText.className = 'text-[10px] text-amber-600 font-medium';
        }
        showToast('AutoPay Paused', 'Automatic rent deduction has been turned off.', 'info');
      }
    }

    // ── Digital Lease Agreement Modal ──────────────────────────────
    function openLeaseModal() {
      const m = document.getElementById('leaseModal');
      if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
      }
    }

    function closeLeaseModal() {
      const m = document.getElementById('leaseModal');
      if (m) {
        m.classList.add('hidden');
        m.classList.remove('flex');
      }
    }

    // ── Combined Unit Gallery Filter (Search + Bedroom category) ────
    let activeBedFilter = 'all';

    function setBedroomFilter(category, btn) {
      activeBedFilter = category;
      document.querySelectorAll('.bed-btn').forEach(b => {
        b.className = 'bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab';
      });
      btn.className = 'bed-btn pill-btn px-3 py-1 text-xs font-bold active-tab';
      filterUnitsCombined();
    }

    function filterUnitsCombined() {
      const search = (document.getElementById('unitSearchInput') ? document.getElementById('unitSearchInput').value.toLowerCase() : '');
      const cards = document.querySelectorAll('.unit-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const cardText = card.innerText.toLowerCase();
        const status = card.getAttribute('data-status');
        const type = card.getAttribute('data-type') || '';

        const matchesSearch = !search || cardText.includes(search);
        let matchesCategory = true;
        if (activeBedFilter === 'available') {
          matchesCategory = status === 'available';
        } else if (activeBedFilter !== 'all') {
          matchesCategory = type === activeBedFilter;
        }

        if (matchesSearch && matchesCategory) {
          card.style.display = 'block';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      const countEl = document.getElementById('unitResultsCount');
      if (countEl) {
        countEl.innerText = 'Showing ' + visibleCount + ' of ' + cards.length + ' Luxury Residences';
      }
    }

    // ── Filter FAQ Questions in Real Time ──────────────────────────
    function filterFaqQuestions() {
      const query = (document.getElementById('faqSearchInput') ? document.getElementById('faqSearchInput').value.toLowerCase() : '');
      document.querySelectorAll('#faqAccordionList details').forEach(d => {
        const text = d.innerText.toLowerCase();
        if (!query || text.includes(query)) {
          d.style.display = '';
          if (query) d.open = true;
        } else {
          d.style.display = 'none';
        }
      });
    }

    // 1. Dual Experience Switcher
    function switchExperience(type) {
      const landlordView = document.getElementById('viewLandlord');
      const tenantView = document.getElementById('viewTenant');
      const btnL = document.getElementById('tabBtnLandlord');
      const btnT = document.getElementById('tabBtnTenant');

      if (type === 'landlord') {
        landlordView.classList.remove('hidden');
        tenantView.classList.add('hidden');
        btnL.className = 'pill-btn px-6 py-2.5 text-xs font-bold active-tab flex items-center gap-1.5';
        btnT.className = 'pill-btn px-6 py-2.5 text-xs font-bold inactive-tab flex items-center gap-1.5';
      } else {
        landlordView.classList.add('hidden');
        tenantView.classList.remove('hidden');
        btnL.className = 'pill-btn px-6 py-2.5 text-xs font-bold inactive-tab flex items-center gap-1.5';
        btnT.className = 'pill-btn px-6 py-2.5 text-xs font-bold active-tab flex items-center gap-1.5';
      }
    }

    function dispatchBatchBills() {
      const btn = document.getElementById('batchDispatchBtn');
      const notice = document.getElementById('batchDispatchNotice');
      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-1">&#9696;</span> Dispatching across 402 units...';

      setTimeout(() => {
        notice.classList.remove('hidden');
        notice.innerHTML = '<strong>Batch Invoicing Complete!</strong><br>Successfully generated and emailed itemized statements across all 402 occupied units via Resend API.';
        btn.disabled = false;
        btn.innerHTML = '<span class="flex items-center justify-center gap-1.5"><svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Invoices Dispatched (402 Sent)</span></span>';
      }, 800);
    }

    // 2. Unit Gallery Filtering
    function filterUnits(category) {
      document.querySelectorAll('[id^="filterBtn-"]').forEach(b => {
        b.className = 'pill-btn px-4 py-1.5 text-xs font-bold inactive-tab';
      });
      document.getElementById('filterBtn-' + category).className = 'pill-btn px-4 py-1.5 text-xs font-bold active-tab';

      document.querySelectorAll('.unit-card').forEach(card => {
        if (category === 'all') {
          card.style.display = 'block';
        } else {
          card.style.display = card.getAttribute('data-status') === category ? 'block' : 'none';
        }
      });
    }

    // 3. ROI Calculator
    function calculateRoi() {
      const units = parseInt(document.getElementById('sliderUnits').value);
      const rent = parseInt(document.getElementById('sliderRent').value);

      document.getElementById('sliderUnitsVal').innerText = units + (units === 1 ? ' Unit' : ' Units');
      document.getElementById('sliderRentVal').innerText = '₹' + rent.toLocaleString('en-IN') + ' / mo';

      const monthlyRev = units * rent;
      const hoursSaved = Math.round(units * 3.2);
      const annualSavings = Math.round(units * 12000);

      document.getElementById('outRevenue').innerText = '₹' + monthlyRev.toLocaleString('en-IN') + ' / mo';
      document.getElementById('outHours').innerText = hoursSaved + ' Hours';
      document.getElementById('outSavings').innerText = '₹' + annualSavings.toLocaleString('en-IN') + ' / yr';
    }

    // 4. Payment Modal Logic
    
    function openPaymentModal() {
      const modal = document.getElementById('paymentModal');
      document.getElementById('paymentFlowContainer').classList.remove('hidden');
      document.getElementById('paymentReceiptContainer').classList.add('hidden');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closePaymentModal() {
      const modal = document.getElementById('paymentModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    let activePayMethod = 'upi';
    function setPayMethod(m) {
      activePayMethod = m;
      if (document.getElementById('pmUpi')) document.getElementById('pmUpi').className = m === 'upi' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';
      if (document.getElementById('pmNetbanking')) document.getElementById('pmNetbanking').className = m === 'netbanking' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';
      if (document.getElementById('pmCard')) document.getElementById('pmCard').className = m === 'card' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';

      if (document.getElementById('payDetailsUpi')) document.getElementById('payDetailsUpi').classList.toggle('hidden', m !== 'upi');
      if (document.getElementById('payDetailsNetbanking')) document.getElementById('payDetailsNetbanking').classList.toggle('hidden', m !== 'netbanking');
      if (document.getElementById('payDetailsCard')) document.getElementById('payDetailsCard').classList.toggle('hidden', m !== 'card');
    }

    function processTestPayment() {
      const btn = document.getElementById('paySubmitBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Step 1/3: Securing payment with 256-bit encryption...';

      setTimeout(() => {
        btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Step 2/3: Verifying payment details...';
      }, 500);

      setTimeout(() => {
        btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Step 3/3: Confirming bank clearance...';
      }, 900);

      setTimeout(() => {
        document.getElementById('paymentFlowContainer').classList.add('hidden');
        const receiptContainer = document.getElementById('paymentReceiptContainer');
        receiptContainer.classList.remove('hidden');

        const methodMap = {
          'ach': 'Automated Bank ACH (Chase Checking • 8421)',
          'card': 'Debit / Credit Card (Visa • 4242)',
          'apple': 'Apple Pay Biometric Clearance'
        };
        document.getElementById('receiptMethodText').innerText = methodMap[activePayMethod] || 'Automated Clearing House';
        document.getElementById('receiptTimestamp').innerText = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US');
        playLottie('lottiePaymentSuccess', '/animations/payment-success.json', '<div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black shadow-inner">&check;</div>');
        btn.disabled = false;
        btn.innerHTML = '<span>Confirm & Pay ₹65,000.00</span><span>&rarr;</span>';
      }, 1400);
    }

    // 5. Schedule Tour Modal Logic
    let selectedTourType = 'In-Person Tour';
    let selectedTourSlot = 'Tomorrow 10:30 AM';

    function openTourModal(title, rent, specs, img) {
      document.getElementById('tourUnitTitle').innerHTML = title;
      document.getElementById('tourUnitRent').innerText = rent;
      document.getElementById('tourUnitSpecs').innerHTML = specs;
      if (img) document.getElementById('tourUnitImg').src = img;
      document.getElementById('tourFormContainer').classList.remove('hidden');
      document.getElementById('tourSuccessCard').classList.add('hidden');
      const modal = document.getElementById('tourModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeTourModal() {
      const modal = document.getElementById('tourModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function setTourType(t) {
      selectedTourType = t === 'person' ? 'In-Person Tour' : '4K Virtual Walkthrough';
      document.getElementById('ttPerson').className = t === 'person' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center hover:border-slate-300';
      document.getElementById('ttVideo').className = t === 'video' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center hover:border-slate-300';
    }

    function setTourTime(btn) {
      btn.parentElement.querySelectorAll('button').forEach(b => {
        b.className = 'p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300';
      });
      btn.className = 'p-2 rounded-xl border-2 border-[#2546A6] bg-blue-50/40 font-bold text-[#2546A6] text-center';
      selectedTourSlot = btn.innerText.trim();
    }

    async function submitTourRequest() {
      const btn = document.getElementById('tourSubmitBtn');
      const name = document.getElementById('tourName').value || 'Prospective Resident';
      const email = document.getElementById('tourEmail').value || 'resident@example.com';
      const phone = document.getElementById('tourPhone').value || 'Unspecified';
      const unit = document.getElementById('tourUnitTitle').innerText;

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Registering reservation...';

      try {
        await fetch('/api/public/tour-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            email: email,
            phone: phone,
            unit: unit,
            tourType: selectedTourType,
            slot: selectedTourSlot
          })
        });
      } catch (e) {
        console.error(e);
      }

      document.getElementById('tourFormContainer').classList.add('hidden');
      document.getElementById('tourSuccessCard').classList.remove('hidden');
      playLottie('lottieTourSuccess', '/animations/tour-success.json', '<div class="w-12 h-12 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-xl font-bold">&check;</div>');
      document.getElementById('tourSuccessMsg').innerHTML = 'Tour confirmed for <strong>' + selectedTourSlot + '</strong> (' + selectedTourType + '). An invitation and digital lease packet have been emailed to ' + email + '.';
      btn.disabled = false;
      btn.innerHTML = '<span>Confirm Tour & Receive Application Packet &rarr;</span>';
    }

    // 6. Resident Maintenance Desk Logic
    let maintCategory = 'Plumbing & Water';
    let maintUrgency = 'Routine';

    function openMaintenanceModal() {
      document.getElementById('maintFormContainer').classList.remove('hidden');
      document.getElementById('maintSuccessCard').classList.add('hidden');
      const modal = document.getElementById('maintenanceModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeMaintenanceModal() {
      const modal = document.getElementById('maintenanceModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function setMaintCategory(btn, cat) {
      btn.parentElement.querySelectorAll('button').forEach(b => {
        b.className = 'p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300';
      });
      btn.className = 'p-2 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-left';
      maintCategory = cat;
    }

    function setMaintUrgency(btn, urg) {
      btn.parentElement.querySelectorAll('button').forEach(b => {
        b.className = 'p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300';
      });
      btn.className = 'p-2 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center';
      maintUrgency = urg;
    }

    async function submitMaintenanceTicket() {
      const btn = document.getElementById('maintSubmitBtn');
      const desc = document.getElementById('maintDescription') ? document.getElementById('maintDescription').value : '';
      const residentName = document.getElementById('maintResidentName') ? document.getElementById('maintResidentName').value.trim() : '';
      const residentEmail = document.getElementById('maintResidentEmail') ? document.getElementById('maintResidentEmail').value.trim() : '';
      const residentUnit = document.getElementById('maintResidentUnit') ? document.getElementById('maintResidentUnit').value.trim() : '';

      if (!residentName || !desc) {
        showToast('Missing Info', 'Please enter your name and describe the issue before submitting.', 'info');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Submitting your request...';

      try {
        const resp = await fetch('/api/public/submit-maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            residentName: residentName || 'Resident',
            unit: residentUnit || 'Not specified',
            email: residentEmail,
            category: maintCategory,
            urgency: maintUrgency,
            description: desc,
            property: 'PropLedger Property'
          })
        });
        const result = await resp.json();
        document.getElementById('maintFormContainer').classList.add('hidden');
        document.getElementById('maintSuccessCard').classList.remove('hidden');
        if (document.getElementById('maintTicketId')) {
          document.getElementById('maintTicketId').innerText = result.ticketId || 'TSK-CONFIRMED';
        }
        playLottie('lottieMaintSuccess', '/animations/maint-success.json', '<div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">&check;</div>');
      } catch (e) {
        showToast('Request Failed', 'Something went wrong. Please try again or call the office.', 'info');
      }
      btn.disabled = false;
      btn.innerHTML = '<span>Submit Maintenance Request &rarr;</span>';
    }

    // 7. Download Statement Helper
    function downloadStatementPdf() {
      window.print();
    }

    // 8. Public Query Form Handler
    async function submitPublicQuery() {
      const btn = document.getElementById('pubBtn');
      const statusBox = document.getElementById('pubStatus');
      const name = document.getElementById('pubName').value || 'Resident';
      const email = document.getElementById('pubEmail').value || 'resident@example.com';
      const subject = document.getElementById('pubSubject').value;
      const message = document.getElementById('pubMessage').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Forwarding to concierge desk...';
      statusBox.className = 'p-4 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Connecting with property concierge desk...';

      try {
        const resp = await fetch('/api/support-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: name, senderEmail: email, subject: subject, message: message })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Inquiry Forwarded Successfully!</strong><br>Our team has received your inquiry and will respond directly to ' + email + '.';
        } else {
          statusBox.className = 'p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Status notice: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 block text-xs leading-relaxed';
        statusBox.innerHTML = '<strong>Something went wrong.</strong> Please try again or email us at support@propledger.vishalbhutekar.me';
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg><span>Send Inquiry to Concierge Desk</span>';
      }
    }

    // Explicit global bindings for inline event attributes
    window.showToast = showToast;
    window.toggleMobileNav = toggleMobileNav;
    window.exportRentRollCsv = exportRentRollCsv;
    window.openAddUnitModal = openAddUnitModal;
    window.closeAddUnitModal = closeAddUnitModal;
    window.submitNewUnit = submitNewUnit;
    window.filterRosterTable = filterRosterTable;
    window.toggleAutoPay = toggleAutoPay;
    window.openLeaseModal = openLeaseModal;
    window.closeLeaseModal = closeLeaseModal;
    window.setBedroomFilter = setBedroomFilter;
    window.filterUnitsCombined = filterUnitsCombined;
    window.filterFaqQuestions = filterFaqQuestions;
    window.switchExperience = switchExperience;

    // ── Dedicated Resident Hub Routing ─────────────────────────────
    function navigateToResidentHub(e) {
      if (e && e.preventDefault) e.preventDefault();
      switchExperience('tenant');
      if (history.pushState) {
        history.pushState(null, null, '#resident-hub');
      } else {
        location.hash = '#resident-hub';
      }
      setTimeout(() => {
        const el = document.getElementById('resident-hub');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
    window.navigateToResidentHub = navigateToResidentHub;

    function handleHashRouting() {
      if (window.location.hash === '#resident-hub') {
        switchExperience('tenant');
        setTimeout(() => {
          const el = document.getElementById('resident-hub');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
    window.addEventListener('hashchange', handleHashRouting);
    window.addEventListener('DOMContentLoaded', handleHashRouting);
    handleHashRouting();

    window.dispatchBatchBills = dispatchBatchBills;
    window.filterUnits = filterUnits;
    window.calculateRoi = calculateRoi;
    window.openPaymentModal = openPaymentModal;
    window.closePaymentModal = closePaymentModal;
    window.setPayMethod = setPayMethod;
    window.processTestPayment = processTestPayment;
    window.openTourModal = openTourModal;
    window.closeTourModal = closeTourModal;
    window.setTourType = setTourType;
    window.setTourTime = setTourTime;
    window.submitTourRequest = submitTourRequest;
    window.openMaintenanceModal = openMaintenanceModal;
    window.closeMaintenanceModal = closeMaintenanceModal;
    window.setMaintCategory = setMaintCategory;
    window.setMaintUrgency = setMaintUrgency;
    window.submitMaintenanceTicket = submitMaintenanceTicket;
    window.downloadStatementPdf = downloadStatementPdf;
    window.submitPublicQuery = submitPublicQuery;

    // Resident Hub: Request Statement
    async function requestStatement() {
      const btn = document.getElementById('stmtBtn');
      const statusBox = document.getElementById('stmtStatus');
      const name = document.getElementById('stmtName').value.trim() || 'Resident';
      const unit = document.getElementById('stmtUnit').value.trim();
      const email = document.getElementById('stmtEmail').value.trim();
      const month = document.getElementById('stmtMonth').value;

      if (!email) {
        statusBox.className = 'text-xs p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 block';
        statusBox.innerHTML = 'Please enter your email address to receive the statement.';
        statusBox.classList.remove('hidden');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-1">&#9696;</span> Sending...';

      try {
        const resp = await fetch('/api/public/request-statement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ residentName: name, unit, email, monthYear: month })
        });
        const data = await resp.json();
        statusBox.className = 'text-xs p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 block';
        statusBox.innerHTML = data.message || 'Statement sent to ' + email;
        statusBox.classList.remove('hidden');
      } catch(e) {
        statusBox.className = 'text-xs p-3 rounded-xl border border-red-200 bg-red-50 text-red-800 block';
        statusBox.innerHTML = 'Something went wrong. Please try again.';
        statusBox.classList.remove('hidden');
      }
      btn.disabled = false;
      btn.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> Email My Statement';
    }
    window.requestStatement = requestStatement;

    // Resident Hub: Load announcements
    async function loadAnnouncements() {
      const list = document.getElementById('announcementsList');
      const badge = document.getElementById('annBadge');
      if (!list) return;
      try {
        const resp = await fetch('/api/public/announcements');
        const data = await resp.json();
        const anns = data.announcements || [];
        if (anns.length === 0) {
          list.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No announcements at this time. Check back soon.</p>';
          if (badge) badge.innerText = '0 Notices';
          return;
        }
        if (badge) badge.innerText = anns.length + ' Notice' + (anns.length > 1 ? 's' : '');
        const priorityStyles = {
          urgent: { bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', text: 'text-red-700', label: 'Urgent' },
          warning: { bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', text: 'text-amber-700', label: 'Notice' },
          info: { bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700', label: 'Info' }
        };
        list.innerHTML = anns.map(a => {
          const s = priorityStyles[a.priority] || priorityStyles.info;
          return '<div class="p-3.5 rounded-xl border ' + s.bg + '">' +
            '<div class="flex items-start gap-2.5">' +
              '<span class="mt-1 w-2 h-2 rounded-full ' + s.dot + ' flex-shrink-0"></span>' +
              '<div class="flex-1">' +
                '<div class="flex items-center justify-between gap-2 mb-0.5">' +
                  '<p class="text-xs font-bold text-slate-900">' + a.title + '</p>' +
                  '<span class="text-[10px] font-bold ' + s.text + ' flex-shrink-0">' + a.postedAt + '</span>' +
                '</div>' +
                '<p class="text-xs text-slate-600 leading-relaxed">' + a.body + '</p>' +
                (a.expiresAt ? '<p class="text-[10px] text-slate-400 mt-1">Expires: ' + a.expiresAt + '</p>' : '') +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      } catch(e) {
        list.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Could not load announcements. Please refresh the page.</p>';
      }
    }

    // Auto-load announcements on page load and refresh every 5 min
    loadAnnouncements();
    setInterval(loadAnnouncements, 5 * 60 * 1000);

    // Dismiss any open modal on Escape key press
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePaymentModal();
        closeTourModal();
        closeMaintenanceModal();
        closeAddUnitModal();
        closeLeaseModal();
      }
    });
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MASTER ADMIN PORTAL: admin.propledger.vishalbhutekar.me
// Executive Master Operations & Infrastructure Control Center
// ─────────────────────────────────────────────────────────────────────────────
function renderAdminPage(hostname) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropLedger Executive Operations Center | Master Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Figtree', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f8fafc; color: #0f172a; -webkit-font-smoothing: antialiased; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .soft-card { background: #ffffff; border: 1px solid rgba(226, 232, 240, 0.85); border-radius: 24px; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02); transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .soft-card:hover { box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.07), 0 4px 10px -2px rgba(0, 0, 0, 0.02); }
    .soft-inner { background: #f8fafc; border: 1px solid #edf2f7; border-radius: 16px; }
    .pill-btn { border-radius: 9999px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .pill-btn:hover { transform: translateY(-1px); }
    .tab-active { background-color: #1e293b !important; color: #ffffff !important; box-shadow: 0 4px 14px -2px rgba(15, 23, 42, 0.25); }
    .chart-tooltip { pointer-events: none; transition: opacity 0.15s ease, transform 0.15s ease; }
    .modal-backdrop { background-color: rgba(15, 23, 42, 0.5); backdrop-filter: blur(8px); }
    /* ── Lucide SVG Icon Normalization (iconstack MCP) ── */
    .tab-btn svg { width: 16px; height: 16px; flex-shrink: 0; vertical-align: middle; }
    .tab-btn .inline-flex { display: inline-flex; align-items: center; }
    .tab-btn .inline-flex svg { width: 16px; height: 16px; }
    #toastContainer svg { display: inline; vertical-align: middle; }
    #toastContainer .inline-flex { display: inline-flex; align-items: center; }
    /* Kanban advance button arrow SVG */
    .advance-btn svg.inline { width: 12px; height: 12px; display: inline; vertical-align: middle; margin-left: 2px; }
  </style>
<script>window.__INITIAL_ADMIN_DATA__ = ${JSON.stringify(globalAdminStore)};</script>
</head>
<body class="min-h-screen antialiased bg-slate-50 text-slate-900 pb-32">

  <!-- Toast Container -->
  <div id="toastContainer" class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"></div>

  <!-- Sticky Executive Header -->
  <div class="sticky top-4 z-50 px-4 max-w-7xl mx-auto">
    <header class="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-full px-6 py-3.5 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.06)] flex items-center justify-between">
      
      <!-- Brand & Subdomain -->
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center font-black text-lg text-white shadow-md shadow-emerald-500/20">
          P
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">PropLedger Executive</span>
            <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Operations Center
            </span>
          </div>
          <p class="text-[11px] text-slate-500 font-mono tracking-tight flex items-center gap-2">
            <span>${hostname}</span>
            <span class="text-slate-300">&bull;</span>
            <span id="liveClock" class="text-slate-600 font-semibold"></span>
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-3">
        <div class="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 font-mono">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span id="currentDateBadge">Saturday, Sep 12, 2026</span>
        </div>
        
        <a href="https://propledger.vishalbhutekar.me" class="pill-btn text-xs font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          <span>Public Portal</span>
        </a>
      </div>
    </header>
  </div>

  <!-- Main Executive Dashboard Container -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

    <!-- Top Executive Navigation Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button onclick="switchTab('properties')" id="tabBtn-properties" class="tab-btn tab-active px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap">
        <span class="inline-flex shrink-0"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg></span>
        <span>Properties & Units</span>
        <span id="badge-propCount" class="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-800 font-mono font-bold">3</span>
      </button>

      <button onclick="switchTab('users')" id="tabBtn-users" class="tab-btn px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap">
        <span class="inline-flex shrink-0"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg></span>
        <span>User Management</span>
        <span id="badge-userCount" class="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-800 font-mono font-bold">7</span>
      </button>

      <button onclick="switchTab('financials')" id="tabBtn-financials" class="tab-btn px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap">
        <span class="inline-flex shrink-0"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16h8"/><path d="M7 11h12"/><path d="M7 6h3"/></svg></span>
        <span>Financials & Profits</span>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">73.9% Net</span>
      </button>

      <button onclick="switchTab('tasks')" id="tabBtn-tasks" class="tab-btn px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap">
        <span class="inline-flex shrink-0"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/></svg></span>
        <span>Real-Time Tasks</span>
        <span id="badge-taskCount" class="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono font-bold">5</span>
      </button>

      <button onclick="switchTab('activity')" id="tabBtn-activity" class="tab-btn px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap">
        <span class="inline-flex shrink-0"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg></span>
        <span>Today's Activity</span>
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      </button>

      <button onclick="switchTab('diagnostics')" id="tabBtn-diagnostics" class="tab-btn px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap">
        <span class="inline-flex shrink-0"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg></span>
        <span>System & Mail</span>
      </button>
    </div>

    <!-- ──────────────────────────────────────────────────────────────────── -->
    <!-- TAB 1: PROPERTIES & UNITS -->
    <!-- ──────────────────────────────────────────────────────────────────── -->
    <div id="tabContent-properties" class="tab-pane space-y-6">
      
      <!-- KPI Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Properties Managed</p>
          <div class="flex items-baseline justify-between mt-2">
            <span id="stat-totalProperties" class="text-2xl sm:text-3xl font-black text-slate-900">3</span>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">100% Active</span>
          </div>
          <p class="text-xs text-slate-500 mt-2">Mumbai, Bengaluru, Pune & Gurugram</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Units</p>
          <div class="flex items-baseline justify-between mt-2">
            <span id="stat-totalUnits" class="text-2xl sm:text-3xl font-black text-slate-900">48</span>
            <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">46 Occupied</span>
          </div>
          <p class="text-xs text-slate-500 mt-2">2 Units In Turnover</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</p>
          <div class="flex items-baseline justify-between mt-2">
            <span id="stat-occupancyRate" class="text-2xl sm:text-3xl font-black text-emerald-700">95.8%</span>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">+2.1% MoM</span>
          </div>
          <p class="text-xs text-slate-500 mt-2">Industry avg: 92.4%</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Monthly Roll</p>
          <div class="flex items-baseline justify-between mt-2">
            <span id="stat-grossRentRoll" class="text-2xl sm:text-3xl font-black text-slate-900">₹36,40,000</span>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">Sep 2026</span>
          </div>
          <p class="text-xs text-slate-500 mt-2">Annualized: ₹4.36 Cr</p>
        </div>
      </div>

      <!-- Action & Filter Bar -->
      <div class="soft-card p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div class="relative flex-1 sm:w-80">
            <input type="text" id="propertySearch" oninput="filterProperties()" placeholder="Search properties, address, city..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition">
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button onclick="setPropFilter('all')" class="prop-filter-btn px-3 py-1.5 rounded-lg font-bold bg-white text-slate-900 shadow-sm" data-filter="all">All</button>
            <button onclick="setPropFilter('Multifamily')" class="prop-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="Multifamily">Multifamily</button>
            <button onclick="setPropFilter('Residential')" class="prop-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="Residential">Residential</button>
            <button onclick="setPropFilter('Commercial')" class="prop-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="Commercial">Commercial</button>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <button onclick="openModal('addPropertyModal')" class="pill-btn px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Add New Property</span>
          </button>
          <button onclick="openModal('addUnitModal')" class="pill-btn px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 flex items-center gap-2">
            <span>+ Add Unit</span>
          </button>
        </div>
      </div>

      <!-- Properties Roster Grid -->
      <div id="propertiesGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    </div>

    <!-- ──────────────────────────────────────────────────────────────────── -->
    <!-- TAB 2: USER MANAGEMENT & ROLES -->
    <!-- ──────────────────────────────────────────────────────────────────── -->
    <div id="tabContent-users" class="tab-pane hidden space-y-6">
      
      <!-- Users KPI Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Directory Accounts</p>
          <p id="stat-usersTotal" class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">7</p>
          <p class="text-xs text-slate-500 mt-2">Across all 5 permission roles</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Residents & Tenants</p>
          <p id="stat-usersTenants" class="text-2xl sm:text-3xl font-black text-blue-600 mt-2">3</p>
          <p class="text-xs text-slate-500 mt-2">Active leases on file</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Property Managers</p>
          <p id="stat-usersManagers" class="text-2xl sm:text-3xl font-black text-indigo-600 mt-2">1</p>
          <p class="text-xs text-slate-500 mt-2">Regional Operations</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maintenance Technicians</p>
          <p id="stat-usersTechs" class="text-2xl sm:text-3xl font-black text-amber-600 mt-2">1</p>
          <p class="text-xs text-slate-500 mt-2">Field emergency dispatch</p>
        </div>
      </div>

      <!-- Action & Search Bar -->
      <div class="soft-card p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div class="relative flex-1 sm:w-80">
            <input type="text" id="userSearch" oninput="filterUsers()" placeholder="Search user name, email, unit..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition">
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button onclick="setUserFilter('all')" class="user-filter-btn px-3 py-1.5 rounded-lg font-bold bg-white text-slate-900 shadow-sm" data-filter="all">All</button>
            <button onclick="setUserFilter('TENANT')" class="user-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="TENANT">Tenants</button>
            <button onclick="setUserFilter('PROPERTY_MANAGER')" class="user-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="PROPERTY_MANAGER">Managers</button>
            <button onclick="setUserFilter('MAINTENANCE_TECH')" class="user-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="MAINTENANCE_TECH">Techs</button>
            <button onclick="setUserFilter('SUPER_ADMIN')" class="user-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="SUPER_ADMIN">Admins</button>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <button onclick="exportUsersCSV()" class="pill-btn px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span>Export Directory (CSV)</span>
          </button>
          <button onclick="openModal('addUserModal')" class="pill-btn px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Add New User</span>
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div class="soft-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">User Details</th>
                <th class="px-6 py-4">Role / Permissions</th>
                <th class="px-6 py-4">Property & Unit</th>
                <th class="px-6 py-4">Phone Contact</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="usersTableBody" class="divide-y divide-slate-100 text-slate-700"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ──────────────────────────────────────────────────────────────────── -->
    <!-- TAB 3: FINANCIAL ANALYTICS & PROFIT GRAPHS -->
    <!-- ──────────────────────────────────────────────────────────────────── -->
    <div id="tabContent-financials" class="tab-pane hidden space-y-6">
      
      <!-- 5 KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="soft-card p-5">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Monthly Income</p>
          <p class="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">₹36,40,000</p>
          <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block border border-emerald-100">+8.4% MoM</span>
        </div>

        <div class="soft-card p-5">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operating Expenses</p>
          <p class="text-xl sm:text-2xl font-black text-rose-600 mt-1.5">₹8,20,000</p>
          <span class="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full mt-2 inline-block">26.1% Expense Ratio</span>
        </div>

        <div class="soft-card p-5 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 border-emerald-200">
          <p class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Net Operating Profit</p>
          <p class="text-xl sm:text-2xl font-black text-emerald-900 mt-1.5">₹28,20,000</p>
          <span class="text-[11px] font-extrabold text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full mt-2 inline-block">73.9% Profit Margin</span>
        </div>

        <div class="soft-card p-5">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rent Collection Rate</p>
          <p class="text-xl sm:text-2xl font-black text-indigo-700 mt-1.5">96.8%</p>
          <span class="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full mt-2 inline-block border border-indigo-100">47 of 49 Paid</span>
        </div>

        <div class="soft-card p-5">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Overdue</p>
          <p class="text-xl sm:text-2xl font-black text-amber-600 mt-1.5">₹52,000</p>
          <span class="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-2 inline-block border border-amber-100">2 Accounts Grace</span>
        </div>
      </div>

      <!-- Main Visual Graph: Income vs Expenses vs Net Profit -->
      <div class="soft-card p-6 sm:p-8 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Portfolio Financial Growth: Gross Income, Expenses & Net Profit (2026)</h2>
            <p class="text-xs text-slate-500">Interactive Month-by-Month Performance & Cashflow Velocity Curve</p>
          </div>
          <div class="flex items-center gap-4 text-xs font-bold">
            <div class="flex items-center gap-1.5 text-blue-600">
              <span class="w-3 h-3 rounded-full bg-blue-600"></span>
              <span>Gross Income</span>
            </div>
            <div class="flex items-center gap-1.5 text-emerald-600">
              <span class="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span>Net Profit</span>
            </div>
            <div class="flex items-center gap-1.5 text-rose-500">
              <span class="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>Operating Expenses</span>
            </div>
          </div>
        </div>

        <!-- SVG Multi-Series Interactive Area Chart -->
        <div class="relative w-full overflow-hidden">
          <svg id="financialChartSvg" viewBox="0 0 900 320" class="w-full h-64 sm:h-80 overflow-visible">
            <defs>
              <linearGradient id="incomeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#2563eb" stop-opacity="0.0"/>
              </linearGradient>
              <linearGradient id="profitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#059669" stop-opacity="0.28"/>
                <stop offset="100%" stop-color="#059669" stop-opacity="0.0"/>
              </linearGradient>
            </defs>

            <!-- Y-Axis Grid Lines & Labels -->
            <line x1="50" y1="40" x2="880" y2="40" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
            <text x="40" y="44" text-anchor="end" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">₹40L</text>

            <line x1="50" y1="100" x2="880" y2="100" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
            <text x="40" y="104" text-anchor="end" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">$120k</text>

            <line x1="50" y1="160" x2="880" y2="160" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
            <text x="40" y="164" text-anchor="end" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">₹25L</text>

            <line x1="50" y1="220" x2="880" y2="220" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
            <text x="40" y="224" text-anchor="end" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">₹15L</text>

            <line x1="50" y1="270" x2="880" y2="270" stroke="#cbd5e1" stroke-width="1.5"/>
            <text x="40" y="274" text-anchor="end" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">₹0</text>

            <!-- Area Fills -->
            <polygon points="70,270 70,72 170,68 270,62 370,58 470,54 570,50 670,47 770,45 860,42 860,270" fill="url(#incomeGrad)" />
            <polygon points="70,270 70,128 170,124 270,120 370,115 470,115 570,110 670,110 770,106 860,107 860,270" fill="url(#profitGrad)" />

            <!-- Stroke Lines -->
            <!-- 1. Income Line (Blue) -->
            <path d="M 70,72 L 170,68 L 270,62 L 370,58 L 470,54 L 570,50 L 670,47 L 770,45 L 860,42" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- 2. Net Profit Line (Emerald) -->
            <path d="M 70,128 L 170,124 L 270,120 L 370,115 L 470,115 L 570,110 L 670,110 L 770,106 L 860,107" fill="none" stroke="#059669" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- 3. Expenses Line (Rose) -->
            <path d="M 70,224 L 170,222 L 270,220 L 370,222 L 470,218 L 570,220 L 670,216 L 770,218 L 860,215" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-dasharray="4" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Interactive Month Markers & Hover Targets -->
            <!-- Jan -->
            <circle cx="70" cy="72" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Jan 2026', '$132,000', '$34,000', '$98,000')" onmouseleave="hideChartTip()"/>
            <circle cx="70" cy="128" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Jan 2026', '$132,000', '$34,000', '$98,000')" onmouseleave="hideChartTip()"/>
            <text x="70" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Jan</text>

            <!-- Feb -->
            <circle cx="170" cy="68" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Feb 2026', '$135,000', '$35,000', '$100,000')" onmouseleave="hideChartTip()"/>
            <circle cx="170" cy="124" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Feb 2026', '$135,000', '$35,000', '$100,000')" onmouseleave="hideChartTip()"/>
            <text x="170" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Feb</text>

            <!-- Mar -->
            <circle cx="270" cy="62" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Mar 2026', '$138,000', '$36,000', '$102,000')" onmouseleave="hideChartTip()"/>
            <circle cx="270" cy="120" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Mar 2026', '$138,000', '$36,000', '$102,000')" onmouseleave="hideChartTip()"/>
            <text x="270" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Mar</text>

            <!-- Apr -->
            <circle cx="370" cy="58" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Apr 2026', '$140,000', '$35,000', '$105,000')" onmouseleave="hideChartTip()"/>
            <circle cx="370" cy="115" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Apr 2026', '$140,000', '$35,000', '$105,000')" onmouseleave="hideChartTip()"/>
            <text x="370" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Apr</text>

            <!-- May -->
            <circle cx="470" cy="54" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'May 2026', '$142,000', '$37,000', '$105,000')" onmouseleave="hideChartTip()"/>
            <circle cx="470" cy="115" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'May 2026', '$142,000', '$37,000', '$105,000')" onmouseleave="hideChartTip()"/>
            <text x="470" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">May</text>

            <!-- Jun -->
            <circle cx="570" cy="50" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Jun 2026', '$144,000', '$36,000', '$108,000')" onmouseleave="hideChartTip()"/>
            <circle cx="570" cy="110" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Jun 2026', '$144,000', '$36,000', '$108,000')" onmouseleave="hideChartTip()"/>
            <text x="570" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Jun</text>

            <!-- Jul -->
            <circle cx="670" cy="47" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Jul 2026', '$146,000', '$38,000', '$108,000')" onmouseleave="hideChartTip()"/>
            <circle cx="670" cy="110" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Jul 2026', '$146,000', '$38,000', '$108,000')" onmouseleave="hideChartTip()"/>
            <text x="670" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Jul</text>

            <!-- Aug -->
            <circle cx="770" cy="45" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Aug 2026', '$147,000', '$37,000', '$110,000')" onmouseleave="hideChartTip()"/>
            <circle cx="770" cy="106" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Aug 2026', '$147,000', '$37,000', '$110,000')" onmouseleave="hideChartTip()"/>
            <text x="770" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Aug</text>

            <!-- Sep (Current) -->
            <circle cx="860" cy="42" r="7" fill="#2563eb" stroke="#ffffff" stroke-width="2.5" class="transition-all hover:r-9 cursor-pointer" onmouseenter="showChartTip(event, 'Current (Sep 2026)', '$148,250', '$38,620', '$109,630')" onmouseleave="hideChartTip()"/>
            <circle cx="860" cy="107" r="7" fill="#059669" stroke="#ffffff" stroke-width="2.5" class="transition-all hover:r-9 cursor-pointer" onmouseenter="showChartTip(event, 'Current (Sep 2026)', '$148,250', '$38,620', '$109,630')" onmouseleave="hideChartTip()"/>
            <text x="860" y="295" text-anchor="middle" fill="#0f172a" font-weight="800" font-size="11">Sep (Now)</text>
          </svg>

          <!-- Floating Tooltip -->
          <div id="chartTipBox" class="chart-tooltip hidden absolute bg-slate-900 text-white rounded-xl px-4 py-3 shadow-xl text-xs space-y-1 z-20 pointer-events-none">
            <p id="tipMonth" class="font-bold text-slate-300"></p>
            <div class="flex items-center justify-between gap-4"><span class="text-blue-400">Income:</span><span id="tipIncome" class="font-mono font-bold"></span></div>
            <div class="flex items-center justify-between gap-4"><span class="text-rose-400">Expenses:</span><span id="tipExpense" class="font-mono font-bold"></span></div>
            <div class="flex items-center justify-between gap-4 pt-1 border-t border-slate-700"><span class="text-emerald-400 font-bold">Net Profit:</span><span id="tipProfit" class="font-mono font-bold text-emerald-400"></span></div>
          </div>
        </div>
      </div>

      <!-- Secondary Visual Graphs: Donut Revenue by Asset + Cashflow Waterfall -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Graph 2: Revenue by Asset -->
        <div class="soft-card p-6 sm:p-8 space-y-5">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Revenue Contribution by Property Asset</h3>
            <p class="text-xs text-slate-500">Gross Monthly Distribution of ₹36,40,000.00</p>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            <!-- Donut Chart -->
            <div class="relative w-44 h-44 flex-shrink-0">
              <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                <!-- Grand Horizon (46.1%) -->
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1d4ed8" stroke-width="16" stroke-dasharray="110 238" stroke-dashoffset="0" />
                <!-- Skyline Bay (35.1%) -->
                <circle cx="50" cy="50" r="38" fill="none" stroke="#0d9488" stroke-width="16" stroke-dasharray="84 238" stroke-dashoffset="-110" />
                <!-- Tech Nexus (18.8%) -->
                <circle cx="50" cy="50" r="38" fill="none" stroke="#7c3aed" stroke-width="16" stroke-dasharray="44 238" stroke-dashoffset="-194" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span class="text-xs text-slate-400 font-bold uppercase">Total Gross</span>
                <span class="text-lg font-black text-slate-900 font-mono">₹36.4L</span>
              </div>
            </div>

            <!-- Legend List -->
            <div class="space-y-3 flex-1 text-xs">
              <div class="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-blue-700"></span>
                  <span class="font-bold text-slate-900">Oberoi Sky City Residences</span>
                </div>
                <div class="text-right font-mono">
                  <span class="font-bold text-slate-900">₹14,50,000</span>
                  <span class="text-slate-500 text-[11px] block">(46.1%)</span>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-teal-600"></span>
                  <span class="font-bold text-slate-900">Panchshil Towers</span>
                </div>
                <div class="text-right font-mono">
                  <span class="font-bold text-slate-900">₹9,80,000</span>
                  <span class="text-slate-500 text-[11px] block">(35.1%)</span>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-purple-600"></span>
                  <span class="font-bold text-slate-900">DLF Cyber Enclave</span>
                </div>
                <div class="text-right font-mono">
                  <span class="font-bold text-slate-900">₹5,40,000</span>
                  <span class="text-slate-500 text-[11px] block">(18.8%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Graph 3: Cashflow Waterfall -->
        <div class="soft-card p-6 sm:p-8 space-y-5">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Operating Cashflow Waterfall</h3>
            <p class="text-xs text-slate-500">Inflows vs Expense Breakdown vs Net NOI</p>
          </div>

          <div class="space-y-3.5 pt-2 text-xs">
            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-slate-700">Residential Rents</span>
                <span class="font-mono text-emerald-700">+₹14,50,000</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-emerald-600 h-full rounded-full" style="width: 79.6%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-slate-700">Commercial Office Leases</span>
                <span class="font-mono text-emerald-700">+₹9,80,000</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-teal-600 h-full rounded-full" style="width: 18.8%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-slate-700">Parking & Amenities Fees</span>
                <span class="font-mono text-emerald-700">+₹6,70,000</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-blue-500 h-full rounded-full" style="width: 1.6%;"></div>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100">
              <div class="flex justify-between font-bold mb-1">
                <span class="text-slate-700">Maintenance & Repair Outflows</span>
                <span class="font-mono text-rose-600">-₹3,20,000</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-rose-500 h-full rounded-full" style="width: 36.7%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-slate-700">Management & Leasing Fees</span>
                <span class="font-mono text-rose-600">-₹2,50,000</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-amber-500 h-full rounded-full" style="width: 29.7%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-slate-700">Municipal Utilities & Insurance</span>
                <span class="font-mono text-rose-600">-₹2,50,000</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-slate-400 h-full rounded-full" style="width: 33.6%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ──────────────────────────────────────────────────────────────────── -->
    <!-- TAB 4: REAL-TIME TASK OPERATIONS SUITE -->
    <!-- ──────────────────────────────────────────────────────────────────── -->
    <div id="tabContent-tasks" class="tab-pane hidden space-y-6">
      
      <!-- Tasks Header & Filter Bar -->
      <div class="soft-card p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div>
            <h2 class="text-lg font-black text-slate-900 tracking-tight">Real-Time Operational Work Orders & Tasks</h2>
            <p class="text-xs text-slate-500">Live Kanban Workflow & Task Progression Engine</p>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <button onclick="openModal('addTaskModal')" class="pill-btn px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>+ Create New Task</span>
          </button>
        </div>
      </div>

      <!-- 4 Kanban Columns -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        
        <!-- Column 1: Backlog -->
        <div class="bg-slate-100/80 p-4 rounded-3xl border border-slate-200/80 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200">
            <span class="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <span class="inline-flex shrink-0"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg></span>
              <span>Backlog / New</span>
            </span>
            <span id="count-backlog" class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">1</span>
          </div>
          <div id="col-backlog" class="space-y-3 min-h-[140px]"></div>
        </div>

        <!-- Column 2: In Progress -->
        <div class="bg-blue-50/60 p-4 rounded-3xl border border-blue-200/80 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-blue-200">
            <span class="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
              <span class="inline-flex shrink-0"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg></span>
              <span>In Progress</span>
            </span>
            <span id="count-in_progress" class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">2</span>
          </div>
          <div id="col-in_progress" class="space-y-3 min-h-[140px]"></div>
        </div>

        <!-- Column 3: Review -->
        <div class="bg-amber-50/60 p-4 rounded-3xl border border-amber-200/80 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-amber-200">
            <span class="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
              <span class="inline-flex shrink-0"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg></span>
              <span>Pending Review</span>
            </span>
            <span id="count-review" class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">1</span>
          </div>
          <div id="col-review" class="space-y-3 min-h-[140px]"></div>
        </div>

        <!-- Column 4: Completed -->
        <div class="bg-emerald-50/60 p-4 rounded-3xl border border-emerald-200/80 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-emerald-200">
            <span class="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
              <span class="inline-flex shrink-0"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span>
              <span>Resolved</span>
            </span>
            <span id="count-completed" class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">1</span>
          </div>
          <div id="col-completed" class="space-y-3 min-h-[140px]"></div>
        </div>
      </div>
    </div>

    <!-- ──────────────────────────────────────────────────────────────────── -->
    <!-- TAB 5: TODAY'S LIVE ACTIVITY & AUDIT STREAM -->
    <!-- ──────────────────────────────────────────────────────────────────── -->
    <div id="tabContent-activity" class="tab-pane hidden space-y-6">
      
      <!-- Stamped Header Card -->
      <div class="soft-card p-8 bg-slate-900 text-white rounded-3xl shadow-lg relative overflow-hidden">
        <div class="max-w-3xl space-y-3">
          <div class="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-Time Immutable Audit Ledger &bull; Live Stream</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Today's Operating Activity Log
          </h2>

          <p class="text-slate-300 text-sm leading-relaxed">
            Every property asset created, tenant registered, rent roll transaction dispatched, and work order advanced is cryptographically recorded with today's live timestamp: <strong class="text-white font-mono">Saturday, September 12, 2026</strong>.
          </p>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button onclick="downloadAuditJSON()" class="pill-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5">
            <span>Download Audit (JSON)</span>
          </button>
          <button onclick="resetDataToSeed()" class="pill-btn px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg><span>Reload Sample Seed</span>
          </button>
        </div>
      </div>

      <!-- Activity Timeline List -->
      <div class="soft-card p-6 sm:p-8 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">Chronological Event Timeline</h3>
          <span class="text-xs text-slate-500 font-mono">Auto-refreshed in Real-Time</span>
        </div>

        <div id="activityStreamContainer" class="divide-y divide-slate-100 space-y-1"></div>
      </div>
    </div>

    <!-- ──────────────────────────────────────────────────────────────────── -->
    <!-- TAB 6: SYSTEM DIAGNOSTICS & MAIL ENGINE -->
    <!-- ──────────────────────────────────────────────────────────────────── -->
    <div id="tabContent-diagnostics" class="tab-pane hidden space-y-8">
      
      <!-- 4 System Infrastructure Status Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Public Portal</p>
          <p class="text-lg font-bold text-slate-900 mt-1">propledger</p>
          <p class="text-xs text-indigo-600 font-mono mt-1">vishalbhutekar.me</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Portal</p>
          <p class="text-lg font-bold text-slate-900 mt-1">admin</p>
          <p class="text-xs text-emerald-700 font-mono mt-1">Dedicated GTS SSL Active</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inbound Concierge</p>
          <p class="text-lg font-bold text-slate-900 mt-1">support@</p>
          <p class="text-xs text-indigo-600 font-mono mt-1">Forwarding Active</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transactional Mail</p>
          <p class="text-lg font-bold text-slate-900 mt-1">Resend API</p>
          <p class="text-xs text-purple-600 font-mono mt-1">DKIM & SPF Live</p>
        </div>
      </div>

      <!-- Master Credentials Card -->
      <div class="soft-card p-8 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 class="text-lg font-bold text-slate-900 tracking-tight">Master Administrator Account Specification</h2>
          <span class="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            BCrypt 12 Provisioned
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div class="soft-inner p-4">
            <span class="text-slate-500 block mb-1">Master Email Address</span>
            <span class="text-slate-900 font-bold text-sm">vishal.bhutekar1@gmail.com</span>
          </div>
          <div class="soft-inner p-4">
            <span class="text-slate-500 block mb-1">Security Password</span>
            <span class="text-slate-900 font-bold text-sm">Vishal@1233</span>
          </div>
          <div class="soft-inner p-4">
            <span class="text-slate-500 block mb-1">Security Roles</span>
            <span class="text-emerald-700 font-bold text-xs">SUPER_ADMIN, MGR, ACCT</span>
          </div>
        </div>
      </div>

      <!-- Commercial Statement Dispatcher & Inbound Simulator -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Statement Dispatcher -->
        <div class="soft-card p-8 space-y-6">
          <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900">Commercial Statement Dispatcher</h2>
              <p class="text-xs text-slate-500">Trigger branded statement email via Resend API</p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Recipient Email Address</label>
              <input id="adminEmailInput" type="email" value="vishal.bhutekar1@gmail.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:bg-white focus:border-indigo-500 focus:outline-none transition">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Invoice #</label>
                <input id="adminInvNumber" type="text" value="INV-202609-00001" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:bg-white focus:border-indigo-500 focus:outline-none transition">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Amount</label>
                <input id="adminInvAmount" type="text" value="₹65,000.00" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:bg-white focus:border-indigo-500 focus:outline-none transition">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Property Asset</label>
              <input id="adminInvProperty" type="text" value="Oberoi Sky City Residences Luxury Suites - Unit 402" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition">
            </div>

            <button id="adminSendBtn" onclick="adminDispatchEmail()" class="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              <span>Dispatch Statement via Resend</span>
            </button>

            <div id="adminStatusResult" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
          </div>
        </div>

        <!-- Inbound Routing Simulator -->
        <div class="soft-card p-8 space-y-6">
          <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
            <div class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900">Inbound Support Routing Monitor</h2>
              <p class="text-xs text-slate-500">Target: <span class="text-indigo-600 font-mono">vishal.bhutekar1@gmail.com</span></p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="soft-inner p-4 space-y-2 text-xs">
              <div class="flex items-center justify-between text-slate-700 font-semibold">
                <span>Target Inbound Address:</span>
                <span class="font-mono text-indigo-600">support@propledger.vishalbhutekar.me</span>
              </div>
              <div class="flex items-center justify-between text-slate-600">
                <span>Forward Destination:</span>
                <span class="font-mono text-slate-900">vishal.bhutekar1@gmail.com</span>
              </div>
              <div class="flex items-center justify-between text-slate-600">
                <span>Cloudflare Zone:</span>
                <span class="font-mono">84d04451d623e1d6885d01c55a89ce3a</span>
              </div>
            </div>

            <button id="adminPingBtn" onclick="adminPingSupport()" class="w-full py-3.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition border border-slate-200 flex items-center justify-center gap-2">
              <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>Simulate Live Inbound Support Forwarding</span>
            </button>

            <div id="adminPingResult" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- ──────────────────────────────────────────────────────────────────── -->
  <!-- MODALS -->
  <!-- ──────────────────────────────────────────────────────────────────── -->

  <!-- 1. Add Property Modal -->
  <div id="addPropertyModal" class="fixed inset-0 z-50 modal-backdrop hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-lg font-black text-slate-900">Register New Property Asset</h3>
        <button onclick="closeModal('addPropertyModal')" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition" aria-label="Close"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
      </div>

      <form onsubmit="submitNewProperty(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Property Name</label>
          <input id="propName" type="text" required placeholder="e.g. Lodha Belmondo Heights" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Property Image URL</label>
          <input id="propImage" type="url" required value="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80" placeholder="https://..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          <div class="flex flex-wrap gap-1.5 mt-2 text-[11px]">
            <span class="text-slate-500 font-medium self-center">Presets:</span>
            <button type="button" onclick="document.getElementById('propImage').value='https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'" class="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">Luxury High-Rise</button>
            <button type="button" onclick="document.getElementById('propImage').value='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'" class="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">Garden Suites</button>
            <button type="button" onclick="document.getElementById('propImage').value='https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'" class="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">Modern Villa</button>
            <button type="button" onclick="document.getElementById('propImage').value='https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'" class="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">Tech Park</button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Property Type</label>
            <select id="propType" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="Luxury Residential">Luxury Residential</option>
              <option value="Premium Residential">Premium Residential</option>
              <option value="Commercial Office">Commercial Office</option>
              <option value="Executive Suites">Executive Suites</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Total Units</label>
            <input id="propUnits" type="number" min="1" max="500" value="16" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Street Address</label>
          <input id="propAddress" type="text" required placeholder="e.g. Senapati Bapat Marg, Lower Parel" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">City</label>
            <input id="propCity" type="text" value="Mumbai" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">State</label>
            <input id="propState" type="text" value="Maharashtra" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Target Rent (₹/mo)</label>
            <input id="propRent" type="number" value="550000" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Amenities (Comma separated)</label>
          <input id="propAmenities" type="text" value="Heated Pool, EV Chargers, Concierge, Rooftop Terrace" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button type="button" onclick="closeModal('addPropertyModal')" class="pill-btn px-4 py-2 text-slate-600 hover:text-slate-900 font-bold">Cancel</button>
          <button type="submit" class="pill-btn px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">Register Property</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 2. Add Unit Modal -->
  <div id="addUnitModal" class="fixed inset-0 z-50 modal-backdrop hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-lg font-black text-slate-900">Add Unit to Property</h3>
        <button onclick="closeModal('addUnitModal')" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition" aria-label="Close"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
      </div>

      <form onsubmit="submitNewUnit(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Target Property</label>
          <select id="unitTargetProperty" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"></select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Unit Number / ID</label>
            <input id="unitNumber" type="text" required placeholder="e.g. Unit 504" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Monthly Rent (₹)</label>
            <input id="unitRent" type="number" value="3150" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Bedrooms</label>
            <input id="unitBeds" type="text" value="2 Bed" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Bathrooms</label>
            <input id="unitBaths" type="text" value="2 Bath" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Status</label>
            <select id="unitStatus" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="Occupied">Occupied</option>
              <option value="Vacant">Vacant</option>
              <option value="Under Renovation">Under Renovation</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Assigned Resident Name</label>
          <input id="unitTenant" type="text" value="Vacant / Open" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button type="button" onclick="closeModal('addUnitModal')" class="pill-btn px-4 py-2 text-slate-600 hover:text-slate-900 font-bold">Cancel</button>
          <button type="submit" class="pill-btn px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">Add Unit</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 3. Add User Modal -->
  <div id="addUserModal" class="fixed inset-0 z-50 modal-backdrop hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-lg font-black text-slate-900">Add User / Member</h3>
        <button onclick="closeModal('addUserModal')" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition" aria-label="Close"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
      </div>

      <form onsubmit="submitNewUser(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Full Legal Name</label>
          <input id="userName" type="text" required placeholder="e.g. Jessica Sterling" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email Address</label>
            <input id="userEmail" type="email" required placeholder="jessica@horizon.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Phone Number</label>
            <input id="userPhone" type="text" value="+1 (512) 680-9921" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">System Role</label>
            <select id="userRole" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="TENANT">Tenant / Resident</option>
              <option value="PROPERTY_MANAGER">Property Manager</option>
              <option value="MAINTENANCE_TECH">Maintenance Tech</option>
              <option value="LANDLORD">Landlord / Owner</option>
              <option value="SUPER_ADMIN">Executive Administrator</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Account Status</label>
            <select id="userStatus" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="Active">Active</option>
              <option value="Pending">Pending Invitation</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Assigned Property</label>
            <input id="userProperty" type="text" value="Oberoi Sky City Residences" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Assigned Unit</label>
            <input id="userUnit" type="text" value="Unit 305" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button type="button" onclick="closeModal('addUserModal')" class="pill-btn px-4 py-2 text-slate-600 hover:text-slate-900 font-bold">Cancel</button>
          <button type="submit" class="pill-btn px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">Create User Account</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 4. Add Task Modal -->
  <div id="addTaskModal" class="fixed inset-0 z-50 modal-backdrop hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-lg font-black text-slate-900">Create Operational Task</h3>
        <button onclick="closeModal('addTaskModal')" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition" aria-label="Close"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
      </div>

      <form onsubmit="submitNewTask(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Task Title</label>
          <input id="taskTitle" type="text" required placeholder="e.g. Repair Balcony Railing Sensor" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Category</label>
            <select id="taskCategory" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="Plumbing & Water">Plumbing & Water</option>
              <option value="Electrical & HVAC">Electrical & HVAC</option>
              <option value="Lease Renewal">Lease Renewal</option>
              <option value="Safety & Compliance">Safety & Compliance</option>
              <option value="Unit Turn">Unit Turn</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Priority</label>
            <select id="taskPriority" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="URGENT">URGENT (24h)</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM" selected>MEDIUM</option>
              <option value="ROUTINE">ROUTINE</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Property</label>
            <input id="taskProperty" type="text" value="Oberoi Sky City Residences" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Unit / Location</label>
            <input id="taskUnit" type="text" value="Unit 204" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Assignee</label>
            <input id="taskAssignee" type="text" value="Marcus Brody" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Due Timeline</label>
            <input id="taskDue" type="text" value="Today, 6:00 PM" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button type="button" onclick="closeModal('addTaskModal')" class="pill-btn px-4 py-2 text-slate-600 hover:text-slate-900 font-bold">Cancel</button>
          <button type="submit" class="pill-btn px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">Create Task</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Clean Minimal Footer -->
  <footer class="mt-20 border-t border-slate-200/80 bg-white py-10 text-center">
    <div class="max-w-7xl mx-auto px-6 space-y-2">
      <p class="text-xs font-semibold text-slate-700">
        PropLedger Technologies &bull; Executive Administration & Portfolio Control Center
      </p>
      <p class="text-[11px] text-slate-500 font-mono">
        Cloudflare Edge Protected &bull; TLS 1.3 &bull; Real-time Operations Active
      </p>
    </div>
  </footer>

  <!-- ──────────────────────────────────────────────────────────────────── -->
  <!-- CLIENT JAVASCRIPT LOGIC & STATE PERSISTENCE -->
  <!-- ──────────────────────────────────────────────────────────────────── -->
  <script>
    // State initialization from seed or local cache
    const STORAGE_KEY = 'propledger_admin_state_v1';
    let appData = null;
    let currentPropFilter = 'all';
    let currentUserFilter = 'all';

    // Live clock
    function updateClock() {
      const now = new Date();
      const clockEl = document.getElementById('liveClock');
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Tab Switching
    function switchTab(tabId) {
      document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('tab-active'));

      const targetPane = document.getElementById('tabContent-' + tabId);
      const targetBtn = document.getElementById('tabBtn-' + tabId);
      if (targetPane) targetPane.classList.remove('hidden');
      if (targetBtn) targetBtn.classList.add('tab-active');
    }

    // Modal helpers
    function openModal(id) {
      const m = document.getElementById(id);
      if (m) m.classList.remove('hidden');
      if (id === 'addUnitModal') populateUnitPropertyDropdown();
    }
    function closeModal(id) {
      const m = document.getElementById(id);
      if (m) m.classList.add('hidden');
    }

    // Toast alert
    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      const bg = type === 'success' ? 'bg-slate-900 border-emerald-500/40 text-white' : 'bg-red-900 border-red-500 text-white';
      toast.className = 'pointer-events-auto px-5 py-3 rounded-2xl border shadow-xl text-xs font-bold flex items-center gap-2.5 transition-all transform translate-y-4 opacity-0 ' + bg;
      toast.innerHTML = (type === 'success' ? '<span class="text-emerald-400 inline-flex shrink-0"><svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/></svg></span>' : '<span class="text-red-400 inline-flex shrink-0"><svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg></span>') + '<span>' + message + '</span>';
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      }, 50);

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    // Initialize application data
    async function initData() {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          appData = JSON.parse(cached);
        } catch(e) {}
      }

      // Try fetching fresh data from Worker edge API
      try {
        const resp = await fetch('/api/admin/dashboard-data');
        if (resp.ok) {
          const res = await resp.json();
          if (res.success && res.data) {
            appData = res.data;
            saveState();
          }
        }
      } catch (err) {
        console.warn('Working in offline/cached mode:', err);
      }

      if (!appData) {
        // Fallback default
        appData = window.__INITIAL_ADMIN_DATA__;
      }

      renderAll();
    }

    function saveState() {
      if (appData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      }
    }

    function renderAll() {
      renderProperties();
      renderUsers();
      renderTasks();
      renderActivity();
      updateBadges();
    }

    function updateBadges() {
      if (!appData) return;
      document.getElementById('badge-propCount').textContent = appData.properties.length;
      document.getElementById('badge-userCount').textContent = appData.users.length;
      document.getElementById('badge-taskCount').textContent = appData.tasks.filter(t => t.status !== 'completed').length;
      
      document.getElementById('stat-totalProperties').textContent = appData.properties.length;
      const totalUnits = appData.properties.reduce((sum, p) => sum + (p.unitsCount || 0), 0);
      const occupiedUnits = appData.properties.reduce((sum, p) => sum + (p.occupiedCount || 0), 0);
      const grossRoll = appData.properties.reduce((sum, p) => sum + (p.grossRent || 0), 0);
      
      document.getElementById('stat-totalUnits').textContent = totalUnits;
      document.getElementById('stat-occupancyRate').textContent = totalUnits ? ((occupiedUnits / totalUnits) * 100).toFixed(1) + '%' : '100%';
      document.getElementById('stat-grossRentRoll').textContent = '₹' + grossRoll.toLocaleString('en-IN');
    }

    // Properties Render
    function renderProperties() {
      const grid = document.getElementById('propertiesGrid');
      if (!grid || !appData) return;
      const query = (document.getElementById('propertySearch').value || '').toLowerCase();

      const filtered = appData.properties.filter(p => {
        const matchType = currentPropFilter === 'all' || p.type.toLowerCase().includes(currentPropFilter.toLowerCase());
        const matchQuery = p.name.toLowerCase().includes(query) || p.address.toLowerCase().includes(query) || p.city.toLowerCase().includes(query);
        return matchType && matchQuery;
      });

      grid.innerHTML = filtered.map(p => \`
        <div class="soft-card p-6 flex flex-col justify-between space-y-5">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                \${p.type}
              </span>
              <span class="text-xs font-mono font-bold text-slate-400">\${p.id}</span>
            </div>

            <div>
              <h3 class="text-lg font-black text-slate-900 tracking-tight">\${p.name}</h3>
              <p class="text-xs text-slate-500 mt-0.5">\${p.address}, \${p.city}, \${p.state} \${p.zip}</p>
            </div>

            <!-- Occupancy bar -->
            <div class="space-y-1.5 pt-1">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-600">Occupancy: \${p.occupiedCount}/\${p.unitsCount} Units</span>
                <span class="text-emerald-700 font-bold">\${((p.occupiedCount / p.unitsCount) * 100).toFixed(0)}%</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full" style="width: \${(p.occupiedCount / p.unitsCount) * 100}%"></div>
              </div>
            </div>

            <!-- Amenities -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              \${(p.amenities || []).map(a => \`<span class="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">\${a}</span>\`).join('')}
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-bold">Monthly Gross</span>
              <span class="text-slate-900 font-black font-mono text-sm">$\${p.grossRent.toLocaleString()}</span>
            </div>
            <button onclick="quickAddUnitTo('\${p.name}')" class="pill-btn px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">
              + Unit
            </button>
          </div>
        </div>
      \`).join('');
    }

    function setPropFilter(type) {
      currentPropFilter = type;
      document.querySelectorAll('.prop-filter-btn').forEach(btn => {
        if (btn.dataset.filter === type) {
          btn.className = 'prop-filter-btn px-3 py-1.5 rounded-lg font-bold bg-white text-slate-900 shadow-sm';
        } else {
          btn.className = 'prop-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900';
        }
      });
      renderProperties();
    }

    function filterProperties() {
      renderProperties();
    }

    function populateUnitPropertyDropdown() {
      const select = document.getElementById('unitTargetProperty');
      if (!select || !appData) return;
      select.innerHTML = appData.properties.map(p => \`<option value="\${p.name}">\${p.name} (\${p.city}, \${p.state})</option>\`).join('');
    }

    function quickAddUnitTo(propName) {
      openModal('addUnitModal');
      setTimeout(() => {
        const select = document.getElementById('unitTargetProperty');
        if (select) select.value = propName;
      }, 50);
    }

    // Submit New Property
    async function submitNewProperty(e) {
      e.preventDefault();
      const name = document.getElementById('propName').value;
      const image = document.getElementById('propImage') ? document.getElementById('propImage').value : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
      const type = document.getElementById('propType').value;
      const unitsCount = parseInt(document.getElementById('propUnits').value);
      const address = document.getElementById('propAddress').value;
      const city = document.getElementById('propCity').value;
      const state = document.getElementById('propState').value;
      const grossRent = parseFloat(document.getElementById('propRent').value);
      const amenities = document.getElementById('propAmenities').value.split(',').map(s => s.trim());

      const payload = { name, image, type, unitsCount, address, city, state, grossRent, amenities };

      // Local optimistic update
      const newProp = {
        id: "PROP-" + String(appData.properties.length + 1).padStart(3, '0'),
        ...payload,
        occupiedCount: Math.max(1, unitsCount - 1),
        zip: "400001",
        status: "Operational"
      };
      appData.properties.unshift(newProp);
      appData.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Property Registered",
        description: \`New asset '\${newProp.name}' (\${newProp.unitsCount} units) registered in system.\`,
        category: "property"
      });

      saveState();
      renderAll();
      closeModal('addPropertyModal');
      showToast(\`Property "\${name}" registered successfully!\`);

      // Post to edge API
      fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.error('Edge sync error:', err));
    }

    // Submit New Unit
    function submitNewUnit(e) {
      e.preventDefault();
      const propName = document.getElementById('unitTargetProperty').value;
      const unitNum = document.getElementById('unitNumber').value;
      const rent = parseFloat(document.getElementById('unitRent').value);
      const tenant = document.getElementById('unitTenant').value;

      const prop = appData.properties.find(p => p.name === propName);
      if (prop) {
        prop.unitsCount += 1;
        prop.grossRent += rent;
        if (tenant && tenant.toLowerCase() !== 'vacant') {
          prop.occupiedCount += 1;
        }
      }

      appData.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Unit Appended",
        description: \`\${unitNum} added to \${propName} ($\${rent.toLocaleString()}/mo).\`,
        category: "property"
      });

      saveState();
      renderAll();
      closeModal('addUnitModal');
      showToast(\`Unit \${unitNum} added to \${propName}!\`);
    }

    // Users Render
    function renderUsers() {
      const tbody = document.getElementById('usersTableBody');
      if (!tbody || !appData) return;
      const query = (document.getElementById('userSearch').value || '').toLowerCase();

      const filtered = appData.users.filter(u => {
        const matchRole = currentUserFilter === 'all' || u.role === currentUserFilter;
        const matchQuery = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.property.toLowerCase().includes(query);
        return matchRole && matchQuery;
      });

      // Update counters
      document.getElementById('stat-usersTotal').textContent = appData.users.length;
      document.getElementById('stat-usersTenants').textContent = appData.users.filter(u => u.role === 'TENANT').length;
      document.getElementById('stat-usersManagers').textContent = appData.users.filter(u => u.role === 'PROPERTY_MANAGER').length;
      document.getElementById('stat-usersTechs').textContent = appData.users.filter(u => u.role === 'MAINTENANCE_TECH').length;

      const roleBadges = {
        'SUPER_ADMIN': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'PROPERTY_MANAGER': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'TENANT': 'bg-blue-100 text-blue-800 border-blue-200',
        'MAINTENANCE_TECH': 'bg-amber-100 text-amber-800 border-amber-200',
        'LANDLORD': 'bg-purple-100 text-purple-800 border-purple-200'
      };

      tbody.innerHTML = filtered.map(u => \`
        <tr class="hover:bg-slate-50/80 transition">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 font-mono">
                \${u.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <p class="font-bold text-slate-900 text-sm leading-tight">\${u.name}</p>
                <p class="text-xs text-slate-500 font-mono">\${u.email}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4">
            <span class="text-[11px] font-bold font-mono px-2.5 py-1 rounded-full border \${roleBadges[u.role] || 'bg-slate-100 text-slate-700 border-slate-200'}">
              \${u.role}
            </span>
          </td>
          <td class="px-6 py-4">
            <p class="font-semibold text-slate-900 text-xs">\${u.property}</p>
            <p class="text-[11px] text-slate-500 font-mono">\${u.unit}</p>
          </td>
          <td class="px-6 py-4 font-mono text-xs text-slate-600">\${u.phone || 'N/A'}</td>
          <td class="px-6 py-4">
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-full \${u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (u.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200')}">
              \${u.status}
            </span>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button onclick="toggleUserStatus('\${u.id}')" class="pill-btn px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200">
                \${u.status === 'Active' ? 'Suspend' : 'Activate'}
              </button>
              <button onclick="deleteUser('\${u.id}')" class="text-slate-400 hover:text-red-600 text-sm px-1.5 py-1" title="Remove Account" class="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition inline-flex items-center justify-center">
                <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      \`).join('');
    }

    function setUserFilter(role) {
      currentUserFilter = role;
      document.querySelectorAll('.user-filter-btn').forEach(btn => {
        if (btn.dataset.filter === role) {
          btn.className = 'user-filter-btn px-3 py-1.5 rounded-lg font-bold bg-white text-slate-900 shadow-sm';
        } else {
          btn.className = 'user-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900';
        }
      });
      renderUsers();
    }

    function filterUsers() {
      renderUsers();
    }

    function toggleUserStatus(userId) {
      const user = appData.users.find(u => u.id === userId);
      if (user) {
        user.status = user.status === 'Active' ? 'Suspended' : 'Active';
        appData.activity.unshift({
          id: "ACT-" + Date.now().toString().slice(-4),
          timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          action: "Status Updated",
          description: \`Account for \${user.name} (\${user.id}) changed to '\${user.status}'.\`,
          category: "user"
        });
        saveState();
        renderAll();
        showToast(\`User \${user.name} status updated to \${user.status}\`);
        fetch('/api/admin/users/' + userId + '/toggle-status', { method: 'POST' }).catch(()=>{});
      }
    }

    function deleteUser(userId) {
      const idx = appData.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        const name = appData.users[idx].name;
        appData.users.splice(idx, 1);
        saveState();
        renderAll();
        showToast(\`User account \${name} removed\`);
      }
    }

    // Submit New User
    function submitNewUser(e) {
      e.preventDefault();
      const name = document.getElementById('userName').value;
      const email = document.getElementById('userEmail').value;
      const phone = document.getElementById('userPhone').value;
      const role = document.getElementById('userRole').value;
      const status = document.getElementById('userStatus').value;
      const property = document.getElementById('userProperty').value;
      const unit = document.getElementById('userUnit').value;

      const newUser = {
        id: "USR-" + String(appData.users.length + 1).padStart(3, '0'),
        name, email, phone, role, status, property, unit,
        joinedDate: "Today, Sep 12"
      };

      appData.users.unshift(newUser);
      appData.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "User Onboarded",
        description: \`\${newUser.name} onboarded as \${newUser.role} (\${newUser.property}).\`,
        category: "user"
      });

      saveState();
      renderAll();
      closeModal('addUserModal');
      showToast(\`User \${name} registered successfully!\`);

      fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      }).catch(()=>{});
    }

    function exportUsersCSV() {
      if (!appData) return;
      const headers = ["ID,Full Name,Email,Role,Property,Unit,Phone,Status,Joined Date"];
      const rows = appData.users.map(u => \`"\${u.id}","\${u.name}","\${u.email}","\${u.role}","\${u.property}","\${u.unit}","\${u.phone}","\${u.status}","\${u.joinedDate}"\`);
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join(String.fromCharCode(10));
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", \`PropLedger_Users_\${new Date().toISOString().slice(0,10)}.csv\`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("User directory exported to CSV!");
    }

    // Tasks Render
    function renderTasks() {
      if (!appData) return;
      const columns = ['backlog', 'in_progress', 'review', 'completed'];
      columns.forEach(col => {
        const container = document.getElementById('col-' + col);
        const countBadge = document.getElementById('count-' + col);
        const tasks = appData.tasks.filter(t => t.status === col);
        if (countBadge) countBadge.textContent = tasks.length;

        if (container) {
          if (tasks.length === 0) {
            container.innerHTML = '<div class="p-4 text-center text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-2xl">No tasks in this lane</div>';
          } else {
            container.innerHTML = tasks.map(t => {
              const priorityClass = t.priority === 'URGENT' 
                ? 'bg-rose-100 text-rose-800 border-rose-200' 
                : (t.priority === 'HIGH' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200');
              
              const nextBtnText = col === 'backlog' ? 'Start <svg class="w-3 h-3 inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' : (col === 'in_progress' ? 'Review <svg class="w-3 h-3 inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' : (col === 'review' ? 'Resolve <svg class="w-3 h-3 inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' : 'Reopen <svg class="w-3 h-3 inline ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>'));

              return \`
                <div class="soft-card p-4 space-y-3 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border \${priorityClass}">
                      \${t.priority}
                    </span>
                    <span class="text-[10px] font-mono text-slate-400 font-bold">\${t.id}</span>
                  </div>

                  <div>
                    <h4 class="font-bold text-slate-900 text-xs leading-snug">\${t.title}</h4>
                    <p class="text-[11px] text-slate-500 mt-1">\${t.property} &bull; <strong class="text-slate-700">\${t.unit}</strong></p>
                  </div>

                  <div class="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                    <div class="flex items-center gap-1.5 text-slate-600">
                      <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                      <span>\${t.assignee}</span>
                    </div>
                    <span class="text-slate-500 font-mono">\${t.dueDate}</span>
                  </div>

                  <button onclick="advanceTaskStatus('\${t.id}')" class="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition">
                    <span>\${nextBtnText}</span>
                  </button>
                </div>
              \`;
            }).join('');
          }
        }
      });
    }

    function advanceTaskStatus(taskId) {
      const task = appData.tasks.find(t => t.id === taskId);
      if (task) {
        const order = ['backlog', 'in_progress', 'review', 'completed'];
        const curr = order.indexOf(task.status);
        task.status = curr < order.length - 1 ? order[curr + 1] : order[0];
        
        appData.activity.unshift({
          id: "ACT-" + Date.now().toString().slice(-4),
          timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          action: "Task Advanced",
          description: \`Work order #\${task.id} advanced to status '\${task.status}'.\`,
          category: "task"
        });

        saveState();
        renderAll();
        showToast(\`Task #\${task.id} moved to \${task.status.replace('_', ' ')}!\`);
        fetch('/api/admin/tasks/' + taskId + '/advance', { method: 'POST' }).catch(()=>{});
      }
    }

    // Submit New Task
    function submitNewTask(e) {
      e.preventDefault();
      const title = document.getElementById('taskTitle').value;
      const category = document.getElementById('taskCategory').value;
      const priority = document.getElementById('taskPriority').value;
      const property = document.getElementById('taskProperty').value;
      const unit = document.getElementById('taskUnit').value;
      const assignee = document.getElementById('taskAssignee').value;
      const dueDate = document.getElementById('taskDue').value;

      const newTask = {
        id: "TSK-" + (100 + appData.tasks.length + 1),
        title, category, priority, property, unit, assignee, dueDate,
        status: "backlog",
        createdDate: "Sep 12, 2026"
      };

      appData.tasks.unshift(newTask);
      appData.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Task Created",
        description: \`Work order '\${newTask.title}' [\${newTask.priority}] assigned to \${newTask.assignee}.\`,
        category: "task"
      });

      saveState();
      renderAll();
      closeModal('addTaskModal');
      showToast(\`Work order #\${newTask.id} created!\`);

      fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      }).catch(()=>{});
    }

    // Activity Stream Render
    function renderActivity() {
      const container = document.getElementById('activityStreamContainer');
      if (!container || !appData) return;

      const catBadges = {
        'financial': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'property': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'user': 'bg-blue-100 text-blue-800 border-blue-200',
        'task': 'bg-amber-100 text-amber-800 border-amber-200',
        'security': 'bg-purple-100 text-purple-800 border-purple-200'
      };

      container.innerHTML = (appData.activity || []).map(act => \`
        <div class="py-3 flex items-start justify-between gap-4 text-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border \${catBadges[act.category] || 'bg-slate-100 text-slate-700'}">
                \${act.action}
              </span>
              <span class="text-slate-400 font-mono text-[11px]">\${act.id}</span>
            </div>
            <p class="font-medium text-slate-800">\${act.description}</p>
          </div>
          <span class="font-mono text-[11px] text-slate-500 flex-shrink-0">\${act.timestamp}</span>
        </div>
      \`).join('');
    }

    function downloadAuditJSON() {
      if (!appData) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", \`PropLedger_Executive_Audit_\${new Date().toISOString().slice(0,10)}.json\`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Daily audit report downloaded as JSON!");
    }

    async function resetDataToSeed() {
      if (confirm("Reset all properties, users, and tasks to default seed data?")) {
        localStorage.removeItem(STORAGE_KEY);
        try {
          await fetch('/api/admin/reset', { method: 'POST' });
        } catch(e) {}
        appData = JSON.parse(JSON.stringify(window.__INITIAL_ADMIN_DATA__));
        saveState();
        renderAll();
        showToast("System reset to production sample seed!");
      }
    }

    // Chart Tooltip logic
    function showChartTip(e, month, income, expense, profit) {
      const tip = document.getElementById('chartTipBox');
      document.getElementById('tipMonth').textContent = month;
      document.getElementById('tipIncome').textContent = income;
      document.getElementById('tipExpense').textContent = expense;
      document.getElementById('tipProfit').textContent = profit;

      tip.classList.remove('hidden');
      const rect = e.target.getBoundingClientRect();
      const parentRect = document.getElementById('financialChartSvg').getBoundingClientRect();
      tip.style.left = (rect.left - parentRect.left - 40) + 'px';
      tip.style.top = (rect.top - parentRect.top - 85) + 'px';
    }

    function hideChartTip() {
      document.getElementById('chartTipBox').classList.add('hidden');
    }

    // Resend email dispatch function
    async function adminDispatchEmail() {
      const btn = document.getElementById('adminSendBtn');
      const statusBox = document.getElementById('adminStatusResult');
      const email = document.getElementById('adminEmailInput').value;
      const invNum = document.getElementById('adminInvNumber').value;
      const amount = document.getElementById('adminInvAmount').value;
      const property = document.getElementById('adminInvProperty').value;

      btn.disabled = true;
      btn.innerHTML = '<svg class="animate-spin w-4 h-4 inline mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Dispatching via Resend API...';
      statusBox.className = 'p-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Connecting to transactional mail engine...';

      try {
        const resp = await fetch('/api/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientEmail: email, invoiceNumber: invNum, amount: amount, property: property, tenant: 'Vishal Bhutekar' })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Email Delivered!</strong><br>Message ID: ' + (data.messageId || 'OK') + '<br>Recipient: ' + email;
        } else {
          statusBox.className = 'p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Response: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 block text-xs leading-relaxed font-mono';
        statusBox.innerHTML = 'Error: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg><span>Dispatch Statement via Resend</span>';
      }
    }

    async function adminPingSupport() {
      const btn = document.getElementById('adminPingBtn');
      const statusBox = document.getElementById('adminPingResult');

      btn.disabled = true;
      btn.innerHTML = '<svg class="animate-spin w-4 h-4 inline mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Testing forward routing...';
      statusBox.className = 'p-4 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Sending diagnostic packet...';

      try {
        const resp = await fetch('/api/support-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: 'Admin Portal Ping', senderEmail: 'support@propledger.vishalbhutekar.me', subject: 'Diagnostic verification of edge forward pipeline', message: 'Testing forward routing to vishal.bhutekar1@gmail.com' })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Support Routing Verified!</strong><br>Forwarded to: ' + data.forwardedTo + '<br>Message ID: ' + (data.messageId || 'OK');
        } else {
          statusBox.className = 'p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Response: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 block text-xs leading-relaxed font-mono';
        statusBox.innerHTML = 'Error: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg><span>Simulate Live Inbound Support Forwarding</span>';
      }
    }

    // Kickoff
    document.addEventListener('DOMContentLoaded', initData);
  </script>
</body>
</html>`;
}
