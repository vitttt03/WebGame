// GAME 2: VOLCANO ROCK CLIMB COMPETITION ENGINE

// --- DEFAULT VOLCANO QUESTION BANK (LỚP 6 - 9 TOÁN, LÝ, KHOA HỌC & ĐỐ VUI) ---
const defaultVolcanoQuestions = [
    {
        id: 1,
        question: "Tìm x biết: 2x + 15 = 35",
        options: ["x = 5", "x = 10", "x = 15", "x = 20"],
        correctIndex: 1, // B. x = 10
        completed: false
    },
    {
        id: 2,
        question: "Tính giá trị của biểu thức toán học: \\(3^2 + 4^2\\)",
        options: ["25", "14", "49", "12"],
        correctIndex: 0, // A. 25
        completed: false
    },
    {
        id: 3,
        question: "Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?",
        options: ["Trái Đất", "Sao Hỏa", "Sao Thủy", "Sao Kim"],
        correctIndex: 2, // C. Sao Thủy
        completed: false
    },
    {
        id: 4,
        question: "Giải phương trình bậc nhất: 3x - 9 = 0",
        options: ["x = -3", "x = 3", "x = 0", "x = 9"],
        correctIndex: 1, // B. x = 3
        completed: false
    },
    {
        id: 5,
        question: "Diện tích hình tròn có bán kính r = 3cm xấp xỉ bằng bao nhiêu? (lấy \\(\\pi \\approx 3.14\\))",
        options: ["28.26 cm²", "18.84 cm²", "9.42 cm²", "37.68 cm²"],
        correctIndex: 0, // A. 28.26 cm²
        completed: false
    },
    {
        id: 6,
        question: "Số nguyên tố nhỏ nhất là số nào?",
        options: ["0", "1", "2", "3"],
        correctIndex: 2, // C. 2
        completed: false
    },
    {
        id: 7,
        question: "Khí nào chiếm tỉ lệ phần trăm lớn nhất trong không khí Trái Đất?",
        options: ["Khí Ôxi (O₂)", "Khí Nitơ (N₂)", "Khí Cacbonic (CO₂)", "Khí Hiđrô (H₂)"],
        correctIndex: 1, // B. Khí Nitơ
        completed: false
    },
    {
        id: 8,
        question: "Công thức tính vận tốc v trong chuyển động đều là gì?",
        options: ["v = s × t", "v = s / t", "v = t / s", "v = s + t"],
        correctIndex: 1, // B. v = s / t
        completed: false
    },
    {
        id: 9,
        question: "Căn bậc hai của 144 là bao nhiêu?",
        options: ["11", "12", "14", "16"],
        correctIndex: 1, // B. 12
        completed: false
    },
    {
        id: 10,
        question: "Trong tam giác vuông, cạnh dài nhất đối diện với góc vuông gọi là gì?",
        options: ["Cạnh góc vuông", "Cạnh huyền", "Cạnh đối", "Cạnh kề"],
        correctIndex: 1, // B. Cạnh huyền
        completed: false
    }
];

// Sound Synth Engine
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let isMuted = false;
let currentVolume = 0.5;
let lastVolume = 0.5;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function changeVolume(val) {
    const num = parseInt(val);
    currentVolume = num / 100;
    isMuted = (currentVolume === 0);
    updateVolumeUI();
}

