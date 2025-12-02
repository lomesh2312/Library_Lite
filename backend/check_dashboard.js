const axios = require('axios');

async function checkDashboard() {
    try {
        const response = await axios.get('https://library-lite.onrender.com/api/dashboard/stats');
        console.log('Dashboard Stats:', response.data);
        if (response.data.overdueLoans !== 0) {
            console.error('FAIL: Overdue loans should be 0');
        } else {
            console.log('PASS: Overdue loans is 0');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkDashboard();
