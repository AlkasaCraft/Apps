const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzR6XSp6RSuv0zImXJed0Sa447IUlb0Gleu42S4hkMN7_uc7PupY7iqg2caDklTwPBu/exec";

let appData = {
  databasePesanan: [],
  produk: [],
  bahan: []
};

// 1. FUNGSI UNTUK MENGAMBIL DATA
async function loadDataFromSpreadsheet() {
  try {
    console.log("Memuat data dari Google Spreadsheet...");
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error("Gagal mengambil data dari server");
    
    const data = await response.json();
    appData.databasePesanan = data.databasePesanan || [];
    appData.produk = data.produk || [];
    appData.bahan = data.bahan || [];

    renderAllUI();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

// 2. FUNGSI TAMPILAN (RENDER UI)
function renderAllUI() {
  renderTabelDatabasePesanan();
  // Tambahkan fungsi render ringkasan/profit di sini jika ada
}

function renderTabelDatabasePesanan() {
  const tbody = document.getElementById("tabel-database-pesanan-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  appData.databasePesanan.forEach((item) => {
    const row = document.createElement("tr");
    
    // Format Tanggal
    let tglText = item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID") : "-";

    row.innerHTML = `
      <td>${tglText}</td>
      <td>${item.kategori || "-"}</td>
      <td>${item.var1 || ""} ${item.var2 || ""}</td>
      <td>${item.packingVar || "-"}</td>
      <td>${item.marketplace || "-"}</td>
      <td><b>${item.detail || "-"}</b></td>
      <td>Rp ${Number(item.nominal || 0).toLocaleString("id-ID")}</td>
      <td>Rp ${Number(item.shopeePay || 0).toLocaleString("id-ID")}</td>
      <td>Rp ${Number(item.biayaCetak || 0).toLocaleString("id-ID")}</td>
      <td>Rp ${Number(item.biayaJasa || 0).toLocaleString("id-ID")}</td>
      <td>Rp ${Number(item.biayaPacking || 0).toLocaleString("id-ID")}</td>
      <td>Rp ${Number(item.biayaPromosi || 0).toLocaleString("id-ID")}</td>
    `;
    tbody.appendChild(row);
  });
}

// 3. FUNGSI KIRIM DATA (POST)
async function sendDataToSpreadsheet(payload) {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (result.status === "success") {
      alert("Data berhasil disimpan!");
      await loadDataFromSpreadsheet(); // Reload data otomatis
    } else {
      alert("Gagal menyimpan: " + result.message);
    }
  } catch (err) {
    alert("Terjadi kesalahan koneksi.");
    console.error(err);
  }
}

// Event Listener Input Form (Sesuai ID Form di HTML Kamu)
document.addEventListener("DOMContentLoaded", () => {
  loadDataFromSpreadsheet();

  // Form Transaksi Keluar
  const formKeluar = document.getElementById("form-transaksi-keluar");
  if (formKeluar) {
    formKeluar.addEventListener("submit", (e) => {
      e.preventDefault();
      const payload = {
        action: "addTransaksi",
        tanggal: document.getElementById("input-tanggal").value,
        kategori: document.getElementById("input-kategori").value,
        var1: document.getElementById("input-var1").value,
        var2: document.getElementById("input-var2").value,
        packingVar: document.getElementById("input-packing").value,
        marketplace: document.getElementById("input-marketplace").value,
        detail: document.getElementById("input-detail").value,
        biayaCetak: document.getElementById("input-biaya-cetak").value || 0,
        biayaJasa: document.getElementById("input-biaya-jasa").value || 0,
        biayaPacking: document.getElementById("input-biaya-packing").value || 0,
        biayaPromosi: document.getElementById("input-biaya-promosi").value || 0
      };
      sendDataToSpreadsheet(payload);
    });
  }

  // Form Transaksi Masuk
  const formMasuk = document.getElementById("form-transaksi-masuk");
  if (formMasuk) {
    formMasuk.addEventListener("submit", (e) => {
      e.preventDefault();
      const payload = {
        action: "addTransaksiMasuk",
        tanggal: document.getElementById("input-masuk-tanggal").value,
        detail: document.getElementById("input-masuk-detail").value,
        nominal: document.getElementById("input-masuk-nominal").value || 0,
        shopeePay: document.getElementById("input-masuk-shopeepay").value || 0
      };
      sendDataToSpreadsheet(payload);
    });
  }
});
