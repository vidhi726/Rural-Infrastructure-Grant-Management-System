
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { connectToDatabase } = require('../src/lib/db/mongodb');
const { Application } = require('../src/models/Application');
const { User } = require('../src/models/User');
const { Village } = require('../src/models/Village');

async function checkData() {
    console.log('Connecting to database...');
    await connectToDatabase();
    
    console.log('\n--- Villages ---');
    const villages = await Village.find().limit(5).lean();
    if (villages.length === 0) console.log('No villages found.');
    villages.forEach(v => console.log(`Village: ${v.name}, ID: ${v._id} (Type: ${typeof v._id})`));

    console.log('\n--- Applications ---');
    const apps = await Application.find().limit(10).lean();
    if (apps.length === 0) console.log('No applications found.');
    apps.forEach(a => console.log(`App: ${a.title}, VillageID: ${a.village_id} (Type: ${typeof a.village_id})`));

    console.log('\n--- Users (Citizens) ---');
    const citizens = await User.find({ role: 'citizen' }).limit(5).lean();
    if (citizens.length === 0) console.log('No citizens found.');
    citizens.forEach(u => console.log(`User: ${u.full_name}, VillageID: ${u.village_id} (Type: ${typeof u.village_id})`));

    console.log('\n--- Detailed Match Check ---');
    if (citizens.length > 0) {
        for (const citizen of citizens) {
            console.log(`\nChecking matches for Citizen: ${citizen.full_name}, VillageID: ${citizen.village_id}`);
            const matches = await Application.countDocuments({ village_id: citizen.village_id });
            console.log(`Matching Applications count (strict): ${matches}`);
            
            if (matches === 0) {
                const idStr = String(citizen.village_id);
                const stringMatches = await Application.countDocuments({ village_id: idStr });
                console.log(`Matches by string ID: ${stringMatches}`);

                try {
                    const idObj = new mongoose.Types.ObjectId(idStr);
                    const objMatches = await Application.countDocuments({ village_id: idObj });
                    console.log(`Matches by ObjectId: ${objMatches}`);
                } catch (e) {
                    console.log('Could not convert to ObjectId');
                }
            }
        }
    }

    process.exit(0);
}

checkData().catch(err => { 
    console.error('ERROR:', err); 
    process.exit(1); 
});
