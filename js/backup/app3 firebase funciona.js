// ===================================================
// FIREBASE — SDK Moderno v10
// ===================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4vg7GpJ-r1oKqQmk2Q2u__gVA0K2GqnU",
  authDomain: "prueba-server-e7c17.firebaseapp.com",
  projectId: "prueba-server-e7c17",
  storageBucket: "prueba-server-e7c17.firebasestorage.app",
  messagingSenderId: "1016897676229",
  appId: "1:1016897676229:web:5c55efdd01b9714289a1ac",
  measurementId: "G-X62K5LHHFD"
};

const app        = initializeApp(firebaseConfig);
const db         = getFirestore(app);
const analytics  = getAnalytics(app);

console.log("Firebase conectado");

// ===================================================
// NOTIFICACIONES
// ===================================================
function showNotification(type, message) {
  const notification = document.getElementById('notification');
  const textEl = notification.querySelector('.notification-text');
  notification.className = `notification ${type}`;
  textEl.textContent = message;
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 4000);
}

// ===================================================
// NAVEGACIÓN
// ===================================================
function openSection(section) {
  document.getElementById('landing').style.opacity = '0';
  setTimeout(() => {
    document.getElementById('landing').classList.add('hidden');
    document.getElementById(section + '-section').classList.remove('hidden');
    window.scrollTo(0, 0);
  }, 400);
}

function goHome() {
  document.getElementById('barber-section').classList.add('hidden');
  document.getElementById('movil-section').classList.add('hidden');
  const landing = document.getElementById('landing');
  landing.classList.remove('hidden');
  landing.style.opacity = '0';
  setTimeout(() => { landing.style.opacity = '1'; }, 10);
}

// ===================================================
// TABS BARBERSHOP
// ===================================================
function showTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
}

// ===================================================
// RESERVAR CITA → GUARDA EN FIRESTORE
// ===================================================
let isSubmitting = false;  // ✅ declarada aquí, antes de la función

async function reservarCita() {
  if (isSubmitting) return;
  isSubmitting = true;

  const btn = document.getElementById('btn-reservar-cita');
  if (btn) { btn.disabled = true; btn.textContent = 'Procesando...'; }

  const nombre   = document.getElementById('f-nombre').value.trim();
  const tel      = document.getElementById('f-tel').value.trim();
  const fecha    = document.getElementById('f-fecha').value;
  const hora     = document.getElementById('f-hora').value;
  const servicio = document.getElementById('f-servicio').value;
  const nota     = document.getElementById('f-nota').value.trim();

  if (!nombre || !tel || !fecha || !hora || !servicio) {
    showNotification('error', 'Por favor completa todos los campos obligatorios.');
    isSubmitting = false;
    if (btn) { btn.disabled = false; btn.textContent = 'Reservar Cita'; }
    return;
  }

  const telefonoRegex = /^\+1(829|809|849)\d{7}$/;
  if (!telefonoRegex.test(tel.replace(/\s|-/g, ''))) {
    showNotification('error', 'Teléfono inválido. Usa formato: +1829 XXX XXXX');
    isSubmitting = false;
    if (btn) { btn.disabled = false; btn.textContent = 'Reservar Cita'; }
    return;
  }

  try {
    // ✅ Sintaxis moderna v10 — addDoc + serverTimestamp importados arriba
    const docRef = await addDoc(collection(db, "citas"), {
      nombre:    nombre,
      telefono:  tel,
      fecha:     fecha,
      hora:      hora,
      servicio:  servicio,
      nota:      nota,
      timestamp: serverTimestamp(),
      estado:    "pendiente"
    });

    console.log("✅ Cita guardada con ID:", docRef.id);
    showNotification('success', '¡Cita reservada exitosamente! Te confirmamos por WhatsApp.');

    ['f-nombre','f-tel','f-fecha','f-hora','f-servicio','f-nota']
      .forEach(id => document.getElementById(id).value = '');

  } catch (error) {
    console.error("❌ Error Firestore:", error);
    if (error.code === 'permission-denied') {
      showNotification('error', 'Sin permisos. Revisa las reglas de Firestore.');
    } else {
      showNotification('error', 'Error al guardar la cita. Inténtalo de nuevo.');
    }
  } finally {
    isSubmitting = false;
    if (btn) { btn.disabled = false; btn.textContent = 'Reservar Cita'; }
  }
}

