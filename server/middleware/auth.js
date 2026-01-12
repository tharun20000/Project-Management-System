
export function localVariables(req, res, next) {
    req.app.locals.OTP = null;
    req.app.locals.resetSession = false;
    req.app.locals.CODE = null;
    next();
}