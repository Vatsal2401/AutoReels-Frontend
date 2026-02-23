import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN || '';

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-revalidate-token');

  if (!token || token !== REVALIDATE_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let path: string;
  try {
    const body = await req.json();
    path = body?.path;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!path || typeof path !== 'string') {
    return Response.json({ error: 'path is required' }, { status: 400 });
  }

  try {
    revalidatePath(path);
    return Response.json({ revalidated: true, path });
  } catch (err) {
    return Response.json(
      { error: 'Revalidation failed', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
