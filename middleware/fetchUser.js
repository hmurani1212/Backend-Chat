var jwt = require('jsonwebtoken');
const jwt_Secret = "HassaisGoodBy";
const fetchUser = (req, res, next) => {
    //get the user from jwt token
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid tokin" })
    }
    try {
        const data = jwt.verify(token, jwt_Secret);
        req.user = data.user
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid tokin" })
    }

}
module.exports = fetchUser;