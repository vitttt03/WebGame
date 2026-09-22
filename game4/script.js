// =========================================================
// GAME 4: NHIỆM VỤ GIẢI CỨU - GAME ENGINE & AUDIO SYSTEM
// =========================================================

// --- CSS SPRITE POSITION MAPPING (4x2 GRIDS FOR TRAPPED & STANDING) ---
const TRAPPED_SPRITE_URL = '../images/anhnhanvatg4.png';
const STANDING_SPRITE_URL = '../images/anhnhanvatanmungG4.png';

const TRAPPED_SPRITE_POS = {
    1: '0% 0%',
    2: '33.333% 0%',
    3: '66.666% 0%',
    4: '100% 0%',
    5: '0% 100%',
    6: '33.333% 100%',
    7: '66.666% 100%',
    8: '100% 100%'
};

const STANDING_SPRITE_POS = {
    1: '0% 0%',
    2: '33.333% 0%',
    3: '66.666% 0%',
    4: '100% 0%',
    5: '0% 100%',
    6: '33.333% 100%',
    7: '66.666% 100%',
    8: '100% 100%'
};

function prepareSpriteSheet(callback) {
    if (callback) callback();
}

function getTrappedImg(type) {
    return TRAPPED_SPRITE_URL;
}

function getStandingImg(type) {
    return STANDING_SPRITE_URL;
}

// --- CHARACTER ASSETS MAPPING ---
const CHARACTER_ASSETS = {
    1: { name: "Tảng đá lớn (Đội Xanh)", badgeColor: "#3b82f6" },
    2: { name: "Tảng đá xếp chồng (Đội Vàng)", badgeColor: "#eab308" },
    3: { name: "Tảng đá hình cầu (Đội Đỏ)", badgeColor: "#ef4444" },
    4: { name: "Tảng đá tinh thể (Đội Tím)", badgeColor: "#a855f7" },
    5: { name: "Tảng đá gỗ (Đội Xanh Lá)", badgeColor: "#22c55e" },
    6: { name: "Tảng đá nhọn (Đội Cam)", badgeColor: "#f97316" },
    7: { name: "Cụm đá nhỏ (Đội Ngọc)", badgeColor: "#06b6d4" },
    8: { name: "Tảng đá có dây leo (Đội Hồng)", badgeColor: "#ec4899" }
};

// --- DEFAULT QUESTION BANK (8 QUESTIONS) ---
const DEFAULT_QUESTIONS = [
    {
        id: 1,
        title: "Đội Xanh - Giải cứu 1",
        type: 1,
        question: "Cơ quan nào trong cơ thể người có nhiệm vụ co bóp bơm máu đi khắp cơ thể?",
        options: ["Phổi", "Quả Tim", "Dạ dày", "Bộ não"],
        correctIndex: 1
    },
    {
        id: 2,
        title: "Đội Vàng - Giải cứu 2",
        type: 2,
        question: "Tính giá trị biểu thức toán học: \\(15 + 25 \\times 2 = ?\\)",
        options: ["80", "65", "50", "70"],
        correctIndex: 1
    },
    {
        id: 3,
        title: "Đội Đỏ - Giải cứu 3",
        type: 3,
        question: "Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?",
        options: ["Trái Đất", "Sao Thủy (Mercury)", "Sao Hỏa", "Sao Kim"],
        correctIndex: 1
    },
    {
        id: 4,
        title: "Đội Tím - Giải cứu 4",
        type: 4,
        question: "Hình học: Tam giác đều có 3 góc bằng nhau. Mỗi góc bằng bao nhiêu độ?",
        options: ["90^\\circ", "45^\\circ", "60^\\circ", "120^\\circ"],
        correctIndex: 2
    },
    {
        id: 5,
        title: "Đội Xanh Lá - Giải cứu 5",
        type: 5,
        question: "Thành phần khí nào chiếm tỉ lệ phần trăm nhiều nhất trong không khí Trái Đất?",
        options: ["Khí Oxy", "Khí Nitơ (N2)", "Khí Cacbonic", "Khí Hơi nước"],
        correctIndex: 1
    },
    {
        id: 6,
        title: "Đội Cam - Giải cứu 6",
        type: 6,
        question: "Giải phương trình: \\(\\sqrt{x} = 9\\). Giá trị của \\(x\\) là bao nhiêu?",
        options: ["3", "18", "81", "27"],
        correctIndex: 2
    },
    {
        id: 7,
        title: "Đội Ngọc - Giải cứu 7",
        type: 7,
        question: "Kim loại nào dẫn điện tốt nhất trong tất cả các kim loại?",
        options: ["Đồng", "Vàng", "Bạc (Silver)", "Nhôm"],
        correctIndex: 2
    },
    {
        id: 8,
        title: "Đội Hồng - Giải cứu 8",
        type: 8,
        question: "Nhiệt độ sôi của nước tinh khiết ở điều kiện áp suất tiêu chuẩn là bao nhiêu?",
        options: ["50^\\circ C", "100^\\circ C", "120^\\circ C", "80^\\circ C"],
        correctIndex: 1
    }
];

// --- GAME STATE ---
let questionBank = [];
let activeCharCount = 4; // Default 4 characters on game screen
let activeQuestions = [];
let currentOpenQId = null;
let rescuedCount = 0;
let isAudioMuted = false;

// --- WEB AUDIO SYNTHESIZER ---
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSound(type) {
    if (isAudioMuted || currentVolume === 0) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        if (type === 'correct') {
            // Upward arpeggio chime (C5, E5, G5, C6)
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.3 * currentVolume, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.35);
            });
        } else if (type === 'wrong') {
            // Low saw-wave buzz
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.4 * currentVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'break') {
            // Rock shatter sound effect
            const bufferSize = ctx.sampleRate * 0.3;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(400, now);
            filter.Q.setValueAtTime(1.5, now);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.5 * currentVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start(now);
        } else if (type === 'victory') {
            // Victory Fanfare Chord
            [523.25, 659.25, 783.99, 1046.50].forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.25 * currentVolume, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 1.5);
            });
        }
    } catch (e) {
        console.warn("Audio play error:", e);
    }
}

