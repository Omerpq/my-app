// hashUser.js
const bcrypt = require('bcrypt');

const saltRounds = 10;
const plainPassword = 'testpassword';

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed password:', hash);
  }
});
