// Get the access token from LocalStorage
const accessToken = localStorage.getItem('accessToken');
let userId; 

if (accessToken) {
    // Fetch user profile including photo and user ID
    fetch('https://people.googleapis.com/v1/people/me?personFields=photos,metadata', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(response => response.json())
        .then(profileData => {
            const profilePicUrl = profileData.photos && profileData.photos[0] ? profileData.photos[0].url : '/img/account.svg';
    
            // Set profile image
            document.getElementById("profileImage").src = profilePicUrl;
    
            // Assign userId to global variable
            userId = profileData.metadata && profileData.metadata.sources[0].id;
            console.log('User ID:', userId);
    
            // Fetch user expenses if userId exists
            if (userId) {
                fetchUserExpenses(userId, accessToken);
            } else {
                showLoginModal();
            }
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            document.getElementById("profileImage").src = '/img/account.svg';
            showLoginModal(); // Show login modal if there's an error or no profile data
        });    
} else {
    console.log('No access token found. Using guest profile img.');
    document.getElementById("profileImage").src = '/img/account.svg';
    showLoginModal(); // Show login modal if access token is missing
}

// Function to show the login modal
function showLoginModal() {
    const loginModal = document.createElement('div');
    loginModal.classList.add('modal');
    loginModal.style.display = 'flex';
    loginModal.innerHTML = `
        <div class="login-modal-content">
            <h2>ล็อกอินเพื่อเข้าถึง</h2>
            <p>กรุณาล็อกอินก่อนเริ่มใช้งาน</p>
            <center>
                <button class="login-button" onclick="redirectToLogin()">
                    <img src="/img/google.png" alt="Google Logo"> ล็อกอินด้วย Google
                </button>
            </center>
        </div>
    `;
    document.body.appendChild(loginModal);
}

// Function to redirect to the login page
function redirectToLogin() {
    const clientId = '71156426726-oslpb03c1vcnepuaup0tsds8d7sopgm2.apps.googleusercontent.com';
    const redirectUri = 'https://supanat-hub.github.io/callback';
    const scope = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
}


// Function to fetch expenses for the logged-in user
function fetchUserExpenses(userId, accessToken) {
    const spreadsheetId = '1iEr8ktcz2B3yR37Eisc2m7vWTtchrBuXBJ1ypyrSNf8';
    const sheetName = userId;  // ใช้ userId เป็นชื่อแท็บ
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Fetched data from Google Sheets'); // Log the fetched data
        const rows = data.values;
        const userExpenses = rows || [];  // ถ้าไม่มีข้อมูลก็ใช้ array ว่าง

        // แสดงข้อมูล userExpenses ในหน้าเว็บ
        displayExpenses(userExpenses);
    })
    .catch(error => console.error('Error fetching user expenses:', error));
}

function displayExpenses(expenses) {
    const expenseList = document.getElementById("expenseList");
    expenseList.innerHTML = '';  // ล้างรายการก่อนแสดงใหม่

    // เรียงลำดับรายการจากล่าสุดก่อน
    expenses.forEach((expense, index) => {
        // แยกชื่อคนและสถานะจากคอลัมน์ F และ E
        const names = expense[4].split(', ');  // ชื่อคนที่คั่นด้วย ,
        const statuses = expense[5].split(', ');  // สถานะการชำระเงินที่คั่นด้วย ,

        const expenseItem = document.createElement("div");
        expenseItem.className = "expense-item";
        expenseItem.setAttribute("data-row", index); // เพิ่ม data-row ให้แต่ละรายการ

        // สร้าง HTML สำหรับเพื่อนและสถานะ
        const friendsHTML = names.map((name, idx) => `
            <li>
                <span data-friend="${name.trim()}">${name.trim()}</span>
                <select class="payment-status" data-row="${index}" data-friend="${name.trim()}">
                    <option value="not_paid" ${statuses[idx] === 'not_paid' ? 'selected' : ''}>ยังไม่จ่าย</option>
                    <option value="paid" ${statuses[idx] === 'paid' ? 'selected' : ''}>จ่ายแล้ว</option>
                </select>
            </li>
        `).join('');

        // ใส่ข้อมูลใน expense-item
        expenseItem.innerHTML = `
            <h3>${expense[2]}</h3>
            <p>จำนวนเงิน: ${expense[3]} บาท</p>
            <h4>สถานะการจ่ายเงิน:</h4>
            <ul>${friendsHTML}</ul>
        `;

        // เพิ่มรายการใหม่ด้านบน
        expenseList.insertBefore(expenseItem, expenseList.firstChild);
    });
}



// ฟังก์ชันสำหรับอัปเดตสถานะการจ่ายเงิน
document.getElementById('expenseList').addEventListener('change', function(event) {
    if (event.target.classList.contains('payment-status')) {
        if (!userId) {
            console.error('User ID is not defined.');
            return;
        }

        const status = event.target.value;
        const rowIndex = event.target.getAttribute('data-row'); // ระบุรายการ
        const friendId = event.target.getAttribute('data-friend'); // ระบุเพื่อน
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            console.error('Access token not found.');
            return;
        }

        // เลือก expense-item ตาม rowIndex
        const expenseItem = document.querySelector(`.expense-item[data-row="${rowIndex}"]`);
        const friends = expenseItem.querySelectorAll('ul li span');

        // อัปเดตสถานะเพื่อน
        const friendsStatuses = Array.from(friends).map(friend => friend.nextElementSibling.value);
        const friendIndex = Array.from(friends).findIndex(friend => friend.getAttribute('data-friend') === friendId);

        if (friendIndex === -1) {
            console.error('Friend not found in the list.');
            return;
        }

        friendsStatuses[friendIndex] = status; // เปลี่ยนสถานะ

        // เตรียมข้อมูลสำหรับ Google Sheets
        const updatedStatuses = friendsStatuses.join(', ');

        const requestBody = {
            range: `${userId}!F${parseInt(rowIndex) + 1}`, // ระบุแถวใน Google Sheets
            values: [[updatedStatuses]]
        };

        const requestUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${userId}!F${parseInt(rowIndex) + 1}?valueInputOption=RAW`;

        fetch(requestUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Payment status updated:', data);
        })
        .catch(error => {
            console.error('Error updating payment status:', error);
        });
    }
});
