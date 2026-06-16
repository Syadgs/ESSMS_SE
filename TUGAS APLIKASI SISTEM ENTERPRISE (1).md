## **TUGAS KELOMPOK SISTEM ENTERPRISE** 

## **Enterprise Supply Chain & Sales Management System (ESSMS)** 

**Disusun Oleh:** 

|Naufal Shafi Anwar|24060122140185|
|---|---|
|Arsyad Grant Saputro|24060122140143|



## **DEPARTEMEN INFORMATIKA/ILMU KOMPUTER** 

## **FAKULTAS SAINS DAN MATEMATIKA UNIVERSITAS DIPONEGORO** 

**2026** 

## **Abstrak** 

Perkembangan industri modern menuntut integrasi operasional yang cepat dan akurat demi meminimalisir inefisiensi akibat fragmentasi data. Dokumen ini menyajikan rancangan implementasi _Enterprise Supply Chain & Sales Management System_ (ESSMS), sebuah sistem enterprise berbasis web yang mengonsolidasikan tiga pilar utama proses bisnis: _Item Management_ , _Procure-to-Pay_ (PTP), dan _Order-to-Cash_ (OTC). Perancangan sistem menggunakan pemodelan proses bisnis berbasis _Business Process Model and Notation_ (BPMN), pembagian hak akses menggunakan _Role-Based Access Control_ (RBAC), serta perancangan skema database terintegrasi. Dengan memfokuskan rancangan pada otomatisasi dokumen transaksi, pengawasan inventaris secara _real-time_ , dan mekanisme persetujuan ( _approval_ ), ESSMS dirancang untuk mengeliminasi kesalahan manusia ( _human error_ ) serta memangkas silo data antar-departemen operasional dan keuangan. Dokumen ini berfungsi sebagai cetak biru ( _blueprint_ ) komprehensif untuk memandu fase pengembangan perangkat lunak selanjutnya. 

**Kata Kunci:** Sistem Enterprise, ERP, ESSMS, Procure to Pay, Order to Cash, Item Management. 

## **Abstract** 

_The development of modern industries demands rapid and accurate operational integration to minimize inefficiencies caused by data fragmentation. This document presents the implementation design of the Enterprise Supply Chain & Sales Management System (ESSMS), a web-based enterprise system that consolidates three main pillars of business processes: Item Management, Procure-to-Pay (PTP), and Order-to-Cash (OTC). The system is designed using Business Process Model and Notation (BPMN) for process mapping, Role-Based Access Control (RBAC) for user permission management, and an integrated database schema design. By focusing on transaction document automation, real-time inventory monitoring, and structured approval mechanisms, ESSMS is built to eliminate human errors and dismantle data silos between operational and financial departments. This document serves as a comprehensive blueprint to guide the subsequent software development phases._ 

**Keywords:** _Enterprise System, ERP, ESSMS, Procure to Pay, Order to Cash, Item Management._ 

## **1. Latar Belakang** 

Dalam ekosistem bisnis kontemporer, integrasi proses operasional merupakan pilar utama dalam mencapai keunggulan kompetitif. Fenomena fragmentasi data pada departemen inventaris, pengadaan, dan penjualan seringkali memicu inefisiensi yang signifikan, seperti redundansi informasi, diskrepansi stok fisik, serta hambatan dalam rantai distribusi. Tanpa sistem yang tersentralisasi, pengambilan keputusan strategis menjadi terhambat oleh kurangnya transparansi data secara menyeluruh. 

Menanggapi tantangan tersebut, pengembangan Enterprise Supply Chain & Sales Management System (ESSMS) hadir sebagai solusi integratif yang mengonsolidasikan modul Item Management, Procure-to-Pay (PTP), dan Order-to-Cash (OTC). ESSMS dirancang untuk mentransformasi operasional konvensional menjadi proses yang terautomasi, memastikan sinkronisasi data yang presisi antar departemen. 

Melalui implementasi sistem ini, perusahaan diharapkan mampu meningkatkan akurasi visibilitas inventaris secara real-time, mengoptimalkan siklus transaksi dengan supplier, serta mempercepat pemenuhan pesanan pelanggan. Dengan demikian, ESSMS tidak hanya berfungsi sebagai alat bantu administratif, tetapi juga sebagai instrumen strategis untuk meminimalisir risiko kesalahan manusia dan meningkatkan efisiensi operasional secara berkelanjutan. 

