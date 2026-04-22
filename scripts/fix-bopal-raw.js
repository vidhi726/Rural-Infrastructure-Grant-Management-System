const mongoose = require('mongoose');

async function fix() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        console.error('MONGODB_URI not defined');
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Register schemas manually to be safe
    const districtSchema = new mongoose.Schema({ name: String });
    const villageSchema = new mongoose.Schema({ name: String, district_id: { type: mongoose.Schema.Types.ObjectId, ref: 'District' } });
    const userSchema = new mongoose.Schema({ full_name: String, village_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' }, district_id: { type: mongoose.Schema.Types.ObjectId, ref: 'District' } });

    const District = mongoose.models.District || mongoose.model('District', districtSchema);
    const Village = mongoose.models.Village || mongoose.model('Village', villageSchema);
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // 1. Find Bopal
    const bopal = await Village.findOne({ name: 'Bopal' });
    if (!bopal) {
        console.log('Village Bopal not found');
        process.exit(0);
    }
    console.log('Found Village Bopal:', bopal._id, 'District ID:', bopal.district_id);

    // 2. Find User
    const user = await User.findOne({ full_name: 'gujaratpanchayat' });
    if (!user) {
        console.log('User gujaratpanchayat not found');
        process.exit(0);
    }
    console.log('User current District ID:', user.district_id);

    // 3. Fix
    if (String(user.district_id) !== String(bopal.district_id)) {
        console.log('Mismatch! Updating user district to match village district...');
        user.district_id = bopal.district_id;
        await user.save();
        console.log('Update successful.');
    } else {
        console.log('No mismatch found.');
    }

    await mongoose.disconnect();
    process.exit(0);
}

fix().catch(console.error);
