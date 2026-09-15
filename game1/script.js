// =========================================================
// PLANTS VS. ZOMBIES - WEB GAME ENGINE & AUDIO SYSTEM
// =========================================================

// --- DEFAULT PVZ QUESTION BANK ---
const defaultQuestions = [
    {
        id: 1,
        mission: "Đợt 01: Zombie thường tiến công!",
        question: "Cây nào trong Plants vs. Zombies có khả năng sản xuất Mặt trời?",
        options: ["Peashooter (Bắn Đậu)", "Sunflower (Hoa Hướng Dương)", "Wall-nut (Quả Óc Chó)", "Cherry Bomb (Quả Anh Đào)"],
        correctIndex: 1, // B. Sunflower
        zombieType: "🧟", // Regular Zombie
        completed: false
    },
    {
        id: 2,
        mission: "Đợt 02: Zombie Đội Nón Chóp xuất hiện!",
        question: "12 + 15 × 2 bằng bao nhiêu?",
        options: ["54", "42", "27", "40"],
        correctIndex: 1, // B. 42
        zombieType: "🧟‍♂️", // Conehead
        completed: false
    },
    {
        id: 3,
        mission: "Đợt 03: Đàn Zombie vượt sông!",
        question: "Cây Peashooter bắn ra loại đạn nào để tấn công Zombie?",
        options: ["Tia laser", "Hạt Đậu Xanh", "Quả Dưa hấu", "Lửa đỏ"],
        correctIndex: 1, // B. Hạt Đậu Xanh
        zombieType: "🧟",
        completed: false
    },
    {
        id: 4,
        mission: "Đợt 04: Zombie Đội Xô Sắt cực trâu!",
        question: "Hình nào sau đây KHÔNG có góc?",
        options: ["Hình vuông", "Hình tam giác", "Hình tròn", "Hình chữ nhật"],
        correctIndex: 2, // C. Hình tròn
        zombieType: "🧟‍♂️",
        completed: false
    },
    {
        id: 5,
        mission: "Đợt Cuối Cùng: Tổng tấn công Khu Vườn!",
        question: "Để bảo vệ ngôi nhà khỏi Zombie, điều quan trọng nhất là gì?",
        options: ["Không trồng cây nào", "Đấu trí trả lời thật chính xác", "Bỏ chạy khỏi nhà", "Cho Zombie ăn não"],
        correctIndex: 1, // B. Đấu trí
        zombieType: "🧟‍♂️",
        completed: false
    }
];

let questions = defaultQuestions;
try {
    const saved = localStorage.getItem('pvzGameQuestions');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
            questions = parsed;
        }
    }
} catch (e) {
    questions = defaultQuestions;
}

// --- AUDIO & MUSIC ENGINE (PvZ Original Theme) ---
const bgmAudio = new Audio('sounds/02.%20Crazy%20Dave%20(Intro%20Theme).mp3');
bgmAudio.loop = true;
let currentVolume = 0.5;
let lastVolume = 0.5;
bgmAudio.volume = currentVolume;

let audioCtx = null;
let isMuted = false;

function initAudioContext() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    } catch (e) {
        console.warn("Audio Context Init:", e);
    }
}

// Auto-play BGM on first user interaction with the page
function enableAudioOnFirstTouch() {
    initAudioContext();
    if (!isMuted && bgmAudio.paused) {
        bgmAudio.play().catch(e => console.log("Waiting for user gesture:", e));
    }
}
document.addEventListener('click', enableAudioOnFirstTouch, { once: true });
document.addEventListener('touchstart', enableAudioOnFirstTouch, { once: true });
document.addEventListener('keydown', enableAudioOnFirstTouch, { once: true });

// --- FULLSCREEN TOGGLE SYSTEM (Bấm phím 'F' để bật/tắt toàn màn hình) ---
function toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(err => console.warn('Fullscreen request denied:', err));
        } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
            docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
            docEl.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => console.warn('Exit fullscreen error:', err));
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Bắt sự kiện phím 'F' / 'f' trên toàn bộ ứng dụng (trừ khi đang nhập liệu vào thẻ input)
document.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toUpperCase() : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement.isContentEditable) {
        return;
    }

    if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
    }
});

// Change volume (0 - 100)
function changeVolume(val) {
    const num = Math.max(0, Math.min(100, parseInt(val) || 0));
    currentVolume = num / 100;
    bgmAudio.volume = currentVolume;

    if (currentVolume === 0) {
        isMuted = true;
    } else {
        isMuted = false;
        if (bgmAudio.paused) {
            bgmAudio.play().catch(() => { });
        }
    }

    // Determine icon
    let icon = '🔊';
    if (num === 0) icon = '🔇';
    else if (num <= 35) icon = '🔈';
    else if (num <= 70) icon = '🔉';

    // Update Top Controls
    const topSlider = document.getElementById('top-vol-slider');
    const topTxt = document.getElementById('top-vol-txt');
    const topIcon = document.getElementById('top-vol-icon');
    if (topSlider) topSlider.value = num;
    if (topTxt) topTxt.innerText = `${num}%`;
    if (topIcon) topIcon.innerText = icon;

    // Update Pause Modal
    const pauseSlider = document.getElementById('pause-vol-slider');
    const pauseTxt = document.getElementById('pause-vol-txt');
    const pauseIcon = document.getElementById('pause-vol-icon');
    if (pauseSlider) pauseSlider.value = num;
    if (pauseTxt) pauseTxt.innerText = `${num}%`;
    if (pauseIcon) pauseIcon.innerText = icon;
}

function toggleMute() {
    if (isMuted || currentVolume === 0) {
        const restore = lastVolume > 0 ? Math.round(lastVolume * 100) : 50;
        changeVolume(restore);
    } else {
        lastVolume = currentVolume;
        changeVolume(0);
    }
}

// Low-level tone generator for SFX (scaled by volume)
function playTone(freq, type = 'sine', duration = 0.2, vol = 0.15, pitchDecay = true) {
    if (isMuted || currentVolume === 0) return;
    initAudioContext();
    if (!audioCtx) return;

    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        if (pitchDecay) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.5), audioCtx.currentTime + duration);
        }

        const finalVol = vol * currentVolume;
        gain.gain.setValueAtTime(finalVol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn("Audio error", e);
    }
}

// PvZ Sound Effects & Themes
const PvZAudio = {
    playClick: () => {
        playTone(450, 'sine', 0.08, 0.2);
    },
    playSun: () => {
        playTone(587, 'triangle', 0.12, 0.18, false);
        setTimeout(() => playTone(880, 'sine', 0.25, 0.2, false), 80);
    },
    playShoot: () => {
        playTone(320, 'square', 0.1, 0.15, true);
    },
    playSplat: () => {
        playTone(180, 'sawtooth', 0.15, 0.25, true);
    },
    playZombieGroan: () => {
        playTone(85, 'sawtooth', 0.6, 0.3, true);
        setTimeout(() => playTone(70, 'sawtooth', 0.5, 0.25, true), 200);
    },
    playCorrect: () => {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((n, i) => {
            setTimeout(() => playTone(n, 'triangle', 0.25, 0.2, false), i * 100);
        });
    },
    playWrong: () => {
        playTone(160, 'sawtooth', 0.4, 0.35, true);
        setTimeout(() => playTone(110, 'sawtooth', 0.5, 0.35, true), 150);
    },
    playVictory: () => {
        const victoryNotes = [
            { f: 523, d: 0.2 }, { f: 659, d: 0.2 }, { f: 784, d: 0.2 },
            { f: 1046, d: 0.5 }, { f: 880, d: 0.2 }, { f: 1046, d: 0.7 }
        ];
        victoryNotes.forEach((n, i) => {
            setTimeout(() => playTone(n.f, 'sine', n.d, 0.25, false), i * 180);
        });
    },
    startBgm: () => {
        if (isMuted || currentVolume === 0) return;
        bgmAudio.play().catch(e => console.log("BGM Play Error:", e));
    },
    stopBgm: () => {
        bgmAudio.pause();
    }
};