## **2. Rumusan Masalah** 

Berdasarkan latar belakang yang telah diuraikan, maka rumusan masalah dalam pengembangan Enterprise Supply Chain & Sales Management System (ESSMS) adalah sebagai berikut: 

1. Bagaimana merancang sistem enterprise yang mampu mengintegrasikan proses Item Management, Procure-to-Pay (PTP), dan Order-to-Cash (OTC) dalam satu platform terpusat? 

2. Bagaimana memastikan data inventaris dapat diperbarui secara real-time berdasarkan transaksi pembelian dan penjualan yang terjadi? 

3. Bagaimana mengotomatisasi proses pengadaan barang mulai dari Purchase Order hingga pembayaran vendor agar lebih efisien dan transparan? 

4. Bagaimana mengelola proses penjualan mulai dari Sales Order hingga pembayaran pelanggan secara terstruktur dan terdokumentasi? 

5. Bagaimana menyediakan informasi dan laporan yang akurat untuk mendukung pengambilan keputusan manajemen? 

## **3. Tujuan** 

Tujuan pembuatan aplikasi: 

1. Mencapai integrasi proses bisnis yang menyeluruh untuk menghilangkan silo data antar departemen. 

2. Meningkatkan akurasi dan sentralisasi data master item guna menjamin konsistensi informasi produk. 

3. Mengoptimalkan siklus pengadaan melalui automasi proses Procure-to-Pay yang transparan. 

4. Mempercepat pemenuhan pesanan pelanggan melalui sistem Order-to-Cash yang terstruktur. 

5. Meminimalisir risiko kesalahan manusia (human error) dalam pencatatan stok dan transaksi keuangan. 

6. Menghasilkan laporan manajerial dan analitik secara real-time untuk mendukung pengambilan keputusan. 

## **4. Manfaat Proyek** 

Pengembangan Enterprise Supply Chain & Sales Management System (ESSMS) diharapkan memberikan manfaat sebagai berikut: 

## 1. Bagi Perusahaan 

- Meningkatkan efisiensi operasional melalui integrasi proses bisnis. 

- Mengurangi risiko kesalahan pencatatan data dan transaksi. 

- Mempercepat proses pengadaan dan penjualan. 

- Menyediakan informasi inventaris secara real-time. 

2. Bagi Pengguna 

   - Memudahkan pengelolaan data barang, supplier, dan pelanggan. 

   - Mempermudah monitoring status transaksi pembelian dan penjualan. 

   - Mengurangi pekerjaan administratif yang dilakukan secara manual. 

3. Bagi Akademik 

   - Menjadi implementasi nyata konsep Sistem Enterprise dan ERP. 

   - Menjadi referensi dalam pengembangan sistem enterprise berbasis web. 

## **5. Analisis Permasalahan** 

Berdasarkan hasil observasi terhadap proses bisnis perusahaan yang mengelola inventaris, pengadaan, dan penjualan, ditemukan beberapa permasalahan yang sering terjadi. Pertama, data barang, transaksi pembelian, dan transaksi penjualan masih dikelola secara terpisah sehingga menyebabkan inkonsistensi data antar departemen. Kondisi ini mengakibatkan proses pelacakan stok menjadi kurang akurat dan berpotensi menimbulkan kesalahan dalam pengambilan keputusan. 

Kedua, proses pengadaan barang dari supplier masih membutuhkan banyak pencatatan manual yang meningkatkan risiko terjadinya human error. Kesalahan pencatatan jumlah barang, harga, maupun status pembayaran dapat menyebabkan keterlambatan operasional perusahaan. 

Ketiga, proses penjualan sering mengalami kendala dalam pemantauan status pesanan pelanggan karena informasi yang tersebar pada beberapa sistem berbeda. Akibatnya, perusahaan kesulitan memberikan informasi yang cepat dan akurat kepada pelanggan terkait status pesanan maupun pengiriman barang. 

Selain itu, manajemen juga mengalami kesulitan dalam memperoleh laporan yang terintegrasi dan real-time. Data yang tersebar mengharuskan proses rekapitulasi secara manual sehingga memperlambat proses analisis dan pengambilan keputusan strategis. 

