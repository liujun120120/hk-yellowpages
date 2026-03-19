// ── Airtable 設定 ──
const AIRTABLE_TOKEN = 'patFIhNaXmV8sQAep.0c5cd8ebd2d215b51b4e5b89595c6e9ece51101176dad89104c9e54d29c93ee4';
const BASE_ID = 'app38apVP58gOc2Gz';
const TABLE_ID = 'tblK3Zp28jh3uoSwt';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

// ── 狀態 ──
let allRecords = [];
let currentCategory = 'all';
let currentSearch = '';

// ── 分類 emoji 對應 ──
const catEmoji = {
  '銀行': '🏦', '醫院': '🏥', '餐廳': '🍜', '地產': '🏠',
  '法律': '⚖️', '政府服務': '🏛️', '教育': '🎓', '超市': '🛒',
  '診所': '💊', '交通': '🚇', '美容': '✂️', '維修': '🔧'
};

// ── 載入數據 ──
async function loadBusinesses() {
  try {
    const res = await fetch(`${API_URL}?view=Grid%20view`, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` }
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    allRecords = data.records;
    renderList(allRecords);
  } catch (e) {
    document.getElementById('businessList').innerHTML = `
      <div class="empty-state">
        <div class="e-icon">⚠️</div>
        <p>載入失敗，請稍後再試</p>
      </div>`;
  }
}

// ── 渲染列表 ──
function renderList(records) {
  const container = document.getElementById('businessList');
  const count = document.getElementById('listCount');

  if (!records.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="e-icon">🔍</div>
        <p>找不到相關商家</p>
      </div>`;
    if (count) count.textContent = '';
    return;
  }

  if (count) count.textContent = `共 ${records.length} 間`;

  container.innerHTML = records.map(r => {
    const f = r.fields;
    const name = f.name || f.Name || '未命名';
    const cat = f.category || f.Category || '';
    const district = f.district || f.District || '';
    const phone = f.phone || f.Phone || '';
    const desc = f.description || f.Description || '';
    const rating = f.rating || f.Rating || '';
    const emoji = catEmoji[cat] || '📍';
    const stars = rating ? '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating)) : '';

    return `
      <a class="biz-card" href="business.html?id=${r.id}">
        <div class="biz-top">
          <div class="biz-name">${emoji} ${name}</div>
          ${rating ? `<div class="biz-rating">★ ${parseFloat(rating).toFixed(1)}</div>` : ''}
        </div>
        <div class="biz-meta">
          ${cat ? `<span class="biz-tag biz-cat">${cat}</span>` : ''}
          ${district ? `<span class="biz-tag biz-district">${district}</span>` : ''}
        </div>
        ${desc ? `<div class="biz-desc">${desc.substring(0, 60)}${desc.length > 60 ? '…' : ''}</div>` : ''}
        <div class="biz-actions">
          ${phone ? `<a class="biz-btn biz-btn-phone" href="tel:${phone}" onclick="event.stopPropagation()">📞 ${phone}</a>` : ''}
          <span class="biz-btn biz-btn-detail">查看詳情 ›</span>
        </div>
      </a>`;
  }).join('');
}

// ── 分類篩選 ──
function filterCategory(cat, btn) {
  currentCategory = cat;
  currentSearch = '';
  const searchEl = document.getElementById('searchInput');
  if (searchEl) searchEl.value = '';

  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const titleEl = document.getElementById('listTitle');
  if (titleEl) titleEl.textContent = cat === 'all' ? '推薦商家' : cat;

  const filtered = cat === 'all' ? allRecords : allRecords.filter(r => {
    const c = r.fields.category || r.fields.Category || '';
    return c === cat;
  });
  renderList(filtered);
}

// ── 搜尋 ──
function handleSearch(val) {
  currentSearch = val.trim().toLowerCase();
  const titleEl = document.getElementById('listTitle');

  if (!currentSearch) {
    if (titleEl) titleEl.textContent = '推薦商家';
    renderList(allRecords);
    return;
  }

  if (titleEl) titleEl.textContent = `搜尋「${val}」`;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));

  const filtered = allRecords.filter(r => {
    const f = r.fields;
    const searchStr = [
      f.name, f.Name, f.category, f.Category,
      f.district, f.District, f.description, f.Description,
      f.address, f.Address, f.tags, f.Tags
    ].filter(Boolean).join(' ').toLowerCase();
    return searchStr.includes(currentSearch);
  });
  renderList(filtered);
}

// ── 啟動 ──
if (document.getElementById('businessList')) {
  loadBusinesses();
}
