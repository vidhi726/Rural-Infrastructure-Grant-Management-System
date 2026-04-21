import { NextRequest, NextResponse } from 'next/server';
import { getMilestones, addMilestone } from '@/lib/db/actions';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const applicationId = searchParams.get('applicationId');

        if (!applicationId) {
            return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
        }

        const milestones = await getMilestones(applicationId);
        return NextResponse.json(milestones);
    } catch (error) {
        console.error('Error in GET /api/milestones:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const role = decoded.role;

        // Security check: only Government/Admin can add milestones
        if (role !== 'government_officer' && role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const milestone = await addMilestone(body);
        return NextResponse.json(milestone);
    } catch (error) {
        console.error('Error in POST /api/milestones:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
