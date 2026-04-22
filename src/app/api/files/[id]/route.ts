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

        await connectToDatabase();
        const doc = await AppDocument.findById(id).lean() as any;

        if (!doc) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Access Control
        // Panchayat can only see their own files
        if ((session.role === 'panchayat' || session.role === 'panchayat_officer') && String(doc.uploaded_by) !== session.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        // Government and Admin can see all files

        const filePath = path.join(process.cwd(), 'public', doc.file_url);
        
        try {
            const fileBuffer = await fs.readFile(filePath);
            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': doc.mime_type || 'application/octet-stream',
                    'Content-Disposition': `inline; filename="${doc.file_name}"`,
                },
            });
        } catch (fileError) {
            console.error('File system error:', fileError);
            return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
        }

    } catch (error) {
        console.error('Error in GET /api/files/[id]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