// --- JUNGLE & MOUNTAIN FOREST ADVENTURE BGM ENGINE ---
let forestBgmTimer = null;
let forestBgmStep = 0;
let isBgmRunning = false;

// Mountain & Forest Adventure Musical Frequencies
const JUNGLE_MARIMBA_PITCHES = [261.63, 329.63, 392.00, 440.00, 523.25, 659.25, 783.99];
const JUNGLE_BASS_PITCHES = [130.81, 130.81, 164.81, 174.61, 196.00, 196.00, 220.00, 174.61];
const MOUNTAIN_FLUTE_MELODY = [523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 440.00, 392.00, 523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33, 659.25];

function playForestStep() {
    if (isAudioMuted || !isBgmRunning) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const step = forestBgmStep % 16;

        // 1. Marimba Wooden Percussion
        const noteIdx = (step * 3 + (step % 4)) % JUNGLE_MARIMBA_PITCHES.length;
        const mFreq = JUNGLE_MARIMBA_PITCHES[noteIdx];
        const mOsc = ctx.createOscillator();
        const mGain = ctx.createGain();
        mOsc.type = 'triangle';
        mOsc.frequency.setValueAtTime(mFreq, now);
        mGain.gain.setValueAtTime(0.09 * currentVolume, now);
        mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        mOsc.connect(mGain);
        mGain.connect(ctx.destination);
        mOsc.start(now);
        mOsc.stop(now + 0.18);

        // 2. Jungle Deep Sub-Bass
        if (step % 2 === 0) {
            const bFreq = JUNGLE_BASS_PITCHES[Math.floor(step / 2) % JUNGLE_BASS_PITCHES.length];
            const bOsc = ctx.createOscillator();
            const bGain = ctx.createGain();
            bOsc.type = 'sine';
            bOsc.frequency.setValueAtTime(bFreq / 2, now);
            bGain.gain.setValueAtTime(0.18 * currentVolume, now);
            bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
            bOsc.connect(bGain);
            bGain.connect(ctx.destination);
            bOsc.start(now);
            bOsc.stop(now + 0.35);
        }

        // 3. Mountain Flute Vibrato Melody
        if (step % 2 === 1) {
            const fFreq = MOUNTAIN_FLUTE_MELODY[Math.floor(step / 2) % MOUNTAIN_FLUTE_MELODY.length];
            const fOsc = ctx.createOscillator();
            const fGain = ctx.createGain();
            fOsc.type = 'sine';
            fOsc.frequency.setValueAtTime(fFreq, now);
            fOsc.frequency.linearRampToValueAtTime(fFreq * 1.008, now + 0.12);
            fGain.gain.setValueAtTime(0.06 * currentVolume, now);
            fGain.gain.linearRampToValueAtTime(0.08 * currentVolume, now + 0.08);
            fGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
            fOsc.connect(fGain);
            fGain.connect(ctx.destination);
            fOsc.start(now);
            fOsc.stop(now + 0.4);
        }

        // 4. Forest Leaf Shaker
        const bufLen = ctx.sampleRate * 0.04;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3200;
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime((step % 4 === 2 ? 0.05 : 0.018) * currentVolume, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start(now);

        // 5. Mountain Bird Chirps
        if (step === 0 || step === 8) {
            const birdOsc = ctx.createOscillator();
            const birdGain = ctx.createGain();
            birdOsc.type = 'sine';
            birdOsc.frequency.setValueAtTime(2200, now);
            birdOsc.frequency.exponentialRampToValueAtTime(3100, now + 0.07);
            birdOsc.frequency.exponentialRampToValueAtTime(2600, now + 0.13);
            birdGain.gain.setValueAtTime(0.035 * currentVolume, now);
            birdGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            birdOsc.connect(birdGain);
            birdGain.connect(ctx.destination);
            birdOsc.start(now);
            birdOsc.stop(now + 0.15);
        }

        forestBgmStep++;
    } catch (e) {}
}

function startBgm() {
    if (isAudioMuted) return;
    isBgmRunning = true;
    if (!forestBgmTimer) {
        forestBgmStep = 0;
        playForestStep();
        forestBgmTimer = setInterval(playForestStep, 260);
    }
}

function stopBgm() {
    isBgmRunning = false;
    if (forestBgmTimer) {
        clearInterval(forestBgmTimer);
        forestBgmTimer = null;
    }
}

let currentVolume = 0.5;
let lastVolume = 0.5;

function changeVolume(val) {
    const num = parseInt(val);
    currentVolume = num / 100;
    isAudioMuted = (currentVolume === 0);
    if (isAudioMuted) {
        stopBgm();
    } else {
        startBgm();
    }
    updateVolumeUI();
}

function updateVolumeUI() {
    const icon = document.getElementById('sound-icon');
    const startIcon = document.getElementById('start-sound-icon');
    const slider = document.getElementById('top-vol-slider');
    const startSlider = document.getElementById('start-vol-slider');
    const txt = document.getElementById('top-vol-txt');
    const startTxt = document.getElementById('start-vol-txt');
    const pct = Math.round(currentVolume * 100);

    const symbol = isAudioMuted || currentVolume === 0 ? '🔇' : (currentVolume <= 0.35 ? '🔈' : (currentVolume <= 0.7 ? '🔉' : '🔊'));
    if (icon) icon.innerText = symbol;
    if (startIcon) startIcon.innerText = symbol;
    if (slider && parseInt(slider.value) !== pct) slider.value = pct;
    if (startSlider && parseInt(startSlider.value) !== pct) startSlider.value = pct;
    if (txt) txt.innerText = `${pct}%`;
    if (startTxt) startTxt.innerText = `${pct}%`;
}

