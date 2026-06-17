 // ── State ──
  const USERS_KEY = 'mlinzi_users';
  const SESSION_KEY = 'mlinzi_session';

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }
  function saveUsers(u) {
    localStorage.setItem(USERS_KEY, JSON.stringify(u));
  }
  function getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  }
  function saveSession(s) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  }

  // Seed demo account
  (function seedDemo() {
    let users = getUsers();
    if (!users.find(u => u.email === 'demo@mlinzi.co.ke')) {
      users.push({
        id: 'demo',
        firstName: 'Demo',
        lastName: 'Parent',
        email: 'demo@mlinzi.co.ke',
        password: 'demo1234',
        phone: '+254 700 000 000',
        role: 'parent',
        children: ['Amani Waweru', 'Zawadi Waweru'],
        joined: new Date().toLocaleDateString('en-KE', {day:'numeric',month:'short',year:'numeric'})
      });
      saveUsers(users);
    }
  })();

  // ── Navigation ──
  let currentStep = 1;

  function showPage(name) {
    // Stop live tracking if switching pages
    if (mapState.liveInterval) {
      clearInterval(mapState.liveInterval);
      mapState.liveInterval = null;
      mapState.isLive = false;
    }
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + name).classList.add('active');
    window.scrollTo(0, 0);
    updateNav();
    if (name === 'accounts') renderAccounts();
    if (name === 'dashboard') renderDashboard();
  }

  function updateNav() {
    const session = getSession();
    document.getElementById('nav-login').style.display = session ? 'none' : '';
    document.getElementById('nav-register').style.display = session ? 'none' : '';
    document.getElementById('nav-logout').style.display = session ? '' : 'none';
    document.getElementById('nav-dash').style.display = session ? '' : 'none';
    const nu = document.getElementById('nav-username');
    if (session) {
      nu.textContent = 'Hi, ' + session.firstName;
      nu.style.display = '';
    } else {
      nu.style.display = 'none';
    }
  }

  // ── Multi-step register ──
  function nextStep(n) {
    const err = document.getElementById('reg-error');
    err.classList.remove('show');

    if (n === 2) {
      const first = document.getElementById('reg-first').value.trim();
      const last = document.getElementById('reg-last').value.trim();
      const role = document.getElementById('reg-role').value;
      if (!first || !last) { showErr(err, 'Please enter your full name.'); return; }
      if (!role) { showErr(err, 'Please select your account type.'); return; }
    }
    if (n === 3) {
      const email = document.getElementById('reg-email').value.trim();
      const pass = document.getElementById('reg-pass').value;
      const pass2 = document.getElementById('reg-pass2').value;
      if (!email || !email.includes('@')) { showErr(err, 'Please enter a valid email.'); return; }
      if (pass.length < 8) { showErr(err, 'Password must be at least 8 characters.'); return; }
      if (pass !== pass2) { showErr(err, 'Passwords do not match.'); return; }
      const existing = getUsers().find(u => u.email === email);
      if (existing) { showErr(err, 'An account with this email already exists.'); return; }
    }

    document.getElementById('step-' + currentStep).classList.remove('active');
    document.getElementById('sdot-' + currentStep).classList.remove('active');
    currentStep = n;
    document.getElementById('step-' + n).classList.add('active');
    document.getElementById('sdot-' + n).classList.add('active');
  }

  function doRegister() {
    const err = document.getElementById('reg-error');
    const suc = document.getElementById('reg-success');
    err.classList.remove('show');
    suc.classList.remove('show');

    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const childName = document.getElementById('reg-child-name').value.trim();

    const newUser = {
      id: Date.now().toString(),
      firstName: document.getElementById('reg-first').value.trim(),
      lastName: document.getElementById('reg-last').value.trim(),
      email,
      password: pass,
      phone: document.getElementById('reg-phone').value.trim(),
      role: document.getElementById('reg-role').value,
      children: childName ? [childName] : [],
      joined: new Date().toLocaleDateString('en-KE', {day:'numeric',month:'short',year:'numeric'})
    };

    const users = getUsers();
    users.push(newUser);
    saveUsers(users);
    saveSession(newUser);

    // Reset form
    currentStep = 1;
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step-dot').forEach(d => d.classList.remove('active'));
    document.getElementById('step-1').classList.add('active');
    document.getElementById('sdot-1').classList.add('active');
    ['reg-first','reg-last','reg-phone','reg-email','reg-pass','reg-pass2','reg-child-name','reg-device'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('reg-role').value = '';

    toast('Account created! Welcome, ' + newUser.firstName + ' 🎉', 'success');
    setTimeout(() => showPage('dashboard'), 800);
  }

  // ── Login ──
  function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    const err = document.getElementById('login-error');
    err.classList.remove('show');

    const user = getUsers().find(u => u.email === email && u.password === pass);
    if (!user) { showErr(err, 'Invalid email or password. Try demo@mlinzi.co.ke / demo1234'); return; }

    saveSession(user);
    document.getElementById('login-email').value = '';
    document.getElementById('login-pass').value = '';
    toast('Welcome back, ' + user.firstName + '!', 'success');
    setTimeout(() => showPage('dashboard'), 600);
  }

  function demoLogin() {
    document.getElementById('login-email').value = 'demo@mlinzi.co.ke';
    document.getElementById('login-pass').value = 'demo1234';
    doLogin();
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    updateNav();
    showPage('home');
    toast('Signed out successfully.');
  }

  // ── Dashboard ──
  function renderDashboard() {
    const session = getSession();
    if (!session) { showPage('login'); return; }
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    document.getElementById('dash-greeting').textContent = greet + ', ' + session.firstName + ' 👋';
    document.getElementById('dash-sub').textContent = 'Here\'s the status of ' + (session.children && session.children.length ? session.children.join(', ') : 'your children') + ' today.';
  }

  function toggleAddChild() {
    document.getElementById('add-child-form').classList.toggle('open');
  }

  function addChild() {
    const name = document.getElementById('new-child-name').value.trim();
    if (!name) { toast('Please enter the child\'s name.'); return; }
    const session = getSession();
    if (!session) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === session.id);
    if (idx > -1) {
      if (!users[idx].children) users[idx].children = [];
      users[idx].children.push(name);
      saveUsers(users);
      saveSession(users[idx]);
    }
    // Add to UI
    const list = document.getElementById('children-list');
    const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    const item = document.createElement('div');
    item.className = 'child-item';
    item.innerHTML = `
      <div class="child-avatar av-teal">${initials}</div>
      <div class="child-info">
        <div class="child-name">${name}</div>
        <div class="child-loc">📍 Connecting device…</div>
      </div>
      <div class="child-actions">
        <button class="btn-outline" style="padding:5px 12px;font-size:12px;" onclick="openChildMap('${name}')">View Map</button>
        <button class="child-delete-btn" onclick="deleteChild('${name}')">Delete</button>
      </div>
      <div class="child-status away">Pending</div>
    `;
    list.appendChild(item);
    // Update stat
    const sc = document.getElementById('stat-children');
    sc.textContent = parseInt(sc.textContent) + 1;

    document.getElementById('new-child-name').value = '';
    document.getElementById('new-device-code').value = '';
    toggleAddChild();
    toast(name + ' added! 🛡️', 'success');
  }

  function deleteChild(childName) {
    if (!confirm(`Are you sure you want to delete ${childName} from your account?`)) return;
    
    const session = getSession();
    if (!session) return;
    
    const users = getUsers();
    const idx = users.findIndex(u => u.id === session.id);
    
    if (idx > -1 && users[idx].children) {
      const childIdx = users[idx].children.indexOf(childName);
      if (childIdx > -1) {
        users[idx].children.splice(childIdx, 1);
        saveUsers(users);
        saveSession(users[idx]);
        
        // Remove from UI
        const childItems = document.querySelectorAll('.child-item');
        childItems.forEach(item => {
          const nameEl = item.querySelector('.child-name');
          if (nameEl && nameEl.textContent === childName) {
            item.remove();
          }
        });
        
        // Update stat
        const sc = document.getElementById('stat-children');
        sc.textContent = Math.max(0, parseInt(sc.textContent) - 1);
        
        toast(childName + ' has been removed.', 'success');
      }
    }
  }

  // ── Accounts table ──
  function renderAccounts() {
    const users = getUsers();
    const tbody = document.getElementById('accounts-tbody');
    document.getElementById('user-count').textContent = '(' + users.length + ')';
    tbody.innerHTML = users.map(u => `
      <tr>
        <td style="font-weight:500;">${u.firstName} ${u.lastName}</td>
        <td style="color:var(--text-secondary);">${u.email}</td>
        <td><span class="role-badge role-${u.role === 'parent' ? 'parent' : u.role === 'guardian' || u.role === 'grandparent' ? 'guardian' : 'admin'}">${formatRole(u.role)}</span></td>
        <td>${(u.children && u.children.length) ? u.children.join(', ') : '<span style="color:var(--text-secondary)">None yet</span>'}</td>
        <td style="color:var(--text-secondary);">${u.joined}</td>
      </tr>
    `).join('');
  }

  function formatRole(r) {
    if (!r) return 'Parent';
    return r.charAt(0).toUpperCase() + r.slice(1);
  }

  // ── Helpers ──
  function showErr(el, msg) {
    el.textContent = msg;
    el.classList.add('show');
  }

  function toast(msg, type) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show' + (type === 'success' ? ' success' : '');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  // ── Map state ──
  let mapState = {
    child: null,
    offsetX: 0,
    offsetY: 0,
    zoomLevel: 1,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartOffsetX: 0,
    dragStartOffsetY: 0,
    isLive: false,
    liveInterval: null
  };

  function openChildMap(childName) {
    mapState.child = childName;
    mapState.offsetX = 0;
    mapState.offsetY = 0;
    mapState.zoomLevel = 1;
    mapState.isLive = false;
    
    document.getElementById('map-child-name').textContent = childName;
    document.getElementById('map-child-location').textContent = '📍 Westlands, Nairobi';
    document.getElementById('map-info').textContent = `📍 ${childName}'s Location`;
    document.getElementById('go-live-btn').textContent = '🔴 Go Live';
    document.getElementById('go-live-btn').style.display = '';
    
    showPage('map');
    setTimeout(() => drawMap(), 100);
  }

  function toggleGoLive() {
    mapState.isLive = !mapState.isLive;
    const btn = document.getElementById('go-live-btn');
    if (mapState.isLive) {
      btn.textContent = '🟢 Live (Active)';
      btn.style.background = '#E24B4A';
      btn.style.borderColor = '#E24B4A';
      toast(mapState.child + ' location is now being shared live! 📍', 'success');
      // Start live update simulation
      mapState.liveInterval = setInterval(() => {
        // Simulate location updates
        mapState.offsetX += (Math.random() - 0.5) * 20;
        mapState.offsetY += (Math.random() - 0.5) * 20;
        drawMap();
      }, 1000);
    } else {
      btn.textContent = '🔴 Go Live';
      btn.style.background = '';
      btn.style.borderColor = '';
      if (mapState.liveInterval) clearInterval(mapState.liveInterval);
      toast('Live tracking stopped.', 'success');
    }
  }

  function drawMap() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#d4edda');
    gradient.addColorStop(1, '#c1e8d5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid pattern
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40 * mapState.zoomLevel;
    for (let x = mapState.offsetX % gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = mapState.offsetY % gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw child location marker (center of map + offset)
    const markerX = width / 2 + mapState.offsetX;
    const markerY = height / 2 + mapState.offsetY;
    
    // Draw marker pin
    const pinSize = 20 * mapState.zoomLevel;
    ctx.save();
    ctx.translate(markerX, markerY);
    
    // Pin shape
    ctx.fillStyle = '#1D9E75';
    ctx.beginPath();
    ctx.arc(0, 0, pinSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Pin point
    ctx.fillStyle = '#0F6E56';
    ctx.beginPath();
    ctx.moveTo(0, pinSize / 2);
    ctx.lineTo(pinSize / 3, 0);
    ctx.lineTo(-pinSize / 3, 0);
    ctx.closePath();
    ctx.fill();
    
    // Emoji in center
    ctx.font = `${14 * mapState.zoomLevel}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText('📍', 0, 0);
    
    ctx.restore();
    
    // Draw pulse animation
    ctx.strokeStyle = 'rgba(29,158,117,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const pulseRadius = pinSize + (10 * Math.sin(Date.now() / 500));
    ctx.arc(markerX, markerY, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  function zoomMap(factor) {
    mapState.zoomLevel = Math.max(0.5, Math.min(3, mapState.zoomLevel * factor));
    drawMap();
  }

  function resetMap() {
    mapState.offsetX = 0;
    mapState.offsetY = 0;
    mapState.zoomLevel = 1;
    drawMap();
  }

  // Map interactions
  const canvas = document.getElementById('map-canvas');
  if (canvas) {
    canvas.addEventListener('mousedown', (e) => {
      mapState.isDragging = true;
      mapState.dragStartX = e.clientX;
      mapState.dragStartY = e.clientY;
      mapState.dragStartOffsetX = mapState.offsetX;
      mapState.dragStartOffsetY = mapState.offsetY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
      if (mapState.isDragging) {
        const dx = e.clientX - mapState.dragStartX;
        const dy = e.clientY - mapState.dragStartY;
        mapState.offsetX = mapState.dragStartOffsetX + dx;
        mapState.offsetY = mapState.dragStartOffsetY + dy;
        drawMap();
      }
    });
    
    canvas.addEventListener('mouseup', () => {
      mapState.isDragging = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
      mapState.isDragging = false;
    });
    
    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        mapState.isDragging = true;
        mapState.dragStartX = e.touches[0].clientX;
        mapState.dragStartY = e.touches[0].clientY;
        mapState.dragStartOffsetX = mapState.offsetX;
        mapState.dragStartOffsetY = mapState.offsetY;
      }
    });
    
    canvas.addEventListener('touchmove', (e) => {
      if (mapState.isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - mapState.dragStartX;
        const dy = e.touches[0].clientY - mapState.dragStartY;
        mapState.offsetX = mapState.dragStartOffsetX + dx;
        mapState.offsetY = mapState.dragStartOffsetY + dy;
        drawMap();
      }
    });
    
    canvas.addEventListener('touchend', () => {
      mapState.isDragging = false;
    });
  }

  // Init
  updateNav();