Untuk mengatasi berbagai permasalahan tersebut, diperlukan suatu sistem Enterprise Supply Chain & Sales Management System (ESSMS) yang mampu mengintegrasikan seluruh proses 

bisnis perusahaan ke dalam satu platform yang terpusat. 

## **6. Kebutuhan Sistem** 

## **6.1 Kebutuhan Fungsional** 

## **Sistem yang dikembangkan harus mampu:** 

1. Mengelola data master item, supplier, dan customer. 

2. Melakukan pencatatan stok barang secara real-time. 

3. Membuat dan mengelola Purchase Order. 

4. Mencatat penerimaan barang dari supplier. 

5. Mengelola proses persetujuan tagihan vendor. 

6. Melakukan pencatatan pembayaran kepada vendor. 

7. Membuat dan mengelola Sales Order. 

8. Mendukung proses pick, pack, dan ship barang. 

9. Menghasilkan invoice pelanggan secara otomatis. 

10. Mencatat pembayaran pelanggan. 

11. Menyajikan laporan persediaan, pembelian, dan penjualan. 

## **6.2 Kebutuhan Non-Fungsional** 

1. Sistem berbasis web dan dapat diakses melalui jaringan internet maupun intranet. 

2. Sistem memiliki mekanisme autentikasi dan otorisasi pengguna. 

3. Data tersimpan pada database terpusat. 

4. Sistem mampu menangani banyak pengguna secara bersamaan. 

5. Sistem menyediakan antarmuka yang mudah digunakan. 

6. Sistem memiliki kemampuan backup dan recovery data. 

## **7. Batasan Masalah** 

Agar pembahasan lebih terarah dan sesuai dengan ruang lingkup proyek, maka batasan masalah yang diterapkan adalah sebagai berikut: 

1. Sistem hanya mencakup modul Item Management, Procure-to-Pay (PTP), dan Order-to-Cash (OTC). 

2. Sistem tidak mencakup modul akuntansi secara penuh seperti General Ledger, Neraca, dan Laporan Laba Rugi. 

3. Sistem tidak terintegrasi dengan payment gateway atau layanan pembayaran pihak ketiga. 

4. Sistem dikembangkan dalam bentuk aplikasi berbasis web. 

5. Sistem hanya mendukung proses bisnis internal perusahaan dan belum mencakup integrasi dengan sistem eksternal. 

6. Pembahasan berfokus pada perancangan dan implementasi proses bisnis utama tanpa membahas optimasi lanjutan. 

## **8. Ruang Lingkup Sistem** 

Sistem terdiri dari 3 modul utama: 

## **Modul Item Management** 

Fokus pada standarisasi dan pengelolaan identitas produk serta pengendalian level stok di gudang. 

- Create Inventory Item 

- Create Non Inventory Item 

- Create Service Item 

- Inventory Adjustment 

- Inventory Transfer 

## **Modul Procure To Pay (PTP)** 

Mengatur seluruh alur akuisisi barang dari pemasok eksternal hingga penyelesaian kewajiban pembayaran. 

- Create Purchase Order 

- Receive Item 

- Vendor Bill 

- Bill Approval 

- Bill Payment 

## **Modul Order To Cash (OTC)** 

Menangani proses komersial mulai dari penerimaan pesanan pelanggan hingga pengakuan pendapatan. 

- Create Sales Order 

- Sales Approval 

- Pick Order 

- Pack Order 

- Ship Order 

- Invoice Customer 

- Customer Payment 

## **9.  Aktor Sistem** 

|**Peran / Aktor**|**Tanggung Jawab Utama**|
|---|---|
|Purchasing Manager|Otorisasi dan pembuatan dokumen pesanan pembelian kepada<br>supplier terpilih.|



|**Peran / Aktor**|**Tanggung Jawab Utama**|
|---|---|
|Inventory Manager|Pengawasan penerimaan barang, manajemen gudang<br>(pick-pack-ship), serta penyesuaian stok.|
|Sales Representative|Penerimaan permintaan pelanggan dan input data pesanan<br>penjualan ke dalam sistem.|
|Sales Manager|Validasi kelayakan pesanan penjualan dan memberikan<br>persetujuan transaksi komersial.|
|Accounting Manager|Pemeriksaan dan persetujuan tagihan dari vendor berdasarkan<br>verifikasi dokumen pendukung.|
|AP Analyst|Pengelolaan utang usaha dan eksekusi pembayaran kepada<br>pemasok sesuai jadwal.|
|AR Analyst|Penerbitan faktur penagihan pelanggan dan rekonsiliasi<br>pembayaran masuk (piutang).|



