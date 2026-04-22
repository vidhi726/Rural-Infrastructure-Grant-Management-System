const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/grant_management';

async function fix() {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ full_name: String, village_id: mongoose.Schema.Types.ObjectId, role: String }), 'users');
        
        // Map all panchayat officers to a village if they don't have one
        const updates = [
            { full_name: 'gujaratpanchayat', village_id: '69d7bb5fac4246ce613dd452' }, // Bopal
            { full_name: 'karnatakapanchayat', village_id: '69d7bb5fac4246ce613dd454' }, // Whitefield
            { full_name: 'uttarpradeshpanchayat', village_id: '69d7bb5fac4246ce613dd456' } // Gomti Nagar
        ];

        for (const update of updates) {
            const res = await User.updateOne({ full_name: update.full_name }, { $set: { village_id: update.village_id } });
            console.log(`Updated ${update.full_name}: ${res.modifiedCount} matches`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
