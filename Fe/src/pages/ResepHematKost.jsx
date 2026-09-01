import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Clock, 
  DollarSign, 
  ChefHat, 
  Search, 
  Sparkles, 
  Utensils, 
  X,
  Lightbulb,
  CheckCircle2,
  Filter
} from 'lucide-react';

// =========================================================================
// 1. DATASET RESEP MELIMPAH (100 MENU LENGKAP)
// =========================================================================
const RECIPE_DATASET = [
  // --- RICE COOKER SPECIAL (1-30) ---
  {
    id: 1,
    title: "Nasi Liwet Rice Cooker Magic",
    price: 12000,
    time: 25,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍚",
    mainIngredient: "Nasi",
    ingredientsBreakdown: [
      { name: "Beras 2 cangkir", cost: 5000 },
      { name: "Ikan Teri / Bilis 50g", cost: 4000 },
      { name: "Bawang Merah & Putih", cost: 1500 },
      { name: "Serai & Daun Salam", cost: 1500 }
    ],
    steps: [
      "Cuci beras hingga bersih lalu masukkan ke dalam bowl Rice Cooker.",
      "Tumis irisan bawang dan teri sebentar, lalu masukkan ke dalam beras.",
      "Tambahkan air sesuai takaran biasa, masukkan serai & daun salam. Tekan 'Cook' dan tunggu hingga matang."
    ],
    hack: "Gunakan minyak bekas goreng teri untuk menumis bawang agar aroma nasi liwet makin gurih meresap!"
  },
  {
    id: 2,
    title: "Nasi Hainan Simpel Ala Rice Cooker",
    price: 14000,
    time: 30,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍗",
    mainIngredient: "Nasi",
    ingredientsBreakdown: [
      { name: "Beras 2 Cangkir", cost: 5000 },
      { name: "Dada Ayam Fillet 100g", cost: 6000 },
      { name: "Jahe & Bawang Putih", cost: 1500 },
      { name: "Minyak Wijen & Kecap Asin", cost: 1500 }
    ],
    steps: [
      "Tumis geprekan jahe dan bawang putih cincang dengan sedikit minyak wijen.",
      "Masukkan tumisan ke dalam beras di rice cooker, tambahkan air dan sedikit kaldu ayam.",
      "Taruh potong dada ayam segar tepat di atas beras. Masak hingga matang bersamaan."
    ],
    hack: "Lemak dari potongan ayam akan meleleh ke dalam beras saat dimasak, membuat nasi menjadi gurih alami tanpa santan!"
  },
  {
    id: 3,
    title: "Macaroni Cheese Simpel Rice Cooker",
    price: 13000,
    time: 20,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🧀",
    mainIngredient: "Mie",
    ingredientsBreakdown: [
      { name: "Makaroni Elbow 150g", cost: 4000 },
      { name: "Susu UHT Plain 200ml", cost: 4500 },
      { name: "Keju Cheddar Parut 50g", cost: 3500 },
      { name: "Sosis Sapi 1 Pcs", cost: 1000 }
    ],
    steps: [
      "Rebus makaroni di rice cooker dengan sedikit air hingga setengah matang.",
      "Buang sisa air rebusan, tuangkan susu UHT dan keju parut.",
      "Aduk terus dalam posisi 'Warm' hingga keju meleleh pekat dan kuah mengental."
    ],
    hack: "Gunakan tombol mode 'Warm' saat mengaduk keju agar susu tidak pecah dan keju meleleh sempurna jadi saus creamy."
  },
  {
    id: 4,
    title: "Kukus Telur Tahu Siram Minyak Wijen",
    price: 8000,
    time: 15,
    equipment: "Rice Cooker",
    category: "super_hemat",
    image: "🍲",
    mainIngredient: "Tahu",
    ingredientsBreakdown: [
      { name: "Tahu Putih Halus 1 Kotak", cost: 3000 },
      { name: "Telur Ayam 2 Butir", cost: 4000 },
      { name: "Minyak Wijen & Kecap Asin", cost: 1000 }
    ],
    steps: [
      "Hancurkan tahu putih di mangkuk tahan panas, kocok telur dengan sedikit kecap asin dan tuangkan di atas tahu.",
      "Kukus mangkuk di atas kukusan Rice Cooker bersamaan saat memasak nasi.",
      "Setelah matang (15 menit), siram dengan 1 sdt minyak wijen hangat."
    ],
    hack: "Kukus mangkuk telur tahu ini persis di atas kukusan rice cooker saat memasak nasi. Hemat listrik & hemat waktu!"
  },
  {
    id: 5,
    title: "Nasi Kuning Harum Rice Cooker",
    price: 11000,
    time: 25,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍚",
    mainIngredient: "Nasi",
    ingredientsBreakdown: [
      { name: "Beras 2 Cangkir", cost: 5000 },
      { name: "Kunyit Bubuk & Santan Instan", cost: 3500 },
      { name: "Daun Jeruk & Serai", cost: 1500 },
      { name: "Garam & Bumbu", cost: 1000 }
    ],
    steps: [
      "Campurkan beras, santan, kunyit bubuk, air, dan bumbu aromatik ke dalam bowl.",
      "Aduk rata agar warna kuning menyebar seimbang.",
      "Tekan tombol Cook dan aduk sesekali saat setengah matang."
    ],
    hack: "Tambahkan perasan air jeruk nipis sedikit agar warna kuning nasi terlihat mengkilap dan segar!"
  },
  {
    id: 6,
    title: "Nasi Kebuli Sederhana Rice Cooker",
    price: 13500,
    time: 30,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍲",
    mainIngredient: "Nasi",
    ingredientsBreakdown: [
      { name: "Beras 2 Cangkir", cost: 5000 },
      { name: "Bumbu Spekoek / Kebuli Saset", cost: 3500 },
      { name: "Sosis/Ayam Suwir", cost: 3500 },
      { name: "Margarin 1 sdm", cost: 1500 }
    ],
    steps: [
      "Tumis bumbu kebuli dengan margarin sebentar.",
      "Masukkan beras, tumisan bumbu, dan air secukupnya ke rice cooker.",
      "Masak hingga matang lalu sajikan dengan taburan bawang goreng."
    ],
    hack: "Gunakan margarin untuk menumis bumbu agar aroma gurih rempahnya langsung mengunci ke beras."
  },
  {
    id: 7,
    title: "Sup Sosis Sayur Rice Cooker",
    price: 10000,
    time: 20,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🥣",
    mainIngredient: "Sosis",
    ingredientsBreakdown: [
      { name: "Sosis Sapi 2 Pcs", cost: 4000 },
      { name: "Wortel & Kentang Iris", cost: 3500 },
      { name: "Bawang Putih & Bumbu Sup", cost: 2500 }
    ],
    steps: [
      "Didihkan air di rice cooker dengan posisi tombol 'Cook'.",
      "Masukkan irisan kentang, wortel, dan geprekan bawang putih.",
      "Masukkan sosis, beri garam dan lada. Masak hingga sayuran empuk."
    ],
    hack: "Potong wortel tipis-tipis agar cepat empuk di dalam panas rice cooker."
  },
  {
    id: 8,
    title: "Bubur Ayam Gurih Rice Cooker",
    price: 9000,
    time: 40,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🥣",
    mainIngredient: "Nasi",
    ingredientsBreakdown: [
      { name: "Beras 1 Cangkir", cost: 2500 },
      { name: "Air 5 Cangkir", cost: 500 },
      { name: "Kaldu Ayam & Bawang Goreng", cost: 2000 },
      { name: "Telur Rebus 1 Pcs", cost: 4000 }
    ],
    steps: [
      "Masukkan beras dan air dengan rasio 1:5 ke rice cooker.",
      "Tambahkan kaldu ayam bubuk dan sedikit garam. Tekan Cook.",
      "Aduk secara berkala hingga tekstur beras pecah menjadi bubur halus."
    ],
    hack: "Buka sedikit tutup rice cooker saat merebus bubur agar kuahnya tidak meluap ke luar!"
  },
  {
    id: 9,
    title: "Nasi Tim Tahu Telur Cincang",
    price: 8500,
    time: 25,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍲",
    mainIngredient: "Tahu",
    ingredientsBreakdown: [
      { name: "Beras 1 Cangkir", cost: 2500 },
      { name: "Tahu Putih Cincang", cost: 2000 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Kecap Manis & Asin", cost: 2000 }
    ],
    steps: [
      "Bumbu tahu cincang dengan kecap manis dan kecap asin.",
      "Letakkan beras dan air di wadah tim tahan panas, susun tahu dan kocokan telur di atasnya.",
      "Kukus wadah tersebut di dalam rice cooker hingga nasi tim lembut matang."
    ],
    hack: "Makanan hangat yang ramah lambung dan cocok dikonsumsi saat merasa kurang sehat."
  },
  {
    id: 10,
    title: "Spaghetti Bolognese Rice Cooker",
    price: 14500,
    time: 20,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍝",
    mainIngredient: "Mie",
    ingredientsBreakdown: [
      { name: "Spaghetti Instant 100g", cost: 5000 },
      { name: "Saus Bolognese Saset", cost: 5500 },
      { name: "Sosis Cincang", cost: 4000 }
    ],
    steps: [
      "Patahkan spaghetti jadi dua, rebus di rice cooker hingga al dente.",
      "Tiriskan sisa air rebusan, tuangkan saus bolognese dan sosis cincang.",
      "Aduk rata dalam posisi Cook selama 3 menit hingga saus meletup."
    ],
    hack: "Patahkan spaghetti agar muat pas di dalam pot rice cooker yang membulat."
  },
  {
    id: 11,
    title: "Pancake Simpel Rice Cooker",
    price: 11500,
    time: 30,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🥞",
    mainIngredient: "Tepung",
    ingredientsBreakdown: [
      { name: "Tepung Terigu 150g", cost: 2500 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Susu UHT 100ml", cost: 3000 },
      { name: "Gula & Margarin", cost: 4000 }
    ],
    steps: [
      "Aduk rata tepung, telur, gula, dan susu hingga adonan halus tanpa gumpalan.",
      "Olesi pot rice cooker dengan margarin, tuang adonan.",
      "Tekan mode Cook. Jika kembali ke Warm, tunggu 5 menit lalu tekan Cook sekali lagi."
    ],
    hack: "Pancake akan mengembang tebal dan empuk seperti kue bolu yang lembut!"
  },
  {
    id: 12,
    title: "Bolu Kukus Cokelat Milo Rice Cooker",
    price: 13000,
    time: 35,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍰",
    mainIngredient: "Tepung",
    ingredientsBreakdown: [
      { name: "Milo Saset 2 Pcs", cost: 5000 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Tepung Terigu 3 sdm", cost: 2000 },
      { name: "Margarin Cair & Gula", cost: 4000 }
    ],
    steps: [
      "Kocok telur dan gula hingga larut, masukkan Milo, tepung, dan margarin cair.",
      "Tuang ke mangkuk tahan panas yang diolesi minyak.",
      "Kukus di atas rice cooker selama 25-30 menit hingga matang."
    ],
    hack: "Gunakan tes tusuk lidi. Jika tidak ada adonan menempel, berarti bolu cokelat sudah matang."
  },
  {
    id: 13,
    title: "Nasi Uduk Gurih Rice Cooker",
    price: 10500,
    time: 25,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍚",
    mainIngredient: "Nasi",
    ingredientsBreakdown: [
      { name: "Beras 2 Cangkir", cost: 5000 },
      { name: "Santan Instan 65ml", cost: 3000 },
      { name: "Daun Salam & Serai", cost: 1500 },
      { name: "Garam Secukupnya", cost: 1000 }
    ],
    steps: [
      "Campur beras, santan, air, garam, serai, dan daun salam.",
      "Tekan Cook, aduk sesekali saat timbul uap agar santan tidak mengendap di bawah.",
      "Tunggu hingga tombol berpindah ke Warm dan nasi tanak."
    ],
    hack: "Sajikan bersama taburan bawang goreng dan irisan telur dadar tipis."
  },
  {
    id: 14,
    title: "Nasi Goreng Tanpa Kompor (Rice Cooker)",
    price: 9500,
    time: 20,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍳",
    mainIngredient: "Nasi",
    ingredientsBreakdown: [
      { name: "Nasi Sisa Kemarin", cost: 3000 },
      { name: "Bumbu Nasgor Saset", cost: 2500 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Margarin 1 sdm", cost: 2000 }
    ],
    steps: [
      "Lelehkan margarin di pot rice cooker pada posisi Cook.",
      "Oreks telur hingga matang, masukkan nasi sisa dingin dan bumbu instan.",
      "Aduk terus hingga nasi hangat terbalut bumbu merata."
    ],
    hack: "Nasi dingin teksturnya lebih pera dan sangat cocok untuk diolah jadi nasi goreng."
  },
  {
    id: 15,
    title: "Kukus Tahu Isi Telur Sayur",
    price: 7500,
    time: 15,
    equipment: "Rice Cooker",
    category: "super_hemat",
    image: "🍲",
    mainIngredient: "Tahu",
    ingredientsBreakdown: [
      { name: "Tahu Cokelat/Pong 5 Pcs", cost: 3000 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Wortel Cincang", cost: 1500 },
      { name: "Bumbu Garam Lada", cost: 1000 }
    ],
    steps: [
      "Belah tahu, masukkan adonan telur kocok dan wortel cincang.",
      "Susun di piring tahan panas.",
      "Kukus di atas rice cooker saat memasak nasi hingga telur mengeras."
    ],
    hack: "Cemilan tinggi protein hemat biaya yang bisa dimasak tanpa menggunakan minyak goreng."
  },
  {
    id: 16,
    title: "Capcay Kukus Praktis Rice Cooker",
    price: 12000,
    time: 15,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🥦",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Sayur Capcay Mix Potong", cost: 5000 },
      { name: "Bakso Sapi 3 Pcs", cost: 4000 },
      { name: "Saus Tiram & Bawang Putih", cost: 3000 }
    ],
    steps: [
      "Tumis bawang putih cincang dengan sedikit minyak di pot rice cooker.",
      "Masukkan bakso dan aneka sayuran capcay.",
      "Beri saus tiram dan sedikit air, masak sebentar hingga sayur matang basah."
    ],
    hack: "Jangan masak terlalu lama agar tekstur wortel dan kembang kol tetap renyah."
  },
  {
    id: 17,
    title: "Kukus Kentang Bumbu Balado",
    price: 8500,
    time: 20,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🥔",
    mainIngredient: "Kentang",
    ingredientsBreakdown: [
      { name: "Kentang 2 Buah", cost: 4500 },
      { name: "Bumbu Balado Tabur", cost: 2500 },
      { name: "Minyak Goreng 1 sdt", cost: 1500 }
    ],
    steps: [
      "Potong kentang dadu, kukus di steamer tray rice cooker hingga empuk.",
      "Pindahkan kentang kukus hangat ke wadah tertutup.",
      "Beri sedikit minyak dan bumbu tabur balado, lalu kocok wadah hingga terbalut rata."
    ],
    hack: "Karbohidrat pengganti nasi yang sehat, lezat, dan cepat kenyang."
  },
  {
    id: 18,
    title: "Ayam Kukus Jahe Kecap Asin",
    price: 14800,
    time: 25,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍗",
    mainIngredient: "Ayam",
    ingredientsBreakdown: [
      { name: "Ayam Potong 150g", cost: 8500 },
      { name: "Irisan Jahe & Bawang Putih", cost: 2000 },
      { name: "Kecap Asin & Minyak Wijen", cost: 4300 }
    ],
    steps: [
      "Marinasi ayam dengan kecap asin, minyak wijen, jahe, dan bawang putih.",
      "Taruh di mangkuk tahan panas.",
      "Kukus di atas rice cooker hingga daging ayam empuk dan mengeluarkan kaldu."
    ],
    hack: "Kuah kaldu hasil kukusan ayam sangat gurih jika disiramkan ke atas nasi hangat."
  },
  {
    id: 19,
    title: "Oatmeal Gurih Telur setengah Matang",
    price: 9000,
    time: 10,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🥣",
    mainIngredient: "Oatmeal",
    ingredientsBreakdown: [
      { name: "Oatmeal Instant 4 sdm", cost: 3000 },
      { name: "Telur Ayam 1 Butir", cost: 2000 },
      { name: "Kaldu Ayam & Kecap Asin", cost: 2000 },
      { name: "Abon Sapi Tabur", cost: 2000 }
    ],
    steps: [
      "Seduh oatmeal dengan air panas dan kaldu di pot rice cooker.",
      "Pecahkan telur di atas oatmeal, tutup rice cooker sebentar hingga telur setengah matang.",
      "Sajikan dengan kecap asin dan taburan abon."
    ],
    hack: "Sarapan sehat kaya serat yang dimasak super cepat di pagi hari."
  },
  {
    id: 20,
    title: "Pepes Tahu Kemangi Rice Cooker",
    price: 7000,
    time: 20,
    equipment: "Rice Cooker",
    category: "super_hemat",
    image: "🌿",
    mainIngredient: "Tahu",
    ingredientsBreakdown: [
      { name: "Tahu Putih 2 Kotak", cost: 3500 },
      { name: "Daun Kemangi & Cabai", cost: 2000 },
      { name: "Daun Pisang / Foil Wrapping", cost: 1500 }
    ],
    steps: [
      "Hancurkan tahu, campur dengan daun kemangi, irisan cabai, dan bumbu penyedap.",
      "Bungkus dengan daun pisang atau aluminium foil.",
      "Kukus di atas kukusan rice cooker selama 20 menit."
    ],
    hack: "Daun kemangi memberikan aroma wangi menggugah selera tanpa perlu dibakar."
  },
  {
    id: 21,
    title: "Mie Instant Rebus Telur Rice Cooker",
    price: 6500,
    time: 8,
    equipment: "Rice Cooker",
    category: "super_hemat",
    image: "🍜",
    mainIngredient: "Mie",
    ingredientsBreakdown: [
      { name: "Mie Instant Kuah", cost: 3500 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Cabai Rawit Iris", cost: 1000 }
    ],
    steps: [
      "Didihkan air di rice cooker, masukkan mie dan bumbu.",
      "Pecahkan telur, biarkan utuh atau diacak sesuai selera.",
      "Masak selama 3 menit hingga mie matang pas."
    ],
    hack: "Penyelamat lapar malam hari paling praktis tanpa perlu menyalakan kompor."
  },
  {
    id: 22,
    title: "Nasi Jagung Manis Gurih",
    price: 8000,
    time: 25,
    equipment: "Rice Cooker",
    category: "super_hemat",
    image: "🌽",
    mainIngredient: "Nasi",
    ingredientsBreakdown: [
      { name: "Beras 2 Cangkir", cost: 5000 },
      { name: "Jagung Manis Pipil 50g", cost: 2000 },
      { name: "Margarin & Garam", cost: 1000 }
    ],
    steps: [
      "Masukkan beras, air, pipilan jagung manis, dan sedikit margarin ke rice cooker.",
      "Masak seperti biasa hingga matang.",
      "Aduk rata sebelum disajikan."
    ],
    hack: "Rasa manis alami dari jagung berpadu sempurna dengan gurihnya margarin."
  },
  {
    id: 23,
    title: "Kukus Bawang Tempe Sambal Kecap",
    price: 6000,
    time: 15,
    equipment: "Rice Cooker",
    category: "super_hemat",
    image: "🧀",
    mainIngredient: "Tempe",
    ingredientsBreakdown: [
      { name: "Tempe 1/2 Papan", cost: 3000 },
      { name: "Kecap Manis & Cabai", cost: 2000 },
      { name: "Bawang Merah Iris", cost: 1000 }
    ],
    steps: [
      "Potong tempe, kukus di rice cooker hingga empuk.",
      "Buat sambal kecap dari irisan cabai, bawang merah, dan kecap manis.",
      "Cocol tempe kukus hangat ke dalam sambal kecap."
    ],
    hack: "Menu sehat bebas minyak goreng yang super hemat anggaran."
  },
  {
    id: 24,
    title: "Puding Cokelat Instan Rice Cooker",
    price: 9500,
    time: 15,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "Puding",
    mainIngredient: "Puding",
    ingredientsBreakdown: [
      { name: "Bubuk Puding Cokelat", cost: 6000 },
      { name: "Susu Kental Manis 1 Saset", cost: 2000 },
      { name: "Air 500ml", cost: 1500 }
    ],
    steps: [
      "Aduk bubuk puding, air, dan susu kental manis di pot rice cooker.",
      "Tekan Cook sambil terus diaduk hingga mendidih.",
      "Tuang ke cetakan lalu dinginkan di dalam kulkas."
    ],
    hack: "Terus aduk adonan puding agar tidak mengendap dan gosong di dasar pot."
  },
  {
    id: 25,
    title: "Sup Jamur Tiram Bening",
    price: 8500,
    time: 15,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍄",
    mainIngredient: "Jamur",
    ingredientsBreakdown: [
      { name: "Jamur Tiram 100g", cost: 4000 },
      { name: "Bawang Putih & Bumbu Sup", cost: 2500 },
      { name: "Daun Bawang", cost: 2000 }
    ],
    steps: [
      "Suwir jamur tiram, cuci bersih dan peras airnya.",
      "Didihkan air di rice cooker dengan tumisan bawang putih.",
      "Masukkan jamur dan bumbu, masak 5 menit hingga layu."
    ],
    hack: "Peras jamur tiram setelah dicuci agar bau langu tanahnya hilang."
  },
  {
    id: 26,
    title: "Nasi Kebuli Sosis Rice Cooker",
    price: 12500,
    time: 25,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🌭",
    mainIngredient: "Nasi",
    ingredientsBreakdown: [
      { name: "Beras 2 Cangkir", cost: 5000 },
      { name: "Sosis Sapi 2 Pcs", cost: 4000 },
      { name: "Bumbu Kebuli Instan", cost: 3500 }
    ],
    steps: [
      "Campurkan beras, air, irisan sosis, dan bumbu kebuli di rice cooker.",
      "Aduk rata dan tekan tombol Cook.",
      "Setelah matang, diamkan 5 menit sebelum diaduk."
    ],
    hack: "Menu kaya rempah beraroma mewah dengan harga merakyat."
  },
  {
    id: 27,
    title: "Kukus Sawi Roll Isi Tahu",
    price: 9000,
    time: 20,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🥬",
    mainIngredient: "Tahu",
    ingredientsBreakdown: [
      { name: "Sawi Putih 5 Lembar", cost: 2500 },
      { name: "Tahu Putih Halus", cost: 3500 },
      { name: "Bumbu Kaldu & Lada", cost: 3000 }
    ],
    steps: [
      "Layukan daun sawi putih dengan air panas.",
      "Isi daun sawi dengan adonan tahu berbumbu, lalu gulung rapi.",
      "Kukus roll sawi di atas rice cooker selama 15 menit."
    ],
    hack: "Hidangan ala dimsum sehat yang kaya nutrisi dan lezat."
  },
  {
    id: 28,
    title: "Nasi Merah Kukus Simpel",
    price: 11000,
    time: 35,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍚",
    mainIngredient: "Nasi",
    ingredientsBreakdown: [
      { name: "Beras Merah 2 Cangkir", cost: 8000 },
      { name: "Air Secukupnya", cost: 1000 },
      { name: "Garam Sedikit", cost: 2000 }
    ],
    steps: [
      "Rendam beras merah selama 30 menit sebelum dimasak.",
      "Tambahkan air lebih banyak dibanding memasak beras putih biasa.",
      "Masak hingga rice cooker berpindah ke tombol Warm."
    ],
    hack: "Merendam beras merah terlebih dahulu membuat tekstur hasilnya jauh lebih pulen dan lembut."
  },
  {
    id: 29,
    title: "Sup Bakso Tahu Bening",
    price: 11500,
    time: 15,
    equipment: "Rice Cooker",
    category: "hemat",
    image: "🍲",
    mainIngredient: "Bakso",
    ingredientsBreakdown: [
      { name: "Bakso Sapi 5 Pcs", cost: 5000 },
      { name: "Tahu Putih 2 Kotak", cost: 3500 },
      { name: "Bumbu Kuah Bakso Instan", cost: 3000 }
    ],
    steps: [
      "Didihkan air di pot rice cooker.",
      "Masukkan bumbu bakso, potongan tahu, dan bakso sapi yang diserat.",
      "Masak hingga bakso mengapung mekar."
    ],
    hack: "Kerat silang bagian atas bakso agar bumbu kuah meresap ke dalam."
  },
  {
    id: 30,
    title: "Kukus Jagung Manis Mentega",
    price: 7000,
    time: 15,
    equipment: "Rice Cooker",
    category: "super_hemat",
    image: "🌽",
    mainIngredient: "Jagung",
    ingredientsBreakdown: [
      { name: "Jagung Manis 1 Tongkol", cost: 4000 },
      { name: "Mentega / Margarin", cost: 2000 },
      { name: "Garam Sedikit", cost: 1000 }
    ],
    steps: [
      "Potong jagung jadi 3 bagian.",
      "Kukus di steamer tray rice cooker selama 15 menit.",
      "Olesi mentega selagi jagung masih panas membara."
    ],
    hack: "Cemilan manis gurih bergizi yang sangat mudah disiapkan."
  },

  // --- KOMPOR 1 TUNGKU SPECIAL (31-80) ---
  {
    id: 31,
    title: "Tumis Tahu Kecap Saus Tiram",
    price: 7000,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🥘",
    mainIngredient: "Tahu",
    ingredientsBreakdown: [
      { name: "Tahu Putih 1 Kotak Besar", cost: 3500 },
      { name: "Kecap Manis & Saus Tiram", cost: 2000 },
      { name: "Bawang Putih & Cabai Rawit", cost: 1500 }
    ],
    steps: [
      "Potong tahu dadu kecil, goreng sebentar hingga setengah berkulit.",
      "Tumis cincangan bawang putih dan cabai hingga harum.",
      "Masukkan tahu, tambahkan kecap manis, saus tiram, sedikit air, lalu aduk hingga bumbu meresap."
    ],
    hack: "Goreng tahu setengah matang saja agar bagian dalamnya tetap lembut dan mudah menyerap bumbu kecap."
  },
  {
    id: 32,
    title: "Orak-Arik Telur Tempe Cabe Garam",
    price: 9000,
    time: 12,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🍳",
    mainIngredient: "Tempe",
    ingredientsBreakdown: [
      { name: "Tempe 1/2 Papan", cost: 3000 },
      { name: "Telur Ayam 2 Butir", cost: 4000 },
      { name: "Cabai Rawit & Bawang Putih", cost: 2000 }
    ],
    steps: [
      "Potong tempe dadu kecil, goreng hingga krispi, sisihkan.",
      "Buat orak-arik telur di wajan yang sama, campurkan dengan tempe goreng.",
      "Tumis irisan cabai rawit dan bawang putih yang melimpah, beri garam dan kaldu bubuk, aduk rata."
    ],
    hack: "Goreng tempe sampai benar-benar kering agar saat dicampur bumbu cabe garam teksturnya tetap renyah!"
  },
  {
    id: 33,
    title: "Sup Tahu Telur Kuah Bening",
    price: 8000,
    time: 15,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🍲",
    mainIngredient: "Telur",
    ingredientsBreakdown: [
      { name: "Telur Ayam 2 Butir", cost: 4000 },
      { name: "Tahu Sutra / Sutri 1 Tube", cost: 2500 },
      { name: "Daun Bawang & Bumbu", cost: 1500 }
    ],
    steps: [
      "Didihkan 500ml air di panci, masukkan potong tahu sutra.",
      "Kocok telur, tuangkan perlahan ke dalam air mendidih sambil diaduk memutar agar membentuk serabut.",
      "Tambahkan garam, lada, kaldu bubuk, dan taburan daun bawang. Sajikan hangat."
    ],
    hack: "Aduk kuah secara melingkar searah jarum jam saat memasukkan telur kocok untuk mendapatkan tekstur serabut kuah yang cantik."
  },
  {
    id: 34,
    title: "Mie Dok-Dok Kuah Kental Kemulian",
    price: 10000,
    time: 12,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🍜",
    mainIngredient: "Mie",
    ingredientsBreakdown: [
      { name: "Mie Instant Kuah 1 Bungkus", cost: 3500 },
      { name: "Telur Ayam 1 Butir", cost: 2000 },
      { name: "Sawi Caisim & Cabai Rawit", cost: 2000 },
      { name: "Saus Sambal & Kecap", cost: 2500 }
    ],
    steps: [
      "Tumis irisan bawang merah, putih, dan cabai rawit hingga harum.",
      "Tuangkan 350ml air, masukkan mie instan dan sayuran caisim.",
      "Saat air mendidih, pecahkan telur dan kocok langsung di dalam kuah untuk mengentalkan kuah dok-dok."
    ],
    hack: "Tambahkan 1 sendok makan saus sambal dan sedikit kecap manis saat merebus agar kuah dok-dok berwarna merah pekat berkaldu."
  },
  {
    id: 35,
    title: "Omelet Mie Telur Daun Bawang",
    price: 8500,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🍕",
    mainIngredient: "Mie",
    ingredientsBreakdown: [
      { name: "Mie Instant Goreng 1 Pcs", cost: 3500 },
      { name: "Telur Ayam 2 Butir", cost: 4000 },
      { name: "Daun Bawang 1 Batang", cost: 1000 }
    ],
    steps: [
      "Rebus mie hingga matang, tiriskan lalu campurkan dengan bumbunya.",
      "Kocok 2 butir telur dan irisan daun bawang, campurkan mie rebus ke dalamnya.",
      "Goreng di teflon dengan api kecil hingga kedua sisinya berwarna kuning keemasan."
    ],
    hack: "Gunakan api paling kecil dan tutup teflon saat menggoreng agar bagian dalam omelet matang sempurna tanpa gosong di luar."
  },
  {
    id: 36,
    title: "Telur Balado Simple Saus Sambal",
    price: 9500,
    time: 15,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🥚",
    mainIngredient: "Telur",
    ingredientsBreakdown: [
      { name: "Telur Ayam Rebus 3 Butir", cost: 6000 },
      { name: "Saus Sambal Botolan 3 sdm", cost: 2000 },
      { name: "Bawang Merah & Putih", cost: 1500 }
    ],
    steps: [
      "Goreng telur yang sudah direbus hingga permukaannya berkulit.",
      "Tumis bawang merah dan putih cincang hingga harum.",
      "Masukkan saus sambal, sedikit gula, dan sedikit air. Masukkan telur goreng dan aduk hingga bumbu menempel."
    ],
    hack: "Kerat-kerat sedikit permukaan telur rebus sebelum digoreng agar bumbu balado meresap sampai ke dalam."
  },
  {
    id: 37,
    title: "Sosis Oseng Bawang Mentega",
    price: 11000,
    time: 8,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🌭",
    mainIngredient: "Sosis",
    ingredientsBreakdown: [
      { name: "Sosis Sapi 3 Pcs", cost: 6000 },
      { name: "Mentega / Margarin 1 sdm", cost: 2000 },
      { name: "Bawang Bombay 1/2 Biji", cost: 3000 }
    ],
    steps: [
      "Potong sosis menjadi bagian kecil lalu kerat-kerat permukaannya.",
      "Lelehkan mentega di wajan, tumis irisan bawang bombay hingga layu dan harum.",
      "Masukkan sosis, oseng hingga sosis mekar dan terbalut mentega gurih."
    ],
    hack: "Kerat sosis secara melintang cukup dalam agar mentega dan gurihnya bawang bombay meresap ke serat sosis terluar."
  },
  {
    id: 38,
    title: "Tumis Kangkung Terasi Pedas",
    price: 6500,
    time: 8,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🥬",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Kangkung 1 Ikat", cost: 3000 },
      { name: "Terasi Bakar 1/2 Pcs", cost: 1000 },
      { name: "Cabai Rawit & Bawang", cost: 2500 }
    ],
    steps: [
      "Tumis irisan bawang, cabai, dan terasi yang sudah dihancurkan.",
      "Masukkan kangkung yang sudah dicuci bersih, gunakan api besar.",
      "Beri sedikit garam dan gula, aduk cepat selama 2 menit lalu angkat."
    ],
    hack: "Memasak kangkung dengan api besar secara cepat menjaga warnanya tetap hijau segar dan renyah."
  },
  {
    id: 39,
    title: "Tempe Penyet Sambal Bawang",
    price: 6000,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🧀",
    mainIngredient: "Tempe",
    ingredientsBreakdown: [
      { name: "Tempe 1/2 Papan", cost: 3000 },
      { name: "Cabai Rawit Merah 10 Pcs", cost: 2000 },
      { name: "Bawang Putih & Minyak Panas", cost: 1000 }
    ],
    steps: [
      "Goreng tempe hingga matang kecokelatan.",
      "Ulek kasar cabai rawit, bawang putih, dan garam di cobek.",
      "Siram sambal dengan 1 sdm minyak panas bekas goreng tempe, lalu penyet tempe di atasnya."
    ],
    hack: "Menyiram minyak panas ke atas ulekan sambal mentah membuat aromanya sangat gurih wangi."
  },
  {
    id: 40,
    title: "Terong Balado Pedas Manis",
    price: 7500,
    time: 12,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🍆",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Terong Ungu 2 Buah", cost: 3500 },
      { name: "Bumbu Balado Instan", cost: 2500 },
      { name: "Minyak Goreng", cost: 1500 }
    ],
    steps: [
      "Potong terong, goreng sebentar hingga layu.",
      "Tumis bumbu balado dengan sedikit minyak hingga harum.",
      "Masukkan terong goreng, aduk rata hingga bumbu terbalut sempurna."
    ],
    hack: "Goreng terong dengan minyak yang sudah benar-benar panas agar terong tidak menyerap terlalu banyak minyak."
  },
  {
    id: 41,
    title: "Orak-Arik Buncis Telur",
    price: 8500,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🍳",
    mainIngredient: "Telur",
    ingredientsBreakdown: [
      { name: "Buncis Iris 100g", cost: 3000 },
      { name: "Telur Ayam 2 Butir", cost: 4000 },
      { name: "Bawang Putih & Lada", cost: 1500 }
    ],
    steps: [
      "Tumis bawang putih cincang hingga wangi.",
      "Masukkan irisan buncis, tumis hingga setengah layu.",
      "Pindahkan buncis ke pinggir wajan, orak-arik telur di tengah wajan lalu campur rata."
    ],
    hack: "Menu kombinasi serat dan protein yang sangat pas disajikan untuk makan siang."
  },
  {
    id: 42,
    title: "Tahu Cabe Garam Krispi",
    price: 8000,
    time: 15,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🥘",
    mainIngredient: "Tahu",
    ingredientsBreakdown: [
      { name: "Tahu Putih Potong Dadu", cost: 3500 },
      { name: "Tepung Maizena / Serbaguna", cost: 2000 },
      { name: "Cabai Rawit & Bawang Putih Cincang", cost: 2500 }
    ],
    steps: [
      "Baluri potong tahu dengan tepung kering, goreng hingga garing krispi.",
      "Tumis bawang putih dan cabai cincang melimpah hingga harum dan agak kering.",
      "Masukkan tahu krispi, beri garam dan kaldu bubuk, aduk cepat lalu angkat."
    ],
    hack: "Pastikan tumisan bawang putih dan cabai sudah matang kering sebelum tahu dimasukkan agar tahu tidak lembek."
  },
  {
    id: 43,
    title: "Fu Yung Hai Tahu Telur Simpel",
    price: 9500,
    time: 12,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🍳",
    mainIngredient: "Telur",
    ingredientsBreakdown: [
      { name: "Telur Ayam 2 Butir", cost: 4000 },
      { name: "Tahu Halus & Kol Iris", cost: 3000 },
      { name: "Saus Tomat & Sambal Saset", cost: 2500 }
    ],
    steps: [
      "Kocok telur, tahu halus, dan irisan kol. Goreng tebal seperti dadar.",
      "Buat saus: didihkan saus tomat, saus sambal, sedikit gula, dan air.",
      "Siram saus asam manis di atas dadar fu yung hai."
    ],
    hack: "Tambahkan 1 sdm tepung terigu ke kocokan telur agar dadar tebal dan tidak mudah hancur saat dibalik."
  },
  {
    id: 44,
    title: "Tumis Sawi Hijau Bakso",
    price: 9000,
    time: 8,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🥬",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Sawi Hijau 1 Ikat", cost: 3000 },
      { name: "Bakso Sapi 4 Pcs", cost: 4000 },
      { name: "Bawang Putih & Bumbu", cost: 2000 }
    ],
    steps: [
      "Tumis irisan bawang putih hingga harum.",
      "Masukkan irisan bakso sapi, tumis sebentar.",
      "Masukkan sawi hijau, tambahkan sedikit air, garam, dan lada. Masak sebentar."
    ],
    hack: "Potong batang sawi lebih tipis dari daunnya agar keduanya matang bersamaan."
  },
  {
    id: 45,
    title: "Sambal Goreng Ati Ampela Simpel",
    price: 13500,
    time: 20,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🥘",
    mainIngredient: "Ayam",
    ingredientsBreakdown: [
      { name: "Ati Ampela 2 Pasang", cost: 7000 },
      { name: "Bumbu Balado / Sambal Instan", cost: 3500 },
      { name: "Kentang Potong Dadu", cost: 3000 }
    ],
    steps: [
      "Rebus ati ampela lalu potong dadu, goreng sebentar bersama kentang.",
      "Tumis bumbu balado hingga matang wangi.",
      "Masukkan ati ampela dan kentang goreng, aduk hingga bumbu terbalut sempurna."
    ],
    hack: "Rebus ati ampela dengan sedikit jahe geprek untuk menghilangkan bau amisnya."
  },
  {
    id: 46,
    title: "Gorengan Bakwan Sayur Krispi",
    price: 6000,
    time: 15,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🥙",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Kol & Wortel Iris", cost: 2500 },
      { name: "Tepung Terigu Serbaguna", cost: 2500 },
      { name: "Bumbu Penyedap", cost: 1000 }
    ],
    steps: [
      "Campur tepung terigu, air, dan bumbu hingga jadi adonan kental.",
      "Masukkan irisan kol dan wortel, aduk rata.",
      "Goreng sendok demi sendok dalam minyak panas hingga kuning keemasan."
    ],
    hack: "Gunakan air es saat membuat adonan tepung agar hasil bakwan lebih krispi tahan lama."
  },
  {
    id: 47,
    title: "Tumis Toge Tahu Kuning",
    price: 7000,
    time: 7,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🌱",
    mainIngredient: "Tahu",
    ingredientsBreakdown: [
      { name: "Toge Segar 100g", cost: 2000 },
      { name: "Tahu Kuning 2 Pcs", cost: 3000 },
      { name: "Daun Bawang & Bawang Putih", cost: 2000 }
    ],
    steps: [
      "Potong tahu dadu, goreng setengah matang.",
      "Tumis bawang putih cincang, masukkan toge dan tahu.",
      "Beri sedikit saus tiram dan garam, tumis cepat 2 menit."
    ],
    hack: "Toge hanya perlu dimasak sebentar agar teksturnya tetap renyah saat dikunyah."
  },
  {
    id: 48,
    title: "Telur Ceplok Kecap Mentega",
    price: 7500,
    time: 7,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🍳",
    mainIngredient: "Telur",
    ingredientsBreakdown: [
      { name: "Telur Ayam 2 Butir", cost: 4000 },
      { name: "Mentega 1 sdm", cost: 1500 },
      { name: "Kecap Manis & Bawang Merah", cost: 2000 }
    ],
    steps: [
      "Goreng ceplok 2 butir telur, sisihkan.",
      "Lelehkan mentega, tumis irisan bawang merah hingga harum.",
      "Masukkan kecap manis dan sedikit air, siramkan saus ke atas telur ceplok."
    ],
    hack: "Menu kilat tanggal tua yang disukai semua anak kost."
  },
  {
    id: 49,
    title: "Sosis Bakar Teplon Saus Barbeque",
    price: 12000,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🌭",
    mainIngredient: "Sosis",
    ingredientsBreakdown: [
      { name: "Sosis Sapi Jumbo 2 Pcs", cost: 7000 },
      { name: "Saus Barbeque Saset", cost: 3500 },
      { name: "Margarin", cost: 1500 }
    ],
    steps: [
      "Kerat-kerat sosis sapi.",
      "Olesi teflon dengan margarin, panggang sosis sambil diolesi saus barbeque.",
      "Panggang hingga sosis mekar dan saus berkaramel."
    ],
    hack: "Gunakan api sedang agar saus barbeque berkaramel tanpa membuat sosis gosong."
  },
  {
    id: 50,
    title: "Sambal Terung Pipit / Rimbang",
    price: 6500,
    time: 12,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🫛",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Terung Pipit 100g", cost: 3000 },
      { name: "Ikan Bilis / Teri 30g", cost: 2500 },
      { name: "Cabai Merah & Bawang", cost: 1000 }
    ],
    steps: [
      "Goreng teri hingga garing, sisihkan.",
      "Tumis sambal merah halus hingga harum, masukkan terung pipit.",
      "Masak hingga terung layu, campurkan teri goreng sebelum diangkat."
    ],
    hack: "Lauk khas Sumatra yang sangat nikmat dimakan bersama nasi hangat."
  },
  {
    id: 51,
    title: "Ayam Goreng Tepung Krispi Simpel",
    price: 14000,
    time: 20,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🍗",
    mainIngredient: "Ayam",
    ingredientsBreakdown: [
      { name: "Dada Ayam Potong 150g", cost: 8500 },
      { name: "Tepung Bumbu Krispi Instan", cost: 3500 },
      { name: "Minyak Goreng", cost: 2000 }
    ],
    steps: [
      "Bagi tepung jadi adonan basah dan adonan kering.",
      "Celupkan ayam ke adonan basah, lalu baluri adonan kering sambil diremas.",
      "Goreng dalam minyak panas hingga berwarna kuning keemasan."
    ],
    hack: "Remas-remas ayam saat dibaluri tepung kering untuk mendapatkan keriting tepung krispi ala restoran."
  },
  {
    id: 52,
    title: "Nasi Goreng Kampung Cabe Rawit",
    price: 8500,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🍳",
    mainIngredient: "Nasi",
    ingredientsBreakdown: [
      { name: "Nasi Putih Cold", cost: 3000 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Bawang Merah & Cabai Rawit Ulek", cost: 2000 },
      { name: "Terasi Sedikit", cost: 1500 }
    ],
    steps: [
      "Tumis ulekan bawang merah, cabai rawit, dan sedikit terasi.",
      "Sisihkan bumbu di tepi wajan, orak-arik telur.",
      "Masukkan nasi putih, beri garam dan kaldu, aduk dengan api besar."
    ],
    hack: "Aroma terasi dan cabai rawit memberikan sensasi gurih pedas ala pedesaan."
  },
  {
    id: 53,
    title: "Tumis Buncis Jagung Manis",
    price: 7500,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🌽",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Buncis Iris 100g", cost: 3000 },
      { name: "Jagung Manis Pipil", cost: 2500 },
      { name: "Bawang Putih & Saus Tiram", cost: 2000 }
    ],
    steps: [
      "Tumis bawang putih hingga harum.",
      "Masukkan pipilan jagung dan irisan buncis.",
      "Beri sedikit air dan saus tiram, masak hingga sayuran matang."
    ],
    hack: "Warna hijau buncis dan kuning jagung membuat tampilan hidangan menarik selera."
  },
  {
    id: 54,
    title: "Perkedel Tahu Kornet Sederhana",
    price: 11000,
    time: 15,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🧆",
    mainIngredient: "Tahu",
    ingredientsBreakdown: [
      { name: "Tahu Putih 2 Kotak", cost: 3500 },
      { name: "Kornet Sapi Saset 1 Pcs", cost: 4500 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Tepung Terigu 1 sdm", cost: 1000 }
    ],
    steps: [
      "Hancurkan tahu, campur dengan kornet, tepung, dan bumbu penyedap.",
      "Bentuk adonan menjadi bulatan pipih.",
      "Celupkan ke kocokan telur lalu goreng hingga matang kecokelatan."
    ],
    hack: "Kornet sapi memberikan rasa gurih daging yang kuat pada adonan tahu."
  },
  {
    id: 55,
    title: "Sup Pare Bening Tidak Pahit",
    price: 7000,
    time: 15,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🥣",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Pare 1 Buah", cost: 3000 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Bawang Putih & Garam", cost: 2000 }
    ],
    steps: [
      "Iris pare, remas-remas dengan garam dapur hingga layu lalu cuci bersih.",
      "Didihkan air, tumis bawang putih dan masukkan pare.",
      "Tuang telur kocok, beri kaldu bubuk lalu sajikan."
    ],
    hack: "Meremas pare dengan garam dapur efektif membilas rasa pahit berlebih pada pare."
  },
  {
    id: 56,
    title: "Sosis Asam Manis Pedas",
    price: 10500,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🌭",
    mainIngredient: "Sosis",
    ingredientsBreakdown: [
      { name: "Sosis 3 Pcs", cost: 6000 },
      { name: "Saus Tomat & Sambal", cost: 2500 },
      { name: "Bawang Bombay Iris", cost: 2000 }
    ],
    steps: [
      "Goreng sosis setengah matang.",
      "Tumis bawang bombay, masukkan saus tomat, saus sambal, dan sedikit air.",
      "Masukkan sosis, masak hingga saus mengental menempel pada sosis."
    ],
    hack: "Perpaduan rasa asam, manis, dan pedas yang sangat membangkitkan selera makan."
  },
  {
    id: 57,
    title: "Tumis Jamur Tiram Cabe Hijau",
    price: 8500,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🍄",
    mainIngredient: "Jamur",
    ingredientsBreakdown: [
      { name: "Jamur Tiram 100g", cost: 4000 },
      { name: "Cabai Hijau Besar 3 Pcs", cost: 2500 },
      { name: "Bawang Merah & Putih", cost: 2000 }
    ],
    steps: [
      "Suwir jamur tiram, cuci dan peras hingga kering.",
      "Tumis irisan bawang dan cabai hijau hingga layu.",
      "Masukkan jamur, beri saus tiram dan garam, aduk hingga matang."
    ],
    hack: "Tekstur jamur tiram yang kenyal mirip seperti daging ayam suwir."
  },
  {
    id: 58,
    title: "Telur Dadar Padang Tebal",
    price: 9000,
    time: 15,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🍳",
    mainIngredient: "Telur",
    ingredientsBreakdown: [
      { name: "Telur Ayam 2 Butir", cost: 4000 },
      { name: "Tepung Beras 1 sdm", cost: 1000 },
      { name: "Daun Bawang & Cabai Iris", cost: 2500 },
      { name: "Bumbu Kunyit Bubuk", cost: 1500 }
    ],
    steps: [
      "Kocok telur, tepung beras, irisan daun bawang, cabai, dan bumbu.",
      "Goreng dalam minyak panas agak banyak dengan api kecil.",
      "Balik sekali saat bagian bawah sudah matang kokoh."
    ],
    hack: "Penambahan tepung beras membuat struktur telur dadar menjadi tebal dan gurih krispi di luar."
  },
  {
    id: 59,
    title: "Sambal Terasi Goreng Lahap",
    price: 5000,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🌶️",
    mainIngredient: "Sambal",
    ingredientsBreakdown: [
      { name: "Cabai Rawit & Merah", cost: 2500 },
      { name: "Terasi Bakar 1 Saset", cost: 1000 },
      { name: "Tomat & Bawang Merah", cost: 1500 }
    ],
    steps: [
      "Goreng cabai, tomat, dan bawang sebentar.",
      "Ulek bersama terasi, garam, dan sedikit gula merah.",
      "Goreng kembali sambal ulek dengan sedikit minyak hingga matang tanak."
    ],
    hack: "Menggoreng ulang sambal ulek membuat sambal lebih awet dan tahan disimpan beberapa hari."
  },
  {
    id: 60,
    title: "Kwetiau Goreng Simpel Telur",
    price: 11000,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🍝",
    mainIngredient: "Mie",
    ingredientsBreakdown: [
      { name: "Kwetiau Basah 150g", cost: 4500 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Caisim & Toge", cost: 2000 },
      { name: "Kecap Manis & Asin", cost: 2500 }
    ],
    steps: [
      "Oreks telur di wajan, masukkan irisan sayur caisim dan toge.",
      "Masukkan kwetiau basah, tuangkan kecap manis, kecap asin, dan saus tiram.",
      "Aduk dengan api besar hingga kwetiau terbalut bumbu merata."
    ],
    hack: "Gunakan kwetiau basah untuk proses memasak yang lebih cepat tanpa perlu direbus terlebih dahulu."
  },
  {
    id: 61,
    title: "Tumis Terong Kecap Pedas",
    price: 7000,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🍆",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Terong Ungu 2 Buah", cost: 3500 },
      { name: "Kecap Manis & Cabai", cost: 2000 },
      { name: "Bawang Putih Cincang", cost: 1500 }
    ],
    steps: [
      "Potong terong, tumis langsung bersama bawang putih dan cabai.",
      "Tuangkan kecap manis dan sedikit air.",
      "Masak hingga kuah kecap meresap dan terong empuk."
    ],
    hack: "Menumis terong tanpa digoreng terlebih dahulu menghemat minyak goreng dan kalori."
  },
  {
    id: 62,
    title: "Perkedel Tempe Bumbu Ketumbar",
    price: 6500,
    time: 15,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🧀",
    mainIngredient: "Tempe",
    ingredientsBreakdown: [
      { name: "Tempe 1/2 Papan", cost: 3000 },
      { name: "Ketumbar Bubuk & Garam", cost: 1500 },
      { name: "Tepung Terigu 1 sdm", cost: 1000 },
      { name: "Telur 1/2 Butir untuk baluran", cost: 1000 }
    ],
    steps: [
      "Kukus atau rebus tempe, lalu hancurkan selagi hangat.",
      "Campur dengan ketumbar bubuk, garam, dan tepung terigu. Bentuk pipih.",
      "Baluri kocokan telur lalu goreng hingga keemasan."
    ],
    hack: "Aroma ketumbar bubuk yang khas membuat rasa perkedel tempe mirip seperti lauk di warung makan."
  },
  {
    id: 63,
    title: "Tumis Labu Siam Iris Telur",
    price: 7500,
    time: 12,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🥒",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Labu Siam Iris 1 Buah", cost: 2500 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Cabai Merah & Bawang", cost: 3000 }
    ],
    steps: [
      "Remas irisan labu siam dengan garam untuk menghilangkan getahnya, cuci bersih.",
      "Tumis bawang dan cabai, masukkan labu siam.",
      "Pindahkan sayur ke tepi wajan, orak-arik telur lalu campur rata."
    ],
    hack: "Meremas labu siam dengan garam membuat teksturnya menjadi lebih lemas dan lembut saat ditumis."
  },
  {
    id: 64,
    title: "Mie Goreng Jawa Simpel",
    price: 9500,
    time: 12,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🍝",
    mainIngredient: "Mie",
    ingredientsBreakdown: [
      { name: "Mie Telur Urai 1/2 Bungkus", cost: 3000 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Kol Iris & Daun Bawang", cost: 2000 },
      { name: "Kecap Manis & Bumbu Ulek", cost: 2500 }
    ],
    steps: [
      "Rebus mie telur hingga matang, tiriskan.",
      "Tumis bumbu halus (bawang putih, kemiri, lada). Masukkan telur dan sayuran.",
      "Masukkan mie dan kecap manis, aduk hingga bumbu meresap kecokelatan."
    ],
    hack: "Tambahkan sedikit kemiri pada bumbu halus untuk mendapatkan cita rasa mie goreng khas Jawa."
  },
  {
    id: 65,
    title: "Tumis Sawi Putih Tahu Pong",
    price: 8000,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🥬",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Sawi Putih 1/2 Bonggol", cost: 3000 },
      { name: "Tahu Pong/Cokelat 4 Pcs", cost: 2500 },
      { name: "Bawang Putih & Saus Tiram", cost: 2500 }
    ],
    steps: [
      "Potong sawi putih dan belah dua tahu pong.",
      "Tumis bawang putih cincang hingga wangi, masukkan tahu dan sawi putih.",
      "Beri saus tiram, garam, dan sedikit air. Masak sebentar hingga layu."
    ],
    hack: "Tahu pong menyerap kuah tumisan dengan sangat baik, membuat setiap gigitannya kaya rasa."
  },
  {
    id: 66,
    title: "Dadar Jagung / Bakwan Jagung Renyah",
    price: 8500,
    time: 15,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🌽",
    mainIngredient: "Jagung",
    ingredientsBreakdown: [
      { name: "Jagung Manis Pipil 1 Buah", cost: 3500 },
      { name: "Tepung Terigu & Tepung Beras", cost: 2500 },
      { name: "Daun Seledri & Bumbu", cost: 2500 }
    ],
    steps: [
      "Ulek kasar sebagian jagung manis, biarkan sisanya utuh.",
      "Campurkan tepung terigu, tepung beras, air, seledri, dan bumbu halus.",
      "Goreng sendok demi sendok dalam minyak panas hingga renyah keemasan."
    ],
    hack: "Mengulek sebagian jagung membuat adonan menyatu sempurna tanpa perlu menggunakan banyak tepung."
  },
  {
    id: 67,
    title: "Orak-Arik Kol Telur Pedas",
    price: 6500,
    time: 7,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🍳",
    mainIngredient: "Telur",
    ingredientsBreakdown: [
      { name: "Kol Iris 100g", cost: 2000 },
      { name: "Telur Ayam 1 Butir", cost: 2000 },
      { name: "Cabai Rawit & Bawang Merah", cost: 2500 }
    ],
    steps: [
      "Tumis irisan bawang dan cabai rawit hingga wangi.",
      "Masukkan irisan kol, tumis hingga setengah layu.",
      "Masukkan telur, orak-arik hingga mengering dan menyatu dengan kol."
    ],
    hack: "Menu ekonomis kilat yang kaya nutrisi dan tetap lezat."
  },
  {
    id: 68,
    title: "Sambal Cumi Asin Cabai Hijau",
    price: 14500,
    time: 15,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🦑",
    mainIngredient: "Seafood",
    ingredientsBreakdown: [
      { name: "Cumi Asin 50g", cost: 8000 },
      { name: "Cabai Hijau & Tomat Hijau", cost: 4000 },
      { name: "Bawang Merah & Putih", cost: 2500 }
    ],
    steps: [
      "Seduh cumi asin dengan air panas lalu potong-potong.",
      "Goreng cumi sebentar, tumis ulekan kasar cabai hijau dan bawang.",
      "Masukkan cumi asin, beri sedikit gula dan garam, aduk rata."
    ],
    hack: "Seduh cumi asin dengan air panas terlebih dahulu untuk mengurangi rasa asin berlebih dan melunakkan teksturnya."
  },
  {
    id: 69,
    title: "Tumis Kacang Panjang Tempe",
    price: 7000,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🌱",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Kacang Panjang 1/2 Ikat", cost: 2500 },
      { name: "Tempe Potong Dadu", cost: 2500 },
      { name: "Kecap Manis & Bumbu Tumis", cost: 2000 }
    ],
    steps: [
      "Goreng tempe dadu hingga setengah matang.",
      "Tumis bawang merah, putih, dan cabai. Masukkan kacang panjang.",
      "Masukkan tempe, beri kecap manis dan air, masak hingga meresap."
    ],
    hack: "Menu harian klasik ala warteg yang selalu disukai."
  },
  {
    id: 70,
    title: "Sup Oyong Bihun Bening",
    price: 8500,
    time: 12,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🥣",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Oyong / Gambas 1 Buah", cost: 3500 },
      { name: "Bihun Jagung 1/2 Lembar", cost: 2500 },
      { name: "Bawang Putih & Bumbu Sup", cost: 2500 }
    ],
    steps: [
      "Kupas dan potong bulat oyong. Seduh bihun dengan air panas.",
      "Didihkan air, tumis bawang putih geprek, masukkan oyong.",
      "Beri bumbu garam lada, masukkan bihun sebelum diangkat."
    ],
    hack: "Sup bening segar yang menenangkan perut saat terasa lelah."
  },
  {
    id: 71,
    title: "Tahu Bacem Manis Gurih",
    price: 7500,
    time: 25,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🥘",
    mainIngredient: "Tahu",
    ingredientsBreakdown: [
      { name: "Tahu Putih 4 Kotak", cost: 4000 },
      { name: "Gula Merah 1 Bulatan", cost: 1500 },
      { name: "Ketumbar & Air Kelapa/Air Biasa", cost: 2000 }
    ],
    steps: [
      "Ungkep tahu bersama gula merah, ketumbar, kecap manis, dan air hingga menyusut.",
      "Goreng tahu bacem sebentar dalam minyak panas.",
      "Sajikan hangat bersama cabai rawit hijau."
    ],
    hack: "Goreng tahu bacem sebentar saja agar gula karamelnya tidak gosong dan pahit."
  },
  {
    id: 72,
    title: "Sambal Teri Kacang Tanah Krispi",
    price: 11500,
    time: 15,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🥜",
    mainIngredient: "Teri",
    ingredientsBreakdown: [
      { name: "Teri Tawar 50g", cost: 4500 },
      { name: "Kacang Tanah 50g", cost: 3500 },
      { name: "Bumbu Sambal Goreng", cost: 3500 }
    ],
    steps: [
      "Goreng teri dan kacang tanah secara terpisah hingga renyah garing.",
      "Tumis bumbu sambal gula Jawa hingga berkaramel pekat.",
      "Matikan api, masukkan teri dan kacang, aduk cepat hingga terbalut."
    ],
    hack: "Matikan api kompor sebelum memasukkan teri dan kacang agar tekstur renyahnya bertahan lama."
  },
  {
    id: 73,
    title: "Tumis Pokcoy Saus Tiram Bawang Putih",
    price: 8000,
    time: 6,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🥬",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Pokcoy 2 Cincang/Bonggol", cost: 3500 },
      { name: "Bawang Putih Cincang Melimpah", cost: 2500 },
      { name: "Saus Tiram & Minyak Wijen", cost: 2000 }
    ],
    steps: [
      "Rebus pokcoy sebentar di air mendidih, tiriskan dan susun di piring.",
      "Goreng bawang putih cincang hingga kuning krispi, masukkan saus tiram dan sedikit air.",
      "Siramkan saus bawang putih di atas pokcoy rebus."
    ],
    hack: "Hidangan ala restoran Tionghoa yang lezat, segar, dan sangat mudah dibuat."
  },
  {
    id: 74,
    title: "Omelet Tahu Telur Daun Bawang",
    price: 7500,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🍳",
    mainIngredient: "Telur",
    ingredientsBreakdown: [
      { name: "Tahu Putih Halus 1 Kotak", cost: 2000 },
      { name: "Telur Ayam 2 Butir", cost: 4000 },
      { name: "Daun Bawang Iris", cost: 1500 }
    ],
    steps: [
      "Campurkan telur kocok, tahu halus, irisan daun bawang, dan kaldu bubuk.",
      "Goreng di teflon dengan sedikit minyak hingga bawahnya matang kecokelatan.",
      "Balik perlahan, masak hingga matang merata."
    ],
    hack: "Gunakan piring datar untuk membantu membalik omelet tahu agar tidak hancur."
  },
  {
    id: 75,
    title: "Perkedel Kentang Ayam Suwir",
    price: 13000,
    time: 25,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🥔",
    mainIngredient: "Kentang",
    ingredientsBreakdown: [
      { name: "Kentang 2 Buah", cost: 5000 },
      { name: "Ayam Suwir Rebus 50g", cost: 4000 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Bawang Goreng & Bumbu", cost: 2000 }
    ],
    steps: [
      "Goreng kentang potong, haluskan selagi hangat.",
      "Campurkan ayam suwir, bawang goreng, lada, dan garam. Bentuk bulat pipih.",
      "Celup kocokan telur, goreng dalam minyak panas hingga kuning keemasan."
    ],
    hack: "Menggoreng kentang alih-alih merebusnya mencegah adonan perkedel menjadi terlalu lembek."
  },
  {
    id: 76,
    title: "Tumis Genjer Oncom Pedas",
    price: 6500,
    time: 8,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🥬",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Sayur Genjer 1 Ikat", cost: 2500 },
      { name: "Oncom Hancur 50g", cost: 2000 },
      { name: "Cabai Rawit & Bumbu Tumis", cost: 2000 }
    ],
    steps: [
      "Potong genjer, remas dengan air garam lalu cuci bersih.",
      "Tumis bumbu halus dan oncom hancur hingga matang wangi.",
      "Masukkan genjer, aduk cepat selama 2 menit lalu angkat."
    ],
    hack: "Remas genjer dengan garam dapur untuk menghilangkan tekstur pahit dan rasa kelatnya."
  },
  {
    id: 77,
    title: "Sup Kimlo Simpel Anak Kost",
    price: 12500,
    time: 15,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🥣",
    mainIngredient: "Bakso",
    ingredientsBreakdown: [
      { name: "Bihun & Jamur Kupang Iris", cost: 4000 },
      { name: "Bakso Sapi 3 Pcs", cost: 3500 },
      { name: "Wortel & Bumbu Sup", cost: 5000 }
    ],
    steps: [
      "Didihkan air, masukkan irisan wortel, bakso, dan jamur kuping.",
      "Beri tumisan bawang putih cincang, kaldu, garam, dan lada.",
      "Masukkan bihun menjelang diangkat. Sajikan hangat."
    ],
    hack: "Sup kaya isian yang memberikan rasa hangat di tubuh saat cuaca dingin."
  },
  {
    id: 78,
    title: "Nasi Goreng Magelangan / Ruwet",
    price: 10000,
    time: 12,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🍳",
    mainIngredient: "Nasi",
    ingredientsBreakdown: [
      { name: "Nasi Putih Cold", cost: 3000 },
      { name: "Mie Rebus Matang 1/2 Pcs", cost: 2000 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Bumbu Nasgor Instan", cost: 3000 }
    ],
    steps: [
      "Oreks telur di wajan, masukkan irisan kol.",
      "Masukkan campuran nasi putih dingin dan mie rebus.",
      "Tuangkan bumbu nasi goreng instan dan kecap manis, aduk hingga rata."
    ],
    hack: "Perpaduan karbohidrat ganda khas Jogja yang mengenyangkan perut seharian."
  },
  {
    id: 79,
    title: "Sosis Solo Goreng Isi Tahu Cincang",
    price: 9000,
    time: 20,
    equipment: "Kompor 1 Tungku",
    category: "hemat",
    image: "🌯",
    mainIngredient: "Tahu",
    ingredientsBreakdown: [
      { name: "Tahu Putih Bumbu Cincang", cost: 3000 },
      { name: "Telur 2 Butir (Kulit & Baluran)", cost: 4000 },
      { name: "Tepung Terigu 1 sdm", cost: 2000 }
    ],
    steps: [
      "Buat dadar telur tipis sebagai kulit.",
      "Isi dadar dengan tumisan tahu berbumbu gurih, lalu gulung rapi.",
      "Celupkan ke kocokan telur, goreng hingga garing krispi."
    ],
    hack: "Ganti isian daging dengan tahu cincang berbumbu gurih untuk versi ekonomis."
  },
  {
    id: 80,
    title: "Tumis Kol Telur Bumbu Kuning",
    price: 7000,
    time: 10,
    equipment: "Kompor 1 Tungku",
    category: "super_hemat",
    image: "🥗",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Kol Iris 150g", cost: 2500 },
      { name: "Telur 1 Butir", cost: 2000 },
      { name: "Bumbu Kunyit Bubuk & Bawang", cost: 2500 }
    ],
    steps: [
      "Tumis bawang putih, bawang merah, dan kunyit bubuk.",
      "Masukkan irisan kol, tumis hingga setengah layu.",
      "Pecahkan telur, aduk rata hingga bumbu kuning meresap ke telur dan kol."
    ],
    hack: "Kunyit memberi warna kuning menarik dan cita rasa gurih yang khas."
  },

  // --- NO-COOK / TANPA MASAK SPECIAL (81-100) ---
  {
    id: 81,
    title: "Salad Tahu Telur Simpel (No-Cook)",
    price: 6500,
    time: 5,
    equipment: "Tanpa Masak (No-Cook)",
    category: "super_hemat",
    image: "🥗",
    mainIngredient: "Tahu",
    ingredientsBreakdown: [
      { name: "Tahu Sutra Matang / Siap Makan", cost: 3500 },
      { name: "Kecap Asin & Minyak Wijen", cost: 1500 },
      { name: "Nori Potong / Biji Wijen", cost: 1500 }
    ],
    steps: [
      "Keluarkan tahu sutra dingin dari kemasan, potong dadu di atas piring.",
      "Siramkan 1 sdm kecap asin dan 1/2 sdt minyak wijen.",
      "Taburkan potongan nori krispi atau biji wijen di atasnya. Siap disantap!"
    ],
    hack: "Gunakan tahu sutra jepang kemasan tube yang steril dan bisa langsung dikonsumsi tanpa perlu dimasak."
  },
  {
    id: 82,
    title: "Roti Tawar Omelet Alpukat Mayo",
    price: 11000,
    time: 5,
    equipment: "Tanpa Masak (No-Cook)",
    category: "hemat",
    image: "🥪",
    mainIngredient: "Roti",
    ingredientsBreakdown: [
      { name: "Roti Tawar 2 Lembar", cost: 3000 },
      { name: "Alpukat Matang 1/2 Buah", cost: 4000 },
      { name: "Mayones & Telur Rebus Matang", cost: 4000 }
    ],
    steps: [
      "Hancurkan alpukat dan telur rebus matang dengan garpu.",
      "Campurkan mayones, sedikit garam, dan lada.",
      "Oleskan adonan lunak di antara dua lembar roti tawar."
    ],
    hack: "Sarapan ala kafe yang kaya lemak sehat dan kaya nutrisi gizi."
  },
  {
    id: 83,
    title: "Sandwich Telur Mayo Ala Konbini",
    price: 8500,
    time: 5,
    equipment: "Tanpa Masak (No-Cook)",
    category: "super_hemat",
    image: "🥪",
    mainIngredient: "Roti",
    ingredientsBreakdown: [
      { name: "Roti Tawar Kupas 2 Lembar", cost: 3000 },
      { name: "Telur Rebus Matang 1 Butir", cost: 2500 },
      { name: "Mayones 2 sdm", cost: 2000 },
      { name: "Kental Manis Sedikit", cost: 1000 }
    ],
    steps: [
      "Hancurkan telur rebus dengan garpu hingga halus.",
      "Aduk rata bersama mayones, sedikit kental manis, dan lada.",
      "Oleskan tebal di roti tawar, potong segitiga lalu sajikan."
    ],
    hack: "Sedikit kental manis memberi sentuhan rasa gurih manis creamy khas egg mayo minimarket Jepang."
  },
  {
    id: 84,
    title: "Oatmeal Buah Pisang & Madu",
    price: 9000,
    time: 3,
    equipment: "Tanpa Masak (No-Cook)",
    category: "hemat",
    image: "🥣",
    mainIngredient: "Oatmeal",
    ingredientsBreakdown: [
      { name: "Oatmeal Instant 4 sdm", cost: 3000 },
      { name: "Air Panas Dispenser", cost: 500 },
      { name: "Pisang Ambon 1 Buah", cost: 3000 },
      { name: "Madu Saset 1 Pcs", cost: 2500 }
    ],
    steps: [
      "Seduh instant oatmeal dengan air panas dari dispenser kamar kost.",
      "Aduk hingga mengental mengembang.",
      "Beri toping irisan pisang manis dan kucuran madu segar."
    ],
    hack: "Cukup seduh dengan air panas dispenser tanpa perlu menyalakan kompor sama sekali."
  },
  {
    id: 85,
    title: "Salad Mentimun Jepang Saus Wijen",
    price: 6000,
    time: 5,
    equipment: "Tanpa Masak (No-Cook)",
    category: "super_hemat",
    image: "🥒",
    mainIngredient: "Sayur",
    ingredientsBreakdown: [
      { name: "Timun Segar 2 Buah", cost: 2500 },
      { name: "Saus Wijen Sangrai Saset", cost: 2500 },
      { name: "Kecap Asin Sedikit", cost: 1000 }
    ],
    steps: [
      "Keprek timun dengan pisau lalu potong kasar.",
      "Masukkan ke dalam mangkuk.",
      "Siram dengan saus wijen sangrai instan dan kecap asin. Aduk rata."
    ],
    hack: "Mengeprek timun membuat bumbu saus wijen meresap lebih cepat ke dalam serat timun."
  },
  {
    id: 86,
    title: "Cimol / Aci Tabur Bumbu Instan",
    price: 5000,
    time: 5,
    equipment: "Tanpa Masak (No-Cook)",
    category: "super_hemat",
    image: "🍡",
    mainIngredient: "Camilan",
    ingredientsBreakdown: [
      { name: "Aci / Kerupuk Mentah Mekar", cost: 2500 },
      { name: "Bumbu Tabur Balado / Keju", cost: 1500 },
      { name: "Minyak Wijen Sedikit", cost: 1000 }
    ],
    steps: [
      "Gunakan cemilan aci siap makan/krupuk matang.",
      "Masukkan ke dalam wadah tertutup rapat.",
      "Taburkan bumbu rasa favorit, lalu kocok wadah hingga terbalut merata."
    ],
    hack: "Camilan penyelamat saat butuh mengunyah di tengah fokus belajar."
  },
  {
    id: 87,
    title: "Roti Bakar Sederhana Tanpa Kompor",
    price: 7000,
    time: 3,
    equipment: "Tanpa Masak (No-Cook)",
    category: "super_hemat",
    image: "🍞",
    mainIngredient: "Roti",
    ingredientsBreakdown: [
      { name: "Roti Tawar 2 Lembar", cost: 3000 },
      { name: "Margarin & Meses Cokelat", cost: 2500 },
      { name: "Susu Kental Manis", cost: 1500 }
    ],
    steps: [
      "Olesi roti tawar dengan margarin dan meses cokelat.",
      "Setel pemanas air/setrika bersih di atas kertas roti (opsional) atau makan langsung.",
      "Beri kucuran susu kental manis."
    ],
    hack: "Roti tawar lembut berlapis margarin dan meses sudah terasa nikmat tanpa harus dipanggang."
  },
  {
    id: 88,
    title: "Cereal Susu UHT Cold Bowl",
    price: 8500,
    time: 2,
    equipment: "Tanpa Masak (No-Cook)",
    category: "hemat",
    image: "🥣",
    mainIngredient: "Sereal",
    ingredientsBreakdown: [
      { name: "Sereal Cokelat Saset 1 Pcs", cost: 4000 },
      { name: "Susu UHT Cold 200ml", cost: 4500 }
    ],
    steps: [
      "Tuangkan sereal cokelat pilihan ke mangkuk.",
      "Siram dengan susu UHT dingin segar.",
      "Santap langsung selagi sereal masih renyah garing."
    ],
    hack: "Sarapan paling kilat dan praktis saat bangun terburu-buru mengejar kuliah pagi."
  },
  {
    id: 89,
    title: "Salad Buah Yogurt Hemat",
    price: 12000,
    time: 5,
    equipment: "Tanpa Masak (No-Cook)",
    category: "hemat",
    image: "🥗",
    mainIngredient: "Buah",
    ingredientsBreakdown: [
      { name: "Semangka / Melon Potong", cost: 5000 },
      { name: "Yogurt Drink Botol Kecil", cost: 5000 },
      { name: "Keju Parut Sedikit", cost: 2000 }
    ],
    steps: [
      "Potong dadu buah-buahan segar.",
      "Pindahkan ke dalam mangkuk.",
      "Siram dengan yogurt drink dingin dan taburi keju parut di atasnya."
    ],
    hack: "Cemilan sehat kaya vitamin yang menyegarkan dahaga saat cuaca terik."
  },
  {
    id: 90,
    title: "Jagung Keju Susu (Jasuke) No-Cook",
    price: 9000,
    time: 5,
    equipment: "Tanpa Masak (No-Cook)",
    category: "hemat",
    image: "🌽",
    mainIngredient: "Jagung",
    ingredientsBreakdown: [
      { name: "Jagung Manis Pipil Kaleng/Matang", cost: 4000 },
      { name: "Margarin 1/2 sdt", cost: 1000 },
      { name: "Susu Kental Manis & Keju Parut", cost: 4000 }
    ],
    steps: [
      "Seduh jagung pipil matang dengan air panas dispenser, tiriskan.",
      "Aduk dengan sedikit margarin selagi hangat.",
      "Beri kucuran susu kental manis dan taburan keju parut yang melimpah."
    ],
    hack: "Menggunakan jagung manis pipil siap makan menghemat waktu persiapan."
  },
  {
    id: 91,
    title: "Pop Ice Float Boba Cincau",
    price: 6000,
    time: 3,
    equipment: "Tanpa Masak (No-Cook)",
    category: "super_hemat",
    image: "🧋",
    mainIngredient: "Minuman",
    ingredientsBreakdown: [
      { name: "Pop Ice Rasa Saset", cost: 2000 },
      { name: "Cincau Hitam Potong Dadu", cost: 2000 },
      { name: "Es Batu & Air Cold", cost: 2000 }
    ],
    steps: [
      "Seduh Pop Ice dengan air dan es batu, kocok hingga berbuih.",
      "Masukkan irisan cincau hitam ke dalam gelas.",
      "Nikmati minuman segar penyejuk dahaga di kamar kost."
    ],
    hack: "Irisan cincau hitam menambah sensasi tekstur kenyal layaknya boba."
  },
  {
    id: 92,
    title: "Es Buah Sirup Ceria",
    price: 8000,
    time: 5,
    equipment: "Tanpa Masak (No-Cook)",
    category: "super_hemat",
    image: "🍧",
    mainIngredient: "Buah",
    ingredientsBreakdown: [
      { name: "Buah Pepaya / Melon Iris", cost: 4000 },
      { name: "Sirup Cocopandan & Air", cost: 2500 },
      { name: "Es Batu Secukupnya", cost: 1500 }
    ],
    steps: [
      "Campur irisan buah-buahan ke dalam mangkuk.",
      "Tuangkan sirup cocopandan, air matang, dan es batu secukupnya.",
      "Aduk rata dan siap disajikan."
    ],
    hack: "Pilihan minuman penutup manis yang menyegarkan setelah makan siang."
  },
  {
    id: 93,
    title: "Dadar Gulung Pisang Cokelat No-Cook",
    price: 8500,
    time: 5,
    equipment: "Tanpa Masak (No-Cook)",
    category: "hemat",
    image: "🍌",
    mainIngredient: "Roti",
    ingredientsBreakdown: [
      { name: "Roti Tawar Tanpa Kulit 2 Lembar", cost: 3000 },
      { name: "Pisang Raja Matang 1 Buah", cost: 2500 },
      { name: "Seres / Selai Cokelat", cost: 3000 }
    ],
    steps: [
      "Gilas roti tawar hingga tipis menggunakan botol bersih.",
      "Olesi selai cokelat dan taruh potongan pisang di atasnya.",
      "Gulung roti dengan rapi lalu potong jadi dua bagian."
    ],
    hack: "Pipihkan roti tawar menggunakan botol kaca bersih sebagai pengganti rolling pin."
  },
  {
    id: 94,
    title: "Es Choco Avocado Float",
    price: 10000,
    time: 5,
    equipment: "Tanpa Masak (No-Cook)",
    category: "hemat",
    image: "🥑",
    mainIngredient: "Buah",
    ingredientsBreakdown: [
      { name: "Alpukat Matang 1 Buah", cost: 5000 },
      { name: "Susu Cokelat Saset 1 Pcs", cost: 2500 },
      { name: "Es Batu & Kental Manis", cost: 2500 }
    ],
    steps: [
      "Hancurkan buah alpukat dengan garpu di gelas, beri sedikit gula.",
      "Masukkan es batu secukupnya.",
      "Tuangkan susu cokelat dingin di atasnya sebagai float layer."
    ],
    hack: "Hancurkan alpukat kasar saja untuk mendapatkan tekstur legit khas jus alpukat kocok."
  },
  {
    id: 95,
    title: "Sandwich Selai Kacang Cokelat",
    price: 7500,
    time: 2,
    equipment: "Tanpa Masak (No-Cook)",
    category: "super_hemat",
    image: "🥪",
    mainIngredient: "Roti",
    ingredientsBreakdown: [
      { name: "Roti Tawar 2 Lembar", cost: 3000 },
      { name: "Selai Kacang 1 sdm", cost: 2500 },
      { name: "Selai Cokelat 1 sdm", cost: 2000 }
    ],
    steps: [
      "Olesi satu sisi roti dengan selai kacang.",
      "Olesi sisi roti lainnya dengan selai cokelat.",
      "Tangakupkan kedua roti lalu nikmati."
    ],
    hack: "Kombinasi rasa manis cokelat dan gurih selai kacang yang kaya akan energi."
  },
  {
    id: 96,
    title: "Overnight Oats Milk & Chia Seed",
    price: 12500,
    time: 5,
    equipment: "Tanpa Masak (No-Cook)",
    category: "hemat",
    image: "🥣",
    mainIngredient: "Oatmeal",
    ingredientsBreakdown: [
      { name: "Rolled Oats 4 sdm", cost: 4000 },
      { name: "Susu UHT Plain 150ml", cost: 3500 },
      { name: "Chia Seed / Biji Selasih 1 sdt", cost: 2000 },
      { name: "Madu 1 Saset", cost: 3000 }
    ],
    steps: [
      "Campurkan oats, susu UHT, chia seed, dan madu di botol/jar tertutup.",
      "Kocok sebentar hingga merata.",
      "Simpan di dalam kulkas semalaman, siap disantap esok pagi."
    ],
    hack: "Persiapkan malam hari sebelum tidur untuk sarapan dingin yang menyehatkan di pagi hari."
  },
  {
    id: 97,
    title: "Es Cincau Hijau Santan Gurih",
    price: 6000,
    time: 3,
    equipment: "Tanpa Masak (No-Cook)",
    category: "super_hemat",
    image: "🥤",
    mainIngredient: "Minuman",
    ingredientsBreakdown: [
      { name: "Cincau Hijau Siap Pakai", cost: 3000 },
      { name: "Santan Instan & Sirup Gula Merah", cost: 2000 },
      { name: "Es Batu Secukupnya", cost: 1000 }
    ],
    steps: [
      "Sendoki cincau hijau lembut ke dalam gelas.",
      "Tuangkan larutan santan instan, sirup gula merah, dan es batu.",
      "Aduk rata dan siap diseruput segar."
    ],
    hack: "Minuman tradisional penyegar tubuh yang lembut di tenggorokan."
  },
  {
    id: 98,
    title: "Rujak Buah Bumbu Kacang Instan",
    price: 9500,
    time: 7,
    equipment: "Tanpa Masak (No-Cook)",
    category: "hemat",
    image: "🍍",
    mainIngredient: "Buah",
    ingredientsBreakdown: [
      { name: "Timun, Bengkuang, & Nanas", cost: 5000 },
      { name: "Bumbu Rujak Instan / Pecel Saset", cost: 3500 },
      { name: "Air Panas Sedikit", cost: 1000 }
    ],
    steps: [
      "Kupas dan potong buah-buahan segar.",
      "Seduh bumbu rujak instan dengan sedikit air panas hingga kental.",
      "Cocol potongan buah ke dalam bumbu rujak pedas manis."
    ],
    hack: "Pilihan camilan buah segar penolak rasa kantuk saat belajar."
  },
  {
    id: 99,
    title: "Es Teh Lemon Sereh Segar",
    price: 4500,
    time: 3,
    equipment: "Tanpa Masak (No-Cook)",
    category: "super_hemat",
    image: "🍹",
    mainIngredient: "Minuman",
    ingredientsBreakdown: [
      { name: "Teh Celup 1 Pcs", cost: 1000 },
      { name: "Lemon Iris 2 Slice", cost: 1500 },
      { name: "Gula & Es Batu", cost: 2000 }
    ],
    steps: [
      "Seduh teh celup dengan sedikit air panas dispenser dan gula.",
      "Peras irisan lemon segar ke dalam teh.",
      "Tambahkan air dingin dan es batu melimpah."
    ],
    hack: "Minuman peremas dahaga kaya vitamin C yang hemat biaya."
  },
  {
    id: 100,
    title: "Susu Kurma Manis Alami",
    price: 11000,
    time: 5,
    equipment: "Tanpa Masak (No-Cook)",
    category: "hemat",
    image: "🥛",
    mainIngredient: "Minuman",
    ingredientsBreakdown: [
      { name: "Kurma Matang 3 Butir", cost: 3500 },
      { name: "Susu UHT Plain 200ml", cost: 4500 },
      { name: "Madu / Es Batu", cost: 3000 }
    ],
    steps: [
      "Cincang halus buah kurma tanpa biji.",
      "Campurkan ke dalam susu UHT, tekan-tekan dengan sendok agar manisnya menyatu.",
      "Beri es batu dan siap diminum penambah energi."
    ],
    hack: "Minuman pengembali energi alami saat tubuh terasa lelah."
  }
];

