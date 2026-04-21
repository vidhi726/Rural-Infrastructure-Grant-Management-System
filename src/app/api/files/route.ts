import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/jwt';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Document as AppDocument } from '@/models/Document';

export async function GET(request: NextRequest) {
    try {
        const session = await getAuthSession();
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        let query = {};
        
        // Panchayat users only see their own files
        if (session.role === 'panchayat') {
            query = { uploaded_by: session.userId };
        } 
        // Government and Admin can see all files
        else if (session.role === 'government' || session.role === 'admin') {
            query = {}; 
        } else {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const documents = await AppDocument.find(query)
            .sort({ createdAt: -1 })
            .populate('uploaded_by', 'full_name email')
            .populate('application_id', 'title application_number')
            .lean();

        const serializedDocs = documents.map((d: any) => ({
            id: d._id,
            file_name: d.file_name,
            file_url: d.file_url,
            file_size: d.file_size,
            mime_type: d.mime_type,
            document_type: d.document_type,
            is_verified: d.is_verified,
            uploaded_by: d.uploaded_by?.full_name || 'Unknown',
            role: d.uploader_role,
            application: d.application_id?.title || 'Unknown',
            application_number: d.application_id?.application_number || 'N/A',
            created_at: d.createdAt
        }));

        return NextResponse.json(serializedDocs);

    } catch (error) {
        console.error('Error in GET /api/files:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
