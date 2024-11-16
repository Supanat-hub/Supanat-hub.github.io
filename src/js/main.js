// main.js - จัดการการเพิ่มค่าใช้จ่ายใหม่และเปิด/ปิด modal

const modal = document.getElementById("addExpenseModal");
const openModalButton = document.querySelector(".bottom-wide-button");
const closeModalButton = document.getElementById("closeModal");
const saveExpenseButton = document.getElementById("saveExpense");

// Function สำหรับดึง user_id
function getUserId(accessToken) {
    return fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(response => response.json())
    .then(data => data.sub) // `sub` คือ user_id
    .catch(error => {
        console.error('Error fetching user ID:', error);
        return null;
    });
}

// เปิด/ปิด modal
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

// บันทึกข้อมูลค่าใช้จ่ายใหม่ไปยัง Google Sheets
saveExpenseButton.addEventListener("click", async () => {
    const expenseName = document.getElementById("expenseName").value;
    const amount = document.getElementById("amount").value;
    const friends = document.getElementById("friends").value.split(",").map(friend => friend.trim());

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        console.error('Access token not found.');
        return;
    }

    const userId = await getUserId(accessToken);
    if (!userId) {
        console.error('Unable to fetch user ID.');
        return;
    }

    const paymentStatus = new Array(friends.length).fill("not_paid").join(", ");

    fetch(`${SHEETS_API_URL}/values/${userId}!A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            values: [
                [userId, new Date().toLocaleString(), expenseName, amount, friends.join(', '), paymentStatus]
            ]
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Expense added:', data);

        // ดึงข้อมูลค่าใช้จ่ายใหม่มาแสดง
        fetchUserExpenses(userId, accessToken);

        // ล้างค่าในฟอร์ม
        document.getElementById("expenseName").value = '';
        document.getElementById("amount").value = '';
        document.getElementById("friends").value = '';
    })
    .catch(error => console.error('Error adding expense:', error));
});