function updateVolumeUI() {
    const icon = document.getElementById('top-vol-icon');
    const slider = document.getElementById('top-vol-slider');
    const txt = document.getElementById('top-vol-txt');
    const pct = Math.round(currentVolume * 100);

    if (icon) {
        icon.innerText = isMuted || currentVolume === 0 ? '🔇' : (currentVolume <= 0.35 ? '🔈' : (currentVolume <= 0.7 ? '🔉' : '🔊'));
    }
    if (slider && parseInt(slider.value) !== pct) {
        slider.value = pct;
    }
    if (txt) {
        txt.innerText = `${pct}%`;
    }
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

function playTone(freq, type = 'sine', duration = 0.2, vol = 0.2) {
    if (isMuted || currentVolume === 0) return;
    try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        const finalVol = vol * currentVolume;
        gain.gain.setValueAtTime(finalVol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function playHopSound() {
    playTone(440, 'sine', 0.15, 0.25);
    setTimeout(() => playTone(660, 'sine', 0.25, 0.3), 100);
}

function playWrongSound() {
    playTone(180, 'sawtooth', 0.35, 0.3);
    setTimeout(() => playTone(120, 'sawtooth', 0.45, 0.35), 120);
}

function playLavaRiseSound() {
    playTone(100, 'triangle', 0.6, 0.3);
    setTimeout(() => playTone(150, 'sawtooth', 0.5, 0.25), 150);
}

function playVictoryFanfare() {
    const notes = [523, 659, 784, 1046, 880, 1046];
    notes.forEach((n, i) => {
        setTimeout(() => playTone(n, 'sine', 0.3, 0.35), i * 180);
    });
}

// Game State Variables
let questions = [];
let redTeamName = "Đội Đỏ 🔴";
let blueTeamName = "Đội Xanh 🔵";
let redStep = 0;
let blueStep = 0;
let lavaStep = 0;
let maxSteps = 10;
let totalTurnsAttempted = 0;
let currentTurnTeam = 'red'; // 'red' or 'blue'
let activeQuestionIndex = null;
let isGameOver = false;

let volcanoSavedQuestionLists = {};
let volcanoActiveListId = 'default';

function loadQuestionBank() {
    const rawLists = localStorage.getItem('volcanoSavedQuestionLists');
    const rawActiveId = localStorage.getItem('volcanoActiveQuestionListId');
    
    if (rawLists) {
        try {
            volcanoSavedQuestionLists = JSON.parse(rawLists);
        } catch (e) {
            volcanoSavedQuestionLists = {};
        }
    }
    
    if (!volcanoSavedQuestionLists['default'] || !Array.isArray(volcanoSavedQuestionLists['default'].questions)) {
        volcanoSavedQuestionLists['default'] = {
            id: 'default',
            name: "Bộ Mặc Định (Leo Bậc Đá Núi Lửa)",
            questions: typeof defaultVolcanoQuestions !== 'undefined' ? [...defaultVolcanoQuestions] : []
        };
    }

    const legacySaved = localStorage.getItem('volcanoGameQuestions');
    if (legacySaved) {
        try {
            const parsedLegacy = JSON.parse(legacySaved);
            if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
                if (rawActiveId && volcanoSavedQuestionLists[rawActiveId]) {
                    volcanoSavedQuestionLists[rawActiveId].questions = parsedLegacy;
                } else {
                    volcanoSavedQuestionLists['default'].questions = parsedLegacy;
                }
            }
        } catch (e) {}
    }

    if (rawActiveId && volcanoSavedQuestionLists[rawActiveId]) {
        volcanoActiveListId = rawActiveId;
    } else {
        volcanoActiveListId = 'default';
    }

    questions = [...volcanoSavedQuestionLists[volcanoActiveListId].questions];
}

function saveVolcanoCurrentQuestionsState() {
    if (!volcanoSavedQuestionLists[volcanoActiveListId]) {
        volcanoSavedQuestionLists[volcanoActiveListId] = {
            id: volcanoActiveListId,
            name: "Bộ Câu Hỏi " + new Date().toLocaleDateString('vi-VN'),
            questions: []
        };
    }
    volcanoSavedQuestionLists[volcanoActiveListId].questions = [...questions];
    localStorage.setItem('volcanoSavedQuestionLists', JSON.stringify(volcanoSavedQuestionLists));
    localStorage.setItem('volcanoActiveQuestionListId', volcanoActiveListId);
    localStorage.setItem('volcanoGameQuestions', JSON.stringify(questions));
}

function renderVolcanoQuestionSetSelector() {
    const selectEl = document.getElementById('volcano-question-set-select');
    if (!selectEl) return;
    
    selectEl.innerHTML = '';
    const keys = Object.keys(volcanoSavedQuestionLists);
    
    keys.forEach(key => {
        const item = volcanoSavedQuestionLists[key];
        const option = document.createElement('option');
        option.value = item.id;
        const count = item.questions ? item.questions.length : 0;
        option.innerText = `${item.name} (${count} câu)`;
        if (item.id === volcanoActiveListId) {
            option.selected = true;
        }
        selectEl.appendChild(option);
    });
}

function onSelectVolcanoQuestionSet(listId) {
    if (!volcanoSavedQuestionLists[listId]) return;
    playHopSound();
    volcanoActiveListId = listId;
    questions = [...volcanoSavedQuestionLists[listId].questions];
    saveVolcanoCurrentQuestionsState();
    renderAdminQuestions();
    renderVolcanoQuestionSetSelector();
}

function promptSaveVolcanoQuestionSet() {
    playHopSound();
    const currentName = volcanoSavedQuestionLists[volcanoActiveListId] ? volcanoSavedQuestionLists[volcanoActiveListId].name : "Bộ câu hỏi mới";
    const name = prompt("Nhập tên cho Bộ Câu Hỏi này:", currentName);
    if (name && name.trim()) {
        const trimmedName = name.trim();
        volcanoSavedQuestionLists[volcanoActiveListId].name = trimmedName;
        volcanoSavedQuestionLists[volcanoActiveListId].questions = [...questions];
        saveVolcanoCurrentQuestionsState();
        renderVolcanoQuestionSetSelector();
        alert(`🎉 Đã lưu bộ câu hỏi: "${trimmedName}"!`);
    }
}

function promptCreateNewVolcanoQuestionSet() {
    playHopSound();
    const name = prompt("Nhập tên Bộ Câu Hỏi Mới:", "Bộ Câu Hỏi Mới " + (Object.keys(volcanoSavedQuestionLists).length + 1));
    if (name && name.trim()) {
        const trimmedName = name.trim();
        const newId = 'set_' + Date.now();
        volcanoSavedQuestionLists[newId] = {
            id: newId,
            name: trimmedName,
            questions: []
        };
        volcanoActiveListId = newId;
        questions = [];
        saveVolcanoCurrentQuestionsState();
        renderAdminQuestions();
        renderVolcanoQuestionSetSelector();
        alert(`✨ Đã tạo bộ câu hỏi mới: "${trimmedName}". Hãy thêm câu hỏi vào bộ này!`);
    }
}

function deleteVolcanoQuestionSet() {
    playHopSound();
    const keys = Object.keys(volcanoSavedQuestionLists);
    if (keys.length <= 1) {
        alert("⚠️ Bạn phải giữ lại ít nhất 1 Bộ Câu Hỏi!");
        return;
    }
    
    const currentName = volcanoSavedQuestionLists[volcanoActiveListId] ? volcanoSavedQuestionLists[volcanoActiveListId].name : "Bộ này";
    if (confirm(`Bạn có chắc chắn muốn xóa bộ câu hỏi "${currentName}"?`)) {
        delete volcanoSavedQuestionLists[volcanoActiveListId];
        const remainingKeys = Object.keys(volcanoSavedQuestionLists);
        volcanoActiveListId = remainingKeys[0];
        questions = [...volcanoSavedQuestionLists[volcanoActiveListId].questions];
        saveVolcanoCurrentQuestionsState();
        renderAdminQuestions();
        renderVolcanoQuestionSetSelector();
        alert("🗑️ Đã xóa bộ câu hỏi thành công.");
    }
}

function exportVolcanoQuestionSetJSON() {
    playHopSound();
    const currentSet = volcanoSavedQuestionLists[volcanoActiveListId] || { name: "Bo_Cau_Hoi_Nui_Lua", questions: questions };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentSet, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const safeFileName = (currentSet.name || "bo_cau_hoi_nui_lua").replace(/[^a-zA-Z0-9_\-\u00C0-\u024F]/g, "_") + ".json";
    downloadAnchor.setAttribute("download", safeFileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importVolcanoQuestionSetJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const parsed = JSON.parse(content);
            let importedQuestions = [];
            let importedName = "Bộ Import " + new Date().toLocaleDateString('vi-VN');
            
            if (Array.isArray(parsed)) {
                importedQuestions = parsed;
            } else if (parsed && Array.isArray(parsed.questions)) {
                importedQuestions = parsed.questions;
                if (parsed.name) importedName = parsed.name;
            } else {
                alert("⚠️ Định dạng tệp JSON không hợp lệ!");
                return;
            }

            const newId = 'set_imported_' + Date.now();
            volcanoSavedQuestionLists[newId] = {
                id: newId,
                name: importedName,
                questions: importedQuestions
            };
            volcanoActiveListId = newId;
            questions = [...importedQuestions];
            saveVolcanoCurrentQuestionsState();
            renderAdminQuestions();
            renderVolcanoQuestionSetSelector();
            alert(`📥 Đã nhập thành công bộ câu hỏi: "${importedName}" (${importedQuestions.length} câu)!`);
        } catch (err) {
            alert("⚠️ Lỗi đọc tệp JSON: " + err.message);
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}

// Fullscreen Toggle (Key F)
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
}

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

// KaTeX Helper
function triggerMathRender(element) {
    if (window.renderMathInElement && element) {
        try {
            window.renderMathInElement(element, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true }
                ],
                throwOnError: false
            });
        } catch (e) {}
    }
}

