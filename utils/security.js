
const crypto = require('crypto');

// Rate limiting (very cool)
function checkRateLimit(userId, userRateLimits, RATE_LIMIT_WINDOW, RATE_LIMIT_MAX) {
    const now = Date.now();
    const userLimit = userRateLimits.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        userRateLimits.set(userId, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
        });
        return true;
    }

    if (userLimit.count >= RATE_LIMIT_MAX) {
        return false;
    }

    userLimit.count++;
    return true;
}

// URL validation and sanitization
function validateURL(url) {
    try {
        // Remove any null bytes or control characters
        url = url.replace(/[\x00-\x1F\x7F]/g, '');
        
        // Auto-add https:// if missing
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }

        const parsed = new URL(url);
        
        // Block dangerous protocols
        const allowedProtocols = ['http:', 'https:'];
        if (!allowedProtocols.includes(parsed.protocol)) {
            return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
        }

        // Block localhost and internal IPs
        const blockedHosts = [
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            '::1'
        ];
        
        if (blockedHosts.includes(parsed.hostname)) {
            return { valid: false, error: 'Local addresses are not allowed' };
        }

        // Block internal IP ranges
        if (isInternalIP(parsed.hostname)) {
            return { valid: false, error: 'Internal network addresses are not allowed' };
        }

        // Block file:// and other dangerous schemes
        if (parsed.protocol === 'file:') {
            return { valid: false, error: 'File protocol is not allowed' };
        }

        return { valid: true, url };
    } catch (e) {
        return { valid: false, error: 'Invalid URL format' };
    }
}

function isInternalIP(hostname) {
    // Check for private IP ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    
    if (match) {
        const [, a, b, c, d] = match.map(Number);
        
        // 10.0.0.0/8
        if (a === 10) return true;
        
        // 172.16.0.0/12
        if (a === 172 && b >= 16 && b <= 31) return true;
        
        // 192.168.0.0/16
        if (a === 192 && b === 168) return true;
        
        // 169.254.0.0/16 (link-local)
        if (a === 169 && b === 254) return true;
    }
    
    return false;
}

// Sanitize text input
function sanitizeInput(text) {
    if (typeof text !== 'string') return '';
    
    // Remove null bytes and control characters except newlines/tabs
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Limit length
    if (text.length > 2000) {
        text = text.substring(0, 2000);
    }
    
    return text;
}

// Check permissions
function hasPermission(member, requiredPermissions = []) {
    // For now, anyone can use the bot, but you can add permission checks here
    // Example: Check if user has ADMINISTRATOR permission
    // return member.permissions.has('administrator');
    return true;
}

// Generate secure session ID
function generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
}

// Clean up session data
function sanitizeSessionData(session) {
    if (session.page) {
        // Inject additional security headers
        session.page.setExtraHTTPHeaders({
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'no-referrer'
        }).catch(() => {});
    }
}

module.exports = {
    checkRateLimit,
    validateURL,
    sanitizeInput,
    hasPermission,
    generateSessionId,
    sanitizeSessionData,
    isInternalIP
};