// --- GAME STATE ---
let currentQuestionIndex = 0;
let sunScore = 50;
let totalMissions = questions.length;
const appDiv = document.getElementById('app');

// --- RENDER APP STRUCTURE ---
function renderApp() {
    appDiv.innerHTML = `
        <!-- FLOATING TOP CONTROLS -->
        <div class="top-controls">
            <!-- Volume Widget Hover Expand -->
            <div class="volume-widget" title="Rê chuột để chỉnh âm lượng">
                <button class="volume-btn" onclick="toggleMute()" title="Bật/Tắt âm thanh">
                    <span id="top-vol-icon">${isMuted || currentVolume === 0 ? '🔇' : (currentVolume <= 0.35 ? '🔈' : (currentVolume <= 0.7 ? '🔉' : '🔊'))}</span>
                </button>
                <div class="volume-slider-panel">
                    <input type="range" class="pvz-slider" id="top-vol-slider" min="0" max="100" value="${Math.round(currentVolume * 100)}" oninput="changeVolume(this.value)">
                    <span class="volume-label" id="top-vol-txt">${Math.round(currentVolume * 100)}%</span>
                </div>
            </div>

            <button class="icon-btn" id="top-home-btn" onclick="window.location.href='../index.html'" title="Trở về Menu chọn trò chơi">
                🏠
            </button>

            <button class="icon-btn" onclick="handleSettingsClick()" title="Cài đặt / Tạm dừng">
                ⚙️
            </button>
        </div>

        <!-- MODAL TẠM DỪNG KHI ĐANG TRONG TRẬN ĐẤU -->
        <div id="pause-modal" class="pause-modal-overlay">
            <div class="pause-modal-box">
                <h2 class="pause-modal-title">⏸️ TẠM DỪNG</h2>
                <p class="pause-modal-desc" id="pause-modal-desc">Trận chiến đang tạm dừng.</p>
                
                <div class="pause-vol-row">
                    <span id="pause-vol-icon">${isMuted || currentVolume === 0 ? '🔇' : '🔊'}</span>
                    <span>ÂM LƯỢNG:</span>
                    <input type="range" class="pvz-slider" id="pause-vol-slider" min="0" max="100" value="${Math.round(currentVolume * 100)}" oninput="changeVolume(this.value)">
                    <span class="volume-label" id="pause-vol-txt">${Math.round(currentVolume * 100)}%</span>
                </div>

                <div class="pause-modal-actions">
                    <button class="pvz-btn" onclick="closePauseModal()">
                        ▶ TIẾP TỤC CHƠI
                    </button>
                    <button class="pvz-btn pvz-btn-wood" onclick="exitToMainMenu()">
                        🚪 VỀ MÀN HÌNH PLAY
                    </button>
                </div>
            </div>
        </div>

        <!-- MODAL XÁC THỰC QUẢN TRỊ VIÊN (BẢO MẬT MẬT KHẨU: uyen123) -->
        <div id="auth-modal" class="pause-modal-overlay">
            <div class="pause-modal-box" style="max-width: 440px;">
                <h2 class="pause-modal-title" style="color: #ffd54f;">🔒 BẢO MẬT QUẢN TRỊ</h2>
                <p class="pause-modal-desc" style="margin-bottom: 0.8rem; font-size: 1.1rem;">
                    Vui lòng nhập mật khẩu để vào Quản lý câu hỏi:
                </p>
                
                <form onsubmit="submitAdminAuth(event)" style="width: 100%;">
                    <input type="password" id="admin-auth-input" class="auth-input-field" placeholder="Nhập mật khẩu (••••••)..." autocomplete="off" required>
                    <div id="auth-error-msg" class="auth-error-text" style="display: none;">❌ Mật khẩu không đúng! Vui lòng thử lại.</div>
                    
                    <div class="pause-modal-actions" style="margin-top: 1.2rem;">
                        <button type="submit" class="pvz-btn">
                            ✔ XÁC NHẬN
                        </button>
                        <button type="button" class="pvz-btn pvz-btn-wood" onclick="closeAuthModal()">
                            ❌ HỦY
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- MÀN HÌNH 1: START / INTRO SCREEN -->
        <div id="screen-intro" class="screen active">
            <div class="pvz-intro-stage">
                <!-- Potato Mine Blinking Antenna Light -->
                <div class="potato-mine-light"></div>

                <!-- Animated Peashooter & Zombie on Start Screen Face-off -->
                <img class="intro-peashooter-actor" id="intro-peashooter" src="images/plant1.jpg" alt="Peashooter">
                <img class="intro-zombie-actor" id="intro-zombie" src="images/zombie1.jpg" alt="Zombie">

                <button class="dirt-start-btn" onclick="startGame()" title="Bấm để bắt đầu chơi!">
                    <span>▶ BẮT ĐẦU CHƠI</span>
                </button>
            </div>
        </div>

        <!-- MÀN HÌNH 2: MÀN CHƠI CHÍNH (PvZ Stage 3 Background - Focused Green Lawn) -->
        <div id="screen-game" class="screen">
            <!-- 1. BỐI CẢNH CHIẾN TRƯỜNG SÂN CỎ XANH STAGE 3 -->
            <div class="pvz-stage-container">
                <div class="pvz-stage-background">
                    <!-- LIVING ANIMATION LAYER: ĐẠN ĐẬU BAY, MẶT TRỜI TỎA SÁNG -->
                    <div class="lawn-living-layer" id="lawn-living-layer">
                        <!-- Peashooter flying pea bullets across 5 rows -->
                        <div class="stage-pea-bullet" style="top: 15%; left: 18%; animation-delay: 0s;"></div>
                        <div class="stage-pea-bullet" style="top: 32%; left: 18%; animation-delay: 0.6s;"></div>
                        <div class="stage-pea-bullet" style="top: 50%; left: 18%; animation-delay: 0.3s;"></div>
                        <div class="stage-pea-bullet" style="top: 68%; left: 18%; animation-delay: 0.9s;"></div>
                        <div class="stage-pea-bullet" style="top: 85%; left: 18%; animation-delay: 0.45s;"></div>

                        <!-- Sunflower sparkling suns -->
                        <div class="floating-sun-drop" style="top: 22%; left: 24%; animation-delay: 0s;">☀️</div>
                        <div class="floating-sun-drop" style="top: 52%; left: 25%; animation-delay: 1.5s;">☀️</div>
                        <div class="floating-sun-drop" style="top: 78%; left: 24%; animation-delay: 0.8s;">☀️</div>
                    </div>

                    <!-- DÀN HOA HƯỚNG DƯƠNG (flower.jpg) - 5 CÂY Ở CỘT CỎ TRONG CÙNG BÊN TRÁI -->
                    <div class="sunflower-column" id="sunflower-column">
                        <!-- Rendered dynamically by renderBattlefieldActors() -->
                    </div>

                    <!-- DÀN CÂY SÚNG PEASHOOTER (TỰ ĐỘNG SINH THEO SỐ CÂU HỎI, BẮT ĐẦU TỪ CỘT CỎ THỨ 2) -->
                    <div class="peashooter-column" id="peashooter-column">
                        <!-- Rendered dynamically by renderBattlefieldActors() -->
                    </div>

                    <!-- DÀN ZOMBIE (TỰ ĐỘNG SINH THEO SỐ CÂU HỎI, TỰ SANG CỘT MỚI KHI > 5 CÂU) -->
                    <div class="zombie-column" id="zombie-column">
                        <!-- Rendered dynamically by renderBattlefieldActors() -->
                    </div>

                    <!-- GIAO DIỆN 1: BẢN ĐỒ CHỌN CÂU HỎI SỐ 1, 2, 3, 4, 5, 6... (Ở GIỮA CỎ) -->
                    <div class="lawn-number-board" id="lawn-number-board">
                        <div class="lawn-select-header">
                            <div class="lawn-select-title">🌻 CHỌN ĐỢT TẤN CÔNG</div>
                            <div class="lawn-select-progress" id="lawn-select-progress">ĐÃ VƯỢT QUA: 0/${totalMissions} 🚩</div>
                        </div>
                        <div class="lawn-number-grid" id="lawn-number-grid">
                            <!-- Rendered by JS -->
                        </div>
                    </div>

                    <!-- GIAO DIỆN 2: BẢNG TRẢ LỜI CÂU HỎI ĐÃ CHỌN -->
                    <div class="lawn-question-board" id="lawn-question-board" style="display: none;">
                        <div class="lawn-question-plank">
                            <div class="lawn-plank-header">
                                <span class="lawn-wave-tag" id="board-mission-name">🧟 ĐỢT 1: ZOMBIE TIẾN CÔNG</span>
                                <button class="lawn-back-btn" onclick="returnToNumberSelect()" title="Chọn câu khác">◀ ĐỔI CÂU</button>
                                <span class="lawn-sun-tag">☀️ <span id="board-sun-count">${sunScore}</span></span>
                            </div>
                            <div class="lawn-question-text" id="question-text">Đang tải câu hỏi...</div>
                        </div>

                        <!-- 4 ô đáp án dạng hạt mầm đặt trực tiếp lên các ô cỏ -->
                        <div class="lawn-answers-grid" id="answers-grid">
                            <!-- Rendered by JS -->
                        </div>

                        <!-- Bảng hoàn thành đợt -->
                        <div class="lawn-success-panel" id="wave-cleared-panel">
                            <h3 id="wave-cleared-title">🎉 ĐÃ ĐẨY LÙI ZOMBIE!</h3>
                            <p>🌻 +50 MẶT TRỜI ĐƯỢC THƯỞNG</p>
                            <button class="pvz-btn" onclick="returnToNumberSelect()">
                                ➡ CHỌN ĐỢT TIẾP THEO
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ready Set Plant Banner Transition -->
            <div class="ready-banner-overlay" id="ready-banner">
                <div class="ready-banner-text">🌱 SẴN SÀNG CHIẾN ĐẤU! 🌱</div>
            </div>

            <!-- Wave Progress Bar at Top -->
            <div class="pvz-top-wave-bar">
                <span class="wave-flag-icon">🚩</span>
                <span class="wave-bar-title" id="wave-progress-text">ĐÃ VƯỢT: 0/${totalMissions}</span>
                <div class="wave-progress-track">
                    <div class="wave-progress-fill" id="wave-progress-fill"></div>
                </div>
            </div>

            <!-- Stamp icon (✅ hoặc ❌) -->
            <div class="feedback-stamp" id="feedback-stamp"></div>
        </div>

        <!-- MÀN HÌNH 3: VICTORY SCREEN -->
        <div id="screen-victory" class="screen">
            <div class="victory-box">
                <div class="trophy-icon">🏆</div>
                <h1 class="victory-title">BẢO VỆ KHU VƯỜN THÀNH CÔNG!</h1>
                <p class="victory-desc">🎉 Toàn bộ ${totalMissions} đợt Zombie đã bị tiêu diệt hoàn toàn!</p>
                <div style="font-size: 4rem; margin-bottom: 2rem;">🌻 🌻 🌻 🌻 🌻</div>
                <button class="pvz-btn" onclick="restartGame()">
                    🔄 CHƠI LẠI TỪ ĐẦU
                </button>
            </div>
        </div>

        <!-- MÀN HÌNH 4: ADMIN DASHBOARD -->
        <div id="screen-admin" class="screen">
            <div class="admin-container">
                <div class="admin-header">
                    <h2>⚙️ QUẢN LÝ CÂU HỎI PVZ</h2>
                    <button class="pvz-btn pvz-btn-wood" style="padding: 0.5rem 1.8rem; font-size: 1.3rem;" onclick="closeAdmin()">Thoát</button>
                </div>

                <div class="question-list" id="admin-question-list">
                    <!-- Questions rendered here -->
                </div>

                <form class="add-question-form" id="admin-question-form" onsubmit="handleFormSubmit(event)">
                    <h3 id="form-title">+ Thêm Câu Hỏi Mới</h3>

                    <!-- BẢNG KÝ HIỆU TOÁN HỌC NHANH -->
                    <div class="math-toolbar-box">
                        <div class="math-toolbar-title">
                            <span>📐 BẢNG KÝ HIỆU TOÁN HỌC (Bấm để chèn trực tiếp vào ô đang nhập):</span>
                        </div>
                        <div class="math-symbol-tags" id="math-symbol-tags-container">
                            <!-- Dynamic Math Symbols & Custom Add Button rendered here -->
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Tên Đợt Tấn Công</label>
                        <input type="text" id="admin-mission" placeholder="VD: Đợt 06: Zombie Vũ Trụ xuất hiện" required>
                    </div>
                    <div class="form-group">
                        <label>Nội dung câu hỏi</label>
                        <input type="text" id="admin-question" placeholder="VD: 15 + 25 = ? hoặc x² + 2x = 0" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>Đáp án A</label>
                            <input type="text" id="admin-opt-0" required>
                        </div>
                        <div class="form-group">
                            <label>Đáp án B</label>
                            <input type="text" id="admin-opt-1" required>
                        </div>
                        <div class="form-group">
                            <label>Đáp án C</label>
                            <input type="text" id="admin-opt-2" required>
                        </div>
                        <div class="form-group">
                            <label>Đáp án D</label>
                            <input type="text" id="admin-opt-3" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Đáp án đúng là:</label>
                        <select id="admin-correct" required>
                            <option value="0">A</option>
                            <option value="1">B</option>
                            <option value="2">C</option>
                            <option value="3">D</option>
                        </select>
                    </div>
                    <button type="submit" id="form-submit-btn" class="pvz-btn" style="margin-top: 1rem; width: 100%;">
                        + LƯU CÂU HỎI VÀO GAME
                    </button>
                    <button type="button" id="form-cancel-btn" class="pvz-btn btn-cancel-edit" style="display: none; margin-top: 0.8rem; width: 100%;" onclick="cancelEditQuestion()">
                        ❌ HỦY CHỈNH SỬA
                    </button>
                    <button type="button" class="btn-small" style="margin-top: 1.2rem; background: #546e7a;" onclick="resetToDefault()">
                        Khôi phục câu hỏi PvZ gốc
                    </button>
                </form>
            </div>
        </div>
    `;
}