// App Initialization & Screen Switcher
const appDiv = document.getElementById('app');

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');

    const topHome = document.getElementById('top-home-btn');
    if (topHome) {
        topHome.style.display = (screenId === 'screen-config') ? 'inline-flex' : 'none';
    }

    if (screenId === 'screen-admin') {
        renderVolcanoQuestionSetSelector();
        renderAdminQuestions();
    }
}

function renderApp() {
    loadQuestionBank();
    const isUnlocked = sessionStorage.getItem('game2_unlocked') === 'true';
    appDiv.innerHTML = `
        <!-- GAME 2 SECURITY LOCK MODAL (PASSWORD: viet123) -->
        <div class="game2-lock-modal" id="game2-lock-modal" style="${isUnlocked ? 'display: none;' : 'display: flex;'}">
            <div class="game2-lock-card">
                <div class="lock-header-icon">🔒</div>
                <h2 class="lock-title">GAME 2 ĐÃ BỊ KHÓA</h2>
                <p class="lock-subtitle">Vui lòng nhập mật khẩu để tham gia <strong>Leo Bậc Đá Núi Lửa</strong>:</p>
                <form onsubmit="unlockGame2(event)" style="width: 100%;">
                    <input type="password" id="game2-pass-input" class="lock-input" placeholder="Nhập mật khẩu..." autofocus autocomplete="off">
                    <button type="submit" class="btn-lock-submit">🔓 MỞ KHÓA GAME ➔</button>
                </form>
                <div id="game2-pass-error" class="lock-error-text" style="display: none;">❌ Mật khẩu không chính xác! Vui lòng thử lại.</div>
                <button class="btn-lock-back" onclick="window.location.href='../index.html'">◀ Quay Về Menu Chính</button>
            </div>
        </div>

        <!-- MODAL TẠM DỪNG GAME 2 -->
        <div id="game2-pause-modal" class="game2-lock-modal" style="display: none;">
            <div class="game2-lock-card">
                <div class="lock-header-icon">⏸️</div>
                <h2 class="lock-title">TRẬN ĐẤU TẠM DỪNG</h2>
                <p class="lock-subtitle">Bạn có muốn tiếp tục trận đấu hay quay về màn hình Play?</p>
                <button class="btn-lock-submit" onclick="closeGame2PauseModal()" style="margin-bottom: 0.8rem;">
                    ▶ TIẾP TỤC CHƠI
                </button>
                <button class="btn-lock-submit" onclick="exitGame2ToPlayScreen()" style="background: linear-gradient(180deg, #64748b 0%, #334155 100%); box-shadow: 0 6px 0 #1e293b;">
                    🚪 VỀ MÀN HÌNH PLAY
                </button>
            </div>
        </div>

        <!-- TOP CONTROLS -->
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

            <button class="icon-btn" id="top-home-btn" onclick="window.location.href='../index.html'" title="Về Menu chọn game chính">🏠</button>
            <button class="icon-btn" onclick="handleGame2SettingsClick()" title="Cài đặt / Tạm dừng">⚙️</button>
        </div>

        <!-- 1. CONFIG SCREEN -->
        <div class="screen active" id="screen-config">
            <div class="config-container">
                <h1 class="config-title">🌋 LEO BẬC ĐÁ NÚI LỬA</h1>
                <div class="config-subtitle">Cuộc Thi Đấu Trí Leo Núi Đồng Đội</div>

                <div class="config-box">
                    <div class="team-inputs-grid">
                        <div class="team-input-group red-label">
                            <label>🔴 Tên Đội 1 (Đội Đỏ):</label>
                            <input type="text" id="input-red-team" class="team-input" value="Đội Đỏ 🔴" placeholder="Nhập tên Đội Đỏ">
                        </div>
                        <div class="team-input-group blue-label">
                            <label>🔵 Tên Đội 2 (Đội Xanh):</label>
                            <input type="text" id="input-blue-team" class="team-input" value="Đội Xanh 🔵" placeholder="Nhập tên Đội Xanh">
                        </div>
                    </div>

                    <button class="btn-start-game" onclick="startGame()">🚀 BẮT ĐẦU TRẬN ĐẤU</button>
                    <button class="btn-admin-config" onclick="showScreen('screen-admin')">🛠️ QUẢN LÝ CÂU HỎI (ADMIN)</button>
                </div>
            </div>
        </div>

        <!-- 2. MAIN GAMEPLAY ARENA -->
        <div class="screen" id="screen-game">
            <div class="game-arena-layout">
                <!-- TOP HUD BAR -->
                <div class="arena-top-hud">
                    <div class="team-badge-hud red-team" id="hud-red-team">
                        <span>🔴 <span id="hud-red-name">Đội Đỏ</span></span>
                        <span class="hud-step-count" id="hud-red-step">Bậc 0/10</span>
                    </div>

                    <div class="lava-info-badge" id="hud-lava-badge">
                        <span>🔥 Lượt: <strong id="hud-turn-count">0/4</strong></span>
                        <span>•</span>
                        <span>🌋 Dung Nham: <strong id="hud-lava-step">Bậc 0</strong></span>
                    </div>

                    <div class="team-badge-hud blue-team" id="hud-blue-team">
                        <span>🔵 <span id="hud-blue-name">Đội Xanh</span></span>
                        <span class="hud-step-count" id="hud-blue-step">Bậc 0/10</span>
                    </div>
                </div>

                <!-- VOLCANO CANVAS ARENA -->
                <div class="volcano-stage" id="volcano-stage">
                    <div class="volcano-mountain-bg"></div>

                    <!-- SUMMIT ESCAPE PORTAL -->
                    <div class="volcano-summit">
                        🏆 ĐỈNH NÚI LỬA (THOÁT HIỂM) 🏆
                    </div>

                    <!-- RED TEAM PATHWAY -->
                    <div class="climbing-path red-path" id="red-path">
                        <!-- Rendered by JS -->
                    </div>

                    <!-- BLUE TEAM PATHWAY -->
                    <div class="climbing-path blue-path" id="blue-path">
                        <!-- Rendered by JS -->
                    </div>

                    <!-- RED HERO CHARACTER -->
                    <div class="hero-character red-hero" id="red-hero">🔴</div>

                    <!-- BLUE HERO CHARACTER -->
                    <div class="hero-character blue-hero" id="blue-hero">🔵</div>

                    <!-- MAGMA LAVA CONTAINER -->
                    <div class="magma-lava-container" id="lava-container" style="height: 0%;">
                        <div class="magma-surface-waves"></div>
                    </div>
                </div>

                <!-- BOTTOM TEACHER CONTROL PANEL -->
                <div class="control-bottom-panel">
                    <div class="panel-header-buttons">
                        <button class="btn-team-pick pick-red" id="btn-pick-red" onclick="setTurn('red')">🔴 LƯỢT ĐỘI ĐỎ CHỌN</button>
                        <button class="btn-team-pick pick-blue" id="btn-pick-blue" onclick="setTurn('blue')">🔵 LƯỢT ĐỘI XANH CHỌN</button>
                        <button class="btn-team-pick pick-lava" onclick="manualRiseLava()">🌋 DÂNG DUNG NHAM (+1)</button>
                    </div>

                    <div class="questions-grid-picker" id="questions-grid-picker">
                        <!-- Rendered by JS -->
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. QUESTION MODAL -->
        <div class="question-modal-overlay" id="question-modal">
            <div class="question-modal-box">
                <button class="modal-close-btn" onclick="closeQuestionModal()">✕</button>
                
                <div class="question-modal-team-banner red-turn" id="modal-team-banner">
                    LƯỢT TRẢ LỜI: ĐỘI ĐỎ 🔴
                </div>

                <div class="question-prompt-text" id="modal-question-prompt">
                    Đang tải câu hỏi...
                </div>

                <div class="answers-grid-modal" id="modal-answers-grid">
                    <!-- Rendered by JS -->
                </div>
            </div>

            <!-- Toast Feedback Stamp -->
            <div class="feedback-toast" id="feedback-toast">✨ +1 BẬC ĐÁ!</div>
        </div>

        <!-- 4. ADMIN SCREEN -->
        <div class="screen" id="screen-admin">
            <div class="admin-container">
                <div class="admin-header">
                    <h2 class="admin-title">🛠️ QUẢN LÝ CÂU HỎI GAME NÚI LỬA</h2>
                    <button class="btn-back-game" onclick="showScreen('screen-config')">◀ QUAY LẠI TRÒ CHƠI</button>
                </div>
                <p style="color: #cbd5e1; font-size: 1.1rem; margin-bottom: 1.5rem;">Danh sách câu hỏi được lưu tự động trên trình duyệt.</p>
                
                <!-- BỘ CÂU HỎI SET MANAGER BAR -->
                <div class="question-list-manager-box" style="background: rgba(15, 23, 42, 0.85); border: 2px solid #38bdf8; border-radius: 16px; padding: 1.2rem; margin-bottom: 1.8rem;">
                    <div class="qs-manager-inner" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                        <div class="qs-select-group" style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 280px;">
                            <span class="qs-label" style="font-weight: bold; color: #38bdf8; white-space: nowrap; font-size: 1.1rem;">📋 Chọn Bộ Câu Hỏi:</span>
                            <select id="volcano-question-set-select" class="qs-select" onchange="onSelectVolcanoQuestionSet(this.value)" style="flex: 1; padding: 0.6rem 1rem; border-radius: 10px; border: 2px solid #0288d1; background: #0f172a; color: #ffffff; font-size: 1rem; font-family: inherit;">
                                <!-- Dynamically populated -->
                            </select>
                        </div>
                        <div class="qs-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button type="button" class="qs-btn qs-btn-save" onclick="promptSaveVolcanoQuestionSet()" style="background: #2e7d32; color: #fff; padding: 0.45rem 0.95rem; border-radius: 8px; border: none; font-weight: bold; cursor: pointer;">💾 Lưu Bộ Này</button>
                            <button type="button" class="qs-btn qs-btn-new" onclick="promptCreateNewVolcanoQuestionSet()" style="background: #1565c0; color: #fff; padding: 0.45rem 0.95rem; border-radius: 8px; border: none; font-weight: bold; cursor: pointer;">➕ Tạo Bộ Mới</button>
                            <button type="button" class="qs-btn qs-btn-delete" onclick="deleteVolcanoQuestionSet()" style="background: #c62828; color: #fff; padding: 0.45rem 0.95rem; border-radius: 8px; border: none; font-weight: bold; cursor: pointer;">🗑️ Xóa Bộ Này</button>
                            <button type="button" class="qs-btn qs-btn-export" onclick="exportVolcanoQuestionSetJSON()" style="background: #6a1b9a; color: #fff; padding: 0.45rem 0.95rem; border-radius: 8px; border: none; font-weight: bold; cursor: pointer;">📥 Export JSON</button>
                            <button type="button" class="qs-btn qs-btn-import" onclick="document.getElementById('import-volcano-json-file-input').click()" style="background: #e65100; color: #fff; padding: 0.45rem 0.95rem; border-radius: 8px; border: none; font-weight: bold; cursor: pointer;">📤 Import JSON</button>
                            <input type="file" id="import-volcano-json-file-input" accept=".json" style="display: none;" onchange="importVolcanoQuestionSetJSON(event)">
                        </div>
                    </div>
                </div>

                <div id="admin-question-list" style="display: flex; flex-direction: column; gap: 1rem;">
                    <!-- Rendered by JS -->
                </div>
            </div>
        </div>
    `;
}

