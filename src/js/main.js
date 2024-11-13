// เปิด modal
const modal = document.getElementById("addExpenseModal");
const openModalButton = document.querySelector(".bottom-wide-button");
const closeModalButton = document.getElementById("closeModal");
const saveExpenseButton = document.getElementById("saveExpense");

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

// เก็บข้อมูลค่าใช้จ่าย
saveExpenseButton.addEventListener("click", () => {
    const expenseName = document.getElementById("expenseName").value;
    const amount = document.getElementById("amount").value;
    const friends = document.getElementById("friends").value.split(",").map(friend => friend.trim());

    // สร้างการ์ดรายการใหม่
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

    // ปิด modal หลังบันทึก
    document.getElementById("addExpenseModal").style.display = "none";

    // ล้างค่าในฟอร์มหลังบันทึก
    document.getElementById("expenseName").value = '';
    document.getElementById("amount").value = '';
    document.getElementById("friends").value = '';
});


