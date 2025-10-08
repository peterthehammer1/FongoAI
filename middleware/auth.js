function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  
  // For AJAX requests, return JSON
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // For page requests, redirect to login
  res.redirect('/login');
}

module.exports = { requireAuth };