## **10. Use Case Utama** 

Item Management 

- Kelola Item: Mendefinisikan atribut produk, kategori, dan parameter akuntansi item. 

- Kelola Stock: Melakukan penyesuaian (adjustment) kuantitas stok berdasarkan audit fisik. 

- Transfer Stock: Mengelola perpindahan fisik barang antar lokasi gudang yang berbeda. 

Purchasing 

- Membuat Purchase Order: Formalisasi pesanan barang kepada vendor secara sistematis. 

- Menerima Barang: Pencatatan barang masuk yang memicu pembaruan stok secara otomatis. 

- Membayar Vendor: Proses penyelesaian kewajiban finansial atas barang yang telah diterima. Sales 

- Membuat Sales Order: Registrasi pesanan dari pelanggan sebagai dasar pemenuhan barang. 

- Pengiriman Barang: Alur logistik dari gudang ke pelanggan yang mengurangi stok tersedia. 

- Penagihan Customer: Penerbitan invoice untuk pengakuan piutang atas barang yang terjual. 

## **11. Database Utama** 

## **users** 

- user_id 

- name 

- role 

## **items** 

- item_id 

- item_name 

- item_type 

- stock 

- price 

## **suppliers** 

- supplier_id 

- supplier_name 

## **customers** 

- customer_id 

- customer_name 

## **purchase_orders** 

- po_id 

- supplier_id 

- total_amount 

- status 

## **sales_orders** 

- so_id 

- customer_id 

- total_amount 

- status 

## **invoices** 

- invoice_id 

- so_id 

- amount 

## **payments** 

- payment_id 

- invoice_id 

- Amount 

- Metodologi Pengembangan Sistem 

## **12. Metode Pengembangan** 

Metode pengembangan yang digunakan adalah Waterfall karena memiliki tahapan yang terstruktur dan mudah diterapkan pada pengembangan sistem enterprise. 

Tahapan pengembangan meliputi: 

1. Analisis Kebutuhan 

Mengidentifikasi kebutuhan pengguna, proses bisnis, serta ruang lingkup sistem yang akan dikembangkan. 

2. Perancangan Sistem 

Membuat desain database, use case diagram, activity diagram, serta rancangan antarmuka pengguna. 

3. Implementasi 

Membangun aplikasi berdasarkan desain yang telah dibuat menggunakan teknologi yang dipilih. 

4. Pengujian 

Melakukan pengujian terhadap seluruh fungsi sistem untuk memastikan sistem berjalan sesuai kebutuhan. 

5. Deployment dan Evaluasi 

Sistem diimplementasikan pada lingkungan operasional dan dilakukan evaluasi untuk perbaikan lebih lanjut. 

6. Teknologi yang Digunakan 

- Frontend : HTML, CSS, JavaScript, Bootstrap 

- Backend : Laravel Framework 

- Database : MySQL 

- Web Server : Apache 

- Version Control : Git 

- Development Environment : Visual Studio Code dan Laragon 

9. Manfaat Sistem 

10. Meningkatkan efisiensi proses bisnis perusahaan. 

11. Mengurangi risiko kesalahan pencatatan data. 

12. Mempercepat proses pengadaan dan penjualan. 

13. Menyediakan informasi inventaris secara real-time. 

14. Memudahkan monitoring transaksi pembelian dan penjualan. 

15. Mendukung pengambilan keputusan melalui laporan yang akurat dan terintegrasi. 

## **13. Kesimpulan** 

Aplikasi Enterprise Supply Chain & Sales Management System merupakan sistem terintegrasi yang menggabungkan Item Management, Procure to Pay, dan Order to Cash ke dalam satu platform ERP. Sistem ini mampu mengelola alur bisnis perusahaan dari pengadaan barang, pengelolaan stok, hingga penjualan dan penerimaan pembayaran secara terintegrasi sehingga meningkatkan efisiensi operasional perusahaan. 

## **VISUALISASI ERP MANAGEMENT SYSTEM** 

