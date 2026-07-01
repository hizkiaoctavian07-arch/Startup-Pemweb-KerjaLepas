// script.js - Logika State Engine & Integrasi REST API MongoDB Atlas


const API_BASE_URL = "https://startup-pemweb-kerjalepas-production.up.railway.app/api";
var transactions = [];
var mobileMenuBtn, mobileMenu;

// Ambil token JWT dari localStorage
function dapatkanToken() {
  return localStorage.getItem("token");
}

// App Initializer Lifecycle
window.onload = function () {
  // Dapatkan nama file atau path halaman saat ini
  const currentPath = window.location.pathname;
  const role = localStorage.getItem("role");

if (role !== "admin") {

    const menuDesktop = document.getElementById("nav-btn-simulasi");
    const menuMobile = document.getElementById("mobile-btn-simulasi");

    if (menuDesktop) menuDesktop.style.display = "none";
    if (menuMobile) menuMobile.style.display = "none";
}

  // Cek Kredensial Akses Sesi Halaman (Proteksi Sesi) - JANGAN jalankan jika di login.html
if (!currentPath.includes("login.html")) {

    if (!dapatkanToken()) {
        alert("Anda tidak memiliki akses! Silakan Login terlebih dahulu.");
        window.location.href = "login.html";
        return;
    }
// Hanya admin yang mengambil data transaksi
    if (dapatkanRole() === "admin") {
        muatDataTransaksiDariServer();
    }

}
  // Elemen di bawah ini hanya diinisialisasi jika tersedia di halaman (mencegah error di login.html)
  mobileMenuBtn = document.getElementById("mobile-menu-btn");
  mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  }

  // Aktifkan tampilan dashboard jika elemen pembungkus SPA-nya tersedia
  if (document.getElementById("view-dashboard")) {
    switchView("dashboard");
  }

  // Render Realtime clock jika elemen teksnya tersedia di halaman tersebut
  const timeDisplay = document.getElementById("current-time-display");
  if (timeDisplay) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const today = new Date();
    timeDisplay.innerHTML = `<i class="fa-regular fa-clock text-slate-500"></i> Server Cloud: ${today.toLocaleDateString("id-ID", options)}`;
  }
};

// ==========================================
// INTEGRASI API AUTHENTICATION (LOGIN & REGIS)
// ==========================================

// Listener Form saat DOM Siap
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginServer);
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegisterServer);
  }
});

// FUNGSI UTAMA LOGIN (POST)
function handleLoginServer(e) {
  e.preventDefault(); // Menghentikan browser agar tidak reload otomatis

  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");

  if (!emailInput || !passwordInput) return;

  const dataLogin = {
    email: emailInput.value.trim(),
    password: passwordInput.value,
  };

  fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataLogin),
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal masuk ke sistem.");
      }
      return data;
    })
.then((data) => {

    if (data.token) {

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);

        alert(`Login Berhasil! Selamat datang, ${data.user.nama}.`);

        window.location.href = "pemweb project1.html";

    } else {

        alert("Gagal mendapatkan token.");

    }

})
}

function dapatkanRole() {
    return localStorage.getItem("role");
}

// FUNGSI UTAMA REGISTER (POST)
function handleRegisterServer(e) {
  e.preventDefault(); // Menghentikan browser agar tidak reload otomatis

  const nama = document.getElementById("reg-nama").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const role = document.getElementById("reg-role").value;

  const dataRegister = { nama, email, password, role };

  fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataRegister),
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal melakukan registrasi.");
      }
      return data;
    })
    .then((data) => {
      alert("Registrasi Berhasil! Silakan masuk menggunakan akun baru Anda.");
      document.getElementById("register-form").reset();
      if (typeof toggleFormAuth === "function") {
        toggleFormAuth("login"); // Otomatis pindah panel ke login box
      }
    })
    .catch((err) => {
      console.error("Detail Kendala Registrasi:", err);
      alert(`Gagal Registrasi: ${err.message}`);
    });
}

// Logika Logout Manual Sesi
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  alert("Anda berhasil logout aman dari sistem.");
  window.location.href = "login.html";
}

