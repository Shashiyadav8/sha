const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const Staff = require('../models/Staff');

const users = [
  { name: 'shashi', email: 'vallalashashi9848@gmail.com', password: '12345', role: 'employee' },
  { name: 'nishanth', email: 'nishanth@gmail.com', password: '12345', role: 'admin' },
  { name: 'raju', email: 'raju@gmail.com', password: '12345', role: 'employee' },
  { name: 'nagaraju', email: 'nagaraju@gmail.com', password: '12345', role: 'employee' },
  { name: 'gokul', email: 'gokul003jan@gmail.com', password: '12345', role: 'employee' }
];

async function seedStaff() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    for (const user of users) {
      const exists = await Staff.findOne({ email: user.email });
      if (exists) {
        console.log(`⚠️  ${user.email} already exists. Skipping.`);
        continue;
      }

      const hashed = await bcrypt.hash(user.password, 10);
      const newUser = new Staff({
        name: user.name,
        email: user.email,
        password: hashed,
        role: user.role
      });

      await newUser.save();
      console.log(`✅ Inserted ${user.email}`);
    }

    console.log('🎉 All staff inserted successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error inserting staff:', err);
    process.exit(1);
  }
}

seedStaff();
