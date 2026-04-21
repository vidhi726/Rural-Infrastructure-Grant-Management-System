import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI is not defined in env');
    process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const db = client.db();

        console.log('Connected to MongoDB');

        // Helper to convert UUID string or random string to 24-char hex string (ObjectId compatible)
        const toOid = (id) => {
            if (!id) return new ObjectId();
            const map = {
                'e1111111-1111-1111-1111-111111111111': new ObjectId('650000000000000000000001'),
                'e2222222-2222-2222-2222-222222222222': new ObjectId('650000000000000000000002'),
                'e3333333-3333-3333-3333-333333333333': new ObjectId('650000000000000000000003'),
                'e4444444-4444-4444-4444-444444444444': new ObjectId('650000000000000000000004'),
                
                'd1111111-1111-1111-1111-111111111111': new ObjectId('650000000000000000000101'),
                'd2222222-2222-2222-2222-222222222222': new ObjectId('650000000000000000000102'),
                'd5555555-5555-5555-5555-555555555555': new ObjectId('650000000000000000000105'),
                'd7777777-7777-7777-7777-777777777777': new ObjectId('650000000000000000000107'),
                'd9999999-9999-9999-9999-999999999999': new ObjectId('650000000000000000000109'),
                
                '11111111-1111-1111-1111-111111111111': new ObjectId('650000000000000000000201'),
                'f5555555-5555-5555-5555-555555555555': new ObjectId('650000000000000000000205'),
                'f7777777-7777-7777-7777-777777777777': new ObjectId('650000000000000000000207'),
                'f9999999-9999-9999-9999-999999999999': new ObjectId('650000000000000000000209'),
                
                '51111111-1111-1111-1111-111111111111': new ObjectId('650000000000000000000301'),
                '52222222-2222-2222-2222-222222222222': new ObjectId('650000000000000000000302'),
                '53333333-3333-3333-3333-333333333333': new ObjectId('650000000000000000000303'),
            };
            return map[id] || new ObjectId();
        };

        // 1. STATES
        console.log('Seeding States...');
        const states = [
            { _id: toOid('e1111111-1111-1111-1111-111111111111'), name: 'Maharashtra', code: 'MH' },
            { _id: toOid('e2222222-2222-2222-2222-222222222222'), name: 'Gujarat', code: 'GJ' },
            { _id: toOid('e3333333-3333-3333-3333-333333333333'), name: 'Karnataka', code: 'KA' },
            { _id: toOid('e4444444-4444-4444-4444-444444444444'), name: 'Uttar Pradesh', code: 'UP' }
        ];
        await db.collection('states').deleteMany({});
        await db.collection('states').insertMany(states);

        // 2. DISTRICTS
        console.log('Seeding Districts...');
        const districts = [
            { _id: toOid('d1111111-1111-1111-1111-111111111111'), name: 'Pune', code: 'MH-PUN', state_id: toOid('e1111111-1111-1111-1111-111111111111') },
            { _id: toOid('d2222222-2222-2222-2222-222222222222'), name: 'Nashik', code: 'MH-NSK', state_id: toOid('e1111111-1111-1111-1111-111111111111') },
            { _id: toOid('d5555555-5555-5555-5555-555555555555'), name: 'Ahmedabad', code: 'GJ-AMD', state_id: toOid('e2222222-2222-2222-2222-222222222222') },
            { _id: toOid('d7777777-7777-7777-7777-777777777777'), name: 'Bengaluru', code: 'KA-BEN', state_id: toOid('e3333333-3333-3333-3333-333333333333') },
            { _id: toOid('d9999999-9999-9999-9999-999999999999'), name: 'Lucknow', code: 'UP-LKO', state_id: toOid('e4444444-4444-4444-4444-444444444444') }
        ];
        await db.collection('districts').deleteMany({});
        await db.collection('districts').insertMany(districts);

        // 3. VILLAGES
        console.log('Seeding Villages...');
        const villages = [
            { _id: toOid('11111111-1111-1111-1111-111111111111'), name: 'Wagholi', district_id: toOid('d1111111-1111-1111-1111-111111111111'), taluka: 'Haveli', population: 45000, pincode: '412207' },
            { _id: toOid('f5555555-5555-5555-5555-555555555555'), name: 'Bopal', district_id: toOid('d5555555-5555-5555-5555-555555555555'), taluka: 'Dascroi', population: 35000, pincode: '380058' },
            { _id: toOid('f7777777-7777-7777-7777-777777777777'), name: 'Whitefield', district_id: toOid('d7777777-7777-7777-7777-777777777777'), taluka: 'East', population: 85000, pincode: '560066' },
            { _id: toOid('f9999999-9999-9999-9999-999999999999'), name: 'Gomti Nagar', district_id: toOid('d9999999-9999-9999-9999-999999999999'), taluka: 'Lucknow', population: 120000, pincode: '226010' }
        ];
        await db.collection('villages').deleteMany({});
        await db.collection('villages').insertMany(villages);

        // 4. GRANT SCHEMES
        console.log('Seeding Grant Schemes...');
        const schemes = [
            { _id: toOid('51111111-1111-1111-1111-111111111111'), name: 'Pradhan Mantri Gram Sadak Yojana', category: 'roads', max_amount: 5000000, min_amount: 500000, installment_count: 4, is_active: true, required_documents: ['Detailed Project Report', 'Village Resolution', 'Land Clearance Certificate'] },
            { _id: toOid('52222222-2222-2222-2222-222222222222'), name: 'Jal Jeevan Mission', category: 'water', max_amount: 3000000, min_amount: 200000, installment_count: 3, is_active: true, required_documents: ['Water Connectivity Plan', 'Panchayat NOC', 'Technical Approval'] },
            { _id: toOid('53333333-3333-3333-3333-333333333333'), name: 'Samagra Shiksha Abhiyan', category: 'education', max_amount: 2000000, min_amount: 100000, installment_count: 2, is_active: true, required_documents: ['School Condition Report', 'Education Committee Recommendation', 'Estimated Budget'] }
        ];
        await db.collection('grantschemes').deleteMany({});
        await db.collection('grantschemes').insertMany(schemes);
        
        // 5. USERS
        console.log('Seeding Dummy Users...');
        const hashedPassword = await bcrypt.hash('123456', 10);
        const dummyUsers = [
            // Maharashtra
            { email: 'mh.c@gov.in', password: hashedPassword, full_name: 'MH Citizen', role: 'citizen', state_id: toOid('e1111111-1111-1111-1111-111111111111'), district_id: toOid('d1111111-1111-1111-1111-111111111111'), village_id: toOid('11111111-1111-1111-1111-111111111111'), is_active: true },
            { email: 'mh.p@gov.in', password: hashedPassword, full_name: 'MH Panchayat', role: 'panchayat_officer', state_id: toOid('e1111111-1111-1111-1111-111111111111'), district_id: toOid('d1111111-1111-1111-1111-111111111111'), village_id: toOid('11111111-1111-1111-1111-111111111111'), is_active: true },
            { email: 'mh.g@gov.in', password: hashedPassword, full_name: 'MH Government', role: 'government_officer', state_id: toOid('e1111111-1111-1111-1111-111111111111'), district_id: toOid('d1111111-1111-1111-1111-111111111111'), is_active: true },
            
            // Gujarat
            { email: 'gj.c@gov.in', password: hashedPassword, full_name: 'GJ Citizen', role: 'citizen', state_id: toOid('e2222222-2222-2222-2222-222222222222'), district_id: toOid('d5555555-5555-5555-5555-555555555555'), village_id: toOid('f5555555-5555-5555-5555-555555555555'), is_active: true },
            { email: 'gj.p@gov.in', password: hashedPassword, full_name: 'GJ Panchayat', role: 'panchayat_officer', state_id: toOid('e2222222-2222-2222-2222-222222222222'), district_id: toOid('d5555555-5555-5555-5555-555555555555'), village_id: toOid('f5555555-5555-5555-5555-555555555555'), is_active: true },
            { email: 'gj.g@gov.in', password: hashedPassword, full_name: 'GJ Government', role: 'government_officer', state_id: toOid('e2222222-2222-2222-2222-222222222222'), district_id: toOid('d5555555-5555-5555-5555-555555555555'), is_active: true },
            
            // Karnataka
            { email: 'ka.c@gov.in', password: hashedPassword, full_name: 'KA Citizen', role: 'citizen', state_id: toOid('e3333333-3333-3333-3333-333333333333'), district_id: toOid('d7777777-7777-7777-7777-777777777777'), village_id: toOid('f7777777-7777-7777-7777-777777777777'), is_active: true },
            { email: 'ka.p@gov.in', password: hashedPassword, full_name: 'KA Panchayat', role: 'panchayat_officer', state_id: toOid('e3333333-3333-3333-3333-333333333333'), district_id: toOid('d7777777-7777-7777-7777-777777777777'), village_id: toOid('f7777777-7777-7777-7777-777777777777'), is_active: true },
            { email: 'ka.g@gov.in', password: hashedPassword, full_name: 'KA Government', role: 'government_officer', state_id: toOid('e3333333-3333-3333-3333-333333333333'), district_id: toOid('d7777777-7777-7777-7777-777777777777'), is_active: true },
            
            // Uttar Pradesh
            { email: 'up.c@gov.in', password: hashedPassword, full_name: 'UP Citizen', role: 'citizen', state_id: toOid('e4444444-4444-4444-4444-444444444444'), district_id: toOid('d9999999-9999-9999-9999-999999999999'), village_id: toOid('f9999999-9999-9999-9999-999999999999'), is_active: true },
            { email: 'up.p@gov.in', password: hashedPassword, full_name: 'UP Panchayat', role: 'panchayat_officer', state_id: toOid('e4444444-4444-4444-4444-444444444444'), district_id: toOid('d9999999-9999-9999-9999-999999999999'), village_id: toOid('f9999999-9999-9999-9999-999999999999'), is_active: true },
            { email: 'up.g@gov.in', password: hashedPassword, full_name: 'UP Government', role: 'government_officer', state_id: toOid('e4444444-4444-4444-4444-444444444444'), district_id: toOid('d9999999-9999-9999-9999-999999999999'), is_active: true },
            
            // Admin
            { email: 'admin@gov.in', password: hashedPassword, full_name: 'System Admin', role: 'admin', is_active: true }
        ];
        
        await db.collection('users').deleteMany({});
        await db.collection('users').insertMany(dummyUsers);

        console.log('Seed data successfully migrated!');
    } catch (err) {
        console.error('Error seeding:', err);
    } finally {
        await client.close();
    }
}

run();
