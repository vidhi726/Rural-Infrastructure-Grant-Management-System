const mongoose = require('mongoose');

// Use current directory for models
const uri = "mongodb://localhost:27017/grant-management"; // Adjusted for potential local env, but usually I should check codebase for DB URI

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grant-management');
        console.log('Connected to database');

        const Application = mongoose.model('Application', new mongoose.Schema({}, { strict: false }));
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Village = mongoose.model('Village', new mongoose.Schema({}, { strict: false }));

        const apps = await Application.find({}).lean();
        console.log(`Found ${apps.length} applications`);

        for (const app of apps) {
            console.log(`App: ${app.application_number}, VillageID: ${app.village_id}`);
            
            const village = await Village.findById(app.village_id);
            if (village) {
                console.log(`  Valid Village: ${village.name}`);
            } else {
                console.log(`  INVALID Village ID! Checking if it is a User ID...`);
                const user = await User.findById(app.village_id);
                if (user) {
                    console.log(`  Found User with this ID: ${user.full_name} (${user.role})`);
                    if (user.role === 'panchayat_officer') {
                        console.log(`  Link error: Application village_id is set to Panchayat Officer User ID!`);
                    }
                }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
