import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { State } from '../src/models/State';
import { District } from '../src/models/District';
import { Village } from '../src/models/Village';
import { User } from '../src/models/User';
import { GrantScheme } from '../src/models/GrantScheme';
import { Application } from '../src/models/Application';
import { Milestone } from '../src/models/Milestone';
import { Installment } from '../src/models/Installment';
import { FundTransfer } from '../src/models/FundTransfer';
import { Complaint } from '../src/models/Complaint';
import { Feedback } from '../src/models/Feedback';
import { AuditLog } from '../src/models/AuditLog';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            State.deleteMany({}),
            District.deleteMany({}),
            Village.deleteMany({}),
            User.deleteMany({}),
            GrantScheme.deleteMany({}),
            Application.deleteMany({}),
            Milestone.deleteMany({}),
            Installment.deleteMany({}),
            FundTransfer.deleteMany({}),
            Complaint.deleteMany({}),
            Feedback.deleteMany({}),
            AuditLog.deleteMany({}),
        ]);
        console.log('Cleared existing data');

        const idMap: Record<string, mongoose.Types.ObjectId> = {};

        // 1. STATES
        const states = [
            { id: 'e1111111-1111-1111-1111-111111111111', name: 'Maharashtra', code: 'MH' },
            { id: 'e2222222-2222-2222-2222-222222222222', name: 'Gujarat', code: 'GJ' },
            { id: 'e3333333-3333-3333-3333-333333333333', name: 'Karnataka', code: 'KA' },
            { id: 'e4444444-4444-4444-4444-444444444444', name: 'Uttar Pradesh', code: 'UP' }
        ];

        for (const s of states) {
            const newState = await State.create({ name: s.name, code: s.code });
            idMap[s.id] = newState._id as mongoose.Types.ObjectId;
        }
        console.log('Seeded States');

        // 2. DISTRICTS
        const districts = [
            { id: 'd1111111-1111-1111-1111-111111111111', name: 'Pune', code: 'MH-PUN', state_id: 'e1111111-1111-1111-1111-111111111111' },
            { id: 'd2222222-2222-2222-2222-222222222222', name: 'Nashik', code: 'MH-NSK', state_id: 'e1111111-1111-1111-1111-111111111111' },
            { id: 'd3333333-3333-3333-3333-333333333333', name: 'Satara', code: 'MH-SAT', state_id: 'e1111111-1111-1111-1111-111111111111' },
            { id: 'd4444444-4444-4444-4444-444444444444', name: 'Kolhapur', code: 'MH-KOL', state_id: 'e1111111-1111-1111-1111-111111111111' },
            { id: 'd5555555-5555-5555-5555-555555555555', name: 'Ahmedabad', code: 'GJ-AMD', state_id: 'e2222222-2222-2222-2222-222222222222' },
            { id: 'd6666666-6666-6666-6666-666666666666', name: 'Surat', code: 'GJ-SUR', state_id: 'e2222222-2222-2222-2222-222222222222' },
            { id: 'd7777777-7777-7777-7777-777777777777', name: 'Bengaluru', code: 'KA-BEN', state_id: 'e3333333-3333-3333-3333-333333333333' },
            { id: 'd8888888-8888-8888-8888-888888888888', name: 'Mysuru', code: 'KA-MYS', state_id: 'e3333333-3333-3333-3333-333333333333' },
            { id: 'd9999999-9999-9999-9999-999999999999', name: 'Lucknow', code: 'UP-LKO', state_id: 'e4444444-4444-4444-4444-444444444444' },
            { id: 'daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Varanasi', code: 'UP-VNS', state_id: 'e4444444-4444-4444-4444-444444444444' }
        ];

        for (const d of districts) {
            const newDist = await District.create({ name: d.name, code: d.code, state_id: idMap[d.state_id] });
            idMap[d.id] = newDist._id as mongoose.Types.ObjectId;
        }
        console.log('Seeded Districts');

        // 3. VILLAGES
        const villages = [
            { id: '11111111-1111-1111-1111-111111111111', name: 'Wagholi', district_id: 'd1111111-1111-1111-1111-111111111111', taluka: 'Haveli', population: 45000, pincode: '412207' },
            { id: '11111111-1111-1111-1111-222222222222', name: 'Loni Kalbhor', district_id: 'd1111111-1111-1111-1111-111111111111', taluka: 'Haveli', population: 28000, pincode: '412201' },
            { id: '11111111-1111-1111-1111-333333333333', name: 'Uruli Kanchan', district_id: 'd1111111-1111-1111-1111-111111111111', taluka: 'Haveli', population: 35000, pincode: '412202' },
            { id: 'f5555555-5555-5555-5555-555555555555', name: 'Bopal', district_id: 'd5555555-5555-5555-5555-555555555555', taluka: 'Dascroi', population: 35000, pincode: '380058' },
            { id: 'f7777777-7777-7777-7777-777777777777', name: 'Whitefield', district_id: 'd7777777-7777-7777-7777-777777777777', taluka: 'East', population: 85000, pincode: '560066' },
            { id: 'f9999999-9999-9999-9999-999999999999', name: 'Gomti Nagar', district_id: 'd9999999-9999-9999-9999-999999999999', taluka: 'Lucknow', population: 120000, pincode: '226010' },
            { id: '22222222-2222-2222-2222-111111111111', name: 'Sinnar', district_id: 'd2222222-2222-2222-2222-222222222222', taluka: 'Sinnar', population: 32000, pincode: '422103' },
            { id: '22222222-2222-2222-2222-222222222222', name: 'Igatpuri', district_id: 'd2222222-2222-2222-2222-222222222222', taluka: 'Igatpuri', population: 18000, pincode: '422403' },
            { id: '22222222-2222-2222-2222-333333333333', name: 'Dindori', district_id: 'd2222222-2222-2222-2222-222222222222', taluka: 'Dindori', population: 22000, pincode: '422202' },
            { id: '33333333-3333-3333-3333-111111111111', name: 'Wai', district_id: 'd3333333-3333-3333-3333-333333333333', taluka: 'Wai', population: 40000, pincode: '412803' },
            { id: '33333333-3333-3333-3333-222222222222', name: 'Mahabaleshwar', district_id: 'd3333333-3333-3333-3333-333333333333', taluka: 'Mahabaleshwar', population: 15000, pincode: '412806' },
            { id: '33333333-3333-3333-3333-333333333333', name: 'Panchgani', district_id: 'd3333333-3333-3333-3333-333333333333', taluka: 'Mahabaleshwar', population: 12000, pincode: '412805' },
            { id: '44444444-4444-4444-4444-111111111111', name: 'Kagal', district_id: 'd4444444-4444-4444-4444-444444444444', taluka: 'Kagal', population: 25000, pincode: '416216' },
            { id: '44444444-4444-4444-4444-222222222222', name: 'Ichalkaranji', district_id: 'd4444444-4444-4444-4444-444444444444', taluka: 'Hatkanangle', population: 55000, pincode: '416115' },
            { id: '44444444-4444-4444-4444-333333333333', name: 'Panhala', district_id: 'd4444444-4444-4444-4444-444444444444', taluka: 'Panhala', population: 18000, pincode: '416201' }
        ];

        for (const v of villages) {
            const newVil = await Village.create({ name: v.name, district_id: idMap[v.district_id], taluka: v.taluka, population: v.population, pincode: v.pincode });
            idMap[v.id] = newVil._id as mongoose.Types.ObjectId;
        }
        console.log('Seeded Villages');

        // 4. USERS
        const passwordHash = await bcrypt.hash('123456', 10);
        const userEmails = [
            { email: 'mh.c@gmail.com', name: 'maharashtracitizen', role: 'citizen', state: 'e1111111-1111-1111-1111-111111111111', dist: 'd1111111-1111-1111-1111-111111111111', vil: '11111111-1111-1111-1111-111111111111' },
            { email: 'mh.p@gmail.com', name: 'maharashtrapanchayat', role: 'panchayat_officer', state: 'e1111111-1111-1111-1111-111111111111', dist: 'd2222222-2222-2222-2222-222222222222', vil: '22222222-2222-2222-2222-111111111111' },
            { email: 'mh.g@gmail.com', name: 'maharashtragovernment', role: 'government_officer', state: 'e1111111-1111-1111-1111-111111111111', dist: 'd3333333-3333-3333-3333-333333333333', vil: '33333333-3333-3333-3333-111111111111' },
            { email: 'gj.c@gmail.com', name: 'gujaratcitizen', role: 'citizen', state: 'e2222222-2222-2222-2222-222222222222', dist: 'd5555555-5555-5555-5555-555555555555', vil: 'f5555555-5555-5555-5555-555555555555' },
            { email: 'gj.p@gmail.com', name: 'gujaratpanchayat', role: 'panchayat_officer', state: 'e2222222-2222-2222-2222-222222222222', dist: 'd6666666-6666-6666-6666-666666666666', vil: null },
            { email: 'gj.g@gmail.com', name: 'gujaratgovernment', role: 'government_officer', state: 'e2222222-2222-2222-2222-222222222222', dist: 'd5555555-5555-5555-5555-555555555555', vil: null },
            { email: 'ka.c@gmail.com', name: 'karnatakacitizen', role: 'citizen', state: 'e3333333-3333-3333-3333-333333333333', dist: 'd7777777-7777-7777-7777-777777777777', vil: 'f7777777-7777-7777-7777-777777777777' },
            { email: 'ka.p@gmail.com', name: 'karnatakapanchayat', role: 'panchayat_officer', state: 'e3333333-3333-3333-3333-333333333333', dist: 'd8888888-8888-8888-8888-888888888888', vil: null },
            { email: 'ka.g@gmail.com', name: 'karnatakagovernment', role: 'government_officer', state: 'e3333333-3333-3333-3333-333333333333', dist: 'd7777777-7777-7777-7777-777777777777', vil: null },
            { email: 'up.c@gmail.com', name: 'uttarpradeshcitizen', role: 'citizen', state: 'e4444444-4444-4444-4444-444444444444', dist: 'd9999999-9999-9999-9999-999999999999', vil: 'f9999999-9999-9999-9999-999999999999' },
            { email: 'up.p@gmail.com', name: 'uttarpradeshpanchayat', role: 'panchayat_officer', state: 'e4444444-4444-4444-4444-444444444444', dist: 'daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', vil: null },
            { email: 'up.g@gmail.com', name: 'uttarpradeshgovernment', role: 'government_officer', state: 'e4444444-4444-4444-4444-444444444444', dist: 'd9999999-9999-9999-9999-999999999999', vil: null }
        ];

        for (const u of userEmails) {
            const newUser = await User.create({
                email: u.email,
                password: passwordHash,
                full_name: u.name,
                role: u.role,
                state_id: idMap[u.state],
                district_id: u.dist ? idMap[u.dist] : undefined,
                village_id: u.vil ? idMap[u.vil] : undefined,
                phone: '12345678'
            });
            idMap[u.email] = newUser._id as mongoose.Types.ObjectId;
        }
        console.log('Seeded Users');

        // 5. GRANT SCHEMES
        const schemes = [
            { id: '51111111-1111-1111-1111-111111111111', name: 'Pradhan Mantri Gram Sadak Yojana', desc: 'Central scheme for construction of all-weather roads in rural areas', cat: 'roads', max: 5000000, min: 500000, inst: 4, gap: 45, docs: ["Project Proposal", "Land Documents", "Environmental Clearance", "Technical Survey Report"] },
            { id: '52222222-2222-2222-2222-222222222222', name: 'Jal Jeevan Mission', desc: 'Piped water supply to every rural household', cat: 'water', max: 3000000, min: 200000, inst: 3, gap: 30, docs: ["Water Quality Report", "Population Certificate", "Land NOC", "Technical Plan"] },
            { id: '53333333-3333-3333-3333-333333333333', name: 'Samagra Shiksha Abhiyan', desc: 'Comprehensive program for school education covering pre-school to senior secondary', cat: 'education', max: 2000000, min: 100000, inst: 2, gap: 60, docs: ["School Registration", "Student Enrollment Data", "Infrastructure Assessment", "Teacher Details"] },
            { id: '54444444-4444-4444-4444-444444444444', name: 'Deen Dayal Upadhyaya Gram Jyoti Yojana', desc: 'Rural electrification scheme for feeder separation, strengthening of sub-transmission', cat: 'power', max: 4000000, min: 300000, inst: 3, gap: 45, docs: ["Load Assessment Report", "Electricity Board NOC", "Route Survey", "Demand Letter"] },
            { id: '55555555-5555-5555-5555-555555555555', name: 'Rashtriya Krishi Vikas Yojana', desc: 'Agricultural development scheme for increasing production and farmers income', cat: 'agriculture', max: 1500000, min: 50000, inst: 2, gap: 30, docs: ["Land Records", "Farmer Registration", "Crop Plan", "Water Source Details"] },
            { id: '56666666-6666-6666-6666-666666666666', name: 'National Health Mission - Rural', desc: 'Strengthening healthcare infrastructure in rural areas', cat: 'healthcare', max: 2500000, min: 150000, inst: 3, gap: 45, docs: ["Health Center Registration", "Staff Details", "Equipment List", "Building Plan"] }
        ];

        for (const sch of schemes) {
            const newSch = await GrantScheme.create({
                name: sch.name,
                description: sch.desc,
                category: sch.cat,
                max_amount: sch.max,
                min_amount: sch.min,
                installment_count: sch.inst,
                time_gap_days: sch.gap,
                required_documents: sch.docs,
                is_active: true,
                valid_from: new Date('2024-01-01'),
                valid_until: new Date('2027-12-31')
            });
            idMap[sch.id] = newSch._id as mongoose.Types.ObjectId;
        }
        console.log('Seeded Grant Schemes');

        // 6. APPLICATIONS
        const applications = [
            { id: 'a1111111-1111-1111-1111-111111111111', num: 'RIGMS-2024-000001', vil: '11111111-1111-1111-1111-111111111111', sch: '51111111-1111-1111-1111-111111111111', title: 'Construction of 5km Village Road to Market', desc: 'Construction of paved road connecting Wagholi village to the main market area, improving access for 45000 residents.', req: 4500000, app: 4200000, status: 'completed', pct: 100 },
            { id: 'a2222222-2222-2222-2222-222222222222', num: 'RIGMS-2024-000002', vil: '22222222-2222-2222-2222-111111111111', sch: '52222222-2222-2222-2222-222222222222', title: 'Piped Water Supply Installation', desc: 'Installation of piped water supply network covering 1500 households in Sinnar village.', req: 2800000, app: 2600000, status: 'in_progress', pct: 65 },
            { id: 'a3333333-3333-3333-3333-333333333333', num: 'RIGMS-2024-000003', vil: '33333333-3333-3333-3333-111111111111', sch: '56666666-6666-6666-6666-666666666666', title: 'Primary Health Center Renovation', desc: 'Complete renovation and equipment upgrade for Wai village Primary Health Center.', req: 2200000, app: 2000000, status: 'approved', pct: 25 }
        ];

        for (const app of applications) {
            const newApp = await Application.create({
                application_number: app.num,
                village_id: idMap[app.vil],
                scheme_id: idMap[app.sch],
                title: app.title,
                description: app.desc,
                requested_amount: app.req,
                approved_amount: app.app,
                status: app.status,
                completion_percentage: app.pct,
                expected_completion_date: new Date('2026-12-31')
            });
            idMap[app.id] = newApp._id as mongoose.Types.ObjectId;
        }
        console.log('Seeded Applications');

        // ... Add more if needed, but this is a good start to unblock the user

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
