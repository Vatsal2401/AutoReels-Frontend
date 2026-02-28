const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getBlogPosts(page: number = 1, limit: number = 10) {
    try {
        const res = await fetch(`${API_URL}/blog?page=${page}&limit=${limit}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return { data: [] };
        return res.json();
    } catch (e) {
        return { data: [] };
    }
}

export async function getBlogPost(slug: string) {
    try {
        const res = await fetch(`${API_URL}/blog/${slug}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        return null;
    }
}

export async function likePost(slug: string) {
    const res = await fetch(`${API_URL}/blog/${slug}/like`, {
        method: 'POST',
        // Like increment is highly dynamic, we shouldn't cache this request at all, though it's a POST anyway
    });
    if (!res.ok) throw new Error('Failed to like post');
    return res.json();
}

export async function submitComment(
    slug: string,
    data: { author_name: string; author_email: string; content: string }
) {
    const res = await fetch(`${API_URL}/blog/${slug}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit comment');
    return res.json();
}
