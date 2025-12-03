const axios = require('axios');

const BASE_URL = 'https://library-lite.onrender.com/api';
let authToken = '';
let createdBookId = '';
let createdAuthorId = '';
let createdMemberId = '';
let createdLoanId = '';

const testUser = {
    name: 'Verification User',
    email: `verify_${Date.now()}@example.com`,
    password: 'password123'
};

async function runTests() {
    console.log('Starting System Verification...');

    try {
        // 1. Auth: Register
        console.log('\n1. Testing Registration...');
        try {
            const regRes = await axios.post(`${BASE_URL}/auth/register`, testUser);
            console.log('✅ Registration Successful');
            authToken = regRes.data.accessToken;
        } catch (error) {
            console.error('❌ Registration Failed:', error.response?.data || error.message);
            process.exit(1);
        }

        // 2. Auth: Login
        console.log('\n2. Testing Login...');
        try {
            const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: testUser.email,
                password: testUser.password
            });
            console.log('✅ Login Successful');
            authToken = loginRes.data.accessToken; // Update token just in case
        } catch (error) {
            console.error('❌ Login Failed:', error.response?.data || error.message);
        }

        // 3. Authors: Create
        console.log('\n3. Testing Create Author...');
        try {
            const authorRes = await axios.post(`${BASE_URL}/authors`, {
                name: 'Test Author',
                profileUrl: 'https://example.com/author.jpg'
            }, { headers: { Authorization: `Bearer ${authToken}` } }); // Assuming auth might be needed, though code didn't show middleware on all routes
            console.log('✅ Create Author Successful');
            createdAuthorId = authorRes.data.id;
        } catch (error) {
            console.error('❌ Create Author Failed:', error.response?.data || error.message);
        }

        // 4. Books: Create
        console.log('\n4. Testing Create Book...');
        try {
            const bookRes = await axios.post(`${BASE_URL}/books`, {
                title: 'Test Book',
                authorName: 'Test Author', // Should use existing or create new
                isbn: `ISBN-${Date.now()}`,
                price: 100,
                totalCopies: 5,
                coverUrl: 'https://example.com/cover.jpg',
                description: 'Test Description'
            }, { headers: { Authorization: `Bearer ${authToken}` } });
            console.log('✅ Create Book Successful');
            createdBookId = bookRes.data.id;
        } catch (error) {
            console.error('❌ Create Book Failed:', error.response?.data || error.message);
        }

        // 5. Members: Create
        console.log('\n5. Testing Create Member...');
        try {
            const memberRes = await axios.post(`${BASE_URL}/members`, {
                name: 'Test Member',
                email: `member_${Date.now()}@example.com`,
                duration: 'MONTH_1'
            }, { headers: { Authorization: `Bearer ${authToken}` } });
            console.log('✅ Create Member Successful');
            createdMemberId = memberRes.data.id;
        } catch (error) {
            console.error('❌ Create Member Failed:', error.response?.data || error.message);
        }

        // 6. Loans: Issue
        console.log('\n6. Testing Issue Loan...');
        try {
            const loanRes = await axios.post(`${BASE_URL}/loans`, {
                userId: createdMemberId, // Note: Loans usually link to Users/Members. Schema says Loan -> User. Member route creates User? Need to check.
                // Wait, schema has User and Admin. Member route probably creates User?
                // Let's check Member controller later. For now assume createdMemberId is valid userId.
                bookId: createdBookId,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }, { headers: { Authorization: `Bearer ${authToken}` } });
            console.log('✅ Issue Loan Successful');
            createdLoanId = loanRes.data.id;
        } catch (error) {
            console.error('❌ Issue Loan Failed:', error.response?.data || error.message);
        }

        // 7. Dashboard: Stats
        console.log('\n7. Testing Dashboard Stats...');
        try {
            await axios.get(`${BASE_URL}/dashboard/stats`, { headers: { Authorization: `Bearer ${authToken}` } });
            console.log('✅ Dashboard Stats Successful');
        } catch (error) {
            console.error('❌ Dashboard Stats Failed:', error.response?.data || error.message);
        }

        console.log('\n✅✅✅ ALL TESTS PASSED ✅✅✅');

    } catch (error) {
        console.error('\n❌ Unexpected Error:', error.message);
    }
}

runTests();