// ==========================================
// INTEGRASI API DATA TRANSAKSI (CRUD)
// ==========================================

// AMBIL DATA (GET) DARI MONGODB ATLAS
function muatDataTransaksiDariServer() {
  fetch(`${API_BASE_URL}/transactions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${dapatkanToken()}`,
      "Content-Type": "application/json",
    },
  })
.then((res) => {

    if (res.status === 401) {
        alert("Sesi login Anda kedaluwarsa.");
        window.location.href = "login.html";
        return;
    }

    if (res.status === 403) {
        console.log("Bukan admin, transaksi tidak dimuat.");
        return [];
    }

    return res.json();
})
    .then((data) => {
      transactions = data.map((item) => ({
        id: item._id,
        clientName: item.clientName,
        serviceName: item.serviceName,
        freelancer: item.freelancer,
        price: item.price,
        status: item.status,
      }));
      renderTransactions();
      updateStatistics();
    })
    .catch((err) => {
      console.error("Gagal mengambil data dari MongoDB Atlas:", err);
      showToast(
        "Koneksi Putus",
        "Gagal menghubungi server database backend.",
        "fa-triangle-exclamation text-rose-500",
      );
    });
}

// KIRIM DATA BARU (POST) KE MONGODB ATLAS
function submitBookingKeServer(e) {
    e.preventDefault();
    
    const dataKirim = {
        clientName: document.getElementById("client-name").value.trim(),
        serviceName: document.getElementById("modal-service-name").value,
        freelancer: document.getElementById("modal-freelancer").value,
        price: parseInt(document.getElementById("modal-service-price").value),
        notes: document.getElementById("client-notes").value.trim()
    };

fetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${dapatkanToken()}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify(dataKirim)
})
.then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    return data;
})
    .then(() => {
    closeBookingModal();
    muatDataTransaksiDariServer();
    showToast("Sukses", "Pesanan berhasil dibuat!", "fa-solid fa-check");
})
.catch(err => {
    console.error(err);
    alert(err.message);
});}

// EDIT STATUS (PUT) DI MONGODB ATLAS
function changeStatus(id, newStatus) {
  fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${dapatkanToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: newStatus }),
  })
    .then((res) => res.json())
    .then((data) => {
      const icon =
        newStatus === "Selesai"
          ? "fa-solid fa-circle-check text-emerald-400"
          : "fa-solid fa-circle-xmark text-rose-500";
      showToast(
        "Perubahan Status",
        `Status Kontrak berhasil diperbarui menjadi ${newStatus}.`,
        icon,
      );
      muatDataTransaksiDariServer();
    })
    .catch((err) => console.error("Gagal memperbarui status transaksi:", err));
}

// HAPUS DATA (DELETE) DARI MONGODB ATLAS
function deleteTransaction(id) {
  if (
    !confirm(
      "Apakah Anda yakin ingin menghapus berkas kontrak ini secara permanen dari Cloud Atlas?",
    )
  )
    return;

  fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${dapatkanToken()}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      showToast(
        "Berkas Dihapus",
        "Kontrak telah dibersihkan secara permanen dari MongoDB Cloud Atlas.",
        "fa-solid fa-trash text-slate-400",
      );
      muatDataTransaksiDariServer();
    })
    .catch((err) => console.error("Gagal menghapus transaksi:", err));
}

// ==========================================
// LOGIKA INTERMUKA & ANTRIAN UI (SPA UTILS)
// ==========================================

