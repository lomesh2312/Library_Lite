const http = require('http');

function checkDashboard() {

    http.get('http://localhost:4000/api/dashboard/stats', (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {

            try {
                const stats = JSON.parse(data);
                console.log('Dashboard Stats:', stats);

                if (stats.overdueLoans !== 0) {
                    console.error('FAIL: Overdue loans should be 0');
                    process.exit(1);

                } 
                else {
                    console.log('PASS: Overdue loans is 0');
                }
                
            } catch (e) {
                console.error('Error parsing JSON:', e.message);

                process.exit(1);
            }
        });

    }).on('error', (err) => {
        console.error('Error:', err.message);

        process.exit(1);
    });
    
}


setTimeout(checkDashboard, 3000);
