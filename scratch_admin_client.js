
    // State initialization from seed or local cache
    const STORAGE_KEY = 'propledger_admin_state_v1';
    let appData = null;
    let currentPropFilter = 'all';
    let currentUserFilter = 'all';

    // Live clock
    function updateClock() {
      const now = new Date();
      const clockEl = document.getElementById('liveClock');
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Tab Switching
    function switchTab(tabId) {
      document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('tab-active'));

      const targetPane = document.getElementById('tabContent-' + tabId);
      const targetBtn = document.getElementById('tabBtn-' + tabId);
      if (targetPane) targetPane.classList.remove('hidden');
      if (targetBtn) targetBtn.classList.add('tab-active');
    }

    // Modal helpers
    function openModal(id) {
      const m = document.getElementById(id);
      if (m) m.classList.remove('hidden');
      if (id === 'addUnitModal') populateUnitPropertyDropdown();
    }
    function closeModal(id) {
      const m = document.getElementById(id);
      if (m) m.classList.add('hidden');
    }

    // Toast alert
    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      const bg = type === 'success' ? 'bg-slate-900 border-emerald-500/40 text-white' : 'bg-red-900 border-red-500 text-white';
      toast.className = 'pointer-events-auto px-5 py-3 rounded-2xl border shadow-xl text-xs font-bold flex items-center gap-2.5 transition-all transform translate-y-4 opacity-0 ' + bg;
      toast.innerHTML = (type === 'success' ? '<span class="text-emerald-400">✔</span>' : '<span class="text-red-400">✖</span>') + '<span>' + message + '</span>';
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      }, 50);

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    // Initialize application data
    async function initData() {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          appData = JSON.parse(cached);
        } catch(e) {}
      }

      // Try fetching fresh data from Worker edge API
      try {
        const resp = await fetch('/api/admin/dashboard-data');
        if (resp.ok) {
          const res = await resp.json();
          if (res.success && res.data) {
            appData = res.data;
            saveState();
          }
        }
      } catch (err) {
        console.warn('Working in offline/cached mode:', err);
      }

      if (!appData) {
        // Fallback default
        appData = window.__INITIAL_ADMIN_DATA__;
      }

      renderAll();
    }

    function saveState() {
      if (appData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      }
    }

    function renderAll() {
      renderProperties();
      renderUsers();
      renderTasks();
      renderActivity();
      updateBadges();
    }

    function updateBadges() {
      if (!appData) return;
      document.getElementById('badge-propCount').textContent = appData.properties.length;
      document.getElementById('badge-userCount').textContent = appData.users.length;
      document.getElementById('badge-taskCount').textContent = appData.tasks.filter(t => t.status !== 'completed').length;
      
      document.getElementById('stat-totalProperties').textContent = appData.properties.length;
      const totalUnits = appData.properties.reduce((sum, p) => sum + (p.unitsCount || 0), 0);
      const occupiedUnits = appData.properties.reduce((sum, p) => sum + (p.occupiedCount || 0), 0);
      const grossRoll = appData.properties.reduce((sum, p) => sum + (p.grossRent || 0), 0);
      
      document.getElementById('stat-totalUnits').textContent = totalUnits;
      document.getElementById('stat-occupancyRate').textContent = totalUnits ? ((occupiedUnits / totalUnits) * 100).toFixed(1) + '%' : '100%';
      document.getElementById('stat-grossRentRoll').textContent = '$' + grossRoll.toLocaleString();
    }

    // Properties Render
    function renderProperties() {
      const grid = document.getElementById('propertiesGrid');
      if (!grid || !appData) return;
      const query = (document.getElementById('propertySearch').value || '').toLowerCase();

      const filtered = appData.properties.filter(p => {
        const matchType = currentPropFilter === 'all' || p.type.toLowerCase().includes(currentPropFilter.toLowerCase());
        const matchQuery = p.name.toLowerCase().includes(query) || p.address.toLowerCase().includes(query) || p.city.toLowerCase().includes(query);
        return matchType && matchQuery;
      });

      grid.innerHTML = filtered.map(p => `
        <div class="soft-card p-6 flex flex-col justify-between space-y-5">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                ${p.type}
              </span>
              <span class="text-xs font-mono font-bold text-slate-400">${p.id}</span>
            </div>

            <div>
              <h3 class="text-lg font-black text-slate-900 tracking-tight">${p.name}</h3>
              <p class="text-xs text-slate-500 mt-0.5">${p.address}, ${p.city}, ${p.state} ${p.zip}</p>
            </div>

            <!-- Occupancy bar -->
            <div class="space-y-1.5 pt-1">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-600">Occupancy: ${p.occupiedCount}/${p.unitsCount} Units</span>
                <span class="text-emerald-700 font-bold">${((p.occupiedCount / p.unitsCount) * 100).toFixed(0)}%</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full" style="width: ${(p.occupiedCount / p.unitsCount) * 100}%"></div>
              </div>
            </div>

            <!-- Amenities -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              ${(p.amenities || []).map(a => `<span class="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">${a}</span>`).join('')}
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-bold">Monthly Gross</span>
              <span class="text-slate-900 font-black font-mono text-sm">$${p.grossRent.toLocaleString()}</span>
            </div>
            <button onclick="quickAddUnitTo('${p.name}')" class="pill-btn px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">
              + Unit
            </button>
          </div>
        </div>
      `).join('');
    }

    function setPropFilter(type) {
      currentPropFilter = type;
      document.querySelectorAll('.prop-filter-btn').forEach(btn => {
        if (btn.dataset.filter === type) {
          btn.className = 'prop-filter-btn px-3 py-1.5 rounded-lg font-bold bg-white text-slate-900 shadow-sm';
        } else {
          btn.className = 'prop-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900';
        }
      });
      renderProperties();
    }

    function filterProperties() {
      renderProperties();
    }

    function populateUnitPropertyDropdown() {
      const select = document.getElementById('unitTargetProperty');
      if (!select || !appData) return;
      select.innerHTML = appData.properties.map(p => `<option value="${p.name}">${p.name} (${p.city}, ${p.state})</option>`).join('');
    }

    function quickAddUnitTo(propName) {
      openModal('addUnitModal');
      setTimeout(() => {
        const select = document.getElementById('unitTargetProperty');
        if (select) select.value = propName;
      }, 50);
    }

    // Submit New Property
    async function submitNewProperty(e) {
      e.preventDefault();
      const name = document.getElementById('propName').value;
      const type = document.getElementById('propType').value;
      const unitsCount = parseInt(document.getElementById('propUnits').value);
      const address = document.getElementById('propAddress').value;
      const city = document.getElementById('propCity').value;
      const state = document.getElementById('propState').value;
      const grossRent = parseFloat(document.getElementById('propRent').value);
      const amenities = document.getElementById('propAmenities').value.split(',').map(s => s.trim());

      const payload = { name, type, unitsCount, address, city, state, grossRent, amenities };

      // Local optimistic update
      const newProp = {
        id: "PROP-" + String(appData.properties.length + 1).padStart(3, '0'),
        ...payload,
        occupiedCount: Math.max(1, unitsCount - 1),
        zip: "78701",
        status: "Operational"
      };
      appData.properties.unshift(newProp);
      appData.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Property Registered",
        description: `New asset '${newProp.name}' (${newProp.unitsCount} units) registered in system.`,
        category: "property"
      });

      saveState();
      renderAll();
      closeModal('addPropertyModal');
      showToast(`Property "${name}" registered successfully!`);

      // Post to edge API
      fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.error('Edge sync error:', err));
    }

    // Submit New Unit
    function submitNewUnit(e) {
      e.preventDefault();
      const propName = document.getElementById('unitTargetProperty').value;
      const unitNum = document.getElementById('unitNumber').value;
      const rent = parseFloat(document.getElementById('unitRent').value);
      const tenant = document.getElementById('unitTenant').value;

      const prop = appData.properties.find(p => p.name === propName);
      if (prop) {
        prop.unitsCount += 1;
        prop.grossRent += rent;
        if (tenant && tenant.toLowerCase() !== 'vacant') {
          prop.occupiedCount += 1;
        }
      }

      appData.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Unit Appended",
        description: `${unitNum} added to ${propName} ($${rent.toLocaleString()}/mo).`,
        category: "property"
      });

      saveState();
      renderAll();
      closeModal('addUnitModal');
      showToast(`Unit ${unitNum} added to ${propName}!`);
    }

    // Users Render
    function renderUsers() {
      const tbody = document.getElementById('usersTableBody');
      if (!tbody || !appData) return;
      const query = (document.getElementById('userSearch').value || '').toLowerCase();

      const filtered = appData.users.filter(u => {
        const matchRole = currentUserFilter === 'all' || u.role === currentUserFilter;
        const matchQuery = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.property.toLowerCase().includes(query);
        return matchRole && matchQuery;
      });

      // Update counters
      document.getElementById('stat-usersTotal').textContent = appData.users.length;
      document.getElementById('stat-usersTenants').textContent = appData.users.filter(u => u.role === 'TENANT').length;
      document.getElementById('stat-usersManagers').textContent = appData.users.filter(u => u.role === 'PROPERTY_MANAGER').length;
      document.getElementById('stat-usersTechs').textContent = appData.users.filter(u => u.role === 'MAINTENANCE_TECH').length;

      const roleBadges = {
        'SUPER_ADMIN': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'PROPERTY_MANAGER': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'TENANT': 'bg-blue-100 text-blue-800 border-blue-200',
        'MAINTENANCE_TECH': 'bg-amber-100 text-amber-800 border-amber-200',
        'LANDLORD': 'bg-purple-100 text-purple-800 border-purple-200'
      };

      tbody.innerHTML = filtered.map(u => `
        <tr class="hover:bg-slate-50/80 transition">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 font-mono">
                ${u.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <p class="font-bold text-slate-900 text-sm leading-tight">${u.name}</p>
                <p class="text-xs text-slate-500 font-mono">${u.email}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4">
            <span class="text-[11px] font-bold font-mono px-2.5 py-1 rounded-full border ${roleBadges[u.role] || 'bg-slate-100 text-slate-700 border-slate-200'}">
              ${u.role}
            </span>
          </td>
          <td class="px-6 py-4">
            <p class="font-semibold text-slate-900 text-xs">${u.property}</p>
            <p class="text-[11px] text-slate-500 font-mono">${u.unit}</p>
          </td>
          <td class="px-6 py-4 font-mono text-xs text-slate-600">${u.phone || 'N/A'}</td>
          <td class="px-6 py-4">
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-full ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (u.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200')}">
              ${u.status}
            </span>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button onclick="toggleUserStatus('${u.id}')" class="pill-btn px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200">
                ${u.status === 'Active' ? 'Suspend' : 'Activate'}
              </button>
              <button onclick="deleteUser('${u.id}')" class="text-slate-400 hover:text-red-600 text-sm px-1.5 py-1" title="Remove Account">
                &times;
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    function setUserFilter(role) {
      currentUserFilter = role;
      document.querySelectorAll('.user-filter-btn').forEach(btn => {
        if (btn.dataset.filter === role) {
          btn.className = 'user-filter-btn px-3 py-1.5 rounded-lg font-bold bg-white text-slate-900 shadow-sm';
        } else {
          btn.className = 'user-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900';
        }
      });
      renderUsers();
    }

    function filterUsers() {
      renderUsers();
    }

    function toggleUserStatus(userId) {
      const user = appData.users.find(u => u.id === userId);
      if (user) {
        user.status = user.status === 'Active' ? 'Suspended' : 'Active';
        appData.activity.unshift({
          id: "ACT-" + Date.now().toString().slice(-4),
          timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          action: "Status Updated",
          description: `Account for ${user.name} (${user.id}) changed to '${user.status}'.`,
          category: "user"
        });
        saveState();
        renderAll();
        showToast(`User ${user.name} status updated to ${user.status}`);
        fetch('/api/admin/users/' + userId + '/toggle-status', { method: 'POST' }).catch(()=>{});
      }
    }

    function deleteUser(userId) {
      const idx = appData.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        const name = appData.users[idx].name;
        appData.users.splice(idx, 1);
        saveState();
        renderAll();
        showToast(`User account ${name} removed`);
      }
    }

    // Submit New User
    function submitNewUser(e) {
      e.preventDefault();
      const name = document.getElementById('userName').value;
      const email = document.getElementById('userEmail').value;
      const phone = document.getElementById('userPhone').value;
      const role = document.getElementById('userRole').value;
      const status = document.getElementById('userStatus').value;
      const property = document.getElementById('userProperty').value;
      const unit = document.getElementById('userUnit').value;

      const newUser = {
        id: "USR-" + String(appData.users.length + 1).padStart(3, '0'),
        name, email, phone, role, status, property, unit,
        joinedDate: "Today, Sep 12"
      };

      appData.users.unshift(newUser);
      appData.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "User Onboarded",
        description: `${newUser.name} onboarded as ${newUser.role} (${newUser.property}).`,
        category: "user"
      });

      saveState();
      renderAll();
      closeModal('addUserModal');
      showToast(`User ${name} registered successfully!`);

      fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      }).catch(()=>{});
    }

    function exportUsersCSV() {
      if (!appData) return;
      const headers = ["ID,Full Name,Email,Role,Property,Unit,Phone,Status,Joined Date"];
      const rows = appData.users.map(u => `"${u.id}","${u.name}","${u.email}","${u.role}","${u.property}","${u.unit}","${u.phone}","${u.status}","${u.joinedDate}"`);
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join(String.fromCharCode(10));
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `PropLedger_Users_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("User directory exported to CSV!");
    }

    // Tasks Render
    function renderTasks() {
      if (!appData) return;
      const columns = ['backlog', 'in_progress', 'review', 'completed'];
      columns.forEach(col => {
        const container = document.getElementById('col-' + col);
        const countBadge = document.getElementById('count-' + col);
        const tasks = appData.tasks.filter(t => t.status === col);
        if (countBadge) countBadge.textContent = tasks.length;

        if (container) {
          if (tasks.length === 0) {
            container.innerHTML = '<div class="p-4 text-center text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-2xl">No tasks in this lane</div>';
          } else {
            container.innerHTML = tasks.map(t => {
              const priorityClass = t.priority === 'URGENT' 
                ? 'bg-rose-100 text-rose-800 border-rose-200' 
                : (t.priority === 'HIGH' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200');
              
              const nextBtnText = col === 'backlog' ? 'Start ➔' : (col === 'in_progress' ? 'Review ➔' : (col === 'review' ? 'Resolve ➔' : 'Reopen &#8634;'));

              return `
                <div class="soft-card p-4 space-y-3 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border ${priorityClass}">
                      ${t.priority}
                    </span>
                    <span class="text-[10px] font-mono text-slate-400 font-bold">${t.id}</span>
                  </div>

                  <div>
                    <h4 class="font-bold text-slate-900 text-xs leading-snug">${t.title}</h4>
                    <p class="text-[11px] text-slate-500 mt-1">${t.property} &bull; <strong class="text-slate-700">${t.unit}</strong></p>
                  </div>

                  <div class="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                    <div class="flex items-center gap-1.5 text-slate-600">
                      <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                      <span>${t.assignee}</span>
                    </div>
                    <span class="text-slate-500 font-mono">${t.dueDate}</span>
                  </div>

                  <button onclick="advanceTaskStatus('${t.id}')" class="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition">
                    <span>${nextBtnText}</span>
                  </button>
                </div>
              `;
            }).join('');
          }
        }
      });
    }

    function advanceTaskStatus(taskId) {
      const task = appData.tasks.find(t => t.id === taskId);
      if (task) {
        const order = ['backlog', 'in_progress', 'review', 'completed'];
        const curr = order.indexOf(task.status);
        task.status = curr < order.length - 1 ? order[curr + 1] : order[0];
        
        appData.activity.unshift({
          id: "ACT-" + Date.now().toString().slice(-4),
          timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          action: "Task Advanced",
          description: `Work order #${task.id} advanced to status '${task.status}'.`,
          category: "task"
        });

        saveState();
        renderAll();
        showToast(`Task #${task.id} moved to ${task.status.replace('_', ' ')}!`);
        fetch('/api/admin/tasks/' + taskId + '/advance', { method: 'POST' }).catch(()=>{});
      }
    }

    // Submit New Task
    function submitNewTask(e) {
      e.preventDefault();
      const title = document.getElementById('taskTitle').value;
      const category = document.getElementById('taskCategory').value;
      const priority = document.getElementById('taskPriority').value;
      const property = document.getElementById('taskProperty').value;
      const unit = document.getElementById('taskUnit').value;
      const assignee = document.getElementById('taskAssignee').value;
      const dueDate = document.getElementById('taskDue').value;

      const newTask = {
        id: "TSK-" + (100 + appData.tasks.length + 1),
        title, category, priority, property, unit, assignee, dueDate,
        status: "backlog",
        createdDate: "Sep 12, 2026"
      };

      appData.tasks.unshift(newTask);
      appData.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Task Created",
        description: `Work order '${newTask.title}' [${newTask.priority}] assigned to ${newTask.assignee}.`,
        category: "task"
      });

      saveState();
      renderAll();
      closeModal('addTaskModal');
      showToast(`Work order #${newTask.id} created!`);

      fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      }).catch(()=>{});
    }

    // Activity Stream Render
    function renderActivity() {
      const container = document.getElementById('activityStreamContainer');
      if (!container || !appData) return;

      const catBadges = {
        'financial': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'property': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'user': 'bg-blue-100 text-blue-800 border-blue-200',
        'task': 'bg-amber-100 text-amber-800 border-amber-200',
        'security': 'bg-purple-100 text-purple-800 border-purple-200'
      };

      container.innerHTML = (appData.activity || []).map(act => `
        <div class="py-3 flex items-start justify-between gap-4 text-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${catBadges[act.category] || 'bg-slate-100 text-slate-700'}">
                ${act.action}
              </span>
              <span class="text-slate-400 font-mono text-[11px]">${act.id}</span>
            </div>
            <p class="font-medium text-slate-800">${act.description}</p>
          </div>
          <span class="font-mono text-[11px] text-slate-500 flex-shrink-0">${act.timestamp}</span>
        </div>
      `).join('');
    }

    function downloadAuditJSON() {
      if (!appData) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `PropLedger_Executive_Audit_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Daily audit report downloaded as JSON!");
    }

    async function resetDataToSeed() {
      if (confirm("Reset all properties, users, and tasks to default seed data?")) {
        localStorage.removeItem(STORAGE_KEY);
        try {
          await fetch('/api/admin/reset', { method: 'POST' });
        } catch(e) {}
        appData = JSON.parse(JSON.stringify(window.__INITIAL_ADMIN_DATA__));
        saveState();
        renderAll();
        showToast("System reset to production sample seed!");
      }
    }

    // Chart Tooltip logic
    function showChartTip(e, month, income, expense, profit) {
      const tip = document.getElementById('chartTipBox');
      document.getElementById('tipMonth').textContent = month;
      document.getElementById('tipIncome').textContent = income;
      document.getElementById('tipExpense').textContent = expense;
      document.getElementById('tipProfit').textContent = profit;

      tip.classList.remove('hidden');
      const rect = e.target.getBoundingClientRect();
      const parentRect = document.getElementById('financialChartSvg').getBoundingClientRect();
      tip.style.left = (rect.left - parentRect.left - 40) + 'px';
      tip.style.top = (rect.top - parentRect.top - 85) + 'px';
    }

    function hideChartTip() {
      document.getElementById('chartTipBox').classList.add('hidden');
    }

    // Resend email dispatch function
    async function adminDispatchEmail() {
      const btn = document.getElementById('adminSendBtn');
      const statusBox = document.getElementById('adminStatusResult');
      const email = document.getElementById('adminEmailInput').value;
      const invNum = document.getElementById('adminInvNumber').value;
      const amount = document.getElementById('adminInvAmount').value;
      const property = document.getElementById('adminInvProperty').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Dispatching via Resend API...';
      statusBox.className = 'p-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Connecting to transactional mail engine...';

      try {
        const resp = await fetch('/api/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientEmail: email, invoiceNumber: invNum, amount: amount, property: property, tenant: 'Vishal Bhutekar' })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Email Delivered!</strong><br>Message ID: ' + (data.messageId || 'OK') + '<br>Recipient: ' + email;
        } else {
          statusBox.className = 'p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Response: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 block text-xs leading-relaxed font-mono';
        statusBox.innerHTML = 'Error: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg><span>Dispatch Statement via Resend</span>';
      }
    }

    async function adminPingSupport() {
      const btn = document.getElementById('adminPingBtn');
      const statusBox = document.getElementById('adminPingResult');

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Testing forward routing...';
      statusBox.className = 'p-4 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Sending diagnostic packet...';

      try {
        const resp = await fetch('/api/support-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: 'Admin Portal Ping', senderEmail: 'diagnostics@propledger.com', subject: 'Diagnostic verification of edge forward pipeline', message: 'Testing forward routing to vishal.bhutekar1@gmail.com' })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Support Routing Verified!</strong><br>Forwarded to: ' + data.forwardedTo + '<br>Message ID: ' + (data.messageId || 'OK');
        } else {
          statusBox.className = 'p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Response: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 block text-xs leading-relaxed font-mono';
        statusBox.innerHTML = 'Error: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg><span>Simulate Live Inbound Support Forwarding</span>';
      }
    }

    // Kickoff
    document.addEventListener('DOMContentLoaded', initData);
  