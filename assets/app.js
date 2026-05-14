/* ============================================
   O'STEPH — Cloud (clients + content éditable)
   v4 : ajout schedule (planning + carte)
   ============================================ */

const OSTEPH = {
  KEY_CLIENTS: 'osteph_clients_v1',
  KEY_COUNTER: 'osteph_counter_v1',
  KEY_BIN_ID: 'osteph_bin_id_v1',
  KEY_BIN_KEY: 'osteph_bin_key_v1',
  KEY_ADMIN_AUTH: 'osteph_admin_auth_v1',
  KEY_THEME: 'osteph_theme_v1',
  KEY_CONTENT_CACHE: 'osteph_content_cache_v1',
  KEY_CONTENT_CACHED_AT: 'osteph_content_cached_at_v1',
  ADMIN_PASSWORD: 'osteph2026',
  CONTENT_CACHE_MS: 5 * 60 * 1000,

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

  DEFAULT_BIN_ID: '6a003b66250b1311c32bba97',
  DEFAULT_MASTER_KEY: '$2a$10$Scw0xyvThlXOPIFme7sN7eIoiui5TrbwqiC/uRoeWcbauIVziR2PK',

  cloudConfig() {
    const u = new URLSearchParams(location.search);
    const idFromUrl = u.get('b');
    const keyFromUrl = u.get('k');
    if (idFromUrl && keyFromUrl) return { id: idFromUrl, key: keyFromUrl };
    return {
      id: localStorage.getItem(this.KEY_BIN_ID) || this.DEFAULT_BIN_ID,
      key: localStorage.getItem(this.KEY_BIN_KEY) || this.DEFAULT_MASTER_KEY
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

  _normalizeRecord(record) {
    if (Array.isArray(record)) {
      return { clients: record, content: this._defaultContent() };
    }
    if (typeof record === 'object' && record !== null) {
      return {
        clients: Array.isArray(record.clients) ? record.clients : [],
        content: this._normalizeContent(record.content)
      };
    }
    return { clients: [], content: this._defaultContent() };
  },

  _normalizeContent(content) {
    if (!content || typeof content !== 'object') return this._defaultContent();
    return {
      cities: Array.isArray(content.cities) ? content.cities : [],
      menu: Array.isArray(content.menu) ? content.menu : [],
      schedule: Array.isArray(content.schedule) ? content.schedule : this._defaultSchedule()
    };
  },

  _defaultSchedule() {
    return [
      { city: "St Nazaire sur Charente", lat: 45.9333, lng: -0.9233, day: "Lundi soir", time: "18h00 - 21h00" },
      { city: "St Sulpice d'Arnoult", lat: 45.7986, lng: -0.7567, day: "Mardi soir", time: "18h00 - 21h00" },
      { city: "Champagne", lat: 45.8211, lng: -0.8019, day: "Mercredi soir", time: "18h00 - 21h00" },
      { city: "St Jean d'Angély", lat: 45.9450, lng: -0.5167, day: "Jeudi soir", time: "18h00 - 21h00" },
      { city: "St Hippolyte", lat: 45.8439, lng: -0.7589, day: "Vendredi midi", time: "11h30 - 14h00" },
      { city: "Les Nouillers", lat: 45.9622, lng: -0.6967, day: "Vendredi soir", time: "18h00 - 21h00" },
      { city: "St Agnant", lat: 45.8639, lng: -0.9472, day: "Samedi midi", time: "11h30 - 14h00" },
      { city: "Tonnay Boutonne", lat: 45.9606, lng: -0.7836, day: "Samedi soir", time: "18h00 - 21h00" },
      { city: "Bords", lat: 45.8867, lng: -0.7569, day: "Dimanche midi", time: "11h30 - 14h00" },
      { city: "Échillais", lat: 45.8889, lng: -0.9836, day: "Dimanche soir", time: "18h00 - 21h00" }
    ];
  },

  _defaultContent() {
    return {
      cities: [
        "St Nazaire sur Charente",
        "St Sulpice d'Arnoult",
        "Champagne",
        "St Jean d'Angély",
        "St Hippolyte",
        "Les Nouillers",
        "St Agnant",
        "Tonnay Boutonne",
        "Bords",
        "Échillais"
      ],
      menu: [
        {
          title: "Shawarma", subtitle: "",
          items: [
            { name: "O' Class", price: "9,50 €", desc: "Salade, tomates, oignons, sauce blanche maison" },
            { name: "O' Cheese", price: "10,50 €", desc: "Cheddar fondu, salade, tomates, oignons" },
            { name: "O' Bec", price: "11,00 €", desc: "Bacon, cheddar, salade, tomates, oignons" },
            { name: "O' Choz", price: "11,50 €", desc: "Chèvre, miel, noix, salade, roquette" },
            { name: "O' Lards", price: "11,00 €", desc: "Lardons fumés, cheddar, salade, oignons confits" },
            { name: "O' Steph", price: "12,50 €", desc: "Galette de pomme de terre, poêlée de légumes (à l'assiette)" }
          ]
        },
        {
          title: "Gyros", subtitle: "",
          items: [
            { name: "O' Gyros Class", price: "9,50 €", desc: "Salade, tomates, oignons, sauce blanche maison" },
            { name: "O' Gyros Cheese", price: "10,50 €", desc: "Cheddar fondu, salade, tomates, oignons" },
            { name: "O' Gyros Bec", price: "11,00 €", desc: "Bacon, cheddar, salade, tomates, oignons" }
          ]
        }
      ],
      schedule: this._defaultSchedule()
    };
  },

  async _cloudFetchRaw() {
    const cfg = this.cloudConfig();
    if (!cfg.id || !cfg.key) throw new Error('NOT_CONFIGURED');
    const r = await fetch(`https://api.jsonbin.io/v3/b/${cfg.id}/latest`, {
      headers: { 'X-Master-Key': cfg.key }
    });
    if (!r.ok) throw new Error('HTTP_' + r.status);
    const j = await r.json();
    return this._normalizeRecord(j.record);
  },

  async _cloudPushRaw(record) {
    const cfg = this.cloudConfig();
    if (!cfg.id || !cfg.key) throw new Error('NOT_CONFIGURED');
    const r = await fetch(`https://api.jsonbin.io/v3/b/${cfg.id}`, {
      method: 'PUT',
      headers: { 'X-Master-Key': cfg.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!r.ok) throw new Error('HTTP_' + r.status);
    return true;
  },

  async cloudFetch() {
    const rec = await this._cloudFetchRaw();
    return rec.clients;
  },

  async cloudPush(arr) {
    let rec;
    try { rec = await this._cloudFetchRaw(); }
    catch (e) { rec = { clients: [], content: this._defaultContent() }; }
    rec.clients = Array.isArray(arr) ? arr : [];
    return await this._cloudPushRaw(rec);
  },

  async cloudAppend(client) {
    const rec = await this._cloudFetchRaw();
    rec.clients.push(client);
    await this._cloudPushRaw(rec);
    return rec.clients;
  },

  async syncFromCloud() {
    const rec = await this._cloudFetchRaw();
    this.saveClients(rec.clients);
    localStorage.setItem('osteph_last_sync', new Date().toISOString());
    return rec.clients.length;
  },

  getLastSync() {
    return localStorage.getItem('osteph_last_sync') || null;
  },

  async fetchContent(forceRefresh = false) {
    if (!forceRefresh) {
      try {
        const cachedAt = parseInt(localStorage.getItem(this.KEY_CONTENT_CACHED_AT) || '0', 10);
        if (Date.now() - cachedAt < this.CONTENT_CACHE_MS) {
          const cached = localStorage.getItem(this.KEY_CONTENT_CACHE);
          if (cached) return this._normalizeContent(JSON.parse(cached));
        }
      } catch (e) {}
    }
    try {
      const rec = await this._cloudFetchRaw();
      localStorage.setItem(this.KEY_CONTENT_CACHE, JSON.stringify(rec.content));
      localStorage.setItem(this.KEY_CONTENT_CACHED_AT, String(Date.now()));
      return rec.content;
    } catch (err) {
      return this._defaultContent();
    }
  },

  async pushContent(content) {
    let rec;
    try { rec = await this._cloudFetchRaw(); }
    catch (e) { rec = { clients: [], content: this._defaultContent() }; }
    rec.content = this._normalizeContent(content);
    await this._cloudPushRaw(rec);
    localStorage.removeItem(this.KEY_CONTENT_CACHED_AT);
    localStorage.setItem(this.KEY_CONTENT_CACHE, JSON.stringify(rec.content));
    return true;
  },

  loadClients() {
    try { return JSON.parse(localStorage.getItem(this.KEY_CLIENTS) || '[]'); }
    catch (e) { return []; }
  },
  saveClients(arr) { localStorage.setItem(this.KEY_CLIENTS, JSON.stringify(arr)); },
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
  document.querySelectorAll('.theme-switcher button').forEach(btn => {
    btn.addEventListener('click', () => OSTEPH.applyTheme(btn.dataset.theme));
  });
  OSTEPH.initTheme();
});
