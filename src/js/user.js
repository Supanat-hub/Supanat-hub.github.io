// user.js - จัดการข้อมูลค่าใช้จ่ายและสถานะการจ่ายเงิน

const spreadsheetId = '1iEr8ktcz2B3yR37Eisc2m7vWTtchrBuXBJ1ypyrSNf8'; // Spreadsheet ID
const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

// ดึงข้อมูลค่าใช้จ่ายของผู้ใช้
async function fetchUserExpenses(userId, accessToken) {
    const range = `${userId}!A1:Z1000`; // ดึงข้อมูลจากแท็บที่ตรงกับ user_id

    try {
        const response = await fetch(`${SHEETS_API_URL}/values/${range}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const data = await response.json();
        if (!data.values) {
            console.error('No data found for user.');
            return [];
        }

        const expenses = data.values.map(row => ({
            userId: row[0],
            date: row[1],
            expenseName: row[2],
            amount: row[3],
            friends: row[4].split(', '),
            paymentStatus: row[5].split(', ')
        }));
        console.log('Fetched user expenses:', expenses);

        // อัปเดต UI ด้วยข้อมูล
        updateUI(expenses);
        return expenses;
    } catch (error) {
        console.error('Error fetching user expenses:', error);
        return [];
    }
}

// อัปเดตสถานะการจ่ายเงิน
async function updatePaymentStatus(userId, expenseIndex, friendIndex, newStatus, accessToken) {
    const range = `${userId}!F${expenseIndex + 1}`;
    try {
        const response = await fetch(`${SHEETS_API_URL}/values/${range}?valueInputOption=USER_ENTERED`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                range,
                values: [[newStatus]]
            })
        });

        const result = await response.json();
        if (result.error) {
            console.error('Error updating payment status:', result.error);
        } else {
            console.log('Payment status updated:', result);
        }
    } catch (error) {
        console.error('Error updating payment status:', error);
    }
}

// อัปเดต UI
function updateUI(expenses) {
    const expenseContainer = document.getElementById('expenseList');
    expenseContainer.innerHTML = '';

    expenses.forEach((expense, expenseIndex) => {
        const expenseItem = document.createElement('div');
        expenseItem.classList.add('expense-item');
        expenseItem.innerHTML = `
            <h3>${expense.expenseName} - ${expense.amount}฿</h3>
            <p>Friends: ${expense.friends.join(', ')}</p>
            <p>Status: ${expense.paymentStatus.join(', ')}</p>
        `;

        expense.friends.forEach((friend, friendIndex) => {
            const statusButton = document.createElement('button');
            statusButton.textContent = expense.paymentStatus[friendIndex];
            statusButton.addEventListener('click', () => {
                const newStatus = expense.paymentStatus[friendIndex] === 'not_paid' ? 'paid' : 'not_paid';
                expense.paymentStatus[friendIndex] = newStatus;

                // อัปเดตสถานะใน Google Sheets
                updatePaymentStatus(userId, expenseIndex, friendIndex, expense.paymentStatus.join(', '), accessToken);

                // อัปเดต UI
                updateUI(expenses);
            });

            expenseItem.appendChild(statusButton);
        });

        expenseContainer.appendChild(expenseItem);
    });
}
