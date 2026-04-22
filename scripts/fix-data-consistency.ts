
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Application } from '../src/models/Application';
import { User } from '../src/models/User';
import { Village } from '../src/models/Village';
import { connectToDatabase } from '../src/lib/db/mongodb';

dotenv.config({ path: '.env.local' });

async function migrate() {
    console.log('🚀 Starting Data Consistency Fix...');
    
    try {
        await connectToDatabase();
        console.log('✅ Connected to Database');

        // 1. Get all villages for mapping
        const villages = await Village.find().lean();
        const villageMap = new Map(villages.map((v: any) => [v.name, v._id]));
        const defaultVillageId = villages[0]?._id;

        if (!defaultVillageId) {
            throw new Error('No villages found in database. Please seed villages first.');
        }

        console.log(`📍 Found ${villages.length} villages. Default: ${villages[0].name}`);

        // 2. Fetch all applications
        const apps = await Application.find().populate('submitted_by').lean();
        console.log(`📦 Processing ${apps.length} applications...`);

        let updatedCount = 0;
        let mismatchCount = 0;

        for (const app of apps) {
            let correctVillageId = null;

            // Strategy 1: Match by Submitting User's Village
            if (app.submitted_by && app.submitted_by.village_id) {
                correctVillageId = app.submitted_by.village_id;
            } 
            // Strategy 2: If no user, but we can guess from title or existing orphan ID
            else if (app.village_id) {
                // If it's already an ID, we keep it as long as it exists in Village collection
                const villageExists = villages.some((v: any) => String(v._id) === String(app.village_id));
                if (villageExists) {
                    correctVillageId = app.village_id;
                }
            }

            // Fallback: Assign to default village if still null
            if (!correctVillageId) {
                correctVillageId = defaultVillageId;
                console.log(`⚠️ App "${app.title}" had no valid village. Assigned to ${villages[0].name}.`);
            }

            // Update identifying exact ObjectId type
            const targetId = new mongoose.Types.ObjectId(String(correctVillageId));

            if (String(app.village_id) !== String(targetId)) {
                await Application.findByIdAndUpdate(app._id, { village_id: targetId });
                updatedCount++;
            }
        }

        console.log(`\n✨ Migration Complete!`);
        console.log(`📊 Updated: ${updatedCount} applications`);
        
        // 3. Final Validation: check Citizen matches
        console.log('\n🔍 Validation Check:');
        const citizens = await User.find({ role: 'citizen' }).limit(5).lean();
        for (const citizen of citizens) {
            const count = await Application.countDocuments({ village_id: citizen.village_id });
            console.log(`👤 Citizen ${citizen.full_name} (${citizen.email}): ${count} matching projects`);
        }

    } catch (error) {
        console.error('❌ Migration Failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

migrate();
