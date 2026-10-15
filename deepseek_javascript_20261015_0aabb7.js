// 已幫你填好 API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbz2akdx2j-ffagnezt87cjwXq_sr3_9ZJLNcAZCzAgUQpj5UeUKkDZPlpdlKLgtYc_G/exec';

let selectedSlot = null;

// 載入時段
async function loadSlots() {
  const slotsDiv = document.getElementById('slots');
  try {
    const res = await fetch(`${API_URL}?action=getSlots`);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    slotsDiv.innerHTML = '';
    data.slots.forEach(slot => {
      const div = document.createElement('div');
      const isFull = slot.remaining <= 0;
      div.className = 'slot' + (isFull ? ' full' : '');
      div.dataset.id = slot.id;
      div.innerHTML = `
        <span class="name">${slot.name}</span>
        <span class="remain">${isFull ? '已額滿' : `剩 ${slot.remaining} 位`}</span>
      `;

      if (!isFull) {
        div.addEventListener('click', () => {
          document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
          div.classList.add('selected');
          selectedSlot = slot.id;
        });
      }

      slotsDiv.appendChild(div);
    });
  } catch (err) {
    slotsDiv.innerHTML = `<p class="message error">載入時段失敗：${err.message}</p>`;
  }
}

// 送出報名
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const msg = document.getElementById('message');
  const btn = document.getElementById('submitBtn');

  if (!selectedSlot) {
    msg.className = 'message error';
    msg.textContent = '請選擇一個時段';
    return;
  }

  const payload = {
    action: 'signup',
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    slotId: selectedSlot
  };

  btn.disabled = true;
  btn.textContent = '送出中…';
  msg.textContent = '';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      msg.className = 'message success';
      msg.textContent = '✅ 報名成功！我們會盡快聯絡你。';
      document.getElementById('signupForm').reset();
      selectedSlot = null;
      loadSlots();
    } else {
      throw new Error(data.error || '報名失敗');
    }
  } catch (err) {
    msg.className = 'message error';
    msg.textContent = '❌ ' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = '送出報名';
  }
});

loadSlots();