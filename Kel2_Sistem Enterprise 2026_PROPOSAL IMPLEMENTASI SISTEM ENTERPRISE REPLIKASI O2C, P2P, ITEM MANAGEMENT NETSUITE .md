## **PROPOSAL IMPLEMENTASI SISTEM ENTERPRISE REPLIKASI O2C, P2P, ITEM MANAGEMENT NETSUITE** 

## **Disusun Oleh:** 

Chandra Wijayakusuma 24060122140106 Farhan Hariz Abdurrahman 24060122140144 Muhammad Anshar Al Faruq 24060122140148 

**‘** 

## **DEPARTEMEN INFORMATIKA** 

**FAKULTAS SAINS DAN MATEMATIKA UNIVERSITAS DIPONEGORO** 

## **SEMARANG** 

**2026** 

## **ABSTRAK** 

Oracle NetSuite merupakan salah satu sistem Enterprise Resource Planning (ERP) berbasis cloud yang banyak digunakan oleh perusahaan skala menengah hingga besar untuk mengintegrasikan proses bisnis utama dalam satu platform terpadu. Dalam praktikum mata kuliah Enterprise Systems, mahasiswa mempelajari tiga modul inti NetSuite yaitu Order to Cash (OTC), Procure to Pay (PTP), dan Item Management. Namun, keterbatasan akses terhadap lisensi Oracle NetSuite di luar lingkungan praktikum menjadi hambatan bagi mahasiswa untuk memperdalam pemahaman secara mandiri. Penelitian ini bertujuan untuk merancang dan membangun aplikasi web yang mereplikasi alur proses bisnis ketiga modul tersebut berdasarkan Standard Operating Procedure (SOP) yang dipraktikkan di kelas. Modul OTC mencakup pembuatan dan persetujuan sales order, fulfillment (pick, pack, ship), penerbitan invoice, penerimaan pembayaran, serta monitoring piutang. Modul PTP mencakup pembuatan purchase order, penerimaan barang, pemrosesan vendor bill dengan mekanisme 3-way matching, pembayaran tagihan, serta monitoring utang. Modul Item Management mencakup pengelolaan item master (inventory item, non-inventory item, service item), penyesuaian dan transfer stok, serta pelaporan inventori. Ketiga modul diintegrasikan melalui shared item master sebagai basis data bersama dengan sistem multi-role berbasis Role-Based Access Control (RBAC). Hasil yang diharapkan adalah sebuah aplikasi web fungsional yang dapat mendemonstrasikan seluruh alur proses bisnis end-to-end dari ketiga modul secara terintegrasi, sehingga dapat digunakan sebagai media pembelajaran ERP yang mandiri tanpa ketergantungan pada lisensi Oracle NetSuite. 

**Kata kunci:** Enterprise Resource Planning, Oracle NetSuite, Order to Cash, Procure to Pay, Item Management, Replikasi Sistem, Role-Based Access Control 

## _**ABSTRACT**_ 

_Oracle NetSuite is a cloud-based Enterprise Resource Planning (ERP) system widely adopted by medium to large enterprises to integrate core business processes within a unified platform. In the Enterprise Systems course practicum, students study three core NetSuite modules: Order to Cash (OTC), Procure to Pay (PTP), and Item Management. However, limited access to Oracle NetSuite licenses outside the practicum environment constrains students from independently deepening their understanding of these business processes. This study aims to design and develop a web application that replicates the business process flows of these three modules based on the Standard Operating Procedures (SOPs) practiced in class. The OTC module covers sales order creation and approval, fulfillment (pick, pack, ship), invoice generation, customer payment acceptance, and accounts receivable monitoring. The PTP module covers purchase order creation, goods receipt, vendor bill processing with a 3-way matching mechanism, bill payment, and accounts payable monitoring. The Item Management module covers item master management (inventory items, non-inventory items, service items), inventory adjustment and transfer, and inventory reporting. All three modules are integrated through a shared item master as a common database, supported by a multi-role system based on Role-Based Access Control (RBAC). The expected outcome is a fully functional web application capable of demonstrating the complete end-to-end business process flows across all three modules in an integrated manner, serving as an independent ERP learning tool without reliance on Oracle NetSuite licensing._ 

_**Keywords:** Enterprise Resource Planning, Oracle NetSuite, Order to Cash, Procure to Pay, Item Management, System Replication, Role-Based Access Control_ 

## **DAFTAR ISI** 

