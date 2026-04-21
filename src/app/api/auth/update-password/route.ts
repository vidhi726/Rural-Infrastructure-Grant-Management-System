import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User';
import { getAuthSession } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session || !session.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { password } = await req.json();
        if (!password) {
            return NextResponse.json({ error: 'Missing new password' }, { status: 400 });
        }

        await connectToDatabase();

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(session.id, { password: hashedPassword });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
