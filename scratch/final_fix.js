const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/grant_management';

async function repair() {
    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ village_id: mongoose.Schema.Types.ObjectId }), 'users');
        const App = mongoose.models.Application || mongoose.model('Application', new mongoose.Schema({ 
            village_id: mongoose.Schema.Types.ObjectId, 
            submitted_by: mongoose.Schema.Types.ObjectId 
        }), 'applications');

        const BOPAL_ID = '69d7bb5fac4246ce613dd452';
        const GUJ_P_ID = '69d7bb5fac4246ce613dd472';

        console.log('Fixing gujaratpanchayat user profile...');
        await User.updateOne({ _id: GUJ_P_ID }, { $set: { village_id: BOPAL_ID } });

        console.log('Fixing applications submitted by gujaratpanchayat...');
        const result = await App.updateMany({ submitted_by: GUJ_P_ID }, { $set: { village_id: BOPAL_ID } });
        console.log(`Fixed ${result.modifiedCount} applications.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

repair();
