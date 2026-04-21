import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User';
import { signToken, setAuthCookie } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const { email, password, fullName, phone, role, stateId, districtId, villageId } = await req.json();

        if (!email || !password || !fullName || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectToDatabase();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            full_name: fullName,
            phone,
            role: email === 'admin@gmail.com' ? 'admin' : role,
            state_id: stateId || undefined,
            district_id: districtId || undefined,
            village_id: villageId || undefined,
        });

        const payload = { id: user._id.toString(), email: user.email, role: user.role };
        const token = signToken(payload);
        await setAuthCookie(token);

        return NextResponse.json({ user: payload }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
