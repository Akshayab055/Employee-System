import './style.css'

const appData = {
  employees: [],
  attendance: [],
  leaveRequests: [],
  performance: []
};

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  loadDataFromStorage();
  setupEventListeners();
  populateEmployeeSelects();
}

function loadDataFromStorage() {
  const stored = localStorage.getItem('appData');
  if (stored) {
    const data = JSON.parse(stored);
    appData.employees = data.employees || [];
    appData.attendance = data.attendance || [];
    appData.leaveRequests = data.leaveRequests || [];
    appData.performance = data.performance || [];
  }
  renderAllTables();
}

function saveDataToStorage() {
  localStorage.setItem('appData', JSON.stringify(appData));
}

function setupEventListeners() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      switchSection(section);
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const addEmployeeBtn = document.getElementById('addEmployeeBtn');
  const employeeForm = document.getElementById('employeeForm');
  const cancelFormBtn = document.getElementById('cancelFormBtn');
  const employeeFormContainer = document.getElementById('employeeFormContainer');

  addEmployeeBtn.addEventListener('click', () => {
    employeeFormContainer.classList.remove('hidden');
    document.getElementById('empId').value = `EMP-${String(appData.employees.length + 1).padStart(3, '0')}`;
    employeeForm.reset();
  });

  employeeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addEmployee();
  });

  cancelFormBtn.addEventListener('click', () => {
    employeeFormContainer.classList.add('hidden');
  });

  const markAttendanceBtn = document.getElementById('markAttendanceBtn');
  const attendanceForm = document.getElementById('attendanceForm');
  const cancelAttBtn = document.getElementById('cancelAttBtn');
  const attendanceFormContainer = document.getElementById('attendanceFormContainer');

  markAttendanceBtn.addEventListener('click', () => {
    attendanceFormContainer.classList.remove('hidden');
    attendanceForm.reset();
    document.getElementById('attDate').valueAsDate = new Date();
  });

  attendanceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addAttendance();
  });

  cancelAttBtn.addEventListener('click', () => {
    attendanceFormContainer.classList.add('hidden');
  });

  const requestLeaveBtn = document.getElementById('requestLeaveBtn');
  const leaveForm = document.getElementById('leaveForm');
  const cancelLeaveBtn = document.getElementById('cancelLeaveBtn');
  const leaveFormContainer = document.getElementById('leaveFormContainer');

  requestLeaveBtn.addEventListener('click', () => {
    leaveFormContainer.classList.remove('hidden');
    leaveForm.reset();
  });

  leaveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitLeaveRequest();
  });

  cancelLeaveBtn.addEventListener('click', () => {
    leaveFormContainer.classList.add('hidden');
  });

  const addPerformanceBtn = document.getElementById('addPerformanceBtn');
  const performanceForm = document.getElementById('performanceForm');
  const cancelPerfBtn = document.getElementById('cancelPerfBtn');
  const performanceFormContainer = document.getElementById('performanceFormContainer');

  addPerformanceBtn.addEventListener('click', () => {
    performanceFormContainer.classList.remove('hidden');
    performanceForm.reset();
    document.getElementById('perfPeriod').valueAsDate = new Date();
  });

  performanceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addPerformanceReview();
  });

  cancelPerfBtn.addEventListener('click', () => {
    performanceFormContainer.classList.add('hidden');
  });
}

function switchSection(sectionName) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionName).classList.add('active');
}

function addEmployee() {
  const emp = {
    id: document.getElementById('empId').value,
    name: document.getElementById('empName').value,
    email: document.getElementById('empEmail').value,
    phone: document.getElementById('empPhone').value,
    department: document.getElementById('empDept').value,
    position: document.getElementById('empPosition').value,
    joinDate: document.getElementById('empJoinDate').value,
    salary: document.getElementById('empSalary').value,
    status: 'Active'
  };

  appData.employees.push(emp);
  saveDataToStorage();
  renderEmployeeTable();
  populateEmployeeSelects();
  document.getElementById('employeeFormContainer').classList.add('hidden');
  document.getElementById('employeeForm').reset();
}

function deleteEmployee(id) {
  if (confirm('Are you sure you want to delete this employee?')) {
    appData.employees = appData.employees.filter(e => e.id !== id);
    saveDataToStorage();
    renderEmployeeTable();
    populateEmployeeSelects();
  }
}

