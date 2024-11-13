// เปิด modal
const modal = document.getElementById("addExpenseModal");
const openModalButton = document.querySelector(".bottom-wide-button");
const closeModalButton = document.getElementById("closeModal");
const saveExpenseButton = document.getElementById("saveExpense");

// Spreadsheet ID ของคุณ
const spreadsheetId = '1iEr8ktcz2B3yR37Eisc2m7vWTtchrBuXBJ1ypyrSNf8';  // <-- ใส่ ID ของ Google Sheets ที่คุณสร้างไว้

// Function สำหรับดึง user_id
function getUserId(accessToken) {
    return fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(response => response.json())
    .then(data => data.sub)  // `sub` คือ user_id ของ Google
    .catch(error => {
        console.error('Error fetching user ID:', error);
        return null;
    });
}

openModalButton.addEventListener("click", () => {
    modal.style.display = "block";
});

closeModalButton.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// บันทึกข้อมูลค่าใช้จ่ายไปยัง Google Sheets พร้อมกับ user_id
saveExpenseButton.addEventListener("click", async () => {
    const expenseName = document.getElementById("expenseName").value;
    const amount = document.getElementById("amount").value;
    const friends = document.getElementById("friends").value.split(",").map(friend => friend.trim());

    // ตรวจสอบ accessToken ใน LocalStorage
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        console.error('Access token not found.');
        return;
    }

    // ดึง user_id ของผู้ใช้
    const userId = await getUserId(accessToken);
    if (!userId) {
        console.error('Unable to fetch user ID');
        return;
    }

    // ส่งข้อมูลไปยัง Google Sheets API
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            values: [
                [userId, new Date().toLocaleString(), expenseName, amount, friends.join(', ')]
            ]
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Expense added to Google Sheets:', data);

        // สร้างการ์ดรายการใหม่ใน UI
        const expenseItem = document.createElement("div");
        expenseItem.className = "expense-item";
        expenseItem.innerHTML = `
            <h3>${expenseName}</h3>
            <p>จำนวนเงิน: ${amount} บาท</p>
            <h4>สถานะการจ่ายเงิน:</h4>
            <ul>
                ${friends.map(friend => `
                    <li>
                        <span>${friend}</span>
                        <select class="payment-status">
                            <option value="not_paid">ยังไม่จ่าย</option>
                            <option value="paid">จ่ายแล้ว</option>
                        </select>
                    </li>
                `).join('')}
            </ul>
        `;

        // เพิ่มการ์ดใหม่ลงในหน้าหลัก
        const insertChild = document.getElementById("expenseList");
        insertChild.insertBefore(expenseItem, insertChild.firstChild);

        // ล้างค่าในฟอร์มหลังบันทึก
        document.getElementById("expenseName").value = '';
        document.getElementById("amount").value = '';
        document.getElementById("friends").value = '';
    })
    .catch(error => console.error('Error adding expense to Google Sheets:', error));
});
