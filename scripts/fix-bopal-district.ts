import mongoose from 'mongoose';
import { District } from '../src/models/District';
import { Village } from '../src/models/Village';
import { State } from '../src/models/State';
import { User } from '../src/models/User';
import { connectToDatabase } from '../src/lib/db/mongodb';

async function fix() {
    await connectToDatabase();
    console.log('Connected to DB');

    // 1. Find the village Bopal
    const bopal = await Village.findOne({ name: 'Bopal' }).populate('district_id');
    if (!bopal) {
        console.log('Village Bopal not found');
        process.exit(0);
    }
    console.log('Found Village Bopal:', bopal._id);
    console.log('District assigned to Bopal:', (bopal.district_id as any)?.name, (bopal.district_id as any)?._id);

    // 2. Find the user gujaratpanchayat
    const user = await User.findOne({ full_name: 'gujaratpanchayat' }).populate('district_id');
    if (!user) {
        console.log('User gujaratpanchayat not found');
        process.exit(0);
    }
    console.log('User gujaratpanchayat current district:', (user.district_id as any)?.name, (user.district_id as any)?._id);

    // 3. Fix user if there is a mismatch
    if (String(user.district_id?._id || user.district_id) !== String(bopal.district_id?._id || bopal.district_id)) {
        console.log('Mismatch detected! Updating user district...');
        user.district_id = (bopal.district_id as any)?._id || bopal.district_id;
        await user.save();
        console.log('User updated successfully.');
    } else {
        console.log('No mismatch detected in User document.');
    }

    process.exit(0);
}

fix().catch(console.error);
