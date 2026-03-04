// Simple in-memory rate limiter for API routes
// Note: In production with multiple instances, use Redis or similar

type RateLimitEntry = {
    count: number;
    resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    });
}, 5 * 60 * 1000);

export function rateLimit(
    identifier: string,
    maxRequests: number = 5,
    windowMs: number = 60 * 1000 // 1 minute default
): { success: boolean; remaining: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
        return { success: true, remaining: maxRequests - 1 };
    }

    if (entry.count >= maxRequests) {
        return { success: false, remaining: 0 };
    }

    entry.count++;
    return { success: true, remaining: maxRequests - entry.count };
}

// Get client IP from request headers
export function getClientIp(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}