function toggleMute() {
    isMuted = !isMuted;
    const icon = document.getElementById('sound-icon');
    if (icon) icon.innerText = isMuted ? '🔇' : '🔊';
}

function startGame() {
    initAudio();
    const inputRed = document.getElementById('input-red-team');
    const inputBlue = document.getElementById('input-blue-team');

    redTeamName = inputRed ? (inputRed.value.trim() || 'Đội Đỏ 🔴') : 'Đội Đỏ 🔴';
    blueTeamName = inputBlue ? (inputBlue.value.trim() || 'Đội Xanh 🔵') : 'Đội Xanh 🔵';

    redStep = 0;
    blueStep = 0;
    lavaStep = 0;
    totalTurnsAttempted = 0;
    currentTurnTeam = 'red';
    isGameOver = false;
    questions.forEach(q => q.completed = false);

    renderArena();
    showScreen('screen-game');
}

function renderArena() {
    // Update Top HUD
    const redNameEl = document.getElementById('hud-red-name');
    const blueNameEl = document.getElementById('hud-blue-name');
    const redStepEl = document.getElementById('hud-red-step');
    const blueStepEl = document.getElementById('hud-blue-step');
    const turnCountEl = document.getElementById('hud-turn-count');
    const lavaStepEl = document.getElementById('hud-lava-step');

    if (redNameEl) redNameEl.innerText = redTeamName;
    if (blueNameEl) blueNameEl.innerText = blueTeamName;
    if (redStepEl) redStepEl.innerText = `Bậc ${redStep}/${maxSteps}`;
    if (blueStepEl) blueStepEl.innerText = `Bậc ${blueStep}/${maxSteps}`;
    if (turnCountEl) turnCountEl.innerText = `${totalTurnsAttempted % 4}/4`;
    if (lavaStepEl) lavaStepEl.innerText = `Bậc ${lavaStep}`;

    // Render 10 Stepping Stones for Red and Blue
    const redPath = document.getElementById('red-path');
    const bluePath = document.getElementById('blue-path');

    if (redPath && bluePath) {
        redPath.innerHTML = '';
        bluePath.innerHTML = '';

        for (let i = 1; i <= maxSteps; i++) {
            // Red Step
            const rStep = document.createElement('div');
            rStep.className = `stone-step ${i === redStep ? 'active-step' : ''} ${i <= lavaStep ? 'submerged' : ''}`;
            rStep.innerHTML = `<span class="step-label">🔴 Bậc ${i}</span>`;
            redPath.appendChild(rStep);

            // Blue Step
            const bStep = document.createElement('div');
            bStep.className = `stone-step ${i === blueStep ? 'active-step' : ''} ${i <= lavaStep ? 'submerged' : ''}`;
            bStep.innerHTML = `<span class="step-label">🔵 Bậc ${i}</span>`;
            bluePath.appendChild(bStep);
        }
    }

    // Position Hero Avatars
    positionHeroes();

    // Update Magma Lava Height
    updateLavaHeight();

    // Render Question Picker Grid
    renderQuestionPicker();

    // Update Turn Buttons Highlight
    updateTurnButtonHighlight();
}

