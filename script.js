let selectedTable = null;
let orderItems = [];
let dailyReport = [];
let monthlyReport = [];

// Select a table
function selectTable(tableId) {
    selectedTable = tableId;
    document.querySelectorAll('.table').forEach(table => {
        table.style.border = '1px solid #ddd';
    });
    document.getElementById(tableId).style.border = '2px solid #4CAF50';
}

// Add item to order
function addItem(name, price) {
    if (!selectedTable) {
        alert('Please select a table first!');
        return;
    }

    const existingItem = orderItems.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += 1;
        existingItem.totalPrice = existingItem.qty * price;
    } else {
        orderItems.push({
            name,
            qty: 1,
            price,
            totalPrice: price
        });
    }
    updateOrderSummary();
}

// Update order summary table
function updateOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    orderSummary.innerHTML = '';
    orderItems.forEach(item => {
        orderSummary.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.totalPrice.toFixed(2)}</td>
                <td><button onclick="removeItem('${item.name}')">Remove</button></td>
            </tr>
        `;
    });
}

// Remove item from order
function removeItem(name) {
    orderItems = orderItems.filter(item => item.name !== name);
    updateOrderSummary();
}

// Clear order items
function clearOrder() {
    orderItems = [];
    updateOrderSummary();
}

// Confirm order and add to table
function confirmOrder() {
    if (!selectedTable) {
        alert('Please select a table first!');
        return;
    }

    const tableData = document.getElementById(`${selectedTable}-data`);
    orderItems.forEach(item => {
        tableData.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.totalPrice.toFixed(2)}</td>
            </tr>
        `;
    });
    orderItems = []; // Clear local order items after confirming
    updateOrderSummary();
}

// Save confirmed orders and clear table
function saveAndClearTable(tableId) {
    const tableData = Array.from(document.getElementById(`${tableId}-data`).getElementsByTagName('tr')).map(tr => {
        const tds = tr.getElementsByTagName('td');
        return {
            name: tds[0].innerText,
            qty: parseInt(tds[1].innerText),
            totalPrice: parseFloat(tds[2].innerText)
        };
    });

    if (tableData.length === 0) {
        alert('Cannot save an empty table!');
        return;
    }

    const monthlyDate = new Date().toLocaleString('default', { month: 'long' }) + ' ' + new Date().getFullYear();

    updateReport(monthlyDate, tableData);
    document.getElementById(`${tableId}-data`).innerHTML = '';
    selectedTable = null;
}

// Update daily and monthly reports
function updateReport(monthlyDate, tableData) {
    // Handle daily report
    const today = new Date().toLocaleDateString();
    let dailyEntry = dailyReport.find(entry => entry.date === today);
    if (!dailyEntry) {
        dailyEntry = {
            date: today,
            items: []
        };
        dailyReport.push(dailyEntry);
    }

    tableData.forEach(newItem => {
        const existingItem = dailyEntry.items.find(item => item.name === newItem.name);
        if (existingItem) {
            existingItem.qty += newItem.qty;
            existingItem.totalPrice += newItem.totalPrice;
        } else {
            dailyEntry.items.push({
                name: newItem.name,
                qty: newItem.qty,
                totalPrice: newItem.totalPrice
            });
        }
    });

    // Handle monthly report
    let monthlyEntry = monthlyReport.find(entry => entry.month === monthlyDate);
    if (!monthlyEntry) {
        monthlyEntry = {
            month: monthlyDate,
            items: []
        };
        monthlyReport.push(monthlyEntry);
    }

    tableData.forEach(newItem => {
        const existingItem = monthlyEntry.items.find(item => item.name === newItem.name);
        if (existingItem) {
            existingItem.qty += newItem.qty;
            existingItem.totalPrice += newItem.totalPrice;
        } else {
            monthlyEntry.items.push({
                name: newItem.name,
                qty: newItem.qty,
                totalPrice: newItem.totalPrice
            });
        }
    });

    // Save reports to localStorage
    localStorage.setItem('dailyReport', JSON.stringify(dailyReport));
    localStorage.setItem('monthlyReport', JSON.stringify(monthlyReport));

    updateReports();
}

// Update reports in the UI
function updateReports() {
    const dailyReportTable = document.getElementById('daily-report');
    dailyReportTable.innerHTML = '';
    dailyReport.forEach(entry => {
        entry.items.forEach(item => {
            dailyReportTable.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>${item.totalPrice.toFixed(2)}</td>
                </tr>
            `;
        });
    });

    const monthlyReportTable = document.getElementById('monthly-report');
    monthlyReportTable.innerHTML = '';
    monthlyReport.forEach(entry => {
        entry.items.forEach(item => {
            monthlyReportTable.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>${item.totalPrice.toFixed(2)}</td>
                </tr>
            `;
        });
    });
}

// Download the report as JSON
function downloadReport() {
    const reportData = {
        daily: dailyReport,
        monthly: monthlyReport
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Clear all reports
function clearReport() {
    dailyReport = [];
    monthlyReport = [];
    localStorage.removeItem('dailyReport');
    localStorage.removeItem('monthlyReport');
    updateReports();
}

// Add more tables
function addTable() {
    const tablesContainer = document.getElementById('tables-container');
    const tableCount = tablesContainer.children.length;
    if (tableCount >= 10) {
        alert('Cannot add more than 10 tables!');
        return;
    }

    const newTableId = `table-${tableCount + 1}`;
    const newTable = document.createElement('div');
    newTable.className = 'table';
    newTable.id = newTableId;
    newTable.onclick = () => selectTable(newTableId);

    newTable.innerHTML = `
        <h3>Table No. ${tableCount + 1}</h3>
        <table>
            <thead>
                <tr>
                    <th>Particular</th>
                    <th>QTY</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody id="${newTableId}-data"></tbody>
        </table>
        <button onclick="saveAndClearTable('${newTableId}')" class="action-btn">Save & Clear Table</button>
    `;

    tablesContainer.appendChild(newTable);
}

// Initialize data from localStorage on page load
function initializeReports() {
    const storedDailyReport = localStorage.getItem('dailyReport');
    const storedMonthlyReport = localStorage.getItem('monthlyReport');

    if (storedDailyReport) {
        dailyReport = JSON.parse(storedDailyReport);
    }

    if (storedMonthlyReport) {
        monthlyReport = JSON.parse(storedMonthlyReport);
    }

    updateReports();
}

// Call initializeReports on page load
document.addEventListener('DOMContentLoaded', initializeReports);

// Calculator functions
function appendToDisplay(value) {
    document.getElementById('calculator-display').value += value;
}

function calculateResult() {
    const display = document.getElementById('calculator-display');
    try {
        display.value = eval(display.value) || '';
    } catch {
        display.value = 'Error';
    }
}

function clearCalculator() {
    document.getElementById('calculator-display').value = '';
}
