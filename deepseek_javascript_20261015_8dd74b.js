// 已幫你填好 API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbz2akdx2j-ffagnezt87cjwXq_sr3_9ZJLNcAZCzAgUQpj5UeUKkDZPlpdlKLgtYc_G/exec';

let allSignups = [];
let password = '';

document.getElementById('loginBtn').addEventListener('click', async () => {
  password = document.getElementById('password').value;
  const msg = document.getElementById('loginMsg');
  msg.textContent = '載入中…';
  msg.className = 'message';

  try {
    const res = await fetch(`${API_URL}?action=getSignups&password=${encodeURIComponent(password)}`);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    allSignups = data.signups;
    document.getElementById('loginBox').classList.add('hidden');
    document.getElementById('adminBox').classList.remove('hidden');
    renderTable(allSignups);
  } catch (err) {
    msg.className = 'message error';
    msg.textContent = '❌ ' + err.message;
  }
});

document.getElementById('search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allSignups.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.phone.includes(q) ||
    s.email.toLowerCase().includes(q)
  );
  renderTable(filtered);
});

document.getElementById('refreshBtn').addEventListener('click', async () => {
  const res = await fetch(`${API_URL}?action=getSignups&password=${encodeURIComponent(password)}`);
  const data = await res.json();
  if (!data.error) {
    allSignups = data.signups;
    renderTable(allSignups);
  }
});

document.getElementById('exportBtn').addEventListener('click', () => {
  if (allSignups.length === 0) return alert('沒有資料');

  const headers = ['報名時間', '姓名', '電話', 'Email', '時段'];
  const rows = allSignups.map(s => [
    new Date(s.time).toLocaleString('zh-TW'),
    s.name,
    s.phone,
    s.email,
    s.slotName
  ]);

  const csv = '\uFEFF' + [headers, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `游泳班報名_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
});

function renderTable(list) {
  const wrap = document.getElementById('tableWrap');

  if (list.length === 0) {
    wrap.innerHTML = '<p class="message">沒有資料</p>';
    return;
  }

  const rows = list.map(s => `
    <tr>
      <td>${new Date(s.time).toLocaleString('zh-TW')}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.phone)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.slotName)}</td>
    </tr>
  `).join('');

  wrap.innerHTML = `
    <p style="margin-top:16px;color:#666;">共 ${list.length} 筆</p>
    <table>
      <thead><tr><th>時間</th><th>姓名</th><th>電話</th><th>Email</th><th>時段</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}