function positionHeroes() {
    const redHero = document.getElementById('red-hero');
    const blueHero = document.getElementById('blue-hero');

    // Bottom percentage calculation based on step 0 to 10
    const calcBottomPercent = (step) => {
        if (step === 0) return 4;
        return 5 + (step / maxSteps) * 78;
    };

    if (redHero) {
        redHero.style.left = '29.5%';
        redHero.style.bottom = `${calcBottomPercent(redStep)}%`;
    }

    if (blueHero) {
        blueHero.style.left = '70.5%';
        blueHero.style.bottom = `${calcBottomPercent(blueStep)}%`;
    }
}

function updateLavaHeight() {
    const lavaContainer = document.getElementById('lava-container');
    if (lavaContainer) {
        const heightPercent = (lavaStep / maxSteps) * 85;
        lavaContainer.style.height = `${heightPercent}%`;
    }
}

function setTurn(team) {
    currentTurnTeam = team;
    updateTurnButtonHighlight();
}

function updateTurnButtonHighlight() {
    const btnRed = document.getElementById('btn-pick-red');
    const btnBlue = document.getElementById('btn-pick-blue');

    if (btnRed && btnBlue) {
        if (currentTurnTeam === 'red') {
            btnRed.style.transform = 'scale(1.08)';
            btnRed.style.borderColor = '#ffffff';
            btnBlue.style.transform = 'scale(1)';
            btnBlue.style.borderColor = 'rgba(255,255,255,0.3)';
        } else {
            btnBlue.style.transform = 'scale(1.08)';
            btnBlue.style.borderColor = '#ffffff';
            btnRed.style.transform = 'scale(1)';
            btnRed.style.borderColor = 'rgba(255,255,255,0.3)';
        }
    }
}

