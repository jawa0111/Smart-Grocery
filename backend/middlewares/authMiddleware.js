import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

/**
 * Protect Middleware
 * 1. Checks for Bearer token in headers.
 * 2. Verifies token; extracts { id, role } payload.
 * 3. Finds user in either Student or Teacher collection, based on role.
 * 4. Attaches user object to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. If no token, reject
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in!'
    });
  }

  try {
    // 3. Verify token & decode payload => { id, role, iat, exp }
    const decoded = jwt.verify(token, JWT_SECRET);

    let currentUser;
    // Check which model to use based on the role in the token
    if (decoded.role === 'teacher') {
      currentUser = await Teacher.findById(decoded.id);
    } else {
      // Default to student if role is 'student' or anything else
      currentUser = await Student.findById(decoded.id);
    }

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4. Attach user & role to the request
    req.user = currentUser; 
    req.user.role = decoded.role;  // so we can check it in other middlewares

    next();
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token.'
    });
  }
};
