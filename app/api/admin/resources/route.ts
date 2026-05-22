import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const fileType = formData.get('fileType') as string | null; // e.g., 'pdf' | 'video' | 'presentation' | 'business_explanation' | 'marketing'
    const language = formData.get('language') as string | null;   // e.g., 'en' | 'es' | 'vi' | 'pt' | 'ko' | 'fr'

    if (!file || !title || !fileType || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Process file upload
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Unique filename to prevent collision
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'resources');
    
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    
    const sizeInMB = file.size / (1024 * 1024);
    const sizeStr = sizeInMB < 0.1 
      ? `${(file.size / 1024).toFixed(1)} KB` 
      : `${sizeInMB.toFixed(2)} MB`;

    // Save to db
    const resource = await prisma.resource.create({
      data: {
        title,
        description: description || '',
        url: `/resources/${filename}`,
        fileType,
        language,
        size: sizeStr,
      }
    });

    return NextResponse.json({ message: 'Resource uploaded successfully', resource }, { status: 201 });

  } catch (err) {
    console.error('[admin-resources-post]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing resource ID' }, { status: 400 });
    }

    const resource = await prisma.resource.findUnique({
      where: { id }
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Try to delete the physical file
    try {
      const filename = path.basename(resource.url);
      const filePath = path.join(process.cwd(), 'public', 'resources', filename);
      await fs.unlink(filePath);
    } catch (fileErr) {
      console.warn('[admin-resources-delete] Could not delete physical file:', fileErr);
    }

    // Delete from db
    await prisma.resource.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Resource deleted successfully' });

  } catch (err) {
    console.error('[admin-resources-delete]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
