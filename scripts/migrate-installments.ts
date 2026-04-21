import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import { Application } from '../src/models/Application';

async function migrate() {
    console.log('Starting migration to initialize installments array and totalReleasedAmount for all applications...');

    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
        }
        await mongoose.connect(MONGODB_URI);

        // Find applications where installments is missing, or totalReleasedAmount is missing
        const result = await Application.updateMany(
            {
                $or: [
                    { installments: { $exists: false } },
                    { installments: null },
                    { totalReleasedAmount: { $exists: false } },
                    { totalReleasedAmount: null }
                ]
            },
            {
                $set: {
                    installments: [],
                    totalReleasedAmount: 0
                }
            }
        );

        console.log(`Migration complete! Modified ${result.modifiedCount} applications.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
