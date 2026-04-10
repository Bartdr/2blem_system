// ===== FIREBASE CONFIG =====
console.log("Firebase disponible:", typeof firebase);

const firebaseConfig = {
  apiKey: "AIzaSyA6msMzHmzpTzZRzKYN5qp33C9J-BpYK6I",
  authDomain: "blem-barbershop.firebaseapp.com",
  projectId: "blem-barbershop",
  storageBucket: "blem-barbershop.firebasestorage.app",
  messagingSenderId: "112478633849",
  appId: "1:112478633849:web:9fcaf50f235166f0c079a8",
  measurementId: "G-NZKT8G7GJE"
};

let db;
let isSubmitting = false; // Variable para prevenir envíos múltiples
try {
  const app = firebase.initializeApp(firebaseConfig);
  const analytics = firebase.analytics();
  db = firebase.firestore();

  console.log("🔥 Firebase conectado correctamente");
} catch (error) {
  console.error("❌ Error al inicializar Firebase:", error);
  console.log("⚠️ Continuando sin Firebase...");
}

// ===== NOTIFICATIONS =====
function showNotification(type, message) {
  const notification = document.getElementById('notification');
  const textEl = notification.querySelector('.notification-text');
  
  notification.className = `notification ${type}`;
  textEl.textContent = message;
  
  notification.classList.add('show');
  
  // Auto-hide after 4 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 4000);
}
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

// ===== BARBER TABS =====
function showTab(tab) {
  console.log("🔄 Mostrando tab:", tab);
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
}

// ===== CITA WHATSAPP =====
async function reservarCita() {
  console.log("🚀 Función reservarCita ejecutada");

  // Prevenir envíos múltiples
  if (isSubmitting) {
    console.log("⚠️ Ya se está procesando una cita, ignorando...");
    return;
  }
  isSubmitting = true;

  // Deshabilitar botón
  const btn = document.getElementById('btn-reservar-cita');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Procesando...';
  }

  const nombre = document.getElementById('f-nombre').value.trim();
  const tel = document.getElementById('f-tel').value.trim();
  const fecha = document.getElementById('f-fecha').value;
  const hora = document.getElementById('f-hora').value;
  const servicio = document.getElementById('f-servicio').value;
  const nota = document.getElementById('f-nota').value.trim();

  if (!nombre || !tel || !fecha || !hora || !servicio) {
    showNotification('error', 'Por favor completa todos los campos obligatorios.');
    // Rehabilitar botón si falla validación
    isSubmitting = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Reservar Cita';
    }
    return;
  }

  // Validar teléfono dominicano
  const telefonoRegex = /^\+1(829|809|849)\d{7}$/;
  if (!telefonoRegex.test(tel.replace(/\s|-/g, ''))) {
    showNotification('error', 'Teléfono inválido. Debe ser un número dominicano válido:\n+1829 XXX XXXX\n+1809 XXX XXXX\n+1849 XXX XXXX');
    // Rehabilitar botón si falla validación
    isSubmitting = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Reservar Cita';
    }
    return;
  }

  try {
    if (!db) {
      console.log("⚠️ Firestore no disponible...");
      showNotification('error', 'Error de conexión con la base de datos. Inténtalo de nuevo.');
      // Rehabilitar botón
      isSubmitting = false;
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Reservar Cita';
      }
      return;
    }
    // Guardar en Firestore
    const docRef = await db.collection("citas").add({
      nombre: nombre,
      telefono: tel,
      fecha: fecha,
      hora: hora,
      servicio: servicio,
      nota: nota,
      timestamp: new Date()
    });
    console.log("✅ Cita guardada en Firestore con ID:", docRef.id);
    
    // Mostrar mensaje de éxito
    showNotification('success', '¡Cita reservada exitosamente!');
    
    // Limpiar formulario
    document.getElementById('f-nombre').value = '';
    document.getElementById('f-tel').value = '';
    document.getElementById('f-fecha').value = '';
    document.getElementById('f-hora').value = '';
    document.getElementById('f-servicio').value = '';
    document.getElementById('f-nota').value = '';
    
    // Rehabilitar botón
    isSubmitting = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Reservar Cita';
    }
    
  } catch (error) {
    console.error("❌ Error al guardar en Firestore:", error);
    showNotification('error', 'Error al guardar la cita. Inténtalo de nuevo.');
    // Rehabilitar botón en caso de error
    isSubmitting = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Reservar Cita';
    }
    return;
  }
}