function renderEmployeeTable() {
  const tbody = document.getElementById('employeeTable');
  tbody.innerHTML = '';

  if (appData.employees.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No employees yet. Click "Add Employee" to get started.</td></tr>';
    return;
  }

  appData.employees.forEach(emp => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.department}</td>
      <td>${emp.position}</td>
      <td>${emp.email}</td>
      <td><span class="status-badge status-approved">${emp.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn btn-danger" onclick="deleteEmployee('${emp.id}')">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ATTENDANCE MANAGEMENT
function addAttendance() {
  const empId = document.getElementById('attEmpId').value;
  const emp = appData.employees.find(e => e.id === empId);
  
  const att = {
    id: Date.now(),
    empId: empId,
    empName: emp.name,
    date: document.getElementById('attDate').value,
    status: document.getElementById('attStatus').value,
    remarks: document.getElementById('attRemarks').value
  };

  appData.attendance.push(att);
  saveDataToStorage();
  renderAttendanceTable();
  updateAttendanceSummary();
  document.getElementById('attendanceFormContainer').classList.add('hidden');
  document.getElementById('attendanceForm').reset();
}

function deleteAttendance(id) {
  if (confirm('Are you sure you want to delete this record?')) {
    appData.attendance = appData.attendance.filter(a => a.id !== id);
    saveDataToStorage();
    renderAttendanceTable();
    updateAttendanceSummary();
  }
}

function renderAttendanceTable() {
  const tbody = document.getElementById('attendanceTable');
  tbody.innerHTML = '';

  if (appData.attendance.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No attendance records. Mark attendance to get started.</td></tr>';
    return;
  }

  const sorted = [...appData.attendance].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  sorted.forEach(att => {
    const row = document.createElement('tr');
    const statusClass = `status-${att.status.toLowerCase().replace(' ', '')}`;
    row.innerHTML = `
      <td>${att.empName}</td>
      <td>${new Date(att.date).toLocaleDateString()}</td>
      <td><span class="status-badge ${statusClass}">${att.status}</span></td>
      <td>${att.remarks}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-danger" onclick="deleteAttendance(${att.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function updateAttendanceSummary() {
  const total = appData.attendance.length;
  const present = appData.attendance.filter(a => a.status === 'Present').length;
  const absent = appData.attendance.filter(a => a.status === 'Absent').length;
  const late = appData.attendance.filter(a => a.status === 'Late').length;

  document.getElementById('totalPresent').textContent = present;
  document.getElementById('totalAbsent').textContent = absent;
  document.getElementById('totalLate').textContent = late;
  document.getElementById('attendanceRate').textContent = total > 0 ? Math.round((present / total) * 100) + '%' : '0%';
}

// LEAVE MANAGEMENT
function submitLeaveRequest() {
  const empId = document.getElementById('leaveEmpId').value;
  const emp = appData.employees.find(e => e.id === empId);
  const startDate = new Date(document.getElementById('leaveStartDate').value);
  const endDate = new Date(document.getElementById('leaveEndDate').value);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  const leave = {
    id: Date.now(),
    empId: empId,
    empName: emp.name,
    leaveType: document.getElementById('leaveType').value,
    startDate: document.getElementById('leaveStartDate').value,
    endDate: document.getElementById('leaveEndDate').value,
    days: days,
    reason: document.getElementById('leaveReason').value,
    status: 'Pending',
    submittedOn: new Date().toISOString()
  };

  appData.leaveRequests.push(leave);
  saveDataToStorage();
  renderLeaveTable();
  updateLeaveSummary();
  document.getElementById('leaveFormContainer').classList.add('hidden');
  document.getElementById('leaveForm').reset();
}

function approveLeave(id) {
  const leave = appData.leaveRequests.find(l => l.id === id);
  if (leave) {
    leave.status = 'Approved';
    saveDataToStorage();
    renderLeaveTable();
    updateLeaveSummary();
  }
}

function rejectLeave(id) {
  const leave = appData.leaveRequests.find(l => l.id === id);
  if (leave) {
    leave.status = 'Rejected';
    saveDataToStorage();
    renderLeaveTable();
    updateLeaveSummary();
  }
}

function deleteLeave(id) {
  if (confirm('Are you sure you want to delete this request?')) {
    appData.leaveRequests = appData.leaveRequests.filter(l => l.id !== id);
    saveDataToStorage();
    renderLeaveTable();
    updateLeaveSummary();
  }
}

function renderLeaveTable() {
  const tbody = document.getElementById('leaveTable');
  tbody.innerHTML = '';

  if (appData.leaveRequests.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No leave requests. Submit a request to get started.</td></tr>';
    return;
  }

  const sorted = [...appData.leaveRequests].sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn));
  
  sorted.forEach(leave => {
    const row = document.createElement('tr');
    const statusClass = `status-${leave.status.toLowerCase()}`;
    row.innerHTML = `
      <td>${leave.empName}</td>
      <td>${leave.leaveType}</td>
      <td>${new Date(leave.startDate).toLocaleDateString()}</td>
      <td>${new Date(leave.endDate).toLocaleDateString()}</td>
      <td>${leave.days}</td>
      <td><span class="status-badge ${statusClass}">${leave.status}</span></td>
      <td>
        <div class="table-actions">
          ${leave.status === 'Pending' ? `
            <button class="btn btn-success" onclick="approveLeave(${leave.id})">Approve</button>
            <button class="btn btn-danger" onclick="rejectLeave(${leave.id})">Reject</button>
          ` : ''}
          <button class="btn btn-danger" onclick="deleteLeave(${leave.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function updateLeaveSummary() {
  const pending = appData.leaveRequests.filter(l => l.status === 'Pending').length;
  const approved = appData.leaveRequests.filter(l => l.status === 'Approved').length;
  const rejected = appData.leaveRequests.filter(l => l.status === 'Rejected').length;

  document.getElementById('pendingLeaves').textContent = pending;
  document.getElementById('approvedLeaves').textContent = approved;
  document.getElementById('rejectedLeaves').textContent = rejected;
}

// PERFORMANCE MANAGEMENT
function addPerformanceReview() {
  const empId = document.getElementById('perfEmpId').value;
  const emp = appData.employees.find(e => e.id === empId);

  const review = {
    id: Date.now(),
    empId: empId,
    empName: emp.name,
    period: document.getElementById('perfPeriod').value,
    rating: parseInt(document.getElementById('perfRating').value),
    goalsAchieved: parseInt(document.getElementById('perfGoalsAchieved').value),
    comments: document.getElementById('perfComments').value,
    submittedOn: new Date().toISOString()
  };

  appData.performance.push(review);
  saveDataToStorage();
  renderPerformanceTable();
  updatePerformanceSummary();
  document.getElementById('performanceFormContainer').classList.add('hidden');
  document.getElementById('performanceForm').reset();
}

function deletePerformance(id) {
  if (confirm('Are you sure you want to delete this review?')) {
    appData.performance = appData.performance.filter(p => p.id !== id);
    saveDataToStorage();
    renderPerformanceTable();
    updatePerformanceSummary();
  }
}

function renderPerformanceTable() {
  const tbody = document.getElementById('performanceTable');
  tbody.innerHTML = '';

  if (appData.performance.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No performance reviews yet. Add a review to get started.</td></tr>';
    return;
  }

  const sorted = [...appData.performance].sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn));
  
  sorted.forEach(perf => {
    const row = document.createElement('tr');
    const stars = '⭐'.repeat(perf.rating);
    row.innerHTML = `
      <td>${perf.empName}</td>
      <td>${perf.period}</td>
      <td>${stars} (${perf.rating}/5)</td>
      <td>${perf.goalsAchieved}%</td>
      <td>${perf.comments.substring(0, 50)}...</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-danger" onclick="deletePerformance(${perf.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function updatePerformanceSummary() {
  if (appData.performance.length === 0) {
    document.getElementById('avgRating').textContent = '0.0';
    document.getElementById('topPerformers').textContent = '0';
    document.getElementById('needImprovement').textContent = '0';
    return;
  }

  const avgRating = (appData.performance.reduce((sum, p) => sum + p.rating, 0) / appData.performance.length).toFixed(1);
  const topPerformers = appData.performance.filter(p => p.rating >= 4).length;
  const needImprovement = appData.performance.filter(p => p.rating <= 2).length;

  document.getElementById('avgRating').textContent = avgRating;
  document.getElementById('topPerformers').textContent = topPerformers;
  document.getElementById('needImprovement').textContent = needImprovement;
}

// Populate employee selects
function populateEmployeeSelects() {
  const selects = ['attEmpId', 'leaveEmpId', 'perfEmpId'];
  
  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    select.innerHTML = '<option value="">Choose an employee...</option>';
    
    appData.employees.forEach(emp => {
      const option = document.createElement('option');
      option.value = emp.id;
      option.textContent = emp.name;
      select.appendChild(option);
    });
    
    select.value = currentValue;
  });
}

function renderAllTables() {
  renderEmployeeTable();
  renderAttendanceTable();
  renderLeaveTable();
  renderPerformanceTable();
  updateAttendanceSummary();
  updateLeaveSummary();
  updatePerformanceSummary();
}