|**ABSTRAK**|**2**|
|---|---|
|**ABSTRACT**|**3**|
|**DAFTAR ISI**|**4**|
|**DAFTAR GAMBAR**|**5**|
|**DAFTAR TABEL**|**6**|
|**BAB I**|**7**|
|**PENDAHULUAN**|**7**|
|1.1.          Latar Belakang|7|
|1.2.          Rumusan Masalah|7|
|1.4.          Manfaat|8|
|1.5.          Ruang Lingkup|8|
|**BAB II**|**9**|
|**LANDASAN TEORI**|**9**|
|2.1.          State of the Art|9|
|2.2.          Konsep ERP|9|
|**BAB III**|**11**|
|**METODOLOGI PENELITIAN**|**11**|
|3.1.          Modul Order to Cash|11|
|Gambar 1. BPMN Order to Cash (O2C)|11|
|3.2.          Modul Procure to Pay|11|
|Gambar 2. BPMN Procure to Pay (P2P)|12|
|3.3.          Modul Item Management|12|
|Gambar 3. BPMN Item Management|12|
|3.4.          Modul Sistem Keseluruhan|13|
|Gambar 4. BPMN Sistem Keseluruhan|13|
|**BAB IV**|**14**|
|**RENCANA JADWAL PENELITIAN**|**14**|
|Tabel 4.1. Rencana Jadwal Penelitian|14|
|**DAFTAR PUSTAKA**|**15**|



## **DAFTAR GAMBAR** 

||**DAFTAR GAMBAR**||
|---|---|---|
|Gambar|1. BPMN Order to Cash (O2C)|12|
|Gambar|2. BPMN Procure to Pay (P2P)|13|
|Gambar|3. BPMN Item Management|13|
|Gambar|4. BPMN Sistem Keseluruhan|14|



## **DAFTAR TABEL** 

Tabel 4.1. Rencana Jadwal Penelitian 

15 

## **BAB I** 

## **PENDAHULUAN** 

## **1.1.          Latar Belakang** 

Enterprise Resource Planning (ERP) merupakan sistem informasi terintegrasi yang memungkinkan perusahaan mengelola seluruh proses bisnis utama dalam satu platform terpadu. Salah satu platform ERP yang banyak digunakan oleh perusahaan skala menengah hingga besar adalah Oracle NetSuite, sebuah sistem berbasis cloud yang mengintegrasikan modul keuangan, operasional, penjualan, pengadaan, dan manajemen inventori dalam satu basis data bersama. 

Dalam praktikum mata kuliah Enterprise Systems, mahasiswa mempelajari tiga proses bisnis inti yang diimplementasikan di Oracle NetSuite, yaitu Order to Cash (OTC), Procure to Pay (PTP), dan Item Management. Ketiga proses ini saling berkaitan dan membentuk siklus operasional bisnis secara end-to-end. OTC menangani alur dari penerimaan pesanan pelanggan hingga pembayaran diterima, PTP mengelola pengadaan barang dan jasa dari vendor hingga pembayaran dilakukan, sementara Item Management menjadi fondasi data master yang menghubungkan keduanya melalui pengelolaan stok secara real-time. 

Namun demikian, akses terhadap Oracle NetSuite membutuhkan lisensi berbayar yang tidak selalu tersedia di luar lingkungan praktikum. Hal ini menjadi kendala ketika mahasiswa ingin memperdalam pemahaman terhadap alur proses bisnis ERP secara mandiri. Oleh karena itu, dibutuhkan sebuah aplikasi replikasi yang mampu mensimulasikan ketiga modul tersebut dalam lingkungan pengembangan yang mandiri, sehingga proses pembelajaran dapat berlanjut tanpa bergantung pada platform berlisensi. 

## **1.2. Rumusan Masalah** 

Berdasarkan latar belakang yang telah diuraikan, rumusan masalah dalam penelitian ini adalah: 

1. Bagaimana merancang dan membangun aplikasi web yang mereplikasi alur proses bisnis Order to Cash sesuai SOP Oracle NetSuite? 

2. Bagaimana merancang dan membangun aplikasi web yang mereplikasi alur proses bisnis Procure to Pay sesuai SOP Oracle NetSuite? 

3. Bagaimana merancang dan membangun modul Item Management yang menjadi penghubung antara modul OTC dan PTP? 

4. Bagaimana mengintegrasikan ketiga modul tersebut dalam satu sistem yang dapat dioperasikan oleh berbagai role pengguna? 

## **1.3. Tujuan** 

1. Bagaimana mengintegrasikan ketiga modul tersebut dalam satu sistem yang dapat dioperasikan oleh berbagai role pengguna? 

