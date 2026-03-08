// Test Script to Generate Sample Leads for Reports Testing
// Run this with: node generate-test-data.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Lead } from './models/lead.model.js';
import { User } from './models/user.model.js';

dotenv.config();

const sampleLeads = [
  {
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+91 9876543210",
    company: "Tech Solutions Inc",
    status: "won",
    source: "website",
    revenue: 150000,
    notes: "High priority client from USA"
  },
  {
    name: "Priya Sharma",
    email: "priya@business.com",
    phone: "+91 9123456789",
    company: "Sharma Enterprises",
    status: "qualified",
    source: "referral",
    revenue: 75000,
    notes: "Looking for premium package"
  },
  {
    name: "Michael Johnson",
    email: "michael.j@corp.com",
    phone: "+91 9988776655",
    company: "Global Corp",
    status: "new",
    source: "facebook",
    revenue: 200000,
    notes: "New lead from Facebook campaign"
  },
  {
    name: "Anjali Patel",
    email: "anjali.patel@startup.in",
    phone: "+91 9876512340",
    company: "Innovate Startup",
    status: "contacted",
    source: "instagram",
    revenue: 50000,
    notes: "Startup looking for basic CRM solution"
  },
  {
    name: "Robert Williams",
    email: "r.williams@enterprise.com",
    phone: "+91 9123498765",
    company: "Enterprise Ltd",
    status: "won",
    source: "website",
    revenue: 300000,
    notes: "Large enterprise deal - closed successfully"
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy@tech.co",
    phone: "+91 9988112233",
    company: "Tech & Co",
    status: "lost",
    source: "referral",
    revenue: 100000,
    notes: "Lost to competitor - price issue"
  },
  {
    name: "David Kumar",
    email: "david.k@services.com",
    phone: "+91 9876543211",
    company: "Kumar Services",
    status: "qualified",
    source: "other",
    revenue: 125000,
    notes: "Follow up next week"
  },
  {
    name: "Lisa Anderson",
    email: "lisa.a@global.com",
    phone: "+91 9123457890",
    company: "Global Industries",
    status: "won",
    source: "website",
    revenue: 450000,
    notes: "Premium client - annual contract"
  }
];

async function generateTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to Database');

    // Get first sales user to assign leads
    const salesUser = await User.findOne({ role: 'sales' });
    
    if (!salesUser) {
      console.log('⚠️ No sales user found. Creating leads without assignment.');
    }

    // Delete existing test leads (optional - comment out if you want to keep old data)
    // await Lead.deleteMany({});
    // console.log('🗑️ Cleared existing leads');

    // Add assignedTo if sales user exists
    const leadsToInsert = sampleLeads.map(lead => ({
      ...lead,
      assignedTo: salesUser ? salesUser._id : null,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
    }));

    // Insert leads
    const inserted = await Lead.insertMany(leadsToInsert);
    
    console.log(`\n✅ Successfully created ${inserted.length} test leads!`);
    console.log('\n📊 Summary:');
    console.log(`   - Won: ${leadsToInsert.filter(l => l.status === 'won').length}`);
    console.log(`   - Qualified: ${leadsToInsert.filter(l => l.status === 'qualified').length}`);
    console.log(`   - Contacted: ${leadsToInsert.filter(l => l.status === 'contacted').length}`);
    console.log(`   - New: ${leadsToInsert.filter(l => l.status === 'new').length}`);
    console.log(`   - Lost: ${leadsToInsert.filter(l => l.status === 'lost').length}`);
    console.log(`\n💰 Total Potential Revenue: ₹${leadsToInsert.reduce((sum, l) => sum + l.revenue, 0).toLocaleString()}`);
    console.log('\n🎯 You can now test the Reports page with different date ranges!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateTestData();
