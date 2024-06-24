const checkRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (roles.includes(userRole)) {
            if (userRole === 'Admin') {
                return res.redirect('/admin');
            } else if (userRole === 'User') {
                return res.redirect('/user');
            } else if (userRole === 'Manager') {
                return res.redirect('/manager');
            }
            // Add other roles as necessary
        } else {
            return res.status(403).send({ error: "Access Denied: You don't have the required role." });
        }
        next()
    };

};

module.exports = checkRole;