function renderQuestionPicker() {
    const picker = document.getElementById('questions-grid-picker');
    if (!picker) return;

    picker.innerHTML = '';
    questions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = `question-picker-card ${q.completed ? 'completed' : ''}`;
        card.innerHTML = `
            <span>CÂU ${idx + 1}</span>
            <small style="font-size: 0.8rem; margin-top: 2px;">${q.completed ? '✔ Đã Xong' : 'Chưa Giải'}</small>
        `;
        if (!q.completed) {
            card.onclick = () => openQuestionModal(idx);
        }
        picker.appendChild(card);
    });
}

function openQuestionModal(index) {
    if (isGameOver) return;
    activeQuestionIndex = index;
    const q = questions[index];
    const modal = document.getElementById('question-modal');
    const banner = document.getElementById('modal-team-banner');
    const prompt = document.getElementById('modal-question-prompt');
    const grid = document.getElementById('modal-answers-grid');

    if (!modal || !q) return;

    // Team Banner
    if (banner) {
        banner.className = `question-modal-team-banner ${currentTurnTeam === 'red' ? 'red-turn' : 'blue-turn'}`;
        banner.innerText = currentTurnTeam === 'red' ? `🔴 LƯỢT TRẢ LỜI: ${redTeamName.toUpperCase()}` : `🔵 LƯỢT TRẢ LỜI: ${blueTeamName.toUpperCase()}`;
    }

    if (prompt) prompt.innerText = q.question;

    if (grid) {
        grid.innerHTML = '';
        const prefixes = ['A', 'B', 'C', 'D'];
        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'answer-option-card';
            btn.innerHTML = `<span class="prefix">${prefixes[idx]}.</span> <span>${opt}</span>`;
            btn.onclick = () => handleModalAnswer(btn, idx);
            grid.appendChild(btn);
        });
    }

    const oldBtn = document.getElementById('btn-volcano-continue');
    if (oldBtn) oldBtn.remove();

    modal.classList.add('active');
    triggerMathRender(modal);
}

