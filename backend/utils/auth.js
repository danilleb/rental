const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = process.env.JWT_SECRET

const generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
};

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'Нет токена' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Неверный токен' });
        }
        req.user = decoded;
        next();
    });
};

const checkRole = (...roles) => {
    return (req, res, next) => {
        console.log(req.user.role);
        
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    };
  };

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = { generateToken, verifyToken, checkRole, hashPassword, comparePassword };
