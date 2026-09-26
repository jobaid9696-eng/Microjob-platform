// State Management
let appState = {
  balance: 1.5000,
  currentFilter: 'all',
  jobs: [
    { id: 1, platform: 'whatsapp', type: 'Join', title: 'Join Official Crypto WhatsApp Group', reward: 0.005, status: 'active', adminLink: '' },
    { id: 2, platform: 'twitter', type: 'Follow', title: 'Follow X/Twitter Account', reward: 0.005, status: 'active', adminLink: '' },
    { id: 3, platform: 'instagram', type: 'Like', title: 'Like Latest Instagram Post', reward: 0.002, status: 'active', adminLink: '' },
    { id: 4, platform: 'facebook', type: 'Comment', title: 'Comment on Facebook Page', reward: 0.003, status: 'active', adminLink: '' },
    { id: 5, platform: 'telegram', type: 'Join', title: 'Join Telegram Crypto News', reward: 0.005, status: 'active', adminLink: '' }
  ]
};

// Load saved state
const savedState = localStorage.getItem('microtask_usdt_state');
if (savedState) {
  try {
    appState = JSON.parse(savedState);
  } catch(e) {}
}

function saveState() {
  localStorage.setItem('microtask_usdt_state', JSON.stringify(appState));
}

document.addEventListener('DOMContentLoaded', () => {
  renderJobs();
  renderHistory();
  updateBalanceDisplay();
});

function switchView(viewName) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`view-${viewName}`).classList.add('active');
  const navMap = { 'tasks': 0, 'post': 1, 'wallet': 2, 'history': 3, 'admin': 4 };
  if (document.querySelectorAll('.nav-item')[navMap[viewName]]) {
    document.querySelectorAll('.nav-item')[navMap[viewName]].classList.add('active');
  }
  if(viewName === 'history') {
    renderHistory();
  }
}