function closeQuestionModal() {
    const modal = document.getElementById('question-modal');
    if (modal) modal.classList.remove('active');
}

function handleModalAnswer(btnElement, selectedIndex) {
    if (btnElement.disabled || isGameOver) return;

    const q = questions[activeQuestionIndex];
    totalTurnsAttempted++;

    if (selectedIndex === q.correctIndex) {
        // === TRẢ LỜI ĐÚNG ===
        btnElement.classList.add('correct');
        document.querySelectorAll('.answer-option-card').forEach(b => b.disabled = true);
        playHopSound();
        showFeedbackToast('✨ CHÍNH XÁC! +1 BẬC ĐÁ!', 'correct');

        // Team Climbs 1 Step
        const heroEl = document.getElementById(`${currentTurnTeam}-hero`);
        if (currentTurnTeam === 'red') {
            redStep = Math.min(maxSteps, redStep + 1);
        } else {
            blueStep = Math.min(maxSteps, blueStep + 1);
        }

        if (heroEl) {
            heroEl.classList.remove('hopping');
            void heroEl.offsetWidth;
            heroEl.classList.add('hopping');
        }

        q.completed = true;

        // Check if 4 turns completed -> Rise Lava by 1 step
        if (totalTurnsAttempted % 4 === 0) {
            setTimeout(() => {
                manualRiseLava();
            }, 800);
        }

        // Hiện nút "XONG - TIẾP TỤC" để cô giáo giải thích cho học sinh trước khi đóng màn
        const modalBox = document.querySelector('#question-modal .modal-card') || document.getElementById('question-modal');
        if (modalBox && !document.getElementById('btn-volcano-continue')) {
            const btn = document.createElement('button');
            btn.id = 'btn-volcano-continue';
            btn.style.cssText = "margin: 0.8rem auto 0 auto; padding: 0.45rem 1.2rem; font-size: 1.05rem; background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; border: 2px solid #86efac; border-radius: 10px; font-weight: bold; cursor: pointer; display: block; width: fit-content; box-shadow: 0 3px 10px rgba(34, 197, 94, 0.4); font-family: inherit;";
            btn.innerHTML = '⏩ XONG - HOÀN THÀNH & TIẾP TỤC ➔';
            btn.onclick = () => {
                playHopSound();
                closeQuestionModal();
                renderArena();
                checkWinCondition();
                setTurn(currentTurnTeam === 'red' ? 'blue' : 'red');
            };
            modalBox.appendChild(btn);
        }

    } else {
        // === TRẢ LỜI SAI ===
        // Nhân vật đứng yên, hiện ❌ + âm thanh sai, KHÔNG hiển thị đáp án đúng
        // Cho phép học sinh khác cùng đội thử lại
        btnElement.classList.add('wrong');
        btnElement.disabled = true;
        playWrongSound();
        showFeedbackToast('❌ CHƯA CHÍNH XÁC!', 'wrong');

        const heroEl = document.getElementById(`${currentTurnTeam}-hero`);
        if (heroEl) {
            heroEl.classList.remove('wrong-shake');
            void heroEl.offsetWidth;
            heroEl.classList.add('wrong-shake');
        }

        // Check if 4 turns completed -> Rise Lava by 1 step
        if (totalTurnsAttempted % 4 === 0) {
            setTimeout(() => {
                manualRiseLava();
            }, 800);
        }
    }
}