// ===== PHONE DATA =====
let phones = [];

async function loadPhones() {
  try {
    const response = await fetch('./data/phones.json');
    phones = await response.json();
    renderPhones(phones);
  } catch (error) {
    console.error('Error:', error);
  }
}

window.addEventListener('DOMContentLoaded', loadPhones);

console.log("📄 app.js cargado completamente");
// const phones = [
//   // Samsung
//   { id: 1, brand: 'samsung', name: 'Samsung Galaxy A04e', year: 2022, img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80', specs: { Pantalla: '6.5" HD+', RAM: '3GB', Almacenamiento: '64GB', Cámara: '13MP', Batería: '5000mAh', SO: 'Android 12' }, price: 'Consultar' },
//   { id: 2, brand: 'samsung', name: 'Samsung Galaxy A54', year: 2023, img: 'https://images.unsplash.com/photo-1672855696432-c0c2b9da8a0c?w=400&q=80', specs: { Pantalla: '6.4" Super AMOLED', RAM: '8GB', Almacenamiento: '128GB', Cámara: '50MP OIS', Batería: '5000mAh', SO: 'Android 13' }, price: 'Consultar' },
//   { id: 3, brand: 'samsung', name: 'Samsung Galaxy A32', year: 2021, img: 'https://images.unsplash.com/photo-1617083934555-ac9d0f5e5b4f?w=400&q=80', specs: { Pantalla: '6.4" Super AMOLED', RAM: '4/6GB', Almacenamiento: '128GB', Cámara: '64MP', Batería: '5000mAh', SO: 'Android 11' }, price: 'Consultar' },
//   { id: 4, brand: 'samsung', name: 'Samsung Galaxy A12', year: 2021, img: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400&q=80', specs: { Pantalla: '6.5" PLS LCD', RAM: '4GB', Almacenamiento: '128GB', Cámara: '48MP', Batería: '5000mAh', SO: 'Android 10' }, price: 'Consultar' },
//   { id: 5, brand: 'samsung', name: 'Samsung Galaxy S22', year: 2022, img: 'https://images.unsplash.com/photo-1644501616227-d5dd0ad99f81?w=400&q=80', specs: { Pantalla: '6.1" AMOLED 120Hz', RAM: '8GB', Almacenamiento: '256GB', Cámara: '50MP Triple', Batería: '3700mAh', SO: 'Android 12' }, price: 'Consultar' },

//   // Xiaomi / Redmi
//   { id: 6, brand: 'xiaomi', name: 'Xiaomi Redmi Note 11', year: 2022, img: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&q=80', specs: { Pantalla: '6.43" AMOLED 90Hz', RAM: '4/6GB', Almacenamiento: '128GB', Cámara: '50MP', Batería: '5000mAh', SO: 'MIUI 13' }, price: 'Consultar' },
//   { id: 7, brand: 'xiaomi', name: 'Xiaomi Redmi 10C', year: 2022, img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80', specs: { Pantalla: '6.71" HD+', RAM: '3/4GB', Almacenamiento: '128GB', Cámara: '50MP', Batería: '5000mAh', SO: 'MIUI 12.5' }, price: 'Consultar' },
//   { id: 8, brand: 'xiaomi', name: 'Xiaomi Poco M4 Pro', year: 2022, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', specs: { Pantalla: '6.43" AMOLED 90Hz', RAM: '6/8GB', Almacenamiento: '128GB', Cámara: '64MP', Batería: '5000mAh', SO: 'MIUI 13' }, price: 'Consultar' },

//   // Tecno
//   { id: 9, brand: 'tecno', name: 'Tecno Spark 10', year: 2023, img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80', specs: { Pantalla: '6.6" IPS LCD', RAM: '8GB', Almacenamiento: '128GB', Cámara: '50MP AI', Batería: '5000mAh', SO: 'Android 13' }, price: 'Consultar' },
//   { id: 10, brand: 'tecno', name: 'Tecno Spark 8C', year: 2022, img: 'https://images.unsplash.com/photo-1592950630581-03cb41342cc5?w=400&q=80', specs: { Pantalla: '6.6" HD+', RAM: '4GB', Almacenamiento: '64GB', Cámara: '13MP', Batería: '5000mAh', SO: 'Android 11 Go' }, price: 'Consultar' },
//   { id: 11, brand: 'tecno', name: 'Tecno Camon 19', year: 2022, img: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400&q=80', specs: { Pantalla: '6.8" AMOLED', RAM: '8GB', Almacenamiento: '128GB', Cámara: '64MP Triple', Batería: '5000mAh', SO: 'Android 12' }, price: 'Consultar' },

