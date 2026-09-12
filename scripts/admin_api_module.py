# -*- coding: utf-8 -*-
"""
Build the full PropLedger Executive Admin Console in cloudflare/propledger-worker.js
"""

import sys

admin_api_and_store_code = r'''
// ─────────────────────────────────────────────────────────────────────────────
// PROPIDGER EXECUTIVE ADMIN IN-MEMORY & EDGE DATA STORE
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_ADMIN_STORE = {
  properties: [
    {
      id: "PROP-001",
      name: "The Grand Horizon Residences",
      address: "1204 Grand Avenue",
      city: "Austin",
      state: "TX",
      zip: "78701",
      type: "Multifamily Luxury",
      unitsCount: 24,
      occupiedCount: 23,
      grossRent: 68400,
      amenities: ["Rooftop Infinity Pool", "EV Fast Charging", "24/7 Concierge", "Fitness Hub"],
      status: "Operational"
    },
    {
      id: "PROP-002",
      name: "Skyline Bay Lofts",
      address: "88 Harbor View Boulevard",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      type: "Luxury Residential",
      unitsCount: 16,
      occupiedCount: 16,
      grossRent: 52000,
      amenities: ["Private Marina", "Wine Cellar", "Valet Parking", "Smart Thermostats"],
      status: "Operational"
    },
    {
      id: "PROP-003",
      name: "Austin Tech Nexus Tower",
      address: "400 Silicon Way",
      city: "Austin",
      state: "TX",
      zip: "78759",
      type: "Commercial Office",
      unitsCount: 8,
      occupiedCount: 7,
      grossRent: 27850,
      amenities: ["Fiber Backbone 10Gbps", "Conference Amphitheater", "Bicycle Lockers"],
      status: "Operational"
    }
  ],
  users: [
    {
      id: "USR-001",
      name: "Vishal Bhutekar",
      email: "vishal.bhutekar1@gmail.com",
      phone: "+1 (512) 800-4921",
      role: "SUPER_ADMIN",
      property: "All Portfolios",
      unit: "Executive Suite",
      rent: 0,
      status: "Active",
      joinedDate: "Jan 15, 2026"
    },
    {
      id: "USR-002",
      name: "Elena Rostova",
      email: "elena.rostova@horizon.com",
      phone: "+1 (512) 441-9022",
      role: "PROPERTY_MANAGER",
      property: "The Grand Horizon",
      unit: "Leasing Office",
      rent: 0,
      status: "Active",
      joinedDate: "Feb 01, 2026"
    },
    {
      id: "USR-003",
      name: "Sarah Connor",
      email: "sarah.connor@skyline.io",
      phone: "+1 (415) 620-1184",
      role: "TENANT",
      property: "Skyline Bay Lofts",
      unit: "Unit 402",
      rent: 3250,
      status: "Active",
      joinedDate: "Apr 10, 2026"
    },
    {
      id: "USR-004",
      name: "Marcus Brody",
      email: "m.brody@apexbuild.com",
      phone: "+1 (512) 773-8890",
      role: "MAINTENANCE_TECH",
      property: "Regional Operations",
      unit: "Field Specialist",
      rent: 0,
      status: "Active",
      joinedDate: "Mar 12, 2026"
    },
    {
      id: "USR-005",
      name: "Jonathan Vance",
      email: "vance.invest@capital.com",
      phone: "+1 (212) 993-4011",
      role: "LANDLORD",
      property: "The Grand Horizon",
      unit: "Owner Equity",
      rent: 0,
      status: "Active",
      joinedDate: "Jan 10, 2026"
    },
    {
      id: "USR-006",
      name: "Chloe Bennet",
      email: "chloe.b@nexusoffice.com",
      phone: "+1 (512) 550-9942",
      role: "TENANT",
      property: "Austin Tech Nexus Tower",
      unit: "Suite 300",
      rent: 4500,
      status: "Active",
      joinedDate: "Jun 01, 2026"
    },
    {
      id: "USR-007",
      name: "David Miller",
      email: "david.miller@email.com",
      phone: "+1 (512) 349-8812",
      role: "TENANT",
      property: "The Grand Horizon",
      unit: "Unit 108",
      rent: 2850,
      status: "Pending",
      joinedDate: "Sep 05, 2026"
    }
  ],
  financials: {
    grossRevenue: 148250,
    operatingExpenses: 38620,
    netProfit: 109630,
    profitMargin: 73.9,
    collectionRate: 96.8,
    overdueAmount: 4800,
    months: [
      { month: "Jan", revenue: 132000, expenses: 34000, profit: 98000 },
      { month: "Feb", revenue: 135000, expenses: 35000, profit: 100000 },
      { month: "Mar", revenue: 138000, expenses: 36000, profit: 102000 },
      { month: "Apr", revenue: 140000, expenses: 35000, profit: 105000 },
      { month: "May", revenue: 142000, expenses: 37000, profit: 105000 },
      { month: "Jun", revenue: 144000, expenses: 36000, profit: 108000 },
      { month: "Jul", revenue: 146000, expenses: 38000, profit: 108000 },
      { month: "Aug", revenue: 147000, expenses: 37000, profit: 110000 },
      { month: "Sep", revenue: 148250, expenses: 38620, profit: 109630 }
    ],
    propertyBreakdown: [
      { name: "The Grand Horizon", amount: 68400, percentage: 46.1, color: "#1d4ed8" },
      { name: "Skyline Bay Lofts", amount: 52000, percentage: 35.1, color: "#0d9488" },
      { name: "Tech Nexus Tower", amount: 27850, percentage: 18.8, color: "#7c3aed" }
    ]
  },
  tasks: [
    {
      id: "TSK-101",
      title: "HVAC Filter Replacement & Air Quality Check",
      category: "Electrical & HVAC",
      priority: "MEDIUM",
      status: "in_progress",
      property: "The Grand Horizon",
      unit: "Floor 4 Central",
      assignee: "Marcus Brody",
      dueDate: "Today, 4:00 PM",
      createdDate: "Sep 12, 2026"
    },
    {
      id: "TSK-102",
      title: "Emergency Water Leak Under Bathroom Vanity",
      category: "Plumbing & Water",
      priority: "URGENT",
      status: "in_progress",
      property: "Skyline Bay Lofts",
      unit: "Unit 402",
      assignee: "Marcus Brody",
      dueDate: "Today, 1:00 PM",
      createdDate: "Sep 12, 2026"
    },
    {
      id: "TSK-103",
      title: "Lease Renewal Agreement Execution & Deposit Update",
      category: "Lease Renewal",
      priority: "HIGH",
      status: "backlog",
      property: "The Grand Horizon",
      unit: "Unit 204",
      assignee: "Elena Rostova",
      dueDate: "Sep 15, 2026",
      createdDate: "Sep 11, 2026"
    },
    {
      id: "TSK-104",
      title: "Annual Fire Sprinkler & Pressure Certification",
      category: "Safety & Compliance",
      priority: "HIGH",
      status: "review",
      property: "Austin Tech Nexus Tower",
      unit: "Building-Wide",
      assignee: "City Fire Marshal",
      dueDate: "Sep 14, 2026",
      createdDate: "Sep 10, 2026"
    },
    {
      id: "TSK-105",
      title: "Turnover Paint, Deep Clean & Key FOB Coding",
      category: "Unit Turn",
      priority: "MEDIUM",
      status: "completed",
      property: "The Grand Horizon",
      unit: "Unit 102",
      assignee: "Elena Rostova",
      dueDate: "Completed Today",
      createdDate: "Sep 09, 2026"
    }
  ],
  activity: [
    {
      id: "ACT-01",
      timestamp: "Today, 09:55 AM",
      action: "SSL Activated",
      description: "Cloudflare Dedicated TLS Certificate successfully validated and activated for admin portal.",
      category: "security"
    },
    {
      id: "ACT-02",
      timestamp: "Today, 09:42 AM",
      action: "AutoPay Received",
      description: "Unit 402 rent payment ($3,250.00) processed via ACH AutoPay for Sarah Connor.",
      category: "financial"
    },
    {
      id: "ACT-03",
      timestamp: "Today, 09:15 AM",
      action: "Work Order Advanced",
      description: "Emergency leak ticket #TSK-102 moved to 'In Progress' by Marcus Brody.",
      category: "task"
    },
    {
      id: "ACT-04",
      timestamp: "Today, 08:30 AM",
      action: "Daily Audit Compiled",
      description: "47/49 units occupied (96.8% collection rate) logged to immutable audit ledger.",
      category: "property"
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
        address: body.address || "Street Address Pending",
        city: body.city || "Austin",
        state: body.state || "TX",
        zip: body.zip || "78701",
        type: body.type || "Multifamily Luxury",
        unitsCount: parseInt(body.unitsCount) || 12,
        occupiedCount: parseInt(body.occupiedCount) || Math.max(1, (parseInt(body.unitsCount) || 12) - 1),
        grossRent: parseFloat(body.grossRent) || 32000,
        amenities: Array.isArray(body.amenities) ? body.amenities : (body.amenities ? String(body.amenities).split(',').map(s => s.trim()) : ["Security Access", "Parking"]),
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
        property: body.property || "The Grand Horizon",
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
        property: body.property || "The Grand Horizon",
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

  return null;
}
'''

print("admin_api_and_store_code prepared successfully.")