function switchView(viewId) {
  const views = ["dashboard", "layanan", "tim", "simulasi"];
  views.forEach((v) => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.add("hidden");
  });

  const activeEl = document.getElementById(`view-${viewId}`);
  if (activeEl) activeEl.classList.remove("hidden");

  const navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach((btn) => {
    if (btn.id === `nav-btn-${viewId}`) {
      if (btn.id === "nav-btn-simulasi") {
        btn.className =
          "nav-btn bg-gradient-to-r from-amikom-purple to-amikom-lightpurple text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-premium hover:shadow-hover-glow transform hover:-translate-y-0.5 flex items-center gap-2 ring-2 ring-amikom-gold";
      } else {
        btn.className =
          "nav-btn px-4 py-2 rounded-xl text-amikom-purple bg-purple-50 font-bold transition-all flex items-center gap-2 text-sm";
      }
    } else {
      if (btn.id === "nav-btn-simulasi") {
        btn.className =
          "nav-btn bg-gradient-to-r from-amikom-purple to-amikom-lightpurple hover:from-amikom-dark hover:to-amikom-purple text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-premium hover:shadow-hover-glow transform hover:-translate-y-0.5 flex items-center gap-2";
      } else {
        btn.className =
          "nav-btn px-4 py-2 rounded-xl text-slate-600 hover:text-amikom-purple font-semibold transition-all flex items-center gap-2 text-sm";
      }
    }
  });

  const mobBtns = document.querySelectorAll(".mobile-btn");
  mobBtns.forEach((btn) => {
    if (btn.id === `mobile-btn-${viewId}`) {
      if (btn.id === "mobile-btn-simulasi") {
        btn.className =
          "mobile-btn w-full text-left block px-4 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-amikom-purple to-amikom-lightpurple text-center shadow-lg ring-2 ring-amikom-gold";
      } else {
        btn.className =
          "mobile-btn w-full text-left block px-4 py-3 rounded-xl text-base font-bold text-amikom-purple bg-purple-50 transition-colors";
      }
    } else {
      if (btn.id === "mobile-btn-simulasi") {
        btn.className =
          "mobile-btn w-full text-left block px-4 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-amikom-purple to-amikom-lightpurple text-center shadow-lg";
      } else {
        btn.className =
          "mobile-btn w-full text-left block px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:text-amikom-purple hover:bg-purple-50 transition-colors";
      }
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleMobileMenu() {
  if (!mobileMenu || !mobileMenuBtn) return;
  mobileMenu.classList.toggle("hidden");
  const icon = mobileMenuBtn.querySelector("i");
  if (icon) {
    if (mobileMenu.classList.contains("hidden")) {
      icon.classList.replace("fa-xmark", "fa-bars");
    } else {
      icon.classList.replace("fa-bars", "fa-xmark");
    }
  }
}

function dismissBanner() {
  const banner = document.getElementById("academic-banner");
  if (banner) banner.style.display = "none";
}

function filterServices() {
  const query = document.getElementById("search-services").value.toLowerCase();
  const cards = document.getElementsByClassName("service-card");
  for (let card of cards) {
    const searchKeys = card.getAttribute("data-title");
    if (searchKeys && searchKeys.includes(query)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  }
}

function openBookingModal(serviceName, price, freelancerName) {
  document.getElementById("modal-service-name").value = serviceName;
  document.getElementById("modal-service-price").value = price;
  document.getElementById("modal-freelancer").value = freelancerName;

  document.getElementById("modal-label-service").innerText = serviceName;
  document.getElementById("modal-label-details").innerText =
    `Oleh: ${freelancerName} | Rp ${price.toLocaleString("id-ID")}`;

  const modal = document.getElementById("booking-modal");
  if (modal) modal.classList.remove("hidden");
}

// HAPUS fungsi renderTransactions yang lama (yang hanya punya status 'Proses'/'Selesai')
// DAN gunakan versi lengkap ini saja:

function renderTransactions() {
  const tbody = document.getElementById("transaction-rows");
  const placeholder = document.getElementById("no-transaction");
  if (!tbody) return;

  // 1. Bersihkan tabel agar data lama tidak terduplikasi
  tbody.innerHTML = "";

  // 2. Tampilkan placeholder jika kosong
  if (transactions.length === 0) {
    if (placeholder) placeholder.classList.remove("hidden");
    return;
  } else {
    if (placeholder) placeholder.classList.add("hidden");
  }

  // 3. Render data baru
  transactions.forEach((trx) => {
    let statusBadge = "";
    if (trx.status === "Proses") {
      statusBadge = `<span class="bg-amber-100/80 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full"><i class="fa-solid fa-arrows-spin animate-spin"></i> Proses</span>`;
    } else if (trx.status === "Selesai") {
      statusBadge = `<span class="bg-emerald-100/80 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full"><i class="fa-solid fa-check"></i> Selesai</span>`;
    } else {
      statusBadge = `<span class="bg-rose-100/80 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full"><i class="fa-solid fa-circle-minus"></i> Batal</span>`;
    }

    const shortId = trx.id ? trx.id.substring(trx.id.length - 6).toUpperCase() : "N/A";
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-100/50 transition-colors border-b";
    tr.innerHTML = `
        <td class="py-4 font-mono font-bold text-slate-500">#${shortId}</td>
        <td class="py-4 font-semibold text-slate-800">${trx.clientName}</td>
        <td class="py-4 text-slate-600">${trx.serviceName}</td>
        <td class="py-4 font-medium text-slate-700">${trx.freelancer}</td>
        <td class="py-4 font-bold text-amikom-purple">Rp ${trx.price.toLocaleString("id-ID")}</td>
        <td class="py-4">${statusBadge}</td>
        <td class="py-4 text-center">
            ${trx.status === "Proses" ? `
                <button onclick="changeStatus('${trx.id}', 'Selesai')" class="text-emerald-600 px-2"><i class="fa-solid fa-check"></i></button>
                <button onclick="changeStatus('${trx.id}', 'Batal')" class="text-rose-600 px-2"><i class="fa-solid fa-xmark"></i></button>
            ` : `<button onclick="deleteTransaction('${trx.id}')" class="text-slate-400 hover:text-rose-600 px-2"><i class="fa-solid fa-trash"></i></button>`}
        </td>
    `;
    tbody.appendChild(tr);
  });
}
function updateStatistics() {
  const totalOrders = transactions.length;
  const completedOrders = transactions.filter(
    (t) => t.status === "Selesai",
  ).length;
  const liveIncome = transactions
    .filter((t) => t.status !== "Batal")
    .reduce((total, cur) => total + cur.price, 0);

  const statLayanan = document.getElementById("stat-layanan");
  const statTransaksi = document.getElementById("stat-transaksi");
  const statSelesai = document.getElementById("stat-selesai");
  const statPendapatan = document.getElementById("stat-pendapatan");

  if (statLayanan) statLayanan.innerText = 5;
  if (statTransaksi) statTransaksi.innerText = totalOrders;
  if (statSelesai) statSelesai.innerText = completedOrders;
  if (statPendapatan)
    statPendapatan.innerText = "Rp " + liveIncome.toLocaleString("id-ID");
}

function showToast(title, message, iconClass) {
  const toast = document.getElementById("toast-notif");
  if (!toast) return;
  document.getElementById("toast-title").innerText = title;
  document.getElementById("toast-msg").innerText = message;
  document.getElementById("toast-icon-wrapper").innerHTML =
    `<i class="${iconClass}"></i>`;

  toast.classList.remove("translate-y-20", "opacity-0", "pointer-events-none");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
  }, 4000);
}

// Tambahkan fungsi ini agar tidak terjadi Error "is not defined"
function closeBookingModal() {
    const modal = document.getElementById("booking-modal");
    if (modal) {
        modal.classList.add("hidden");
    }
    
    // Pastikan ID ini sama dengan <form id="booking-form"> di HTML Anda
    const form = document.getElementById("booking-form");
    if (form) {
        form.reset();
    }
}
// Fungsi simpan ke LocalStorage
document.getElementById('form-edit-profil').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nama = document.getElementById('input-nama').value;
    const bio = document.getElementById('input-bio').value;
    
    // Simpan data
    localStorage.setItem('user_name', nama);
    localStorage.setItem('user_bio', bio);
    
    alert('Profil berhasil diperbarui!');
    switchView('home'); // Kembali ke halaman utama
});

// Fungsi memuat data saat halaman dibuka
window.addEventListener('load', () => {
    const savedNama = localStorage.getItem('user_name');
    const savedBio = localStorage.getItem('user_bio');
    
    if(savedNama) document.getElementById('input-nama').value = savedNama;
    if(savedBio) document.getElementById('input-bio').value = savedBio;
});
function bukaPanelTransaksi() {

    if (dapatkanRole() !== "admin") {

        alert("Maaf, hanya Admin yang dapat mengakses Panel Transaksi.");

        return;
    }

    switchView("simulasi");

}