let cleanPlantDataUrl = null;
let cleanZombieDataUrl = null;
let cleanFlowerDataUrl = null;

// Render dynamic Plants & Zombies matching the exact number of questions
// If questions > 5, automatically spills over into new columns (sang hàng/cột mới)
function renderBattlefieldActors() {
    const plantsContainer = document.getElementById('peashooter-column');
    const zombiesContainer = document.getElementById('zombie-column');
    const sunflowersContainer = document.getElementById('sunflower-column');
    if (!plantsContainer || !zombiesContainer) return;

    plantsContainer.innerHTML = '';
    zombiesContainer.innerHTML = '';

    // Tọa độ tiếp đất cho Gốc Hoa Hướng Dương (Cột 1 trong cùng):
    const sunflowerRowTops = ['7.5%', '23.5%', '39.5%', '55.5%', '71.5%'];
    // Tọa độ tiếp đất cho Gốc Cây Súng Peashooter (Hạ xuống để chân nằm chính giữa tâm ô cỏ):
    const peashooterRowTops = ['10.5%', '26.5%', '42.5%', '58.5%', '74.5%'];
    // Tọa độ tiếp đất cho Bàn Chân Zombie (Foot contact tại tâm mỗi hàng cỏ):
    const zombieRowTops = ['1.0%', '17.0%', '33.0%', '49.0%', '65.0%'];

    // 1. Dàn 5 Hoa Hướng Dương cố định ở cột cỏ trong cùng bên trái (8.5%)
    if (sunflowersContainer) {
        sunflowersContainer.innerHTML = '';
        sunflowerRowTops.forEach((topPos, rowIdx) => {
            const flowerSlot = document.createElement('div');
            flowerSlot.className = 'sunflower-slot';
            flowerSlot.style.top = topPos;
            flowerSlot.style.left = '8.5%';
            flowerSlot.innerHTML = `
                <img class="sunflower-row-actor" id="sunflower-actor-${rowIdx}" src="${cleanFlowerDataUrl || 'images/flower.jpg'}" alt="Sunflower ${rowIdx + 1}" title="Hoa Hướng Dương Hàng ${rowIdx + 1}" style="animation-delay: ${(rowIdx * 0.35) % 1.5}s;">
            `;
            sunflowersContainer.appendChild(flowerSlot);
        });
    }

    // 2. Dàn Peashooter căn chuẩn vào CHÍNH GIỮA TÂM Ô CỎ thứ 2 (20.0%), quá 5 cây sang tâm ô 3 (29.5%), ô 4 (39.0%)
    const plantLefts = ['20.0%', '29.5%', '39.0%'];
    // 3. Dàn Zombie bắt đầu từ CỘT CỎ NGOÀI CÙNG MÉP PHẢI (86.5%), quá 5 con sang cột 8 (77.5%), cột 7 (68.5%)
    const zombieLefts = ['86.5%', '77.5%', '68.5%'];

    questions.forEach((q, i) => {
        const rIdx = i % 5;
        const cIdx = Math.floor(i / 5);
        const plantTop = peashooterRowTops[rIdx];
        const zombieTop = zombieRowTops[rIdx];
        const plantLeft = plantLefts[cIdx % plantLefts.length];
        const zombieLeft = zombieLefts[cIdx % zombieLefts.length];

        // Plant Slot
        const plantSlot = document.createElement('div');
        plantSlot.className = 'plant-slot';
        plantSlot.style.top = plantTop;
        plantSlot.style.left = plantLeft;
        plantSlot.innerHTML = `
            <img class="plant-row-actor" id="plant-actor-${i}" src="${cleanPlantDataUrl || 'images/plant1.jpg'}" alt="Peashooter ${i + 1}" title="Cây Đợt ${i + 1}" style="animation-delay: ${(i * 0.2) % 1.2}s;">
        `;
        plantsContainer.appendChild(plantSlot);

        // Zombie Slot
        const zombieSlot = document.createElement('div');
        zombieSlot.className = 'zombie-slot';
        zombieSlot.style.top = zombieTop;
        zombieSlot.style.left = zombieLeft;
        zombieSlot.innerHTML = `
            <img class="zombie-row-actor ${q.completed ? 'defeated' : ''}" id="zombie-actor-${i}" src="${cleanZombieDataUrl || 'images/zombie1.jpg'}" alt="Zombie ${i + 1}" title="Zombie Đợt ${i + 1}" style="animation-delay: ${(i * 0.25) % 1.4}s;">
        `;
        zombiesContainer.appendChild(zombieSlot);
    });

    if (!cleanPlantDataUrl || !cleanZombieDataUrl || !cleanFlowerDataUrl) {
        processTransparentSprites();
    }
}