function toggleSound() {
    if (isAudioMuted || currentVolume === 0) {
        const restore = lastVolume > 0 ? Math.round(lastVolume * 100) : 50;
        changeVolume(restore);
    } else {
        lastVolume = currentVolume;
        changeVolume(0);
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    prepareSpriteSheet(() => {
        loadSettingsAndQuestions();
        initGameScene();
        setupKeyboardShortcuts();
        showStartScreen();
    });
    document.addEventListener('click', () => {
        startBgm();
    }, { once: true });
});

function startGameFromStartScreen() {
    playSound('correct');
    startBgm();
    const startModal = document.getElementById('start-modal');
    if (startModal) {
        startModal.classList.add('hidden');
    }
}

function showStartScreen() {
    const startModal = document.getElementById('start-modal');
    if (startModal) {
        startModal.classList.remove('hidden');
    }
}

let rescueSavedQuestionLists = {};
let rescueActiveListId = 'default';

function loadSettingsAndQuestions() {
    const savedCount = localStorage.getItem('rescueGameActiveCount_v1');
    if (savedCount) {
        activeCharCount = parseInt(savedCount) || 4;
    }

    const rawLists = localStorage.getItem('rescueSavedQuestionLists');
    const rawActiveId = localStorage.getItem('rescueActiveQuestionListId');
    
    let hasLoadedLists = false;
    if (rawLists) {
        try {
            rescueSavedQuestionLists = JSON.parse(rawLists);
            if (Object.keys(rescueSavedQuestionLists).length > 0) hasLoadedLists = true;
        } catch (e) {
            rescueSavedQuestionLists = {};
        }
    }
    
    if (!rescueSavedQuestionLists['default'] || !Array.isArray(rescueSavedQuestionLists['default'].questions)) {
        rescueSavedQuestionLists['default'] = {
            id: 'default',
            name: "Bộ Mặc Định (Nhiệm Vụ Giải Cứu)",
            questions: typeof DEFAULT_QUESTIONS !== 'undefined' ? JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)) : []
        };
    }

    if (!hasLoadedLists) {
        const legacySaved = localStorage.getItem('rescueGameQuestions_v1');
        if (legacySaved) {
            try {
                const parsedLegacy = JSON.parse(legacySaved);
                if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
                    if (rawActiveId && rescueSavedQuestionLists[rawActiveId]) {
                        rescueSavedQuestionLists[rawActiveId].questions = parsedLegacy;
                    } else {
                        rescueSavedQuestionLists['default'].questions = parsedLegacy;
                    }
                }
            } catch (e) {}
        }
    }

    if (rawActiveId && rescueSavedQuestionLists[rawActiveId]) {
        rescueActiveListId = rawActiveId;
    } else {
        rescueActiveListId = 'default';
    }

    questionBank = JSON.parse(JSON.stringify(rescueSavedQuestionLists[rescueActiveListId].questions));

    if (savedCount) {
        activeCharCount = parseInt(savedCount) || 4;
    } else {
        activeCharCount = Math.min(8, Math.max(4, questionBank.length));
    }
    
    syncQuestionBankLength();

    const selectEl = document.getElementById('setting-char-count');
    if (selectEl) {
        selectEl.value = activeCharCount.toString();
    }
}

function syncQuestionBankLength() {
    if (questionBank.length > activeCharCount) {
        questionBank = questionBank.slice(0, activeCharCount);
    } else if (questionBank.length < activeCharCount) {
        const currentLen = questionBank.length;
        for (let i = currentLen; i < activeCharCount; i++) {
            const newId = questionBank.length > 0 ? Math.max(...questionBank.map(q => q.id)) + 1 : 1;
            questionBank.push({
                id: newId,
                title: `Đội giải cứu ${newId}`,
                type: (newId % 8) === 0 ? 8 : (newId % 8),
                question: "",
                options: ["", "", "", ""],
                correctIndex: 0
            });
        }
    }
}

function saveQuestionsToStorage() {
    if (!rescueSavedQuestionLists[rescueActiveListId]) {
        rescueSavedQuestionLists[rescueActiveListId] = {
            id: rescueActiveListId,
            name: "Bộ Câu Hỏi " + new Date().toLocaleDateString('vi-VN'),
            questions: []
        };
    }
    rescueSavedQuestionLists[rescueActiveListId].questions = [...questionBank];
    localStorage.setItem('rescueSavedQuestionLists', JSON.stringify(rescueSavedQuestionLists));
    localStorage.setItem('rescueActiveQuestionListId', rescueActiveListId);
    localStorage.setItem('rescueGameQuestions_v1', JSON.stringify(questionBank));
    localStorage.setItem('rescueGameActiveCount_v1', activeCharCount.toString());
}

function renderRescueQuestionSetSelector() {
    const selectEl = document.getElementById('rescue-question-set-select');
    if (!selectEl) return;
    
    selectEl.innerHTML = '';
    const keys = Object.keys(rescueSavedQuestionLists);
    
    keys.forEach(key => {
        const item = rescueSavedQuestionLists[key];
        const option = document.createElement('option');
        option.value = item.id;
        const count = item.questions ? item.questions.length : 0;
        option.innerText = `${item.name} (${count} câu)`;
        if (item.id === rescueActiveListId) {
            option.selected = true;
        }
        selectEl.appendChild(option);
    });
}

function onSelectRescueQuestionSet(listId) {
    if (!rescueSavedQuestionLists[listId]) return;
    rescueActiveListId = listId;
    questionBank = JSON.parse(JSON.stringify(rescueSavedQuestionLists[listId].questions));
    
    activeCharCount = Math.min(8, Math.max(4, questionBank.length));
    const selectEl = document.getElementById('setting-char-count');
    if (selectEl) selectEl.value = activeCharCount.toString();
    
    syncQuestionBankLength();
    
    saveQuestionsToStorage();
    renderAdminQuestionsList();
    renderRescueQuestionSetSelector();
    initGameScene();
}

