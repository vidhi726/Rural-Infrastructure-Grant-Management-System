import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/jwt';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User';

export async function GET() {
    console.log('GET /api/auth/me - Attempting to get session...');
    const session = await getAuthSession();

    if (!session || !session.id) {
        console.log('GET /api/auth/me - No active session found.');
        return NextResponse.json({ user: null }, { status: 401 });
    }

    console.log('GET /api/auth/me - Session found, ID:', session.id);
    await connectToDatabase();
    const user = await User.findById(session.id).select('-password');
    if (!user) {
        console.log('GET /api/auth/me - user not found in DB even though session exists', session.id);
        return NextResponse.json({ user: null }, { status: 401 });
    }

    console.log('GET /api/auth/me - user found:', user.email, user.role);
    return NextResponse.json({ user }, { status: 200 });
}
