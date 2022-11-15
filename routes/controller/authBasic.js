const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        res.redirect('/login');
    }
};

const isAuthAdmin = (req, res, next) => {
    if (req.session.isAuth && req.session.accounttype == "TL") {
        next();
    } else if (req.session.isAuth && req.session.accounttype == "CREATOR") {
        next();
    }
    else if (req.session.isAuth && req.session.accounttype == "ADMINISTRATOR") {
        next();
    }
    else if (req.session.isAuth && req.session.accounttype == "USER") {
        next();
    }
    else if (req.session.isAuth && req.session.accounttype == "CABLING") {
        next();
    }
    else {
        res.redirect('/login');
    }
};

module.exports = { isAuth, isAuthAdmin}