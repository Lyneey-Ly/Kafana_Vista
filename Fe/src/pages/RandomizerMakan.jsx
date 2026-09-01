import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Utensils, 
  RotateCw, 
  Plus, 
  Trash2, 
  Wallet, 
  Dices,
  ChefHat,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

// 1. PRESET MENU DEFAULT ANAK KOST WITH PRICE RANGE & BUDGET CATEGORY
const DEFAULT_MENU_PRESETS = [
  { id: 1, name: 'Ayam Geprek', priceRange: 'Rp 12.000 - Rp 18.000', category: 'hemat', color: '#261C19' },
  { id: 2, name: 'Nasi Goreng', priceRange: 'Rp 13.000 - Rp 20.000', category: 'hemat', color: '#C5A059' },
  { id: 3, name: 'Warteg Paket Hemat', priceRange: 'Rp 10.000 - Rp 15.000', category: 'hemat', color: '#3A2B27' },
  { id: 4, name: 'Masakan Padang', priceRange: 'Rp 18.000 - Rp 28.000', category: 'standard', color: '#D4AF37' },
  { id: 5, name: 'Pecel Lele', priceRange: 'Rp 15.000 - Rp 22.000', category: 'standard', color: '#1E1513' },
  { id: 6, name: 'Mie Dogdog / Indomie', priceRange: 'Rp 8.000 - Rp 14.000', category: 'hemat', color: '#B38E5D' },
  { id: 7, name: 'Soto Ayam', priceRange: 'Rp 14.000 - Rp 20.000', category: 'hemat', color: '#4A3731' },
  { id: 8, name: 'Ketoprak', priceRange: 'Rp 12.000 - Rp 16.000', category: 'hemat', color: '#AA8232' },
  { id: 9, name: 'Bubur Ayam', priceRange: 'Rp 10.000 - Rp 15.000', category: 'hemat', color: '#2C211E' },
  { id: 10, name: 'Bakso / Mie Ayam', priceRange: 'Rp 15.000 - Rp 25.000', category: 'standard', color: '#96723B' },
  { id: 11, name: 'Steak Ayam Crispy', priceRange: 'Rp 26.000 - Rp 35.000', category: 'sultan', color: '#5C433C' },
  { id: 12, name: 'Ramen / Bento', priceRange: 'Rp 28.000 - Rp 45.000', category: 'sultan', color: '#E6C280' }
];

