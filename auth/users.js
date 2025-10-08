const bcrypt = require('bcrypt');

// Hashed passwords for security
// pete@nucleus.com: NucleusAI2025!Secure
// joe@fongo.com: FongoAdmin2025#Safe

const users = [
  {
    email: 'pete@nucleus.com',
    password: '$2b$10$W8I6wruqwT.yZVN/dDFdF.mYXAgp6iHdPOa6lPPNvoMrUyfazJc8K', // NucleusAI2025!Secure
    name: 'Pete',
    role: 'Admin'
  },
  {
    email: 'joe@fongo.com',
    password: '$2b$10$/nbnlivGXusJVgtK3AXliuFMc/o6RTg.u6kW.z/UWLRL0IQInN9qi', // FongoAdmin2025#Safe
    name: 'Joe',
    role: 'Admin'
  }
];

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function verifyUser(email, password) {
  const user = users.find(u => u.email === email);
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;
  
  return { email: user.email, name: user.name, role: user.role };
}

module.exports = { verifyUser, hashPassword };

