// ================================================================
// JAVASCRIPT FRONTEND WEB (Koneksi ke Web App Google)
// ================================================================

// Ganti URL ini dengan URL Deployment "Web App" dari Apps Script kamu
const SCRIPT_URL = "https://alkasacraft.github.io/Apps/";

// Variable global untuk menyimpan data sementara jika dibutuhkan
let appData = {
  transaksiKeluar: [],
  transaksiMasuk: [],
  produk: [],
  bahan: []
};

/**
 * 1. MENGAMBIL DATA DARI SPREADSHEET (Otomatis dipanggil saat web di-refresh)
 */
async function loadDataFromSpreadsheet() {
  try {
    console.log("Memuat data dari Google Spreadsheet...");

    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error("Gagal mengambil data dari server");

    const data = await response.json();

    // Simpan data ke variable global
    appData.transaksiKeluar = data.transaksiKeluar || [];
    appData.transaksiMasuk = data.transaksiMasuk || [];
    appData.produk = data.produk || [];
    appData.bahan = data.bahan || [];

    console.log("Data berhasil diambil:", appData);

    // Render / Tampilkan data ke elemen HTML
    renderAllDataUI();

  } catch (error) {
    console.error("Gagal memuat data:", error);
  }
}

/**
 * 2. MENAMPILKAN DATA KE TAMPILAN WEB (RENDER UI)
 * Silakan sesuaikan ID elemen HTML (seperti "tabel-produk-body") dengan ID di HTML kamu.
 */
function renderAllDataUI() {
  // Contoh Render Tabel Produk Jadi
  const tabelProduk = document.getElementById("tabel-produk-body");
  if (tabelProduk) {
    tabelProduk.innerHTML = "";
    appData.produk.forEach(item => {
      tabelProduk.innerHTML += `
        <tr>
          <td>${item.nama}</td>
          <td>${item.stok}</td>
          <td>Rp ${Number(item.harga).toLocaleString("id-ID")}</td>
        </tr>
      `;
    });
  }

  // Contoh Render Tabel Bahan Mentah
  const tabelBahan = document.getElementById("tabel-bahan-body");
  if (tabelBahan) {
    tabelBahan.innerHTML = "";
    appData.bahan.forEach(item => {
      tabelBahan.innerHTML += `
        <tr>
          <td>${item.nama}</td>
          <td>${item.stok}</td>
          <td>${item.satuan}</td>
        </tr>
      `;
    });
  }

  // Tambahkan fungsi render tabel Transaksi Keluar/Masuk di sini jika ada...
}

/**
 * 3. MENIRIM DATA BARU KE SPREADSHEET (POST)
 */
async function sendToSpreadsheet(payload) {
  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("Data berhasil dikirim ke Spreadsheet!");

    // Setelah simpan data, ambil ulang data dari Spreadsheet agar tampilan web langsung ter-update
    await loadDataFromSpreadsheet();
    return true;

  } catch (error) {
    console.error("Gagal mengirim data:", error);
    return false;
  }
}

// ----------------------------------------------------------------
// FUNGSI KHUSUS FORM INPUT (Gunakan ini saat Form di-submit)
// ----------------------------------------------------------------

// A. Tambah Transaksi Keluar
async function addTransaksiKeluar(formData) {
  await sendToSpreadsheet({
    action: "addTransaksi",
    ...formData
  });
}

// B. Tambah Transaksi Masuk
async function addTransaksiMasuk(formData) {
  await sendToSpreadsheet({
    action: "addTransaksiMasuk",
    ...formData
  });
}

// C. Update / Tambah Stok Produk
async function updateStokProduk(nama, stok, harga) {
  await sendToSpreadsheet({
    action: "addProduk",
    nama: nama,
    stok: Number(stok),
    harga: Number(harga)
  });
}

// D. Update / Tambah Stok Bahan
async function updateStokBahan(nama, stok, satuan) {
  await sendToSpreadsheet({
    action: "addBahan",
    nama: nama,
    stok: Number(stok),
    satuan: satuan
  });
}

/**
 * 4. OTOMATIS JALANKAN SAAT WEB DIMUAT / DI-REFRESH
 */
document.addEventListener("DOMContentLoaded", () => {
  loadDataFromSpreadsheet();
});