2. Membangun aplikasi web replikasi modul Procure to Pay dengan alur dan role sesuai praktikum Oracle NetSuite. 

3. Membangun modul Item Management yang mengelola data master item serta menjembatani modul OTC dan PTP. 

## **1.4. Manfaat** 

- a. Bagi Mahasiswa 

Memberikan media pembelajaran mandiri untuk memahami alur proses bisnis ERP tanpa bergantung pada lisensi Oracle NetSuite, serta meningkatkan kompetensi dalam pengembangan sistem informasi berbasis web. 

- b. Bagi Akademik 

Menghasilkan referensi praktis tentang replikasi sistem ERP yang dapat digunakan sebagai bahan ajar atau studi kasus pada mata kuliah Enterprise Systems. 

## **1.5. Ruang Lingkup** 

Sistem mencakup empat bagian utama: modul Order to Cash, modul Procure to Pay, modul Item Management, dan dashboard integrasi sistem keseluruhan. Sistem tidak mencakup integrasi dengan sistem eksternal nyata, pemrosesan pembayaran aktual, maupun konfigurasi multi-subsidiary dan multi-currency kompleks. 

## **BAB II** 

## **LANDASAN TEORI** 

## **2.1.          State of the Art** 

Penelitian dan implementasi terkait sistem ERP telah banyak dilakukan, khususnya dalam konteks digitalisasi proses bisnis perusahaan. Beberapa referensi yang relevan dengan penelitian ini antara lain: 

Solichatun et al. (2023) melakukan implementasi ERP modul Purchasing, Sales, dan Inventory menggunakan Odoo pada PT. Sukacita Kokoh Bersama, yang diterbitkan di IMTechno: Journal of Industrial Management and Technology Vol. 4 No. 2. Penelitian tersebut menunjukkan bahwa integrasi modul purchasing dan inventory dalam satu platform ERP mampu meningkatkan efisiensi proses pengadaan secara signifikan. Relevansinya dengan penelitian ini terletak pada kesamaan scope modul yang direplikasi, meskipun platform yang digunakan berbeda (Odoo vs Oracle NetSuite). 

Demilda et al. (2022) mengimplementasikan Software Odoo dengan menggunakan modul Accounting, Inventory, Purchase, dan Point of Sales pada Toko Al Hikmah Mart di Bogor Jawa Barat, yang diterbitkan di Industrial Engineering Online Journal Universitas Diponegoro. Penelitian ini relevan karena membahas integrasi antara modul inventory dan purchase dalam satu sistem, yang secara konseptual serupa dengan hubungan antara modul Item Management dan P2P dalam penelitian ini. 

Artikel dari School of Information Systems BINUS (2022) membahas implementasi ERP Oracle NetSuite Modul Order to Cash (OTC) di PT Kris Proteindo Prakarsa (KPP). Ini merupakan referensi paling relevan karena secara langsung membahas implementasi modul OTC pada Oracle NetSuite di konteks perusahaan Indonesia, menjadi acuan alur proses yang direplikasi dalam penelitian ini. 

NetSuite mendefinisikan bahwa sistem ERP menggunakan built-in workflows dan logic untuk mengotomasi proses bisnis seperti order-to-cash dan procure-to-pay, termasuk kemampuan real-time data syncing di mana transaksi pada satu area langsung memperbarui data relevan di seluruh sistem, serta shared interfaces dengan role-based access yang membatasi akses sesuai peran pengguna. 

Perbedaan penelitian ini dengan penelitian-penelitian sebelumnya terletak pada fokusnya yang spesifik pada replikasi Oracle NetSuite (bukan Odoo), cakupan tiga modul sekaligus dalam satu sistem terintegrasi, serta pendekatan pembelajaran berbasis simulasi SOP yang dipraktikkan di kelas. 

## **2.2. Konsep ERP** 

1. Enterprise Resource Planning (ERP) 

adalah sistem perangkat lunak yang mengintegrasikan seluruh fungsi bisnis utama organisasi termasuk keuangan, pengadaan, penjualan, produksi, dan SDM — ke dalam satu platform dengan basis data terpusat. NetSuite sebagai sistem ERP memungkinkan pengguna menyelesaikan proses multi-tahap seperti order-to-cash dan 

procure-to-pay dari satu aplikasi tanpa perlu memasukkan ulang atau mengekspor informasi, karena seluruh modul berbagi satu sumber data yang sama. 

## 2. Order to Cash (OTP) 

