const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/grant_management';

async function repair() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        // Define temporary schemas to avoid model conflicts
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            village_id: mongoose.Schema.Types.ObjectId
        }), 'users');

        const Application = mongoose.models.Application || mongoose.model('Application', new mongoose.Schema({
            village_id: mongoose.Schema.Types.ObjectId,
            submitted_by: mongoose.Schema.Types.ObjectId,
            application_number: String,
            title: String
        }), 'applications');

        const apps = await Application.find({});
        console.log(`Checking ${apps.length} applications...`);

        let fixCount = 0;

        for (const app of apps) {
            // Check if village_id exists in Users collection
            const user = await User.findById(app.village_id);
            
            if (user) {
                console.log(`[FIX] Application ${app.application_number} ("${app.title}") has village_id pointing to User: ${user._id}`);
                
                if (user.village_id) {
                    console.log(`      Updating to actual Village ID: ${user.village_id}`);
                    
                    // Fix it
                    await Application.updateOne(
                        { _id: app._id },
                        { 
                            $set: { 
                                village_id: user.village_id,
                                submitted_by: user._id // Ensure submitted_by is the user
                            } 
                        }
                    );
                    fixCount++;
                } else {
                    console.log(`      [WARN] User ${user._id} does not have a village_id assigned! Cannot fix automatically.`);
                }
            } else {
                // If not a user, assume it's correctly a village (or something else we don't handle)
                // console.log(`[OK] Application ${app.application_number} has village_id: ${app.village_id}`);
            }
        }

        console.log(`\nRepair complete. Fixed ${fixCount} applications.`);
        process.exit(0);
    } catch (err) {
        console.error('Repair failed:', err);
        process.exit(1);
    }
}

repair();
