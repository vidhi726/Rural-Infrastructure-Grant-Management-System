import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/jwt';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Document as AppDocument } from '@/models/Document';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const session = await getAuthSession();
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only Panchayat users can upload files according to requirements
        if (session.role !== 'panchayat_officer') {
            return NextResponse.json({ error: 'Forbidden: Only Panchayat users can upload files' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const applicationId = formData.get('applicationId') as string;
        const documentType = formData.get('documentType') as string || 'other';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type (PDF, JPG, PNG)
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only PDF, JPG, and PNG are allowed.' }, { status: 400 });
        }

        // Validate file size (Max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size too large. Max 5MB allowed.' }, { status: 400 });
        }

        if (!applicationId) {
            return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const fileExt = file.name.split('.').pop();
        const uniqueFileName = `${crypto.randomUUID()}.${fileExt}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', applicationId);

        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, uniqueFileName), buffer);

        const publicUrl = `/uploads/${applicationId}/${uniqueFileName}`;

        const doc = await AppDocument.create({
            application_id: applicationId,
            document_type: documentType,
            file_name: file.name,
            file_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: session.id,
            uploader_role: session.role
        });

        return NextResponse.json({ 
            success: true, 
            document: {
                id: doc._id,
                file_name: doc.file_name,
                file_url: doc.file_url,
                status: 'uploaded'
            }
        });

    } catch (error) {
        console.error('Error in POST /api/files/upload:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