function promptSaveRescueQuestionSet() {
    const currentName = rescueSavedQuestionLists[rescueActiveListId] ? rescueSavedQuestionLists[rescueActiveListId].name : "Bộ câu hỏi mới";
    const name = prompt("Nhập tên cho Bộ Câu Hỏi này:", currentName);
    if (name && name.trim()) {
        const trimmedName = name.trim();
        rescueSavedQuestionLists[rescueActiveListId].name = trimmedName;
        rescueSavedQuestionLists[rescueActiveListId].questions = [...questionBank];
        saveQuestionsToStorage();
        renderRescueQuestionSetSelector();
        alert(`🎉 Đã lưu bộ câu hỏi: "${trimmedName}"!`);
    }
}

function promptCreateNewRescueQuestionSet() {
    const name = prompt("Nhập tên Bộ Câu Hỏi Mới:", "Bộ Câu Hỏi Mới " + (Object.keys(rescueSavedQuestionLists).length + 1));
    if (name && name.trim()) {
        const trimmedName = name.trim();
        const newId = 'set_' + Date.now();
        rescueSavedQuestionLists[newId] = {
            id: newId,
            name: trimmedName,
            questions: []
        };
        rescueActiveListId = newId;
        questionBank = [];
        syncQuestionBankLength();
        saveQuestionsToStorage();
        renderAdminQuestionsList();
        renderRescueQuestionSetSelector();
        initGameScene();
        alert(`✨ Đã tạo bộ câu hỏi mới: "${trimmedName}". Hãy thêm nội dung cho các câu hỏi!`);
    }
}

function deleteRescueQuestionSet() {
    const keys = Object.keys(rescueSavedQuestionLists);
    if (keys.length <= 1) {
        alert("⚠️ Bạn phải giữ lại ít nhất 1 Bộ Câu Hỏi!");
        return;
    }
    
    const currentName = rescueSavedQuestionLists[rescueActiveListId] ? rescueSavedQuestionLists[rescueActiveListId].name : "Bộ này";
    if (confirm(`Bạn có chắc chắn muốn xóa bộ câu hỏi "${currentName}"?`)) {
        delete rescueSavedQuestionLists[rescueActiveListId];
        const remainingKeys = Object.keys(rescueSavedQuestionLists);
        rescueActiveListId = remainingKeys[0];
        questionBank = [...rescueSavedQuestionLists[rescueActiveListId].questions];
        saveQuestionsToStorage();
        renderAdminQuestionsList();
        renderRescueQuestionSetSelector();
        initGameScene();
        alert("🗑️ Đã xóa bộ câu hỏi thành công.");
    }
}

// --- GAME SCENE RENDERING ---
function initGameScene() {
    rescuedCount = 0;
    document.getElementById('rescued-count').innerText = '0';
    document.getElementById('total-count').innerText = activeCharCount.toString();

    // Select active questions up to activeCharCount
    activeQuestions = questionBank.slice(0, activeCharCount).map((q, idx) => ({
        ...q,
        rescued: false,
        slotIndex: idx
    }));

    // Clear Rescued Base Group
    const rescuedGroup = document.getElementById('rescued-group');
    if (rescuedGroup) {
        rescuedGroup.innerHTML = `
            <div class="rescued-row rescued-row-bottom" id="rescued-row-bottom"></div>
            <div class="rescued-row rescued-row-top" id="rescued-row-top"></div>
        `;
    }

    // Render Trapped Path Slots
    const trappedPath = document.getElementById('trapped-path');
    if (!trappedPath) return;
    trappedPath.innerHTML = '';

    function createSlotElement(q) {
        const charInfo = CHARACTER_ASSETS[q.type] || CHARACTER_ASSETS[1];
        const slotEl = document.createElement('div');
        slotEl.className = 'char-slot';
        slotEl.id = `char-slot-${q.id}`;
        slotEl.setAttribute('onclick', `openQuestionModal(${q.id})`);

        const qNum = q.title ? q.title.replace(/[^0-9]/g, '') : q.id;

        slotEl.innerHTML = `
            <div class="char-badge" id="badge-q-${q.id}">
                ${qNum || q.id}
            </div>
            <div class="trapped-wrapper" id="wrapper-q-${q.id}">
                <div class="sprite-char trapped-sprite" id="img-trapped-${q.id}" style="background-position: ${TRAPPED_SPRITE_POS[q.type] || '0% 0%'};"></div>
            </div>
        `;
        return slotEl;
    }

    if (activeQuestions.length <= 4) {
        const rowEl = document.createElement('div');
        rowEl.className = 'trapped-row trapped-row-bottom';
        activeQuestions.forEach((q) => {
            rowEl.appendChild(createSlotElement(q));
        });
        trappedPath.appendChild(rowEl);
    } else {
        const bottomRowEl = document.createElement('div');
        bottomRowEl.className = 'trapped-row trapped-row-bottom';

        const topRowEl = document.createElement('div');
        topRowEl.className = 'trapped-row trapped-row-top';

        activeQuestions.forEach((q, idx) => {
            if (idx < 4) {
                bottomRowEl.appendChild(createSlotElement(q));
            } else {
                topRowEl.appendChild(createSlotElement(q));
            }
        });

        trappedPath.appendChild(bottomRowEl);
        trappedPath.appendChild(topRowEl);
    }
}

function restartGame() {
    initGameScene();
    closeVictoryModal();
}