adalah siklus proses bisnis yang dimulai dari penerimaan pesanan pelanggan dan berakhir ketika pembayaran atas pesanan tersebut diterima oleh perusahaan. Proses ini mencakup order management (pembuatan dan approval sales order, fulfillment berupa pick-pack-ship) dan billing operations (penerbitan invoice, penerimaan pembayaran, serta monitoring piutang). 

## 3. Procure to Pay (PTP) 

adalah siklus pengadaan yang mencakup keseluruhan proses dari identifikasi kebutuhan barang atau jasa hingga pembayaran kepada vendor. NetSuite mendefinisikan P2P sebagai proses pengadaan barang dan jasa pada harga paling menguntungkan dan dalam waktu yang ditentukan, dengan pengelolaan pengadaan terpusat untuk menghemat waktu, mengurangi biaya, dan meningkatkan visibilitas pengeluaran serta performa vendor. 

## 4. Item Management 

adalah elemen kunci dari proses Design to Build yang berfungsi melacak dan mengelola item serta layanan yang dibeli maupun dijual. Item dalam konteks ERP mencakup barang fisik yang dijual ke pelanggan, part dan bahan baku yang dibeli dari vendor, serta layanan yang tidak memiliki wujud fisik. Item Management menjadi titik pusat integrasi antara OTC dan PTP karena kedua proses tersebut mengacu pada data master item yang sama. 

## 5. Role-Based Access Control (RBAC) 

adalah mekanisme pengendalian akses yang memberikan hak akses kepada pengguna berdasarkan perannya dalam organisasi. Dalam sistem ERP, setiap role memiliki akses terbatas hanya pada fitur dan data yang relevan dengan tanggung jawabnya. Dalam konteks penelitian ini, role yang dilibatkan antara lain Sales Representative, Sales Manager, Inventory Manager, A/R Analyst, Purchasing Manager, A/P Analyst, dan Accounting Manager. 

## 6. Reminder Portlet 

adalah komponen antarmuka dashboard di NetSuite yang menampilkan daftar transaksi yang memerlukan tindakan dari pengguna sesuai rolenya, misalnya "Sales Orders to Approve" untuk Sales Manager atau "Orders to Fulfill" untuk Inventory Manager. 

## **BAB III** 

## **METODOLOGI PENELITIAN** 

## **3.1. Modul Order to Cash** 

Modul OTC diimplementasikan dengan mengacu pada 10 walkthrough dari materi Oracle Academy ERP Basics — Order to Cash. Alur dimulai dari penerimaan Purchase Order dari customer sebagai message trigger, dilanjutkan pembuatan Sales Order oleh Sales Representative dengan input customer, item, qty, rate, price level, department, class, tax code, dan memo. Sales Order masuk ke status Pending Approval dan Sales Manager melakukan review melalui dashboard reminder portlet "Sales Orders to Approve". Jika disetujui, Inventory Manager memproses fulfillment dalam tiga tahap terpisah (Pick → Pack → Ship) masing-masing melalui reminder portlet tersendiri. Setelah status Shipped, A/R Analyst menerbitkan invoice dan kemudian menerima pembayaran dari customer dengan mencocokkan invoice yang dilunasi. Monitoring dilakukan melalui A/R Aging Report, KPI scorecard (receivables, average days to receive, new customers), dan reminder portlet yang dapat dikustomisasi. 

Gambar 1. BPMN Order to Cash (O2C) 

## **3.2. Modul Procure to Pay** 

Modul PTP diimplementasikan berdasarkan 9 walkthrough dari materi Oracle Academy ERP Basics — Procure to Pay. Alur dimulai dari pengelolaan vendor master oleh Purchasing Manager, dilanjutkan pembuatan Purchase Order dengan input vendor, item, qty, rate, dan memo. PO dikirim ke vendor sebagai message flow dan vendor mengirimkan barang beserta vendor bill. Inventory Manager mengkonfirmasi penerimaan barang melalui menu Receive Orders yang secara otomatis mengupdate stok di Item Management. A/P Analyst kemudian memproses vendor bill dengan mekanisme 3-way matching antara PO, Item Receipt, dan Vendor Bill. Selain alur utama tersebut, terdapat jalur alternatif untuk standalone bill (tagihan tanpa PO seperti utilitas) yang memerlukan approval dari Accounting Manager 

sebelum dapat dibayar. Monitoring dilakukan melalui A/P Aging Report dan KPI scorecard vendor performance. 

Gambar 2. BPMN Procure to Pay (P2P) 

## **3.3. Modul Item Management** 

