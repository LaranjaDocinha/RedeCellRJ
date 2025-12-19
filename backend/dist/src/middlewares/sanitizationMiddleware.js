import xss from 'xss';
export const xssSanitizer = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    next();
};
function sanitizeObject(obj) {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (typeof obj[key] === 'string') {
                obj[key] = xss(obj[key]);
            }
            else if (typeof obj[key] === 'object' && obj[key] !== null) {
                obj[key] = sanitizeObject(obj[key]);
            }
        }
    }
    return obj;
}
