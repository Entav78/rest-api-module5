const jwt = require('jsonwebtoken');

function optionalAuthentication(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next();
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    req.authenticationError = 'Authorization must use a Bearer token';
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.TOKEN_SECRET);
  } catch (error) {
    req.authenticationError = 'JWT token is invalid or expired';
  }
  return next();
}

function requireAuthentication(req, res, next) {
  if (!req.user) {
    return res.status(401).jsend.fail({
      result: req.authenticationError || 'JWT token not provided',
    });
  }

  return next();
}

module.exports = { optionalAuthentication, requireAuthentication };
