const bcrypt = require('bcrypt');

async function check() {
    const pass = '#Lucky2312';
    const hash = '$2b$10$syyhpl4mSjCTOdG8IB9/ZuNddDgN4NoacavB/x3XlsFI3QVj07T4S';
    const match = await bcrypt.compare(pass, hash);
    console.log('Password match:', match);
}

check();