// --- SCREEN SWITCHING ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
    }
    const topHome = document.getElementById('top-home-btn');
    if (topHome) {
        topHome.style.display = (screenId === 'screen-intro') ? 'inline-flex' : 'none';
    }
}

// --- GAMEPLAY LOGIC & TRANSITIONS ---
function startGame() {
    initAudioContext();
    PvZAudio.playClick();
    PvZAudio.startBgm();

    currentQuestionIndex = 0;
    sunScore = 50;
    totalMissions = questions.length;
    questions.forEach(q => q.completed = false);

    // Tự động sinh số lượng Hoa, Cây và Zombie
    renderBattlefieldActors();

    const gameScreen = document.getElementById('screen-game');
    if (gameScreen) {
        gameScreen.classList.add('entering');
    }
    showScreen('screen-game');

    // 1. Kích hoạt hoạt cảnh Banner "SẴN SÀNG CHIẾN ĐẤU!"
    const banner = document.getElementById('ready-banner');
    if (banner) {
        banner.classList.remove('show');
        void banner.offsetWidth; // Reflow để khởi chạy lại animation
        banner.classList.add('show');
    }

    // 2. Ẩn tạm bảng số và các nhân vật trong lúc lia máy từ ngoài đường phóng vào sân cỏ
    const qBoard = document.getElementById('lawn-question-board');
    const numBoard = document.getElementById('lawn-number-board');
    const sunCol = document.getElementById('sunflower-column');
    const peaCol = document.getElementById('peashooter-column');
    const zombieCol = document.getElementById('zombie-column');

    if (qBoard) qBoard.style.display = 'none';

    if (sunCol) {
        sunCol.style.opacity = '0';
        sunCol.style.transform = 'translateX(-60px)';
        sunCol.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }
    if (peaCol) {
        peaCol.style.opacity = '0';
        peaCol.style.transform = 'translateX(-60px)';
        peaCol.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }
    if (zombieCol) {
        zombieCol.style.opacity = '0';
        zombieCol.style.transform = 'translateX(60px)';
        zombieCol.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }

    if (numBoard) {
        numBoard.style.display = 'flex';
        numBoard.style.opacity = '0';
        numBoard.style.transform = 'translateY(40px) scale(0.9)';
        numBoard.style.transition = 'opacity 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }

    // Hoa, Cây và Zombie trượt vào đội hình khi máy quay bay sâu vào bãi cỏ
    setTimeout(() => {
        if (sunCol) {
            sunCol.style.opacity = '1';
            sunCol.style.transform = 'translateX(0)';
        }
        if (peaCol) {
            peaCol.style.opacity = '1';
            peaCol.style.transform = 'translateX(0)';
        }
        if (zombieCol) {
            zombieCol.style.opacity = '1';
            zombieCol.style.transform = 'translateX(0)';
        }
    }, 1500);

    // Bảng chọn số trượt xuống khi camera đã dừng vững trên thảm cỏ chính
    setTimeout(() => {
        if (numBoard) {
            numBoard.style.opacity = '1';
            numBoard.style.transform = 'translateY(0) scale(1)';
        }
    }, 2100);

    // Kết thúc trạng thái entering
    setTimeout(() => {
        if (gameScreen) gameScreen.classList.remove('entering');
    }, 2500);

    renderNumberGrid();
}

function renderNumberGrid() {
    const grid = document.getElementById('lawn-number-grid');
    const progressEl = document.getElementById('lawn-select-progress');
    const waveText = document.getElementById('wave-progress-text');
    const waveFill = document.getElementById('wave-progress-fill');

    const completedCount = questions.filter(q => q.completed).length;
    totalMissions = questions.length;

    if (progressEl) {
        progressEl.innerText = `ĐÃ VƯỢT QUA: ${completedCount}/${totalMissions} 🚩`;
    }
    if (waveText) {
        waveText.innerText = `TIẾN ĐỘ: ${completedCount}/${totalMissions}`;
    }
    if (waveFill) {
        const percent = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;
        waveFill.style.width = `${percent}%`;
    }

    if (!grid) return;
    grid.innerHTML = '';

    // Tự động điều chỉnh số cột grid nếu có nhiều câu hỏi (3 cột hoặc 4 cột)
    if (questions.length > 6) {
        grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    } else {
        grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    }

    questions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = `lawn-number-card ${q.completed ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="lawn-number-digit">${idx + 1}</div>
            <div class="lawn-number-sub">${q.completed ? '🌻 ĐÃ XONG' : '🌼 ĐỢT ' + (idx + 1)}</div>
        `;

        if (!q.completed) {
            card.onclick = () => openQuestion(idx);
        }

        grid.appendChild(card);
    });
}