// --- QUESTION MODAL LOGIC ---
function openQuestionModal(qId) {
    const q = activeQuestions.find(item => item.id === qId);
    if (!q || q.rescued) return; // Do not open if already rescued

    currentOpenQId = qId;
    const charInfo = CHARACTER_ASSETS[q.type] || CHARACTER_ASSETS[1];

    document.getElementById('modal-team-title').innerText = `${q.title.toUpperCase()}`;
    
    // Render question text with KaTeX support
    const qTextEl = document.getElementById('question-text');
    qTextEl.innerHTML = q.question;

    // Render 4 Answer Buttons
    const answersGrid = document.getElementById('answers-grid');
    answersGrid.innerHTML = '';

    const prefixes = ['A', 'B', 'C', 'D'];
    q.options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-opt';
        btn.setAttribute('onclick', `handleSelectAnswer(${optIdx}, this)`);
        btn.innerHTML = `
            <span class="opt-prefix">${prefixes[optIdx]}</span>
            <span class="opt-text">${optText}</span>
        `;
        answersGrid.appendChild(btn);
    });

    // Reset status toast inside modal
    const toast = document.getElementById('modal-status-toast');
    if (toast) {
        toast.className = 'modal-status-toast';
        toast.innerText = '';
    }

    // Render KaTeX math in modal
    renderMathInElement(qTextEl, {
        delimiters: [
            {left: '\\(', right: '\\)', display: false},
            {left: '\\[', right: '\\]', display: true},
            {left: '$$', right: '$$', display: true}
        ]
    });

    // Remove any previous continue button
    const oldBtn = document.getElementById('btn-rescue-continue');
    if (oldBtn) oldBtn.remove();

    // Show modal
    document.getElementById('question-modal').classList.add('active');
}

function closeQuestionModal() {
    document.getElementById('question-modal').classList.remove('active');
    currentOpenQId = null;
}

function handleSelectAnswer(optIdx, btnEl) {
    const q = activeQuestions.find(item => item.id === currentOpenQId);
    if (!q || q.rescued || btnEl.disabled) return;

    const toast = document.getElementById('modal-status-toast');

    if (optIdx === q.correctIndex) {
        // ✅ TRẢ LỜI ĐÚNG!
        playSound('correct');
        btnEl.classList.add('correct');
        document.querySelectorAll('#modal-options-grid .btn-opt').forEach(b => b.disabled = true);

        if (toast) {
            toast.className = 'modal-status-toast correct';
            toast.innerText = '✅ CHÍNH XÁC! TẢNG ĐÁ ĐÃ VỠ & BẠN TRẺ ĐƯỢC GIẢI CỨU!';
        }

        q.rescued = true;
        rescuedCount++;
        document.getElementById('rescued-count').innerText = rescuedCount.toString();

        // Hiện nút "XONG - TIẾP TỤC GIẢI CỨU" để cô giáo giải thích bài học trước khi quay lại màn game
        const modalBody = document.querySelector('#question-modal .modal-body') || document.getElementById('question-modal');
        if (modalBody && !document.getElementById('btn-rescue-continue')) {
            const btn = document.createElement('button');
            btn.id = 'btn-rescue-continue';
            btn.style.cssText = "margin: 0.8rem auto 0 auto; padding: 0.45rem 1.2rem; font-size: 1.05rem; background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; border: 2px solid #86efac; border-radius: 10px; font-weight: bold; cursor: pointer; display: block; width: fit-content; box-shadow: 0 3px 10px rgba(34, 197, 94, 0.4); font-family: inherit;";
            btn.innerHTML = '⏩ XONG - HOÀN THÀNH & TIẾP TỤC GIẢI CỨU ➔';
            btn.onclick = () => {
                closeQuestionModal();
                triggerRescueAnimation(q);
            };
            modalBody.appendChild(btn);
        }

    } else {
        // ❌ TRẢ LỜI SAI!
        playSound('wrong');
        btnEl.classList.add('wrong');
        btnEl.disabled = true; // Giữ nguyên màu đỏ và khóa đáp án đã chọn sai

        if (toast) {
            toast.className = 'modal-status-toast wrong';
            toast.innerText = '❌ CHƯA CHÍNH XÁC! HỌC SINH KHÁC HÃY TIẾP TỤC THỬ LẠI!';
        }
    }
}

// --- RESCUE ANIMATION: ROCK BREAK & WALK TO RESCUE BASE ---
function triggerRescueAnimation(q) {
    const charInfo = CHARACTER_ASSETS[q.type] || CHARACTER_ASSETS[1];
    const slotEl = document.getElementById(`char-slot-${q.id}`);
    const imgTrapped = document.getElementById(`img-trapped-${q.id}`);
    const badgeEl = document.getElementById(`badge-q-${q.id}`);

    if (!slotEl || !imgTrapped) return;

    // 1. Play Rock Shatter Sound & Particle Animation
    playSound('break');
    imgTrapped.classList.add('rock-shattering');

    // Update Badge to Rescued
    slotEl.classList.add('rescued');
    if (badgeEl) {
        badgeEl.innerHTML = `✔`;
    }

    // 2. Create Standing Character Element for Walk Animation
    setTimeout(() => {
        // Hide trapped rock image completely
        imgTrapped.style.display = 'none';

        const arenaContainer = document.getElementById('arena-container');
        const slotRect = slotEl.getBoundingClientRect();
        const arenaRect = arenaContainer.getBoundingClientRect();

        const startLeft = slotRect.left - arenaRect.left + (slotRect.width / 2) - 70;
        const startBottom = Math.max(10, arenaRect.bottom - slotRect.bottom);

        // Determine target row inside rescued-group
        const rowIdx = Math.floor((rescuedCount - 1) / 4);
        let targetRow = rowIdx === 1 ? document.getElementById('rescued-row-top') : document.getElementById('rescued-row-bottom');
        if (!targetRow) targetRow = document.getElementById('rescued-group');

        // Append final character element into target row (initially hidden)
        const finalChar = document.createElement('div');
        finalChar.className = 'rescued-standing-char';
        finalChar.style.opacity = '0';
        finalChar.style.transition = 'opacity 0.25s ease';
        finalChar.innerHTML = `<div class="sprite-char standing-sprite" style="background-position: ${STANDING_SPRITE_POS[q.type] || '0% 0%'};"></div>`;
        targetRow.appendChild(finalChar);

        // Get exact pixel destination coordinates of finalChar relative to arena container
        const finalRect = finalChar.getBoundingClientRect();
        const destLeft = finalRect.left - arenaRect.left;
        const destBottom = arenaRect.bottom - finalRect.bottom;

        // Create walking character overlay element
        const standingImg = document.createElement('div');
        standingImg.className = 'sprite-char standing-sprite standing-anim-char';
        standingImg.style.backgroundPosition = STANDING_SPRITE_POS[q.type] || '0% 100%';
        standingImg.style.left = `${startLeft}px`;
        standingImg.style.bottom = `${startBottom}px`;
        arenaContainer.appendChild(standingImg);

        // 3. Smooth Walk / Run transition directly to exact destination spot
        requestAnimationFrame(() => {
            setTimeout(() => {
                standingImg.style.left = `${destLeft}px`;
                standingImg.style.bottom = `${destBottom}px`;
            }, 40);
        });

        // 4. Arrived seamlessly at standing spot:
        setTimeout(() => {
            finalChar.style.opacity = '1';
            standingImg.remove();

            // Check Victory Condition!
            if (rescuedCount >= activeCharCount) {
                setTimeout(showVictoryModal, 600);
            }
        }, 1600);

    }, 600);
}

