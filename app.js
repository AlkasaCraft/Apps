// ================================================================
// JAVASCRIPT FRONTEND WEB (Koneksi ke Web App Google - FULL UPDATED)
// ================================================================

// ⚠️ PENTING: Ganti URL ini dengan URL Web App Apps Script kamu (berakhiran /exec)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzR6XSp6RSuv0zImXJed0Sa447IUlb0Gleu42S4hkMN7_uc7PupY7iqg2caDklTwPBu/exec"; 

// Variable global untuk menyimpan data sementara dari server
let appData = {
  transaksiKeluar: [],
  transaksiMasuk: [],
  cashFlow: [],
  produk: [],
  bahan: []
};

/**
 * 1. MENGAMBIL DATA DARI SPREADSHEET
 * (Otomatis dipanggil saat web dibuka/di-refresh)
 */
async function loadDataFromSpreadsheet() {
  try {
    console.log("Memuat data dari server Google...");

    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error("Gagal mengambil data dari server");

    const data = await response.json();

    // Simpan data ke variable global
    appData.transaksiKeluar = data.transaksiKeluar || [];
    appData.transaksiMasuk = data.transaksiMasuk || [];
    appData.cashFlow = data.cashFlow || [];
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
 */
function renderAllDataUI() {
  // A. Render Tabel Produk Jadi
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

  // B. Render Tabel Bahan Mentah
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

  // C. Render Tabel Cash Flow
  renderCashFlowUI();
}

/**
 * Render khusus untuk Tabel Riwayat Cash Flow
 */
function renderCashFlowUI() {
  const tabelCashFlow = document.getElementById("tabel-cashflow-body");
  if (!tabelCashFlow) return;

  tabelCashFlow.innerHTML = "";

  if (appData.cashFlow.length === 0) {
    tabelCashFlow.innerHTML = `<tr><td colspan="5" class="text-center">Belum ada data cash flow.</td></tr>`;
    return;
  }

  appData.cashFlow.forEach(item => {
    const isMasuk = item.cashFlow && item.cashFlow.toLowerCase() === "masuk";
    const badgeClass = isMasuk ? "badge-masuk" : "badge-keluar";
    const textNominalColor = isMasuk ? "text-success" : "text-danger";

    tabelCashFlow.innerHTML += `
      <tr>
        <td>${item.tanggal || "-"}</td>
        <td>${item.keterangan || "-"}</td>
        <td><span class="badge ${badgeClass}">${item.cashFlow || "-"}</span></td>
        <td>${item.kategori || "-"}</td>
        <td class="${textNominalColor} fw-bold">Rp ${Number(item.nominal || 0).toLocaleString("id-ID")}</td>
      </tr>
    `;
  });
}

/**
 * 3. MENGIRIM DATA BARU KE SERVER GOOGLE (POST)
 */
async function sendToSpreadsheet(payload) {
  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Wajib untuk Google Apps Script
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("Data berhasil dikirim!");

    // Ambil ulang data terbaru dari server
    await loadDataFromSpreadsheet();
    return true;

  } catch (error) {
    console.error("Gagal mengirim data:", error);
    return false;
  }
}

// ----------------------------------------------------------------
// FUNGSI KHUSUS FORM INPUT (TRANSAKSI, CASH FLOW & STOK)
// ----------------------------------------------------------------

// A. Tambah Cash Flow Baru
async function addCashFlow(tanggal, keterangan, cashFlow, kategori, nominal) {
  await sendToSpreadsheet({
    action: "addCashFlow",
    tanggal: tanggal,
    keterangan: keterangan,
    cashFlow: cashFlow,
    kategori: kategori,
    nominal: Number(nominal)
  });
}

// B. Tambah Transaksi Keluar
async function addTransaksiKeluar(formData) {
  await sendToSpreadsheet({
    action: "addTransaksi",
    ...formData
  });
}

// C. Tambah Transaksi Masuk
async function addTransaksiMasuk(formData) {
  await sendToSpreadsheet({
    action: "addTransaksiMasuk",
    ...formData
  });
}

// D. Update / Tambah Stok Produk
async function updateStokProduk(nama, stok, harga) {
  await sendToSpreadsheet({
    action: "addProduk",
    nama: nama,
    stok: Number(stok),
    harga: Number(harga)
  });
}

// E. Update / Tambah Stok Bahan
async function updateStokBahan(nama, stok, satuan) {
  await sendToSpreadsheet({
    action: "addBahan",
    nama: nama,
    stok: Number(stok),
    satuan: satuan
  });
}

/**
 * 4. EVENT LISTENER FORM CASH FLOW & OTOMATIS RUN SAAT WEB DIMUAT
 */
document.addEventListener("DOMContentLoaded", () => {
  // Load data awal dari spreadsheet
  loadDataFromSpreadsheet();

  // Event Listener Form Cash Flow (Jika form ada di HTML)
  const formCashFlow = document.getElementById("form-cashflow");
  if (formCashFlow) {
    formCashFlow.addEventListener("submit", async (e) => {
      e.preventDefault();

      const tanggal = document.getElementById("cf-tanggal")?.value;
      const cashFlow = document.getElementById("cf-type")?.value; // "Masuk" atau "Keluar"
      const kategori = document.getElementById("cf-kategori")?.value;
      const nominal = document.getElementById("cf-nominal")?.value;
      const keterangan = document.getElementById("cf-keterangan")?.value;

      if (!tanggal || !nominal) {
        alert("Harap isi Tanggal dan Nominal!");
        return;
      }

      // Kirim data ke Google Sheets
      await addCashFlow(tanggal, keterangan, cashFlow, kategori, nominal);

      // Reset Form setelah disimpan
      formCashFlow.reset();
    });
  }
});
