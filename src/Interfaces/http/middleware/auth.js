import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Missing authentication',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

    req.userId = decoded.id;

    next();
  } catch {
    return res.status(401).json({
      status: 'fail',
      message: 'Token tidak valid',
    });
  }
};

export default authMiddleware;