Modul Item Management diimplementasikan berdasarkan 7 walkthrough dari materi Oracle Academy ERP Basics — Item Management. Modul ini terbagi menjadi tiga bagian utama. Pertama, item strategy yang didefinisikan pada level eksekutif mencakup pemilihan item type, costing method (FIFO/LIFO/Average/Standard), units of measure, dan konfigurasi pajak default. Kedua, manage item master yang memungkinkan pembuatan tiga jenis item: Inventory Item (dengan tracking stok penuh, akun COGS, asset, dan income), Non-Inventory Item (tanpa tracking stok, dapat dikonversi ke inventory), dan Service Item (tanpa stok fisik, tax schedule non-taxable). Ketiga, inventory transactions yang mencakup adjust inventory (penyesuaian manual stok dengan pencatatan ke adjustment account) dan transfer inventory (perpindahan stok antar lokasi/warehouse). Monitoring dilakukan melalui Physical Inventory Worksheet Report dan KPI & Reminders dashboard. 

Gambar 3. BPMN Item Management 

## **3.4. Modul Sistem Keseluruhan** 

Integrasi ketiga modul diwujudkan melalui shared item master sebagai basis data bersama. Ketika Sales Representative membuat Sales Order di modul OTC, sistem mengecek ketersediaan stok secara real-time dari Item Management. Ketika Inventory Manager mengkonfirmasi penerimaan barang di modul PTP, stok di Item Management otomatis bertambah. Sistem keseluruhan menggunakan autentikasi berbasis role (RBAC) sehingga setiap pengguna hanya mengakses fitur sesuai tanggung jawabnya. Dashboard utama sistem menampilkan ringkasan lintas modul: jumlah SO pending approval, PO pending receipt, item dengan stok kritis, invoice overdue, dan bills to pay. Tech stack yang direncanakan adalah Next.js untuk frontend, dengan PostgreSQL sebagai basis data terpusat yang menjamin konsistensi data antar modul. 

Gambar 4. BPMN Sistem Keseluruhan 

## **BAB IV** 

## **RENCANA JADWAL PENELITIAN** 

## **Tabel 4.1. Rencana Jadwal Penelitian** 

|No|Kegiatan||Juni|Juni|Juni|Juni|Juli|Juli|Juli|Juli|
|---|---|---|---|---|---|---|---|---|---|---|
||||1|2|3|4|1|2|3|4|
|1|Analisis kebutuhan, finalisasi SOP per<br>modul, desain ERD||||||||||
|2|Setup project, autentikasi, role<br>management, data master (item, customer,<br>vendor)||||||||||
|3|Implementasi modul Item Management<br>(item master, adjust, transfer)||||||||||
|4|Implementasi modul Order to Cash (SO,<br>approval, fulfillment)||||||||||
|5|Implementasi modul OTC lanjutan<br>(invoice, payment, A/R monitoring)||||||||||
|6|Implementasi modul Procure to Pay (PO,<br>receive, bill, 3-way match)||||||||||
|7|Implementasi PTP lanjutan (standalone<br>bill, approve bill, A/P monitoring)||||||||||
|8|Integrasi antar modul, dashboard sistem<br>keseluruhan||||||||||
|9|Testing, bug fixing, dokumentasi||||||||||



## **DAFTAR PUSTAKA** 

Solichatun, S., Elmyawan, N. F., Arfandi, M. I., Oktapiansyah, Y., & Hermaliani, E. H. (2023). Implementasi Enterprise Resource Planning Modul Purchasing, Sales dan Inventory Menggunakan Odoo pada PT. Sukacita Kokoh Bersama. _IMTechno: Journal of Industrial Management and Technology_ , 4(2), 84–92. 

Demilda, Y. E., Arvianto, A., & Rosyada, Z. F. (2022). Implementasi Software Odoo dengan Menggunakan Modul Accounting, Inventory, Purchase, dan Point of Sales pada Toko Al Hikmah Mart. _Industrial Engineering Online Journal_ , Universitas Diponegoro. 

School of Information Systems BINUS. (2022). Implementasi ERP Oracle NetSuite Modul Order to Cash (OTC) di PT Kris Proteindo Prakarsa. Retrieved from https://sis.binus.ac.id/2022/08/24/32621/ 

NetSuite. (2025). _What is ERP?_ Oracle NetSuite. Retrieved from https://www.netsuite.com/portal/resource/articles/erp/what-is-erp.shtml 

Oracle Academy. (2025). _Order to Cash (OTC) — ERP Basics_ . Oracle Corporation. 

Oracle Academy. (2025). _Procure to Pay (PTP) — ERP Basics_ . Oracle Corporation. 

Oracle Academy. (2025). _Item Management — ERP Basics_ . Oracle Corporation. 

