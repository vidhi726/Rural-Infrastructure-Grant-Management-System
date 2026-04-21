import { NextResponse } from 'next/server';
import { getNotifications } from '@/lib/db/actions';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const userId = decoded.userId;

        const notifications = await getNotifications(userId);
        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error in GET /api/notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
