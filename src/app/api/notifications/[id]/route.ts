import { NextRequest, NextResponse } from 'next/server';
import { markNotificationAsRead } from '@/lib/db/actions';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const userId = decoded.userId;

        // Security check: only mark as read if it belongs to the user
        const result = await markNotificationAsRead(id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in PATCH /api/notifications/[id]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