export default function RandomizerMakan() {
  // STATE MANAGEMENT
  const [menuList, setMenuList] = useState(DEFAULT_MENU_PRESETS);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'hemat', 'standard', 'sultan'
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('hemat');
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);

  // CANVAS & ANIMATION REFS
  const canvasRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const currentAngleRef = useRef(0);
  const spinAnimationRef = useRef(null);

  // Filter menu berdasarkan kategori kantong
  const filteredMenu = menuList.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  // Color Palette Kafana Vista Sync
  const palette = ['#261C19', '#C5A059', '#3A2B27', '#D4AF37', '#1E1513', '#B38E5D', '#4A3731', '#E6C280'];

  // =========================================================================
  // 🎨 CANVAS RENDERER FOR WHEEL OF FORTUNE
  // =========================================================================
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 20;

    ctx.clearRect(0, 0, width, height);

    if (filteredMenu.length === 0) {
      // Draw empty placeholder wheel
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#261C19';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#C5A059';
      ctx.stroke();

      ctx.fillStyle = '#FAF6F0';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Tambahkan Menu / Pilih Filter', centerX, centerY);
      return;
    }

    const arcSize = (2 * Math.PI) / filteredMenu.length;

    // Outer Glow Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.strokeStyle = '#C5A059';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#C5A059';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();

    // Draw Slices
    filteredMenu.forEach((item, index) => {
      const angle = currentAngleRef.current + index * arcSize;
      const sliceColor = palette[index % palette.length];

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
      ctx.fillStyle = sliceColor;
      ctx.fill();

      // Border line for slice
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FAF6F0';
      ctx.stroke();

      // Text Render
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = sliceColor === '#C5A059' || sliceColor === '#D4AF37' || sliceColor === '#E6C280' ? '#261C19' : '#FAF6F0';
      ctx.font = 'bold 14px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;

      // Truncate long menu text
      const maxText = item.name.length > 18 ? item.name.substring(0, 16) + '...' : item.name;
      ctx.fillText(maxText, radius - 30, 5);
      ctx.restore();
    });

    // Center Gold Hub Knob
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
    ctx.fillStyle = '#C5A059';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#261C19';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#261C19';
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    drawWheel();
  }, [filteredMenu, activeCategory]);

  // =========================================================================
  // 🎡 SPIN LOGIC WITH ACCELERATION & EASE-OUT CUBIC-BEZIER
  // =========================================================================
  const spinWheel = () => {
    if (isSpinning || filteredMenu.length === 0) return;

    setIsSpinning(true);
    setSelectedWinner(null);

    const spinDuration = 5000; // 5 Detik Total Putaran
    const totalRotation = Math.PI * 2 * (10 + Math.random() * 5); // 10-15 putaran penuh
    const startAngle = currentAngleRef.current;
    const startTime = performance.now();

    // Cubic-Bezier Ease Out function
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animateSpin = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const easeProgress = easeOutCubic(progress);

      currentAngleRef.current = startAngle + totalRotation * easeProgress;
      drawWheel();

      if (progress < 1) {
        spinAnimationRef.current = requestAnimationFrame(animateSpin);
      } else {
        setIsSpinning(false);
        determineWinner();
      }
    };

    spinAnimationRef.current = requestAnimationFrame(animateSpin);
  };

  // Kalkulasi Pemenang Berdasarkan Posisi Stopper / Pointer Atas (270 derajat atau 1.5 * PI)
  const determineWinner = () => {
    const totalSlices = filteredMenu.length;
    const arcSize = (2 * Math.PI) / totalSlices;

    // Normalisasi sudut roda
    let normalizedAngle = (currentAngleRef.current % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

    // Pointer berada di atas (270 derajat / 1.5 * Math.PI dalam konteks Canvas)
    const pointerAngle = (3 * Math.PI) / 2;

    // Hitung offset relatif ke pointer
    let relativeAngle = (pointerAngle - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);
    const winningIndex = Math.floor(relativeAngle / arcSize) % totalSlices;

    const winner = filteredMenu[winningIndex];
    setSelectedWinner(winner);

    // Trigger Confetti & Popup
    triggerConfetti();
    showWinnerModal(winner);
  };

  // =========================================================================
  // 🎉 CONFETTI CANVAS ANIMATION
  // =========================================================================
  const triggerConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }).map(() => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.8) * 12,
      size: Math.random() * 8 + 4,
      color: ['#C5A059', '#D4AF37', '#FAF6F0', '#261C19', '#E6C280'][Math.floor(Math.random() * 5)],
      gravity: 0.25,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10
    }));

    let animationFrame;
    const renderConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;

        if (p.y < canvas.height) alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (alive) {
        animationFrame = requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    renderConfetti();
  };

  // =========================================================================
  // 🏆 WINNER POPUP DIALOG (SWEETALERT2 INTEGRATED)
  // =========================================================================
  const showWinnerModal = (winner) => {
    Swal.fire({
      title: `<span style="color:#C5A059; font-weight:800; font-size:24px;">🎉 SERBA DUS! MENU TERPILIH 🎉</span>`,
      html: `
        <div style="padding:10px; font-family:sans-serif;">
          <div style="width:80px; height:80px; margin:0 auto 15px auto; background:#FAF6F0; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #C5A059; box-shadow: 0 4px 15px rgba(197,160,89,0.3);">
            <span style="font-size:40px;">🍲</span>
          </div>
          <h2 style="color:#261C19; font-size:26px; font-weight:900; margin-bottom:5px;">${winner.name}</h2>
          <div style="display:inline-block; padding:6px 16px; background:#FAF6F0; border:1px solid #C5A059; border-radius:20px; color:#261C19; font-weight:700; font-size:14px; margin-top:8px;">
            💰 Estimasi: ${winner.priceRange}
          </div>
          <p style="color:#71717a; font-size:13px; margin-top:15px;">
            Sesuai dompet anak kost, gak usah pusing mikir lagi. Selamat makan!
          </p>
        </div>
      `,
      background: '#ffffff',
      confirmButtonText: 'Siap, OTW Beli! 🚀',
      confirmButtonColor: '#C5A059',
      customClass: {
        popup: 'rounded-3xl border-2 border-[#C5A059]',
        confirmButton: 'rounded-xl text-white font-bold py-3 px-6'
      }
    });
  };

  // =========================================================================
  // ➕ DYNAMIC MENU MANAGEMENT HANDLERS
  // =========================================================================
  const handleAddMenu = (e) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newMenuName.trim(),
      priceRange: newMenuPrice.trim() || 'Rp 10.000 - Rp 20.000',
      category: newMenuCategory,
      color: palette[menuList.length % palette.length]
    };

    setMenuList([...menuList, newItem]);
    setNewMenuName('');
    setNewMenuPrice('');

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Menu "${newItem.name}" ditambahkan!`,
      showConfirmButton: false,
      timer: 1500,
      background: '#261C19',
      color: '#FAF6F0'
    });
  };

  const handleDeleteMenu = (id) => {
    setMenuList(menuList.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans text-[#261C19] relative overflow-x-hidden p-4 md:p-8">
      {/* Confetti Overlay Canvas */}
      <canvas ref={confettiCanvasRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* HEADER TITLE SECTION */}
      <div className="max-w-6xl mx-auto text-center mb-8 animate-fadeIn">
        <div className="inline-flex items-center gap-2 bg-[#261C19] text-[#C5A059] px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase border border-[#C5A059]/40 mb-3 shadow-sm">
          <Sparkles className="w-4 h-4 text-[#C5A059]" />
          <span>Fitur Hiburan Anak Kost • Kafana Vista</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-[#261C19] tracking-tight">
          Makan Apa Hari Ini? <span className="text-[#C5A059] block md:inline">(Roda Keberuntungan)</span>
        </h1>
        <p className="text-slate-600 mt-2 text-sm md:text-base max-w-2xl mx-auto">
          Bingung mau makan apa dan takut kantong jebol? Putar roda keberuntungan dan biarkan sistem menentukan menu makanan idealmu!
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT / TOP COLUMN: INTERACTIVE WHEEL & BUDGET FILTER */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-[#C5A059]/20 shadow-xl flex flex-col items-center relative">
          
          {/* BUDGET FILTER TABS */}
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Wallet className="w-4 h-4 text-[#C5A059]" /> Filter Sesuai Kantong:
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 bg-[#FAF6F0] p-1.5 rounded-2xl border border-slate-200">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'hemat', label: 'Hemat (<15rb)' },
                { id: 'standard', label: 'Standard' },
                { id: 'sultan', label: 'Sultan (25rb+)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  disabled={isSpinning}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? 'bg-[#261C19] text-[#C5A059] shadow-md'
                      : 'text-slate-600 hover:text-[#261C19] hover:bg-white/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* CANVAS WHEEL CONTAINER WITH TOP STOPPER */}
          <div className="relative my-4 flex justify-center items-center">
            {/* TOP POINTER / STOPPER */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-[#C5A059] filter drop-shadow-[0_4px_8px_rgba(197,160,89,0.8)]"></div>
              <div className="w-3 h-3 bg-[#261C19] rounded-full border-2 border-[#FAF6F0] -mt-7"></div>
            </div>

            {/* CANVAS WHEEL */}
            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="max-w-full h-auto rounded-full transition-transform duration-300"
            />
          </div>

          {/* SPIN ACTION BUTTON */}
          <button
            disabled={isSpinning || filteredMenu.length === 0}
            onClick={spinWheel}
            className="w-full md:w-4/5 mt-4 py-4 px-8 bg-[#261C19] hover:bg-[#3A2B27] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-[#C5A059] font-black text-lg rounded-2xl transition-all duration-200 shadow-xl shadow-[#261C19]/20 flex items-center justify-center gap-3 border-2 border-[#C5A059] cursor-pointer"
          >
            <RotateCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'MEMUTAR RODA...' : 'PUTAR RODA SEKARANG'}</span>
          </button>

          {/* WINNER PREVIEW CARD */}
          {selectedWinner && !isSpinning && (
            <div className="w-full mt-6 p-4 bg-[#FAF6F0] border-2 border-[#C5A059] rounded-2xl flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#261C19] text-[#C5A059] rounded-xl">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Hasil Terakhir:</p>
                  <h4 className="font-extrabold text-[#261C19] text-base">{selectedWinner.name}</h4>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-[#C5A059]/20 text-[#261C19] px-3 py-1.5 rounded-lg border border-[#C5A059]/40">
                {selectedWinner.priceRange}
              </span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT / BOTTOM COLUMN: DYNAMIC MENU MANAGEMENT */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ADD CUSTOM MENU FORM */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-[#261C19] flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-[#C5A059]" /> Tambah Pilihan Custom
            </h3>
            <form onSubmit={handleAddMenu} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nama Makanan (misal: Sate Padang)"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF6F0] border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C5A059] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Kisaran Harga (Opsional)"
                  value={newMenuPrice}
                  onChange={(e) => setNewMenuPrice(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF6F0] border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C5A059] transition"
                />

                <select
                  value={newMenuCategory}
                  onChange={(e) => setNewMenuCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FAF6F0] border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C5A059] cursor-pointer font-semibold"
                >
                  <option value="hemat">Hemat (&lt;15rb)</option>
                  <option value="standard">Standard (15-25rb)</option>
                  <option value="sultan">Sultan (25rb+)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#C5A059] hover:bg-[#B38E5D] text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah ke Roda
              </button>
            </form>
          </div>

          {/* ACTIVE MENU LIST & DELETION */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col max-h-[420px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-[#261C19] flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#C5A059]" /> Daftar Opsi Roda ({filteredMenu.length})
              </h3>
              {menuList.length !== DEFAULT_MENU_PRESETS.length && (
                <button
                  onClick={() => setMenuList(DEFAULT_MENU_PRESETS)}
                  className="text-xs text-[#C5A059] font-bold hover:underline cursor-pointer"
                >
                  Reset Preset
                </button>
              )}
            </div>

            {/* SCROLLABLE LIST */}
            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              {filteredMenu.length > 0 ? (
                filteredMenu.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#FAF6F0] border border-slate-200/80 rounded-xl flex items-center justify-between hover:border-[#C5A059] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div>
                        <p className="font-bold text-xs md:text-sm text-[#261C19]">{item.name}</p>
                        <p className="text-[11px] text-slate-500">{item.priceRange}</p>
                      </div>
                    </div>

                    <button
                      disabled={isSpinning}
                      onClick={() => handleDeleteMenu(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus Menu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Tidak ada menu pada filter ini. Silakan ganti filter atau tambah menu baru.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}