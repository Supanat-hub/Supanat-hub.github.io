// Get the access token from LocalStorage
const accessToken = localStorage.getItem('accessToken');

if (accessToken) {
    // ดึงข้อมูล user_id
    getUserId(accessToken).then(userId => {
        if (userId) {
            console.log('User ID:', userId);

            // เรียกใช้ฟังก์ชันเพื่อดึงรายการของผู้ใช้
            fetchUserExpenses(userId, accessToken);
        }
    });

    // Fetch user profile including photo
    fetch('https://people.googleapis.com/v1/people/me?personFields=photos', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(profileData => {
        const profilePicUrl = profileData.photos && profileData.photos[0] ? profileData.photos[0].url : '/img/account.svg';

        // Display the profile picture or default image
        document.getElementById("profileImage").src = profilePicUrl;
    })
    .catch(error => {
        console.error('Error fetching profile:', error);
        document.getElementById("profileImage").src = '/img/account.svg';
    });
} else {
    console.log('No access token found. Using guest account.');
    document.getElementById("profileImage").src = '/img/account.svg';
    displayLoginModal();
}

// Function to redirect to the login page
function redirectToLogin() {
    const clientId = 'YOUR_CLIENT_ID';
    const redirectUri = 'https://supanat-hub.github.io/callback';
    const scope = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
}

// Function to get user_id
function getUserId(accessToken) {
    return fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(response => response.json())
    .then(data => data.sub)
    .catch(error => {
        console.error('Error fetching user ID:', error);
        return null;
    });
}

// Function to fetch expenses for the logged-in user
function fetchUserExpenses(userId, accessToken) {
    const spreadsheetId = '1iEr8ktcz2B3yR37Eisc2m7vWTtchrBuXBJ1ypyrSNf8';  // <-- ใส่ ID ของ Google Sheets
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(response => response.json())
    .then(data => {
        const rows = data.values;
        const userExpenses = rows.filter(row => row[0] === userId);
        console.log('User expenses:', userExpenses);

        // แสดงข้อมูล userExpenses ในหน้าเว็บ (ปรับแต่งการแสดงผลตามต้องการ)
        displayExpenses(userExpenses);
    })
    .catch(error => console.error('Error fetching user expenses:', error));
}

// Function to display expenses on the web page
function displayExpenses(expenses) {
    const expenseList = document.getElementById("expenseList");
    expenseList.innerHTML = '';  // ล้างรายการก่อนแสดงใหม่

    expenses.forEach((expense, index) => {
        const expenseItem = document.createElement("div");
        expenseItem.className = "expense-item";
        expenseItem.innerHTML = `
            <h3>${expense[2]}</h3>
            <p>จำนวนเงิน: ${expense[3]} บาท</p>
            <h4>สถานะการจ่ายเงิน:</h4>
            <ul>
                ${expense[4].split(', ').map((status, idx) => `
                    <li>
                        <span>${status}</span>
                        <select class="payment-status" data-row="${index}">
                            <option value="not_paid" ${status === 'not_paid' ? 'selected' : ''}>ยังไม่จ่าย</option>
                            <option value="paid" ${status === 'paid' ? 'selected' : ''}>จ่ายแล้ว</option>
                        </select>
                    </li>
                `).join('')}
            </ul>
        `;
        expenseList.appendChild(expenseItem);
    });
}

// ฟังก์ชันเพื่ออัปเดตสถานะการจ่ายเงิน
document.getElementById('expenseList').addEventListener('change', function(event) {
    if (event.target.classList.contains('payment-status')) {
        const status = event.target.value;
        const rowIndex = event.target.getAttribute('data-row');

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            console.error('Access token not found.');
            return;
        }

        // ส่งการอัปเดตไปยัง Google Sheets
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!E${parseInt(rowIndex) + 1}:update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: [
                    [status]
                ]
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Payment status updated:', data);
        })
        .catch(error => console.error('Error updating payment status:', error));
    }
});
