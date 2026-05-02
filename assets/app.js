/* ============================================
   O'STEPH — DB clients (localStorage)
   ============================================ */

const OSTEPH = {
  KEY_CLIENTS: 'osteph_clients_v1',
  KEY_COUNTER: 'osteph_counter_v1',
  KEY_BIN_ID: 'osteph_bin_id_v1',
  KEY_BIN_KEY: 'osteph_bin_key_v1',
  KEY_ADMIN_AUTH: 'osteph_admin_auth_v1',
  KEY_THEME: 'osteph_theme_v1',
  ADMIN_PASSWORD: 'osteph2026',

  // ===== Theme =====
  applyTheme(theme) {
    const t = ['bw', 'gold', 'light'].includes(theme) ? theme : 'gold';
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(this.KEY_THEME, t);
    document.querySelectorAll('.theme-switcher button').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === t);
    });
  },
  initTheme() {
    const saved = localStorage.getItem(this.KEY_THEME) || 'gold';
    this.applyTheme(saved);
  },

  // ===== Configuration JSONBin =====
  // Priorité : URL params (téléphone client) > localStorage (admin Karim)
  cloudConfig() {
    const u = new URLSearchParams(location.search);
    const idFromUrl = u.get('b');
    const keyFromUrl = u.get('k');
    if (idFromUrl && keyFromUrl) return { id: idFromUrl, key: keyFromUrl };
    return {
      id: localStorage.getItem(this.KEY_BIN_ID) || '',
      key: localStorage.getItem(this.KEY_BIN_KEY) || ''
    };
  },
  setCloudConfig(id, key) {
    localStorage.setItem(this.KEY_BIN_ID, (id || '').trim());
    localStorage.setItem(this.KEY_BIN_KEY, (key || '').trim());
  },
  isCloudConfigured() {
    const c = this.cloudConfig();
    return !!(c.id && c.key);
  },

  // GET la liste des clients depuis JSONBin
  async cloudFetch() {
    const cfg = this.cloudConfig();
    if (!cfg.id || !cfg.key) throw new Error('NOT_CONFIGURED');
    const r = await fetch(`https://api.jsonbin.io/v3/b/${cfg.id}/latest`, {
      headers: { 'X-Master-Key': cfg.key }
    });
    if (!r.ok) throw new Error('HTTP_' + r.status);
    const j = await r.json();
    return Array.isArray(j.record) ? j.record : [];
  },

  // PUT (remplace tout le bin)
  async cloudPush(arr) {
    const cfg = this.cloudConfig();
    if (!cfg.id || !cfg.key) throw new Error('NOT_CONFIGURED');
    const r = await fetch(`https://api.jsonbin.io/v3/b/${cfg.id}`, {
      method: 'PUT',
      headers: {
        'X-Master-Key': cfg.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(arr)
    });
    if (!r.ok) throw new Error('HTTP_' + r.status);
    return true;
  },

  // Ajoute un client (read-modify-write)
  async cloudAppend(client) {
    const all = await this.cloudFetch();
    all.push(client);
    await this.cloudPush(all);
    return all;
  },

  // Synchronise local depuis le cloud
  async syncFromCloud() {
    const arr = await this.cloudFetch();
    this.saveClients(arr);
    localStorage.setItem('osteph_last_sync', new Date().toISOString());
    return arr.length;
  },

  getLastSync() {
    return localStorage.getItem('osteph_last_sync') || null;
  },

  // ===== Client storage =====
  loadClients() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_CLIENTS) || '[]');
    } catch (e) { return []; }
  },

  saveClients(arr) {
    localStorage.setItem(this.KEY_CLIENTS, JSON.stringify(arr));
  },

  nextNumber() {
    const year = new Date().getFullYear();
    const counter = parseInt(localStorage.getItem(this.KEY_COUNTER) || '0', 10) + 1;
    localStorage.setItem(this.KEY_COUNTER, String(counter));
    return `OS-${year}-${String(counter).padStart(5, '0')}`;
  },

  removeClient(number) {
    const clients = this.loadClients().filter(c => c.number !== number);
    this.saveClients(clients);
  },

  clearAll() {
    localStorage.removeItem(this.KEY_CLIENTS);
    localStorage.removeItem(this.KEY_COUNTER);
    localStorage.removeItem('osteph_last_sync');
  },

  // ===== Export CSV =====
  exportCSV() {
    const clients = this.loadClients();
    const headers = ['Numéro', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Menus', 'Inscription'];
    const rows = clients.map(c => [
      c.number, c.prenom, c.nom, c.email, c.telephone, c.menus || 0,
      new Date(c.created).toLocaleString('fr-FR')
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => {
        const s = String(cell || '');
        return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(';'))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `osteph_clients_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }
};

// ===== Sparkles décoratives (fond animé) =====
function spawnSparkles(count = 24) {
  const layer = document.querySelector('.sparkle-layer');
  if (!layer) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    if (i % 3 === 0) s.classList.add('s2');
    if (i % 5 === 0) s.classList.add('s3');
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = (Math.random() * 4) + 's';
    s.style.animationDuration = (3 + Math.random() * 3) + 's';
    layer.appendChild(s);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  spawnSparkles();
  // Init du sélecteur de thème
  document.querySelectorAll('.theme-switcher button').forEach(btn => {
    btn.addEventListener('click', () => OSTEPH.applyTheme(btn.dataset.theme));
  });
  OSTEPH.initTheme();
});
