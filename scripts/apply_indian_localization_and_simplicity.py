import re
import os
import subprocess
import sys

worker_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cloudflare", "propledger-worker.js")
with open(worker_path, "r", encoding="utf-8") as f:
    code = f.read()

print("Original worker size:", len(code), "chars, lines:", len(code.splitlines()))

# 1. Update DEFAULT_ADMIN_STORE
new_store = '''const DEFAULT_ADMIN_STORE = {
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
};'''

# Replace DEFAULT_ADMIN_STORE in code
store_pattern = r'const DEFAULT_ADMIN_STORE = \{.*?\n\};'
code = re.sub(store_pattern, new_store, code, count=1, flags=re.DOTALL)
print("Updated DEFAULT_ADMIN_STORE")

# Replace inquiries email in footer and elsewhere
code = code.replace("concierge@propledger.com", "support@propledger.vishalbhutekar.me")
code = code.replace("resident@propledger.com", "support@propledger.vishalbhutekar.me")
code = code.replace("diagnostics@propledger.com", "support@propledger.vishalbhutekar.me")

with open(worker_path, "w", encoding="utf-8") as f:
    f.write(code)

print("Saved preliminary changes.")
