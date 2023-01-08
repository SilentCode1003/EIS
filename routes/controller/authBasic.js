const helper = require('../repository/customhelper')

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
    else if (req.session.isAuth && req.session.accounttype == "IT") {
        next();
    }
     else if (req.session.isAuth && req.session.accounttype == "IT CUSTODIAN") {
        next();
    }
    else if (req.session.isAuth && req.session.accounttype == "CABLING") {
        next();
    }
    else if (req.session.isAuth && req.session.accounttype == "CYBERPOWER") {
        next();
    }
    else if (req.session.isAuth && req.session.accounttype == "ACCOUNTING") {
        next();
    }
    else if (req.session.isAuth && req.session.accounttype == "PURCHASING") {
        next();
    }
    else if (req.session.isAuth && req.session.accounttype == "CUSTODIAN") {
        next();
    }
    else {
        res.redirect('/login');
    }
};

module.exports = { isAuth }