const mongoose = require('mongoose');

async function checkUserData() {
    const MONGO_URI = 'mongodb://localhost:27017/grant-manage'; // Assuming default local URI, will check if possible
    // Wait, I should find the actual connection string.
    // Usually it's in .env
    
    // Let's just try to connect using the logic from the app.
}

// Actually I'll just use the existing models and connection logic.
const { connectToDatabase } = require('./src/lib/db/mongodb');
const { User } = require('./src/models/User');
const { Village } = require('./src/models/Village');
const { District } = require('./src/models/District');

async function run() {
    await connectToDatabase();
    const user = await User.findOne({ full_name: 'gujaratpanchayat' })
        .populate('village_id')
        .populate('district_id');
    
    if (user) {
        console.log('User found:', user.full_name);
        console.log('Village:', user.village_id ? user.village_id.name : 'None');
        console.log('District (from User):', user.district_id ? user.district_id.name : 'None');
        
        if (user.village_id) {
            const villageDistrict = await District.findById(user.village_id.district_id);
            console.log('District (from Village):', villageDistrict ? villageDistrict.name : 'None');
            
            if (villageDistrict && user.district_id && String(villageDistrict._id) !== String(user.district_id._id)) {
                console.log('Inconsistency detected! Updating user district to match village district...');
                user.district_id = villageDistrict._id;
                await user.save();
                console.log('User updated successfully.');
            }
        }
    } else {
        console.log('User gujaratpanchayat not found.');
    }
    process.exit(0);
}

run().catch(console.error);