function openQuestion(index) {
    PvZAudio.playClick();
    currentQuestionIndex = index;

    const numBoard = document.getElementById('lawn-number-board');
    const qBoard = document.getElementById('lawn-question-board');

    if (numBoard) numBoard.style.display = 'none';
    if (qBoard) {
        qBoard.style.display = 'flex';
        qBoard.style.animation = 'none';
        void qBoard.offsetWidth; // reflow
        qBoard.style.animation = 'plantBoardPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }

    loadQuestion(index);
}

function returnToNumberSelect() {
    PvZAudio.playClick();

    // Kiểm tra đã chiến thắng tất cả các câu chưa
    const completedCount = questions.filter(q => q.completed).length;
    if (completedCount >= questions.length && questions.length > 0) {
        triggerVictory();
        return;
    }

    const numBoard = document.getElementById('lawn-number-board');
    const qBoard = document.getElementById('lawn-question-board');

    if (qBoard) qBoard.style.display = 'none';
    if (numBoard) {
        numBoard.style.display = 'flex';
        numBoard.style.animation = 'none';
        void numBoard.offsetWidth; // reflow
        numBoard.style.animation = 'plantBoardPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }

    renderNumberGrid();
}

function loadQuestion(index) {
    if (index >= questions.length) {
        triggerVictory();
        return;
    }

    const q = questions[index];

    // Update Wave Progress Bar
    const waveText = document.getElementById('wave-progress-text');
    const completedCount = questions.filter(item => item.completed).length;
    if (waveText) waveText.innerText = `TIẾN ĐỘ: ${completedCount}/${totalMissions}`;

    // Update Question Board plank
    const missionName = document.getElementById('board-mission-name');
    if (missionName) missionName.innerText = `🧟 ĐỢT ${index + 1}: ${q.mission || 'ZOMBIE TIẾN CÔNG'}`;

    const sunCount = document.getElementById('board-sun-count');
    if (sunCount) sunCount.innerText = sunScore;

    const qText = document.getElementById('question-text');
    if (qText) qText.innerText = q.question;

    const clearedPanel = document.getElementById('wave-cleared-panel');
    if (clearedPanel) clearedPanel.style.display = 'none';

    const grid = document.getElementById('answers-grid');
    if (!grid) return;
    grid.style.display = 'grid';
    grid.innerHTML = '';

    const prefixes = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'lawn-answer-card';
        btn.innerHTML = `<span class="prefix">${prefixes[idx]}.</span> <span>${opt}</span>`;
        btn.onclick = () => handleAnswer(btn, idx);
        grid.appendChild(btn);
    });

    // Kích hoạt render công thức toán học KaTeX nếu có
    triggerMathRender(document.getElementById('lawn-question-board'));
}

function handleAnswer(btnElement, selectedIdx) {
    if (btnElement.disabled) return;

    const q = questions[currentQuestionIndex];
    const stamp = document.getElementById('feedback-stamp');
    const targetRow = currentQuestionIndex % 5;
    const targetPlant = document.getElementById(`plant-actor-${currentQuestionIndex}`);
    const targetZombie = document.getElementById(`zombie-actor-${currentQuestionIndex}`);

    if (selectedIdx === q.correctIndex) {
        // === TRẢ LỜI ĐÚNG ===
        btnElement.classList.add('correct');
        document.querySelectorAll('.lawn-answer-card').forEach(b => b.disabled = true);

        PvZAudio.playCorrect();
        PvZAudio.playSun();

        // 1. Cây bắn đậu tương ứng xả đạn liên thanh vào chú Zombie của câu này
        triggerLanePeaBarrage(targetRow, () => {
            // Khi đạn bắn trúng: Zombie của câu này gục ngã và biến mất
            if (targetZombie) {
                targetZombie.classList.remove('hurt', 'attacking');
                void targetZombie.offsetWidth;
                targetZombie.classList.add('falling-defeated');
                setTimeout(() => {
                    targetZombie.classList.add('defeated');
                    targetZombie.classList.remove('falling-defeated');
                }, 950);
            }
        });

        // 2. Chú cây Peashooter tương ứng bật nhảy ăn mừng
        if (targetPlant) {
            targetPlant.classList.remove('celebrating');
            void targetPlant.offsetWidth;
            targetPlant.classList.add('celebrating');
            setTimeout(() => targetPlant.classList.remove('celebrating'), 1800);
        }

        // Cập nhật trạng thái hoàn thành câu
        q.completed = true;
        sunScore += 50;
        const sunCounter = document.getElementById('board-sun-count');
        if (sunCounter) sunCounter.innerText = sunScore;

        // Cập nhật tiến độ wave
        const completedCount = questions.filter(item => item.completed).length;
        const waveFill = document.getElementById('wave-progress-fill');
        if (waveFill) waveFill.style.width = `${(completedCount / totalMissions) * 100}%`;

        // Bắn pháo giấy ăn mừng
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 }
            });
        }

        // Hiện panel hoàn thành đợt
        setTimeout(() => {
            const grid = document.getElementById('answers-grid');
            if (grid) grid.style.display = 'none';
            const clearedPanel = document.getElementById('wave-cleared-panel');
            if (clearedPanel) {
                const titleEl = document.getElementById('wave-cleared-title');
                titleEl.innerText = `🎉 ĐÃ TIÊU DIỆT ZOMBIE ĐỢT ${currentQuestionIndex + 1}!`;
                clearedPanel.style.display = 'flex';
            }
        }, 800);

    } else {
        // === TRẢ LỜI SAI ===
        btnElement.classList.add('wrong');
        PvZAudio.playWrong();
        PvZAudio.playZombieGroan();

        if (stamp) {
            stamp.innerText = '❌';
            stamp.style.color = '#ef4444';
            stamp.classList.add('show');
        }

        // Zombie của câu này lao lên đe dọa khi người chơi trả lời sai
        if (targetZombie && !targetZombie.classList.contains('defeated')) {
            targetZombie.classList.remove('hurt', 'attacking');
            void targetZombie.offsetWidth;
            targetZombie.classList.add('attacking');
            setTimeout(() => targetZombie.classList.remove('attacking'), 900);
        }

        setTimeout(() => {
            if (stamp) stamp.classList.remove('show');
            btnElement.classList.remove('wrong');
        }, 1200);
    }
}