// --- VICTORY MODAL & CONFETTI ---
function showVictoryModal() {
    playSound('victory');
    document.getElementById('v-stat-rescued').innerText = `${rescuedCount}/${activeCharCount}`;
    document.getElementById('victory-modal').classList.add('active');
    startConfetti();
}

function closeVictoryModal() {
    document.getElementById('victory-modal').classList.remove('active');
}

// Simple HTML5 Canvas Confetti System
function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const particles = [];
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < 90; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 8 + 4,
            d: Math.random() * 90,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }

    let animationId;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.tilt = Math.sin(p.tiltAngle) * 15;

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();

            if (p.y > canvas.height) {
                particles[i] = {
                    x: Math.random() * canvas.width,
                    y: -10,
                    r: p.r,
                    d: p.d,
                    color: p.color,
                    tilt: p.tilt,
                    tiltAngleIncremental: p.tiltAngleIncremental,
                    tiltAngle: p.tiltAngle
                };
            }
        });

        if (document.getElementById('victory-modal').classList.contains('active')) {
            animationId = requestAnimationFrame(draw);
        }
    }
    draw();
}

// --- ADMIN & AUTH SYSTEM (PASSWORD: UYEN123) ---
function openAuthModal() {
    const input = document.getElementById('admin-auth-input');
    const err = document.getElementById('auth-error-msg');
    if (input) input.value = '';
    if (err) err.style.display = 'none';
    document.getElementById('auth-modal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

function submitAdminAuth(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('admin-auth-input');
    const err = document.getElementById('auth-error-msg');

    if (input && input.value.trim().toLowerCase() === 'uyen123') {
        playSound('correct');
        closeAuthModal();
        openAdminModal();
    } else {
        playSound('wrong');
        if (err) err.style.display = 'block';
    }
}

function openAdminModal() {
    renderRescueQuestionSetSelector();
    renderAdminQuestionsList();
    renderMathToolbar();
    document.getElementById('admin-modal').classList.add('active');
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.remove('active');
}

function updateCharCountSetting(val) {
    activeCharCount = parseInt(val) || 4;
    syncQuestionBankLength();
    saveQuestionsToStorage();
    renderAdminQuestionsList();
    initGameScene();
}

// --- AUTO-CONVERT CARET (^) TYPING TO UNICODE SUPERSCRIPTS ---
const SUPERSCRIPT_MAP = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼',
    'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
    'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
    'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
    'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
    'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
    'A': 'ᴬ', 'B': 'ᴮ', 'D': 'ᴰ', 'E': 'ᴱ', 'G': 'ᴳ',
    'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ', 'K': 'ᴷ', 'L': 'ᴸ',
    'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ', 'P': 'ᴾ', 'R': 'ᴿ',
    'T': 'ᵀ', 'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ'
};

function convertCaretToSuperscript(text) {
    if (!text || !text.includes('^')) return text;

    function toSuper(str) {
        return str.split('').map(ch => SUPERSCRIPT_MAP[ch] || ch).join('');
    }

    // 1. Convert ^(...) -> superscripts inside parentheses
    let converted = text.replace(/\^\(([^)]+)\)/g, (match, inner) => {
        return toSuper(inner);
    });

    // 2. Convert ^something -> superscripts for word/number after ^
    converted = converted.replace(/\^([0-9a-zA-Z+\-]+)/g, (match, inner) => {
        return toSuper(inner);
    });

    return converted;
}

document.addEventListener('input', (e) => {
    const selectors = '#admin-q-text, #admin-opt-0, #admin-opt-1, #admin-opt-2, #admin-opt-3, #admin-q-title';
    if (!e.target || !e.target.matches(selectors)) return;

    const input = e.target;
    const oldVal = input.value;
    const newVal = convertCaretToSuperscript(oldVal);

    if (oldVal !== newVal) {
        const start = input.selectionStart;
        const diff = oldVal.length - newVal.length;

        input.value = newVal;

        // Adjust cursor position smoothly
        if (start !== null) {
            const newPos = Math.max(0, start - diff);
            input.setSelectionRange(newPos, newPos);
        }
    }
});

// --- MATH TOOLBAR & KATEX INTEGRATION ---
let lastFocusedInput = null;
let customMathSymbols = JSON.parse(localStorage.getItem('rescueCustomMathSymbols') || '[]');