function showFeedbackToast(text, type) {
    const toast = document.getElementById('feedback-toast');
    if (!toast) return;
    toast.innerText = text;
    toast.className = `feedback-toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 1200);
}

function manualRiseLava() {
    lavaStep = Math.min(maxSteps, lavaStep + 1);
    playLavaRiseSound();
    renderArena();
    checkEliminationCondition();
}

function checkEliminationCondition() {
    if (lavaStep >= redStep && redStep < maxSteps) {
        // Red team eliminated
        triggerDefeat(redTeamName, blueTeamName);
    } else if (lavaStep >= blueStep && blueStep < maxSteps) {
        // Blue team eliminated
        triggerDefeat(blueTeamName, redTeamName);
    }
}

function checkWinCondition() {
    if (redStep >= maxSteps) {
        triggerVictory(redTeamName);
    } else if (blueStep >= maxSteps) {
        triggerVictory(blueTeamName);
    }
}

function triggerVictory(winnerName) {
    isGameOver = true;
    playVictoryFanfare();
    if (typeof confetti === 'function') {
        confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
    }

    setTimeout(() => {
        alert(`🎉 CHÚC MỪNG ${winnerName.toUpperCase()} ĐÃ CHINH PHỤC ĐỈNH NÚI LỬA & CHIẾN THẮNG! 🏆`);
    }, 500);
}

function triggerDefeat(eliminatedTeam, winningTeam) {
    isGameOver = true;
    setTimeout(() => {
        alert(`🌋 DUNG NHAM ĐÃ DÂNG CHẠM BẬC ĐÁ CỦA ${eliminatedTeam.toUpperCase()}!\n🏆 ${winningTeam.toUpperCase()} ĐÀO TẨU THÀNH CÔNG VÀ CHÍNH THỨC CHIẾN THẮNG!`);
    }, 400);
}

// Admin Questions Rendering
function renderAdminQuestions() {
    const list = document.getElementById('admin-question-list');
    if (!list) return;

    list.innerHTML = '';
    questions.forEach((q, idx) => {
        const item = document.createElement('div');
        item.style.cssText = "background: rgba(255,255,255,0.05); padding: 1.2rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);";
        item.innerHTML = `
            <div style="font-weight: 800; font-size: 1.2rem; color: #ffe082; margin-bottom: 6px;">Câu ${idx + 1}: ${q.question}</div>
            <div style="color: #cbd5e1;">Đáp án đúng: <strong style="color: #4ade80;">${q.options[q.correctIndex]}</strong></div>
        `;
        list.appendChild(item);
    });
}

// Game 2 Security Lock Verification (Pass: viet123)
function unlockGame2(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('game2-pass-input');
    const err = document.getElementById('game2-pass-error');
    if (input && input.value.trim().toLowerCase() === 'viet123') {
        sessionStorage.setItem('game2_unlocked', 'true');
        const modal = document.getElementById('game2-lock-modal');
        if (modal) modal.style.display = 'none';
        playHopSound();
    } else {
        if (err) err.style.display = 'block';
        if (input) {
            input.value = '';
            input.focus();
        }
        playWrongSound();
    }
}

// Game 2 Pause & Settings Controller
function handleGame2SettingsClick() {
    playHopSound();
    const gameScreen = document.getElementById('screen-game');
    if (gameScreen && gameScreen.classList.contains('active')) {
        openGame2PauseModal();
    } else {
        showScreen('screen-admin');
    }
}

function openGame2PauseModal() {
    const modal = document.getElementById('game2-pause-modal');
    if (modal) modal.style.display = 'flex';
}

function closeGame2PauseModal() {
    playHopSound();
    const modal = document.getElementById('game2-pause-modal');
    if (modal) modal.style.display = 'none';
}

function exitGame2ToPlayScreen() {
    playHopSound();
    closeGame2PauseModal();
    showScreen('screen-config');
}

// First Initialization
renderApp();