export default function ResepHematKost() {
  // STATE FILTER & SEARCH
  const [equipmentFilter, setEquipmentFilter] = useState("Semua");
  const [budgetFilter, setBudgetFilter] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default"); // 'default', 'cheapest', 'fastest'
  
  // STATE MODAL DETAIL RESEP
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // HELPER FORMAT RUPIAH
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number);
  };

  // LOGIKA FILTER & SORTING DATASET
  const filteredRecipes = useMemo(() => {
    return RECIPE_DATASET.filter((recipe) => {
      // Filter Peralatan
      const matchesEquipment = equipmentFilter === "Semua" ? true : recipe.equipment === equipmentFilter;
      
      // Filter Budget
      let matchesBudget = true;
      if (budgetFilter === "super_hemat") {
        matchesBudget = recipe.price < 8000;
      } else if (budgetFilter === "hemat") {
        matchesBudget = recipe.price >= 8000 && recipe.price <= 15000;
      }

      // Filter Search Bahan / Nama
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.mainIngredient.toLowerCase().includes(searchLower) ||
        recipe.ingredientsBreakdown.some(item => item.name.toLowerCase().includes(searchLower));

      return matchesEquipment && matchesBudget && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "cheapest") return a.price - b.price;
      if (sortBy === "fastest") return a.time - b.time;
      return 0;
    });
  }, [equipmentFilter, budgetFilter, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans text-[#261C19] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#261C19] text-[#C5A059] px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase border border-[#C5A059]/30 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>Cooking Hacks Anak Kost • Kafana Vista</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#261C19] tracking-tight">
            Resep Hemat <span className="text-[#C5A059]">Anak Kost</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
            Katalog masakan praktis di bawah Rp 15.000 dengan peralatan terbatas. Solusi makan enak, sehat, dan tetap hemat di tanggal tua!
          </p>
        </div>

        {/* SEARCH & FILTER BAR PANEL */}
        <div className="bg-[#261C19] text-[#FAF6F0] p-6 rounded-3xl border border-[#C5A059]/30 shadow-xl space-y-5">
          
          {/* SEARCH & SORT ROW */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-8 relative">
              <Search className="w-5 h-5 text-[#C5A059] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari berdasarkan bahan (misal: Telur, Tahu, Tempe, Mie)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A1311] border border-slate-700 focus:border-[#C5A059] rounded-2xl pl-12 pr-10 py-3 text-sm text-white placeholder-slate-400 outline-none transition"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 shrink-0">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#1A1311] border border-slate-700 focus:border-[#C5A059] rounded-2xl px-4 py-3 text-xs text-[#C5A059] font-bold outline-none cursor-pointer"
              >
                <option value="default">Rekomendasi Default</option>
                <option value="cheapest">Termurah (Harga Rendah)</option>
                <option value="fastest">Tercepat (&lt; 15 Menit)</option>
              </select>
            </div>
          </div>

          {/* FILTER BUTTONS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            {/* Filter Peralatan */}
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C5A059] block mb-2">
                ⚙️ Pilih Peralatan Masak:
              </span>
              <div className="flex flex-wrap gap-2">
                {["Semua", "Rice Cooker", "Kompor 1 Tungku", "Tanpa Masak (No-Cook)"].map((eq) => (
                  <button
                    key={eq}
                    onClick={() => setEquipmentFilter(eq)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      equipmentFilter === eq
                        ? 'bg-[#C5A059] text-[#261C19] shadow-md'
                        : 'bg-[#1A1311] text-slate-300 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Budget */}
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C5A059] block mb-2">
                💰 Filter Kantong:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "Semua", label: "Semua Budget" },
                  { id: "super_hemat", label: "Super Hemat (< Rp 8.000)" },
                  { id: "hemat", label: "Hemat (Rp 8.000 - Rp 15.000)" }
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBudgetFilter(b.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      budgetFilter === b.id
                        ? 'bg-[#C5A059] text-[#261C19] shadow-md'
                        : 'bg-[#1A1311] text-slate-300 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* RECIPE GRID DISPLAY */}
        <div>
          <div className="flex justify-between items-center mb-4 px-2">
            <p className="text-xs font-bold text-slate-500">
              Menampilkan <span className="text-[#261C19] font-black">{filteredRecipes.length}</span> resep ramah kantong
            </p>
          </div>

          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-[#C5A059] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    {/* Card Header & Icon */}
                    <div className="p-6 bg-[#FAF6F0] border-b border-slate-100 flex items-center justify-between relative">
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {recipe.image}
                      </span>
                      <span className="px-3 py-1 bg-[#261C19] text-[#C5A059] text-[10px] font-extrabold uppercase rounded-full border border-[#C5A059]/30">
                        {recipe.equipment}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-black text-lg text-[#261C19] group-hover:text-[#C5A059] transition-colors leading-snug">
                        {recipe.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#C5A059]" /> {recipe.time} mnt
                        </span>
                        <span className="flex items-center gap-1">
                          <Utensils className="w-3.5 h-3.5 text-[#C5A059]" /> Bahan: {recipe.mainIngredient}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Price */}
                  <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Estimasi Biaya</span>
                      <span className="text-base font-black text-emerald-700">
                        {formatRupiah(recipe.price)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#C5A059] group-hover:underline">
                      Lihat Resep →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
              <div className="w-12 h-12 bg-[#FAF6F0] text-[#C5A059] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                🍳
              </div>
              <h3 className="font-extrabold text-[#261C19] text-base">Resep Tidak Ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian bahan atau reset filter peralatan dan budget di atas.
              </p>
            </div>
          )}
        </div>

        {/* MODAL DETAIL RESEP & COOKING HACKS */}
        {selectedRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="bg-[#261C19] p-6 text-white flex justify-between items-start relative">
                <div className="flex items-center gap-4">
                  <span className="text-4xl p-3 bg-white/10 rounded-2xl border border-white/10">
                    {selectedRecipe.image}
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/20 px-3 py-0.5 rounded-full border border-[#C5A059]/30">
                      {selectedRecipe.equipment}
                    </span>
                    <h3 className="text-2xl font-black mt-1 text-[#FAF6F0]">{selectedRecipe.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                      <span>⏱️ Est. {selectedRecipe.time} Menit</span>
                      <span>•</span>
                      <span className="text-[#C5A059] font-bold">💰 Est. Total {formatRupiah(selectedRecipe.price)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body Scrollable */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* BREAKDOWN BAHAN & HARGA */}
                <div>
                  <h4 className="font-extrabold text-[#261C19] text-sm flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-[#C5A059]" /> Rincian Bahan & Estimasi Harga
                  </h4>
                  <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-slate-200/80 space-y-2">
                    {selectedRecipe.ingredientsBreakdown.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-200/60 pb-2 last:border-0 last:pb-0">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {item.name}
                        </span>
                        <span className="font-extrabold text-[#261C19]">{formatRupiah(item.cost)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LANGKAH MEMASAK */}
                <div>
                  <h4 className="font-extrabold text-[#261C19] text-sm flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-[#C5A059]" /> Langkah Memasak Sederhana
                  </h4>
                  <div className="space-y-3">
                    {selectedRecipe.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start text-xs leading-relaxed">
                        <span className="w-6 h-6 rounded-full bg-[#261C19] text-[#C5A059] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-slate-700 font-medium pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PRO TIP / COOKING HACK */}
                <div className="p-4 bg-[#261C19] text-[#FAF6F0] rounded-2xl border border-[#C5A059]/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#C5A059] font-bold text-xs">
                    <Lightbulb className="w-4 h-4" />
                    <span>PRO TIP / HACKS ANAK KOST:</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    "{selectedRecipe.hack}"
                  </p>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="px-6 py-2.5 bg-[#261C19] hover:bg-[#3A2B27] text-[#C5A059] font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Tutup & Mulai Masak
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}