import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/jwt';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Document as AppDocument } from '@/models/Document';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getAuthSession();
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only Government users can download files according to requirements
        if (session.role !== 'government' && session.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Only Government users can download files' }, { status: 403 });
        }

        await connectToDatabase();
        const doc = await AppDocument.findById(id).lean() as any;

        if (!doc) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const filePath = path.join(process.cwd(), 'public', doc.file_url);
        
        try {
            const fileBuffer = await fs.readFile(filePath);
            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': doc.mime_type || 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${doc.file_name}"`,
                },
            });
        } catch (fileError) {
            console.error('File system error:', fileError);
            return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
        }

    } catch (error) {
        console.error('Error in GET /api/download/[id]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