//   // ZTE
//   { id: 12, brand: 'zte', name: 'ZTE Blade A54', year: 2023, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80', specs: { Pantalla: '6.6" HD+', RAM: '4GB', Almacenamiento: '128GB', Cámara: '50MP', Batería: '5000mAh', SO: 'Android 13 Go' }, price: 'Consultar' },
//   { id: 13, brand: 'zte', name: 'ZTE Blade V40 Vita', year: 2022, img: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80', specs: { Pantalla: '6.75" HD+', RAM: '4GB', Almacenamiento: '128GB', Cámara: '50MP', Batería: '5000mAh', SO: 'Android 11' }, price: 'Consultar' },

//   // Oukitel
//   { id: 14, brand: 'oukitel', name: 'Oukitel WP23', year: 2023, img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80', specs: { Pantalla: '6.52" HD+', RAM: '8GB', Almacenamiento: '128GB', Cámara: '20MP Triple', Batería: '10600mAh', SO: 'Android 12', Protección: 'IP68/IP69K' }, price: 'Consultar' },
//   { id: 15, brand: 'oukitel', name: 'Oukitel WP33', year: 2023, img: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&q=80', specs: { Pantalla: '6.6" FHD+', RAM: '12GB', Almacenamiento: '256GB', Cámara: '64MP', Batería: '11000mAh', SO: 'Android 13', Protección: 'IP68/IP69K' }, price: 'Consultar' },

//   // Otros
//   { id: 16, brand: 'otros', name: 'iPhone 12', year: 2020, img: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400&q=80', specs: { Pantalla: '6.1" Super Retina XDR', RAM: '4GB', Almacenamiento: '64/128GB', Cámara: '12MP Dual', Batería: '2815mAh', SO: 'iOS 14' }, price: 'Consultar' },
//   { id: 17, brand: 'otros', name: 'iPhone 13', year: 2021, img: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&q=80', specs: { Pantalla: '6.1" Super Retina XDR', RAM: '4GB', Almacenamiento: '128/256GB', Cámara: '12MP Dual con Cinematic Mode', Batería: '3227mAh', SO: 'iOS 15' }, price: 'Consultar' },
//   { id: 18, brand: 'otros', name: 'Motorola Moto G62', year: 2022, img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80', specs: { Pantalla: '6.5" IPS LCD 120Hz', RAM: '6GB', Almacenamiento: '128GB', Cámara: '50MP Triple', Batería: '5000mAh', SO: 'Android 12' }, price: 'Consultar' },
//   { id: 19, brand: 'otros', name: 'Infinix Note 12', year: 2022, img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=80', specs: { Pantalla: '6.7" AMOLED 120Hz', RAM: '6/8GB', Almacenamiento: '128GB', Cámara: '50MP Triple', Batería: '5000mAh', SO: 'Android 12' }, price: 'Consultar' },
//   { id: 20, brand: 'otros', name: 'Realme 10', year: 2022, img: 'https://images.unsplash.com/photo-1620287341056-49a2f1ab2fdc?w=400&q=80', specs: { Pantalla: '6.4" AMOLED 90Hz', RAM: '8GB', Almacenamiento: '128GB', Cámara: '50MP', Batería: '5000mAh', SO: 'Android 13' }, price: 'Consultar' },
// ];

let currentBrand = 'all';

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
  const box = document.getElementById('modal-box');
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
    <div style="background:#0a0a18;border:1px solid var(--movil-cyan);border-radius:12px;padding:1.2rem;text-align:center;margin-bottom:1rem;">
      <div style="color:#555;font-size:0.85rem;margin-bottom:0.3rem;">Compra en línea</div>
      <div style="color:#333;font-size:1.1rem;font-weight:700;letter-spacing:2px;">🔒 DISPONIBLE PRONTO</div>
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

// Close modal with Escape
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Set min date for cita form
window.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('f-fecha');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
  renderPhones(phones);
});

console.log("📄 app.js cargado completamente");