// Bắn loạt đạn đậu tập trung trên đúng 1 hàng của câu hỏi để tiêu diệt 1 Zombie
function triggerLanePeaBarrage(rowIdx, onHitCallback) {
    const layer = document.getElementById('lawn-living-layer');
    if (!layer) return;

    const rowTops = ['20.5%', '36.0%', '51.5%', '67.0%', '82.5%'];
    const topPos = rowTops[rowIdx] || '51.5%';

    for (let b = 0; b < 3; b++) {
        setTimeout(() => {
            PvZAudio.playShoot();
            const pea = document.createElement('div');
            pea.className = 'stage-pea-bullet';
            pea.style.top = topPos;
            pea.style.left = '24.5%';
            pea.style.setProperty('--fly-dist', '63.5vw');
            pea.style.animation = 'flyPea 0.4s linear forwards';
            layer.appendChild(pea);

            setTimeout(() => {
                PvZAudio.playSplat();
                const splat = document.createElement('div');
                splat.className = 'impact-splat';
                splat.innerText = 'SPLAT!';
                splat.style.top = topPos;
                splat.style.left = '87%';
                layer.appendChild(splat);

                // Khi viên đạn thứ 3 trúng đích -> Zombie gục ngã
                if (b === 2 && onHitCallback) {
                    onHitCallback();
                }

                setTimeout(() => {
                    pea.remove();
                    splat.remove();
                }, 450);
            }, 360);
        }, b * 130);
    }
}

// Spawn flying pea bullet across the lane
function spawnPeaBullet(rowEl, plantEl, zombieEl) {
    if (!rowEl || !plantEl || !zombieEl) return;

    const bullet = document.createElement('div');
    bullet.className = 'pea-bullet';

    const plantRect = plantEl.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();

    const startX = plantRect.right - rowRect.left;
    const startY = (plantRect.top + plantRect.height / 2) - rowRect.top - 10;

    bullet.style.left = `${startX}px`;
    bullet.style.top = `${startY}px`;
    bullet.style.transition = 'left 0.35s linear';

    rowEl.appendChild(bullet);

    // Animate moving right to zombie
    requestAnimationFrame(() => {
        const zombieRect = zombieEl.getBoundingClientRect();
        const targetX = zombieRect.left - rowRect.left;
        bullet.style.left = `${targetX}px`;

        setTimeout(() => {
            // Splat text effect
            const splat = document.createElement('div');
            splat.className = 'splat-text';
            splat.innerText = 'SPLAT!';
            splat.style.left = `${targetX - 20}px`;
            splat.style.top = `${startY - 25}px`;
            rowEl.appendChild(splat);

            bullet.remove();
            setTimeout(() => splat.remove(), 600);
        }, 340);
    });
}

function nextWave() {
    PvZAudio.playClick();
    currentQuestionIndex++;

    if (currentQuestionIndex >= questions.length) {
        triggerVictory();
    } else {
        loadQuestion(currentQuestionIndex);
    }
}

function triggerVictory() {
    PvZAudio.stopBgm();
    PvZAudio.playVictory();

    const waveFill = document.getElementById('wave-progress-fill');
    if (waveFill) waveFill.style.width = '100%';
    showScreen('screen-victory');

    if (typeof confetti === 'function') {
        confetti({
            particleCount: 300,
            spread: 120,
            origin: { y: 0.5 }
        });
    }
}

function restartGame() {
    PvZAudio.playClick();
    startGame();
}

// --- SETTINGS & PAUSE CONTROLLER ---
function handleSettingsClick() {
    PvZAudio.playClick();
    const introScreen = document.getElementById('screen-intro');
    const isIntro = introScreen && introScreen.classList.contains('active');

    if (!isIntro) {
        openPauseModal();
    } else {
        openAuthModal();
    }
}

function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    const input = document.getElementById('admin-auth-input');
    const errorMsg = document.getElementById('auth-error-msg');

    if (input) input.value = '';
    if (errorMsg) errorMsg.style.display = 'none';

    if (modal) {
        modal.classList.add('active');
        setTimeout(() => {
            if (input) input.focus();
        }, 100);
    }
}

function closeAuthModal() {
    PvZAudio.playClick();
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
}

function submitAdminAuth(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('admin-auth-input');
    const errorMsg = document.getElementById('auth-error-msg');
    if (!input) return;

    const entered = input.value.trim();
    if (entered.toLowerCase() === 'uyen123') {
        PvZAudio.playCorrect();
        closeAuthModal();
        openAdmin();
    } else {
        PvZAudio.playWrong();
        if (errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.classList.remove('authShake');
            void errorMsg.offsetWidth;
            errorMsg.classList.add('authShake');
        }
        input.value = '';
        input.focus();
    }
}

function openPauseModal() {
    const modal = document.getElementById('pause-modal');
    const desc = document.getElementById('pause-modal-desc');
    if (desc) {
        desc.innerText = `Đang ở Đợt ${currentQuestionIndex + 1}/${totalMissions} - Điểm Mặt Trời: ${sunScore} ☀️`;
    }
    if (modal) {
        modal.classList.add('active');
    }
}