// ===================================================
// CATÁLOGO DE TELÉFONOS
// ===================================================
let phones = [];
let currentBrand = 'all';

async function loadPhones() {
  try {
    const response = await fetch('./data/phones.json');
    phones = await response.json();
    renderPhones(phones);
  } catch (error) {
    console.error('Error cargando phones.json:', error);
  }
}

function renderPhones(list) {
  const grid = document.getElementById('phones-grid');
  if (!grid) return;
  if (list.length === 0) {
    grid.innerHTML = '<p style="color:#555;grid-column:1/-1;text-align:center;padding:3rem">No se encontraron equipos.</p>';
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="phone-card" onclick="openPhone(${p.id})" data-brand="${p.brand}">
      <div class="phone-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <div class="phone-brand-tag">${p.brand.toUpperCase()}</div>
      </div>
      <div class="phone-info">
        <div class="phone-name">${p.name}</div>
        <div class="phone-year">${p.year}</div>
        <div class="phone-specs-preview">
          ${Object.entries(p.specs).slice(0,3).map(([k,v]) => `<span class="spec-chip">${v}</span>`).join('')}
        </div>
        <div class="phone-cta">
          <span class="phone-price">Consultar</span>
          <span class="phone-buy-soon">📲 Disponible</span>
        </div>
      </div>
    </div>
  `).join('');
}

function filterBrand(brand, btn) {
  currentBrand = brand;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterPhones();
}

function filterPhones() {
  const q = (document.getElementById('search-phone')?.value || '').toLowerCase();
  const filtered = phones.filter(p => {
    const matchBrand = currentBrand === 'all' || p.brand === currentBrand;
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || String(p.year).includes(q);
    return matchBrand && matchQ;
  });
  renderPhones(filtered);
}

function openPhone(id) {
  const p = phones.find(x => x.id === id);
  if (!p) return;
  const modal = document.getElementById('phone-modal');
  const box   = document.getElementById('modal-box');
  const waMsg = `Hola 2BLE M Movil! Me interesa el ${p.name} (${p.year}). ¿Pueden darme más información y precio?`;
  box.innerHTML = `
    <button onclick="closeModal()" style="position:absolute;top:1rem;right:1rem;background:#1a1a35;border:1px solid #333;color:#aaa;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1.1rem;">✕</button>
    <img src="${p.img}" alt="${p.name}" style="width:100%;height:220px;object-fit:cover;border-radius:12px;margin-bottom:1.5rem;">
    <div style="color:var(--movil-cyan);font-size:0.8rem;letter-spacing:3px;text-transform:uppercase;margin-bottom:0.4rem;">${p.brand.toUpperCase()} · ${p.year}</div>
    <h2 style="color:white;font-family:'Oswald';font-size:1.8rem;margin-bottom:1.2rem;">${p.name}</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;margin-bottom:1.5rem;">
      ${Object.entries(p.specs).map(([k,v]) => `
        <div style="background:#0d0d20;border:1px solid #1a1a35;border-radius:8px;padding:0.8rem;">
          <div style="color:#555;font-size:0.78rem;text-transform:uppercase;letter-spacing:1px;">${k}</div>
          <div style="color:white;font-weight:600;margin-top:0.2rem;">${v}</div>
        </div>
      `).join('')}
    </div>
    <a href="https://wa.me/18292894683?text=${encodeURIComponent(waMsg)}" target="_blank" style="display:block;width:100%;padding:0.9rem;background:var(--movil-blue);color:white;text-align:center;border-radius:8px;font-family:'Oswald';font-size:1rem;letter-spacing:1px;text-transform:uppercase;">📲 Consultar por WhatsApp</a>
  `;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('phone-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ===================================================
// EVENTOS
// ===================================================
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

window.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('f-fecha');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
  loadPhones();
});

// ===================================================
// EXPONER AL HTML (necesario con type="module")
// ===================================================
window.reservarCita = reservarCita;
window.openSection  = openSection;
window.goHome       = goHome;
window.showTab      = showTab;
window.filterBrand  = filterBrand;
window.filterPhones = filterPhones;
window.openPhone    = openPhone;
window.closeModal   = closeModal;