function filterJobs(platform) {
  appState.currentFilter = platform;
  document.querySelectorAll('.filter-tab').forEach(btn => {
    const txt = btn.textContent.toLowerCase();
    if(platform === 'all' && txt === 'all') btn.classList.add('active');
    else if(txt === platform) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  renderJobs();
}

function renderJobs() {
  const container = document.getElementById('jobs-list');
  let activeJobs = appState.jobs.filter(job => job.status === 'active');
  if(appState.currentFilter !== 'all') {
    activeJobs = activeJobs.filter(job => job.platform === appState.currentFilter);
  }
  
  if(activeJobs.length === 0) {
    container.innerHTML = `<div class="card" style="text-align: center; padding: 32px;"><p style="font-size: 16px; color: var(--text-muted);">No active tasks right now. Check back soon!</p></div>`;
    return;
  }

  container.innerHTML = activeJobs.map(job => `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="badge badge-${job.platform}">${job.platform}</span>
        <span style="color: var(--accent); font-weight: 700; font-size: 16px;">+${job.reward.toFixed(3)} USDT</span>
      </div>
      <h3 style="font-size: 16px; font-weight: 600;">${job.type}: ${job.title}</h3>
      <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; display: flex; flex-direction: column; gap: 10px;">
        <div class="form-group">
          <label class="form-label">Task Link (Admin)</label>
          <input type="url" id="admin-link-${job.id}" placeholder="" class="form-control" value="${job.adminLink || ''}" oninput="updateAdminLink(${job.id}, this.value)">
        </div>
        <a href="${job.adminLink || '#'}" target="_blank" onclick="return checkAdminLink(${job.id})" style="color: var(--accent); font-size: 14px; text-decoration: underline; font-weight: 600;">🔗 Open Task Link</a>
        
        <div class="form-group">
          <label class="form-label">Profile Link / Username</label>
          <input type="text" id="proof-text-${job.id}" placeholder="e.g. @username or profile URL" class="form-control">
        </div>
        
        <div class="form-group">
          <label class="form-label">Upload Proof Screenshot</label>
          <input type="file" id="proof-file-${job.id}" accept="image/*" class="form-control" style="padding: 6px; font-size: 13px;">
        </div>

        <button class="btn" onclick="submitProof(${job.id})">Submit Proof</button>
      </div>
    </div>
  `).join('');
}

function updateAdminLink(jobId, val) {
  const job = appState.jobs.find(j => j.id === jobId);
  if(job) {
    job.adminLink = val.trim();
  }
}

function checkAdminLink(jobId) {
  const job = appState.jobs.find(j => j.id === jobId);
  if(!job || !job.adminLink) {
    alert('Please enter a valid task link first.');
    return false;
  }
  return true;
}

function submitProof(jobId) {
  const textInput = document.getElementById(`proof-text-${jobId}`);
  const fileInput = document.getElementById(`proof-file-${jobId}`);
  
  const textVal = textInput ? textInput.value.trim() : '';
  const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

  if(!textVal || !hasFile) {
    alert('Please enter your profile link/username AND upload a screenshot proof.');
    return;
  }

  const job = appState.jobs.find(j => j.id === jobId);
  if(job && job.status === 'active') {
    job.status = 'completed';
    appState.balance += job.reward;
    saveState();
    updateBalanceDisplay();
    renderJobs();
    renderHistory();
    alert(`Proof submitted successfully! Reward of +${job.reward.toFixed(3)} USDT added to balance.`);
  }
}

function renderHistory() {
  const container = document.getElementById('history-list');
  if(!container) return;
  const completedJobs = appState.jobs.filter(job => job.status === 'completed');

  if(completedJobs.length === 0) {
    container.innerHTML = `<div class="card" style="text-align: center; padding: 24px;"><p style="font-size: 14px; color: var(--text-muted);">No completed tasks yet. Finish tasks from the Tasks tab to earn USDT!</p></div>`;
    return;
  }

  container.innerHTML = completedJobs.map(job => `
    <div class="card" style="padding: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="badge badge-${job.platform}">${job.platform}</span>
        <span style="color: var(--accent); font-weight: 700; font-size: 15px;">+${job.reward.toFixed(3)} USDT</span>
      </div>
      <h3 style="font-size: 15px; font-weight: 600;">${job.type}: ${job.title}</h3>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); margin-top: 4px;">
        <span>Status: Completed & Paid</span>
        <span>ID: #${job.id}</span>
      </div>
    </div>
  `).join('');
}

function processWithdrawal() {
  const amount = parseFloat(document.getElementById('wd-amount').value);
  const address = document.getElementById('wd-address').value;
  if (!amount || amount < 0.5 || amount > 100) return alert('Min withdrawal is $0.50 and Max is $100.00');
  if (!address.startsWith('0x')) return alert('Invalid BEP20 Address');
  if (amount > appState.balance) return alert('Insufficient balance');
  
  appState.balance -= amount;
  saveState();
  updateBalanceDisplay();
  alert('Withdrawal request of ' + amount + ' USDT submitted successfully!');
}

function postNewJob() {
  const platform = document.getElementById('post-platform').value;
  const type = document.getElementById('post-type').value;
  const title = document.getElementById('post-title').value.trim();
  const reward = parseFloat(document.getElementById('post-reward').value);
  const link = document.getElementById('post-link').value.trim();

  if(!title || isNaN(reward) || reward <= 0 || !link) {
    alert('Please fill in all fields correctly to post a job.');
    return;
  }

  const newJob = {
    id: appState.jobs.length + 1,
    platform: platform,
    type: type,
    title: title,
    reward: reward,
    status: 'active',
    adminLink: link
  };

  appState.jobs.unshift(newJob);
  saveState();
  renderJobs();
  switchView('tasks');
  alert('Microjob posted successfully!');
  
  document.getElementById('post-title').value = '';
  document.getElementById('post-reward').value = '';
  document.getElementById('post-link').value = '';
}

function updateBalanceDisplay() {
  document.getElementById('wallet-balance').textContent = appState.balance.toFixed(4);
  document.getElementById('wallet-main-balance').textContent = `${appState.balance.toFixed(4)} USDT`;
}