function closePauseModal() {
    PvZAudio.playClick();
    const modal = document.getElementById('pause-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function exitToMainMenu() {
    PvZAudio.playClick();
    closePauseModal();
    PvZAudio.stopBgm();
    showScreen('screen-intro');
}

// --- ADMIN SYSTEM ---
function openAdmin() {
    PvZAudio.playClick();
    renderAdminQuestions();
    renderMathToolbar();
    showScreen('screen-admin');
}

function closeAdmin() {
    PvZAudio.playClick();
    totalMissions = questions.length;
    renderApp();
    showScreen('screen-intro');
}

// --- MATH SYMBOLS & KATEX INTEGRATION ---
let lastFocusedInput = null;
let customMathSymbols = JSON.parse(localStorage.getItem('pvzCustomMathSymbols') || '[]');

document.addEventListener('focusin', (e) => {
    if (e.target && e.target.matches('#admin-question, #admin-opt-0, #admin-opt-1, #admin-opt-2, #admin-opt-3, #admin-mission')) {
        lastFocusedInput = e.target;
    }
});

function renderMathToolbar() {
    const container = document.getElementById('math-symbol-tags-container');
    if (!container) return;

    // 1. Trọn bộ Số Mũ từ 0 đến 9, n, x, +, -
    const superscripts = [
        { display: 'x⁰', val: '⁰', title: 'Mũ 0' },
        { display: 'x¹', val: '¹', title: 'Mũ 1' },
        { display: 'x²', val: '²', title: 'Mũ 2' },
        { display: 'x³', val: '³', title: 'Mũ 3' },
        { display: 'x⁴', val: '⁴', title: 'Mũ 4' },
        { display: 'x⁵', val: '⁵', title: 'Mũ 5' },
        { display: 'x⁶', val: '⁶', title: 'Mũ 6' },
        { display: 'x⁷', val: '⁷', title: 'Mũ 7' },
        { display: 'x⁸', val: '⁸', title: 'Mũ 8' },
        { display: 'x⁹', val: '⁹', title: 'Mũ 9' },
        { display: 'xⁿ', val: 'ⁿ', title: 'Mũ n' },
        { display: 'xˣ', val: 'ˣ', title: 'Mũ x' },
        { display: 'x⁺', val: '⁺', title: 'Mũ cộng' },
        { display: 'x⁻', val: '⁻', title: 'Mũ trừ' }
    ];

    // 2. Phép tính & So sánh (kèm dấu chia hết 3 chấm dọc ⋮, gạch đứng |, không chia hết ∤)
    const basicOps = [
        '+', '−', '×', '÷', '±', '=', '≠', '≈', '<', '>', '≤', '≥', 
        '⋮', '|', '∤', '…'
    ];

    // 3. Căn bậc, phân số, hình học & Hy Lạp
    const advancedSymbols = [
        '√', '∛', 'π', '°', '½', '⅓', '¼', '¾', 
        '△', '∠', '⊥', '∥', 'α', 'β', 'Δ', '∞', 
        '∈', '∉', '⊂', '∪', '∩'
    ];

    let html = `
        <!-- HÀNG 1: TRỌN BỘ SỐ MŨ 0 ĐẾN 9 -->
        <div class="math-group-row">
            <span class="math-row-label">🔢 SỐ MŨ (0 - 9):</span>
            <div class="math-row-buttons">
                ${superscripts.map(s => `<button type="button" class="math-sym-btn math-super-btn" onclick="insertMathSymbol('${s.val}')" title="${s.title}">${s.display}</button>`).join('')}
            </div>
        </div>

        <!-- HÀNG 2: PHÉP TÍNH, CĂN BẬC, HÌNH HỌC & HY LẠP -->
        <div class="math-group-row">
            <span class="math-row-label">📐 KÝ HIỆU & PHÉP TÍNH:</span>
            <div class="math-row-buttons">
                ${basicOps.map(op => `<button type="button" class="math-sym-btn" onclick="insertMathSymbol('${op}')">${op}</button>`).join('')}
                ${advancedSymbols.map(sym => `<button type="button" class="math-sym-btn" onclick="insertMathSymbol('${sym}')">${sym}</button>`).join('')}
            </div>
        </div>

        <!-- HÀNG 4: KÝ TỰ TÙY CHỈNH & LATEX -->
        <div class="math-group-row">
            <span class="math-row-label">🧪 TÙY CHỈNH & LATEX:</span>
            <div class="math-row-buttons">
                ${customMathSymbols.map((sym, cIdx) => {
                    const safe = sym.replace(/'/g, "\\'");
                    return `<button type="button" class="math-sym-btn custom-sym" onclick="insertMathSymbol('${safe}')" oncontextmenu="deleteCustomMathSymbol(event, ${cIdx})" title="Ký tự tự thêm (Chuột phải để xóa)">${sym}</button>`;
                }).join('')}
                <button type="button" class="math-sym-btn katex-btn" onclick="insertMathSymbol('$x^5$')" title="Chèn x mũ 5">$x^5$</button>
                <button type="button" class="math-sym-btn katex-btn" onclick="insertMathSymbol('$\\frac{a}{b}$')" title="Chèn phân số LaTeX">$\\frac{a}{b}$</button>
                <button type="button" class="math-sym-btn katex-btn" onclick="insertMathSymbol('$\\sqrt{x}$')" title="Chèn căn thức LaTeX">$\\sqrt{x}$</button>
                <button type="button" class="math-sym-btn math-add-custom-btn" onclick="promptAddCustomMathSymbol()" title="Bấm để tự thêm ký tự mới">+ Thêm Ký Tự</button>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function promptAddCustomMathSymbol() {
    PvZAudio.playClick();
    const sym = prompt("Nhập ký tự hoặc công thức toán học bạn muốn thêm vào bảng:\n(Ví dụ: ∫, ∑, log, ∜, \\vec{u}, ...)");
    if (sym && sym.trim()) {
        const trimmed = sym.trim();
        if (!customMathSymbols.includes(trimmed)) {
            customMathSymbols.push(trimmed);
            localStorage.setItem('pvzCustomMathSymbols', JSON.stringify(customMathSymbols));
            PvZAudio.playSun();
            renderMathToolbar();
        } else {
            alert("Ký tự này đã có trên bảng rồi!");
        }
    }
}

function deleteCustomMathSymbol(e, index) {
    if (e) e.preventDefault();
    PvZAudio.playClick();
    const sym = customMathSymbols[index];
    if (confirm(`Bạn có muốn xóa ký tự "${sym}" khỏi bảng không?`)) {
        customMathSymbols.splice(index, 1);
        localStorage.setItem('pvzCustomMathSymbols', JSON.stringify(customMathSymbols));
        renderMathToolbar();
    }
}

function insertMathSymbol(symbol) {
    PvZAudio.playClick();
    if (!lastFocusedInput) {
        lastFocusedInput = document.getElementById('admin-question') || document.getElementById('admin-opt-0');
    }
    if (lastFocusedInput) {
        const start = lastFocusedInput.selectionStart ?? lastFocusedInput.value.length;
        const end = lastFocusedInput.selectionEnd ?? lastFocusedInput.value.length;
        const text = lastFocusedInput.value;
        lastFocusedInput.value = text.substring(0, start) + symbol + text.substring(end);
        lastFocusedInput.focus();
        lastFocusedInput.selectionStart = lastFocusedInput.selectionEnd = start + symbol.length;
    }
}

function triggerMathRender(containerEl) {
    if (!containerEl) return;
    try {
        if (typeof renderMathInElement === 'function') {
            renderMathInElement(containerEl, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false },
                    { left: "\\(", right: "\\)", display: false },
                    { left: "\\[", right: "\\]", display: true }
                ],
                throwOnError: false
            });
        }
    } catch (e) {
        console.warn("KaTeX render error:", e);
    }
}

let editingQuestionIndex = -1;

function renderAdminQuestions() {
    const list = document.getElementById('admin-question-list');
    if (!list) return;
    list.innerHTML = '';

    if (questions.length === 0) {
        list.innerHTML = '<p style="color: #94a3b8; text-align: center;">Chưa có câu hỏi nào. Hãy thêm câu hỏi mới!</p>';
        return;
    }

    questions.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'question-item';

        item.innerHTML = `
            <div class="question-item-info">
                <strong>${q.mission}</strong>
                <span><strong>Câu hỏi:</strong> ${q.question}</span><br>
                <span style="color: #a5d6a7;"><strong>Đáp án đúng:</strong> ${q.options[q.correctIndex]}</span>
            </div>
            <div class="question-item-actions" style="display: flex; gap: 8px; flex-shrink: 0;">
                <button class="btn-small btn-edit" onclick="startEditQuestion(${index})" title="Chỉnh sửa câu hỏi này">✏️ Sửa</button>
                <button class="btn-small btn-delete" onclick="deleteQuestion(${index})" title="Xóa câu hỏi này">🗑️ Xóa</button>
            </div>
        `;
        list.appendChild(item);
    });

    triggerMathRender(list);
}

function startEditQuestion(index) {
    PvZAudio.playClick();
    if (index < 0 || index >= questions.length) return;

    editingQuestionIndex = index;
    const q = questions[index];

    // Điền dữ liệu câu hỏi vào Form
    const missionInput = document.getElementById('admin-mission');
    const questionInput = document.getElementById('admin-question');
    const opt0Input = document.getElementById('admin-opt-0');
    const opt1Input = document.getElementById('admin-opt-1');
    const opt2Input = document.getElementById('admin-opt-2');
    const opt3Input = document.getElementById('admin-opt-3');
    const correctSelect = document.getElementById('admin-correct');

    if (missionInput) missionInput.value = q.mission || '';
    if (questionInput) questionInput.value = q.question || '';
    if (opt0Input) opt0Input.value = q.options[0] || '';
    if (opt1Input) opt1Input.value = q.options[1] || '';
    if (opt2Input) opt2Input.value = q.options[2] || '';
    if (opt3Input) opt3Input.value = q.options[3] || '';
    if (correctSelect) correctSelect.value = q.correctIndex !== undefined ? q.correctIndex : 0;

    // Cập nhật giao diện Form sang chế độ chỉnh sửa
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('form-submit-btn');
    const cancelBtn = document.getElementById('form-cancel-btn');
    const formEl = document.getElementById('admin-question-form');

    if (formTitle) formTitle.innerText = `✏️ Chỉnh Sửa Câu Hỏi (Đợt ${index + 1})`;
    if (submitBtn) submitBtn.innerText = `💾 CẬP NHẬT CÂU HỎI`;
    if (cancelBtn) cancelBtn.style.display = 'block';
    if (formEl) {
        formEl.classList.add('editing-mode');
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (questionInput) questionInput.focus();
}

function cancelEditQuestion() {
    PvZAudio.playClick();
    editingQuestionIndex = -1;

    const formEl = document.getElementById('admin-question-form');
    if (formEl) {
        formEl.reset();
        formEl.classList.remove('editing-mode');
    }

    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('form-submit-btn');
    const cancelBtn = document.getElementById('form-cancel-btn');

    if (formTitle) formTitle.innerText = '+ Thêm Câu Hỏi Mới';
    if (submitBtn) submitBtn.innerText = '+ LƯU CÂU HỎI VÀO GAME';
    if (cancelBtn) cancelBtn.style.display = 'none';
}

function handleFormSubmit(e) {
    e.preventDefault();

    const mission = document.getElementById('admin-mission').value.trim();
    const questionText = document.getElementById('admin-question').value.trim();
    const opt0 = document.getElementById('admin-opt-0').value.trim();
    const opt1 = document.getElementById('admin-opt-1').value.trim();
    const opt2 = document.getElementById('admin-opt-2').value.trim();
    const opt3 = document.getElementById('admin-opt-3').value.trim();
    const correctStr = document.getElementById('admin-correct').value;

    if (!mission || !questionText || !opt0 || !opt1 || !opt2 || !opt3) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    if (editingQuestionIndex >= 0 && editingQuestionIndex < questions.length) {
        // === CẬP NHẬT CÂU HỎI ĐANG SỬA ===
        questions[editingQuestionIndex].mission = mission;
        questions[editingQuestionIndex].question = questionText;
        questions[editingQuestionIndex].options = [opt0, opt1, opt2, opt3];
        questions[editingQuestionIndex].correctIndex = parseInt(correctStr);

        PvZAudio.playCorrect();
        saveQuestions();
        renderAdminQuestions();
        cancelEditQuestion();

        alert("🎉 Đã cập nhật câu hỏi thành công!");
    } else {
        // === THÊM CÂU HỎI MỚI ===
        const newQ = {
            id: Date.now(),
            mission: mission,
            question: questionText,
            options: [opt0, opt1, opt2, opt3],
            correctIndex: parseInt(correctStr),
            zombieType: "🧟",
            completed: false
        };

        PvZAudio.playSun();
        questions.push(newQ);
        saveQuestions();
        renderAdminQuestions();

        e.target.reset();
    }
}

function deleteQuestion(index) {
    if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
        if (editingQuestionIndex === index) {
            cancelEditQuestion();
        } else if (editingQuestionIndex > index) {
            editingQuestionIndex--;
        }
        questions.splice(index, 1);
        saveQuestions();
        renderAdminQuestions();
    }
}

function saveQuestions() {
    localStorage.setItem('pvzGameQuestions', JSON.stringify(questions));
}

// Auto-remove light / white / checkerboard backgrounds (including enclosed inner-leg spaces)
function makeImageTransparent(src, onComplete, isOuterBg, isInnerBg) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
        try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            const w = canvas.width;
            const h = canvas.height;
            const visited = new Uint8Array(w * h);
            const queue = [];

            // 1. Flood fill từ 4 viền ngoài để khử toàn bộ phông nền bên ngoài
            for (let x = 0; x < w; x++) {
                queue.push(x, 0);
                queue.push(x, h - 1);
            }
            for (let y = 0; y < h; y++) {
                queue.push(0, y);
                queue.push(w - 1, y);
            }

            while (queue.length > 0) {
                const py = queue.pop();
                const px = queue.pop();
                const pIdx = py * w + px;
                if (visited[pIdx]) continue;
                visited[pIdx] = 1;

                const dIdx = pIdx * 4;
                if (isOuterBg(data[dIdx], data[dIdx + 1], data[dIdx + 2], px, py, w, h)) {
                    data[dIdx + 3] = 0; // Trong suốt

                    if (px > 0 && !visited[pIdx - 1]) queue.push(px - 1, py);
                    if (px < w - 1 && !visited[pIdx + 1]) queue.push(px + 1, py);
                    if (py > 0 && !visited[pIdx - w]) queue.push(px, py - 1);
                    if (py < h - 1 && !visited[pIdx + w]) queue.push(px, py + 1);
                }
            }

            // 2. Quét khử các vùng trắng bị kẹt bên trong (ví dụ giữa 2 chân, đùi, nách)
            if (isInnerBg) {
                for (let py = 0; py < h; py++) {
                    for (let px = 0; px < w; px++) {
                        const pIdx = py * w + px;
                        const dIdx = pIdx * 4;
                        if (data[dIdx + 3] !== 0) {
                            if (isInnerBg(data[dIdx], data[dIdx + 1], data[dIdx + 2], px, py, w, h)) {
                                data[dIdx + 3] = 0;
                            }
                        }
                    }
                }
            }

            ctx.putImageData(imgData, 0, 0);
            const cleanUrl = canvas.toDataURL("image/png");
            if (onComplete) onComplete(cleanUrl);
        } catch (e) {
            console.warn("Canvas transparent error:", e);
        }
    };
}

function processTransparentSprites() {
    // 1. Tách nền Peashooter (plant1.jpg) cho tất cả các cây
    makeImageTransparent(
        "images/plant1.jpg",
        (cleanUrl) => {
            cleanPlantDataUrl = cleanUrl;
            document.querySelectorAll('.plant-row-actor, .intro-peashooter-actor').forEach(el => {
                el.src = cleanUrl;
            });
        },
        (r, g, b) => {
            if (r < 55 && g < 55 && b < 55) return false;
            if (g > r + 15 && g > b + 15) return false;
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            return (maxVal - minVal) <= 35 && maxVal > 140;
        },
        (r, g, b, x, y, w, h) => {
            if (y < h * 0.35) return false; // Giữ mắt
            if (r < 55 && g < 55 && b < 55) return false;
            if (g > r + 15 && g > b + 15) return false;
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            return (maxVal - minVal) <= 35 && maxVal > 150;
        }
    );

    // 2. Tách nền Zombie (zombie1.jpg) cho tất cả các zombie
    makeImageTransparent(
        "images/zombie1.jpg",
        (cleanUrl) => {
            cleanZombieDataUrl = cleanUrl;
            document.querySelectorAll('.zombie-row-actor, .intro-zombie-actor').forEach(el => {
                el.src = cleanUrl;
            });
        },
        (r, g, b) => {
            if (r < 55 && g < 55 && b < 55) return false;
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            return (maxVal - minVal) <= 25 && minVal > 215;
        },
        (r, g, b, x, y, w, h) => {
            if (y < h * 0.42) return false; // Không chạm vào cà vạt hay mắt
            if (r < 60 && g < 60 && b < 60) return false; // Giữ viền đen
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            return (maxVal - minVal) <= 25 && minVal > 210; // Trắng thuần giữa 2 chân
        }
    );

    // 3. Tách nền Hoa Hướng Dương (flower.jpg) cho dàn 5 cây hoa
    makeImageTransparent(
        "images/flower.jpg",
        (cleanUrl) => {
            cleanFlowerDataUrl = cleanUrl;
            document.querySelectorAll('.sunflower-row-actor').forEach(el => {
                el.src = cleanUrl;
            });
        },
        (r, g, b) => {
            if (r < 50 && g < 50 && b < 50) return false; // Giữ viền đen
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            return (maxVal - minVal) <= 20 && minVal > 190; // Phông nền xám nhạt
        },
        (r, g, b, x, y, w, h) => {
            if (y < h * 0.5) return false; // Giữ mặt hoa và mắt
            if (r < 50 && g < 50 && b < 50) return false;
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            return (maxVal - minVal) <= 20 && minVal > 190;
        }
    );
}

// First Initialization
renderApp();
renderBattlefieldActors();
processTransparentSprites();
