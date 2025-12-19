import { ipWhitelistService } from '../services/ipWhitelistService.js';
import { AppError } from '../utils/errors.js';
export const ipWhitelistMiddleware = async (req, res, next) => {
    const clientIp = req.ip; // Express adds 'ip' to request object if behind proxy or directly connected.
    // Consider 'req.headers['x-forwarded-for']' for production behind load balancers.
    // Bypass if IP whitelist is empty or not active
    const activeWhitelistedIps = await ipWhitelistService.getActiveWhitelistedIps();
    if (activeWhitelistedIps.length === 0) {
        return next();
    }
    if (clientIp && activeWhitelistedIps.includes(clientIp)) {
        return next();
    }
    else {
        return next(new AppError(`Access denied. Your IP (${clientIp}) is not whitelisted for this resource.`, 403));
    }
};
