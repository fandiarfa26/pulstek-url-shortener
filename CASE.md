## Study Case #1: URL Shortener

**Difficulty:** Beginner → Intermediate

### Project

Buat sebuah web app sederhana untuk memendekkan URL, seperti versi mini dari Bitly.

### Learning Objectives

* Memahami alur **frontend → backend → database**
* Membuat API sederhana
* Melakukan CRUD data
* Memahami **redirect berdasarkan identifier**
* Menangani validasi dan error
* Memisahkan logic aplikasi dengan cukup rapi

### Project Overview

User memasukkan URL panjang, kemudian aplikasi menghasilkan URL pendek.

Contoh:

`https://example.com/article/very-long-url`

menjadi:

`http://localhost:3000/abc123`

Ketika `/abc123` dibuka, user diarahkan ke URL aslinya.

### Problem yang Harus Diselesaikan

Buat aplikasi yang memungkinkan user:

1. Memasukkan URL.
2. Membuat short URL.
3. Melihat daftar URL yang pernah dibuat.
4. Membuka short URL dan mendapatkan redirect ke URL asli.
5. Menghapus short URL.

Tidak perlu authentication. Kita sedang belajar engineering, bukan membangun birokrasi login untuk sebuah URL.

### Core Features

* Create short URL
* List semua short URL
* Redirect short URL → original URL
* Delete short URL
* Validasi URL
* Error handling untuk short URL yang tidak ditemukan

Setiap short URL minimal memiliki:

* `id`
* `originalUrl`
* `shortCode`
* `createdAt`

### Expected Result

Minimal terdapat:

**Halaman utama**

* Form input URL
* Tombol create
* Daftar URL yang sudah dibuat
* Tombol delete

**Endpoint redirect**

```text
/:shortCode
```

Contoh:

```text
/abc123
```

akan melakukan redirect ke URL tujuan.

### Technical Requirements

Tidak ada tech stack yang diwajibkan.

Kamu bebas menentukan:

* frontend
* backend
* database
* ORM/query builder
* cara generate `shortCode`
* struktur project

Yang penting keputusan teknisnya bisa kamu jelaskan.

### Definition of Done

Case dianggap selesai jika:

* [x] User bisa membuat short URL dari URL valid.
* [x] `shortCode` setiap URL unik.
* [x] Data URL tersimpan dan tetap tersedia setelah aplikasi restart.
* [x] User bisa melihat daftar URL yang dibuat.
* [x] Membuka `/:shortCode` melakukan redirect ke URL yang benar.
* [x] Short code yang tidak ditemukan menghasilkan error yang sesuai.
* [x] User bisa menghapus short URL.
* [x] URL invalid ditolak dengan pesan error yang jelas.
* [x] API tidak hanya bergantung pada validasi frontend.
* [x] Tidak ada data penting yang di-hardcode untuk menggantikan database.
* [x] Project bisa dijalankan dari kondisi fresh setup sesuai dokumentasi yang kamu buat.

### Out of Scope

Jangan tambahkan dulu:

* Authentication
* User management
* Custom domain
* QR code
* Analytics
* Expiration URL
* Rate limiting
* Deployment
* UI yang terlalu kompleks

### Stretch Goals

Jika core feature sudah benar-benar selesai:

* Tambahkan jumlah click untuk setiap short URL.
* Tambahkan custom `shortCode`.
* Tambahkan expiration date.
* Tambahkan endpoint API untuk mengambil statistik sederhana.