document.addEventListener('focusin', (e) => {
    if (e.target && e.target.matches('#admin-q-text, #admin-opt-0, #admin-opt-1, #admin-opt-2, #admin-opt-3, #admin-q-title')) {
        lastFocusedInput = e.target;
    }
});

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
        <!-- HÀNG 1: TRỌN BỘ SỐ MŨ (0 - 9, n, x, +, -) -->
        <div class="math-group-row">
            <span class="math-row-label">🔢 SỐ MŨ:</span>
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

        <!-- HÀNG 3: KÝ TỰ TÙY CHỈNH -->
        <div class="math-group-row">
            <span class="math-row-label">🧪 KÝ TỰ TÙY CHỈNH:</span>
            <div class="math-row-buttons">
                ${customMathSymbols.map((sym, cIdx) => {
                    const safe = sym.replace(/'/g, "\\'");
                    return `<button type="button" class="math-sym-btn custom-sym" onclick="insertMathSymbol('${safe}')" oncontextmenu="deleteCustomMathSymbol(event, ${cIdx})" title="Ký tự tự thêm (Chuột phải để xóa)">${sym}</button>`;
                }).join('')}
                <button type="button" class="math-sym-btn math-add-custom-btn" onclick="promptAddCustomMathSymbol()" title="Bấm để tự thêm ký tự mới">+ Thêm Ký Tự</button>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function promptAddCustomMathSymbol() {
    playSound('correct');
    const sym = prompt("Nhập ký tự hoặc công thức toán học bạn muốn thêm vào bảng:\n(Ví dụ: ∫, ∑, log, ∜, \\vec{u}, ...)");
    if (sym && sym.trim()) {
        const trimmed = sym.trim();
        if (!customMathSymbols.includes(trimmed)) {
            customMathSymbols.push(trimmed);
            localStorage.setItem('rescueCustomMathSymbols', JSON.stringify(customMathSymbols));
            playSound('correct');
            renderMathToolbar();
        } else {
            alert("Ký tự này đã có trên bảng rồi!");
        }
    }
}

function deleteCustomMathSymbol(e, index) {
    if (e) e.preventDefault();
    playSound('correct');
    const sym = customMathSymbols[index];
    if (confirm(`Bạn có muốn xóa ký tự "${sym}" khỏi bảng không?`)) {
        customMathSymbols.splice(index, 1);
        localStorage.setItem('rescueCustomMathSymbols', JSON.stringify(customMathSymbols));
        renderMathToolbar();
    }
}

function insertMathSymbol(symbol) {
    playSound('correct');
    if (!lastFocusedInput) {
        lastFocusedInput = document.getElementById('admin-q-text') || document.getElementById('admin-opt-0');
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

function insertMath(texSnippet) {
    insertMathSymbol(`\\(${texSnippet}\\)`);
}

function renderAdminQuestionsList() {
    const container = document.getElementById('admin-questions-list');
    const countEl = document.getElementById('q-list-count');
    if (!container) return;

    if (countEl) countEl.innerText = questionBank.length.toString();

    container.innerHTML = '';

    if (questionBank.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 1.5rem;">Chưa có câu hỏi nào trong bộ này. Hãy thêm câu hỏi mới bên dưới!</p>';
        return;
    }

    questionBank.forEach((q, idx) => {
        const item = document.createElement('div');
        item.className = 'q-item-card question-item';
        item.innerHTML = `
            <div class="q-item-info question-item-info">
                <span class="q-item-tag"><strong>Câu ${idx + 1}</strong> • ${q.title || 'Đội giải cứu'}</span><br>
                <span class="q-item-title"><strong>Câu hỏi:</strong> ${q.question}</span><br>
                <span class="q-item-opts" style="color: #a5d6a7;"><strong>Đáp án đúng:</strong> ${['A', 'B', 'C', 'D'][q.correctIndex]} (${q.options[q.correctIndex]})</span>
            </div>
            <div class="q-item-actions question-item-actions" style="display: flex; gap: 8px; flex-shrink: 0;">
                <button class="btn-small btn-edit btn-q-edit" onclick="editQuestion(${q.id})" title="Chỉnh sửa câu hỏi này">✏️ Sửa</button>
                <button class="btn-small btn-delete btn-q-del" onclick="deleteQuestion(${q.id})" title="Xóa câu hỏi này">🗑️ Xóa</button>
            </div>
        `;
        container.appendChild(item);
    });

    triggerMathRender(container);
}

function handleQuestionSubmit(e) {
    if (e) e.preventDefault();

    const editId = document.getElementById('edit-q-id').value;
    const title = document.getElementById('admin-q-title').value.trim();
    const type = parseInt(document.getElementById('admin-q-type').value) || 1;
    const question = document.getElementById('admin-q-text').value.trim();
    const opt0 = document.getElementById('admin-opt-0').value.trim();
    const opt1 = document.getElementById('admin-opt-1').value.trim();
    const opt2 = document.getElementById('admin-opt-2').value.trim();
    const opt3 = document.getElementById('admin-opt-3').value.trim();
    const correctIndex = parseInt(document.getElementById('admin-correct-opt').value) || 0;

    if (editId) {
        // Edit existing
        const target = questionBank.find(item => item.id === parseInt(editId));
        if (target) {
            target.title = title;
            target.type = type;
            target.question = question;
            target.options = [opt0, opt1, opt2, opt3];
            target.correctIndex = correctIndex;
        }
    } else {
        // Add new (nhưng nếu đã đạt activeCharCount thì sẽ tăng activeCharCount)
        const newId = questionBank.length > 0 ? Math.max(...questionBank.map(i => i.id)) + 1 : 1;
        questionBank.push({
            id: newId,
            title,
            type,
            question,
            options: [opt0, opt1, opt2, opt3],
            correctIndex
        });
        activeCharCount = Math.min(8, questionBank.length);
        const selectEl = document.getElementById('setting-char-count');
        if (selectEl) selectEl.value = activeCharCount.toString();
    }

    syncQuestionBankLength();
    saveQuestionsToStorage();
    cancelEditForm();
    renderAdminQuestionsList();
    initGameScene();
    playSound('correct');
}

function editQuestion(id) {
    playSound('correct');
    const q = questionBank.find(item => item.id === id);
    if (!q) return;

    document.getElementById('edit-q-id').value = q.id;
    document.getElementById('admin-q-title').value = q.title || '';
    document.getElementById('admin-q-type').value = q.type || 1;
    document.getElementById('admin-q-text').value = q.question || '';
    document.getElementById('admin-opt-0').value = q.options[0] || '';
    document.getElementById('admin-opt-1').value = q.options[1] || '';
    document.getElementById('admin-opt-2').value = q.options[2] || '';
    document.getElementById('admin-opt-3').value = q.options[3] || '';
    document.getElementById('admin-correct-opt').value = q.correctIndex !== undefined ? q.correctIndex : 0;

    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('form-submit-btn');
    const cancelBtn = document.getElementById('btn-cancel-edit');
    const formEl = document.getElementById('admin-question-form');

    if (formTitle) formTitle.innerText = `✏️ Chỉnh Sửa Câu Hỏi #${q.id}`;
    if (submitBtn) submitBtn.innerText = `💾 CẬP NHẬT CÂU HỎI`;
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
    if (formEl) {
        formEl.classList.add('editing-mode');
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const qInput = document.getElementById('admin-q-text');
    if (qInput) qInput.focus();
}

function cancelEditForm() {
    playSound('correct');
    document.getElementById('edit-q-id').value = '';
    const formEl = document.getElementById('admin-q-form');
    if (formEl) formEl.reset();

    const parentFormBox = document.getElementById('admin-question-form');
    if (parentFormBox) parentFormBox.classList.remove('editing-mode');

    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('form-submit-btn');
    const cancelBtn = document.getElementById('btn-cancel-edit');

    if (formTitle) formTitle.innerText = '➕ Thêm Câu Hỏi Mới';
    if (submitBtn) submitBtn.innerText = '💾 LƯU CÂU HỎI VÀO GAME';
    if (cancelBtn) cancelBtn.style.display = 'none';
}

function deleteQuestion(id) {
    playSound('correct');
    if (questionBank.length <= 4) {
        alert("⚠️ Trò chơi cần tối thiểu 4 câu hỏi/nhân vật!");
        return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi hệ thống?')) {
        questionBank = questionBank.filter(item => item.id !== id);
        activeCharCount = questionBank.length;
        const selectEl = document.getElementById('setting-char-count');
        if (selectEl) selectEl.value = activeCharCount.toString();
        
        saveQuestionsToStorage();
        renderAdminQuestionsList();
        initGameScene();
    }
}

// --- EXPORT & IMPORT JSON ---
function exportQuestionsJSON() {
    playSound('correct');
    const currentSet = rescueSavedQuestionLists[rescueActiveListId] || { name: "Bo_Cau_Hoi_Giai_Cuu", questions: questionBank };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentSet, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const safeFileName = (currentSet.name || "bo_cau_hoi_giai_cuu").replace(/[^a-zA-Z0-9_\-\u00C0-\u024F]/g, "_") + ".json";
    downloadAnchor.setAttribute("download", safeFileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importQuestionsJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            let importedQuestions = [];
            let importedName = "Bộ Import " + new Date().toLocaleDateString('vi-VN');

            if (Array.isArray(parsed)) {
                importedQuestions = parsed;
            } else if (parsed && Array.isArray(parsed.questions)) {
                importedQuestions = parsed.questions;
                if (parsed.name) importedName = parsed.name;
            } else {
                alert('⚠️ Định dạng tệp JSON không hợp lệ!');
                return;
            }

            const newId = 'set_imported_' + Date.now();
            rescueSavedQuestionLists[newId] = {
                id: newId,
                name: importedName,
                questions: importedQuestions
            };
            rescueActiveListId = newId;
            questionBank = [...importedQuestions];
            
            activeCharCount = Math.min(8, Math.max(4, questionBank.length));
            const selectEl = document.getElementById('setting-char-count');
            if (selectEl) selectEl.value = activeCharCount.toString();
            syncQuestionBankLength();
            
            saveQuestionsToStorage();
            cancelEditForm();
            renderAdminQuestionsList();
            renderRescueQuestionSetSelector();
            initGameScene();
            playSound('correct');
            alert(`📥 Đã nhập thành công bộ câu hỏi: "${importedName}" (${questionBank.length} câu)!`);
        } catch (err) {
            alert('⚠️ Lỗi đọc file JSON: ' + err.message);
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}

function resetDefaultQuestions() {
    playSound('correct');
    if (confirm('Khôi phục ngân hàng câu hỏi về mặc định ban đầu?')) {
        questionBank = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
        activeCharCount = 8;
        const selectEl = document.getElementById('setting-char-count');
        if (selectEl) selectEl.value = '8';
        syncQuestionBankLength();
        saveQuestionsToStorage();
        renderAdminQuestionsList();
        initGameScene();
    }
}

// --- KEYBOARD SHORTCUTS (PRESS 'F' FOR FULLSCREEN) ---
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement ? document.activeElement.tagName.toUpperCase() : '';
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement.isContentEditable) {
            return;
        }

        if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }
    });
}

// --- GAME 4 PAUSE CONTROLLER ---
function handleGame4SettingsClick() {
    playSound('correct');
    openGame4PauseModal();
}

function openGame4PauseModal() {
    const modal = document.getElementById('game4-pause-modal');
    if (modal) modal.classList.add('active');
}

function closeGame4PauseModal() {
    playSound('correct');
    const modal = document.getElementById('game4-pause-modal');
    if (modal) modal.classList.remove('active');
}

function exitGame4ToPlayScreen() {
    playSound('correct');
    closeGame4PauseModal();
    const startModal = document.getElementById('start-modal');
    if (startModal) startModal.classList.remove('hidden');
    stopBgm();
}
