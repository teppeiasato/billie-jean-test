const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // 🔊 iPadの消音モード（ベル赤）でも音を強制的に鳴らす設定
    audio: {
        disableWebAudio: true
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

const GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxFuDr_Q4pLHg-ywJOipHcgTKgm5m072Jbw8LtsWldjphlLvebIrYPdv2MeHy2how6v/exec";

let studentInfo = { grade: 1, class: 'A', number: 1, name: '' };
let playCount = 0; 
let currentSelectedMode = "ALL"; 

let slots = [];             
let wordBlocks = []; 

const quizData = [
    // === STAGE 1: 単語・熟語タイピング (10問) ===
    { id: 1,  stage: 1, type: 'typing', audioKey: 'music1',  instruction: '【単語】歌詞中の told は動詞 tell の過去形です。「言う／伝える」の過去形をタイピングしよう\nThey [   ] him, "Don\'t you ever come around here"', answer: 'TOLD', explanation: 'tell（伝える・言う）の過去形です。不良グループが主人公に「言った」場面です。' },
    { id: 2,  stage: 1, type: 'typing', audioKey: 'music2',  instruction: '【単語】「消え失せる」「見えなくなる」を意味する助動詞の後の動詞をタイピングしよう\nYou better [   ]', answer: 'DISAPPEAR', explanation: 'disappear（消える）。appear（現れる）に否定のdisがついた重要な動詞。' },
    { id: 3,  stage: 1, type: 'typing', audioKey: 'music3',  instruction: '【単語】「はっきりした」「明確な」を意味する形容詞をタイピングしよう\nand their words are really [   ]', answer: 'CLEAR', explanation: 'clear（明確な、はっきりした）。' },
    { id: 4,  stage: 1, type: 'typing', audioKey: 'music4',  instruction: '【熟語】曲のタイトルにもなっている、「失せろ／立ち去れ」という動詞をタイピングしよう\nSo [   ] it, just beat it', answer: 'BEAT', explanation: 'beat itで「負かす、失せる、立ち去る」という強い表現（スラング）です。' },
    { id: 5,  stage: 1, type: 'typing', audioKey: 'music2',  instruction: '【口語】「〜したい（want to）」の歌詞などでよく使われる口語表現をタイピングしよう\nDon\'t [   ] see your face', answer: 'WANNA', explanation: 'wanna は want to の縮小音です。' },
    { id: 6,  stage: 1, type: 'typing', audioKey: 'music7',  instruction: '【単語】「タフな」「たくましい」をタイピングしよう\nYou wanna be [   ]', answer: 'TOUGH', explanation: 'tough（タフな、頑丈な）。ghの綴りで「f」の音になります。' },
    { id: 7,  stage: 1, type: 'typing', audioKey: 'music3',  instruction: '【単語】歌詞の中の「奴らの目には炎がある」の「炎（ほのお）」をタイピングしよう\nThe [   ] is in their eyes', answer: 'FIRE', explanation: 'fire（炎）。敵対するグループの目の中に燃える闘志や怒りを表現しています。' },
    { id: 8,  stage: 1, type: 'typing', audioKey: 'music10', instruction: '【単語】「打ち負かす(defeat)」の過去分詞形（負かされる）をタイピングしよう\nNo one wants to be [   ]', answer: 'DEFEATED', explanation: 'be defeatedで「敗北する、負かされる（受動態）」になります。' },
    { id: 9,  stage: 1, type: 'typing', audioKey: 'music12', instruction: '【意味】「それは重要ではない Matters 」「関係ない」という意味を作る動詞をタイピングしよう\nIt doesn\'t [   ] who\'s wrong or right', answer: 'MATTER', explanation: 'It doesn\'t matter で「どうでもいい／問題ではない」という重要フレーズです。' },
    { id: 10, stage: 1, type: 'typing', audioKey: 'music11', instruction: '【単語】「戦い」「闘志」をタイピングしよう\nShowin\' how funky and strong is your [   ]', answer: 'FIGHT', explanation: 'fight（戦い、闘志）。' },

    // === STAGE 2: 英文法知識・空欄補充タイピング (10問) ===
    { id: 11, stage: 2, type: 'typing', audioKey: 'music1',  instruction: '【空欄補充】否定命令文の強調「二度と〜するな」に入る単語は？\nDon\'t you [   ] come around here.', answer: 'EVER', explanation: 'Don\'t you ever 〜 で命令を強く強調します。' },
    { id: 12, stage: 2, type: 'typing', audioKey: 'music2',  instruction: '【空欄補充】「〜したほうがよい（強い警告）」に入る、口語ではよく省略される助動詞をタイピングしよう\nYou [   ] better disappear.', answer: 'HAD', explanation: 'had better + 動詞の原形で「〜したほうがよい（強い警告）」となります。口語では省略されることもあります。' },
    { id: 13, stage: 2, type: 'typing', audioKey: 'music3',  instruction: '【空欄補充】「奴らの目には炎がある」動詞の三人称単数形を入れよう\nThe fire [   ] in their eyes.', answer: 'IS', explanation: '主語がThe fire（単数）なので is です。' },
    { id: 14, stage: 2, type: 'typing', audioKey: 'music3',  instruction: '【空欄補充】形容詞 clear（明確な）を修飾する、「本当に」という副詞を入れよう\nand their words are [   ] clear', answer: 'REALLY', explanation: 'really（本当に）は副詞です。' },
    { id: 15, stage: 2, type: 'typing', audioKey: 'music3',  instruction: '【空欄補充】歌詞の中の「奴らの言葉は本当にハッキリしている」の「言葉（複数形）」をタイピングしよう\nand their [   ] are really clear', answer: 'WORDS', explanation: 'word（言葉）の複数形 words です。' },
    { id: 16, stage: 2, type: 'typing', audioKey: 'music5',  instruction: '【空欄補充】関係代名詞「あなたが出来ること（もの）」\nDo [   ] you can', answer: 'WHAT', explanation: 'what is the thing which と同じ「先行詞を含む関係代名詞」です。' },
    { id: 17, stage: 2, type: 'typing', audioKey: 'music4',  instruction: '【空欄補充】命令文の前において「とにかく〜しろ」と強調する役割を持つ単語を入れよう\n[   ] beat it, just beat it.', answer: 'JUST', explanation: 'just（ただ、単に）を動詞の前に置くことで、命令の意味を「とにかく」「四の五の言わずに」と強める効果があります。' },
    { id: 18, stage: 2, type: 'typing', audioKey: 'music10', instruction: '【空欄補充】「誰も負けたくなどない」主語が三人称単数扱いになるため、動詞の形に注意してタイピングしよう\nNo one [   ] to be defeated.', answer: 'WANTS', explanation: '主語の No one（誰も〜ない）は「単数扱い（三人称単数現在）」になるため、動詞の語尾に s がついて wants になります。' },
    { id: 19, stage: 2, type: 'typing', audioKey: 'music12', instruction: '【空欄補充】「誰が間違っているか（who is...）」の短縮形 who\'s を作るための単語を入れよう\nIt doesn\'t matter [   ]\'s wrong or right', answer: 'WHO', explanation: 'who\'s は who is の短縮形です。' },
    { id: 20, stage: 2, type: 'typing', audioKey: 'music6',  instruction: '【空欄補充】歌詞中の「血（ち）なんか見たくない」の「血」をタイピングしよう\nDon\'t wanna see no [   ]', answer: 'BLOOD', explanation: 'blood（血）。争いで血が流れるのを避けるための強い意思を表すフレーズです。' },

    // === STAGE 3: 英語並べ替えパズル (10問) ===
    { id: 21, stage: 3, type: 'drag',   audioKey: 'music1',  instruction: '【並べ替え】「二度とここへ近づくな」', words: ['AROUND', 'COME', 'HERE', 'EVER', "DON'T"], answer: ["DON'T", 'EVER', 'COME', 'AROUND', 'HERE'], explanation: 'Don\'t ever + 動詞の原形で強い命令。' },
    { id: 22, stage: 3, type: 'drag',   audioKey: 'music2',  instruction: '【並べ替え】「お前は消え失せたほうがいい（had省略）」', words: ['DISAPPEAR', 'BETTER', 'YOU'], answer: ['YOU', 'BETTER', 'DISAPPEAR'], explanation: 'You better + 動詞の原形。' },
    { id: 23, stage: 3, type: 'drag',   audioKey: 'music4',  instruction: '【並べ替え】「とにかく失せろ」', words: ['IT', 'BEAT', 'JUST'], answer: ['JUST', 'BEAT', 'IT'], explanation: '曲のタイトルであり、最も有名なフレーズ。' },
    { id: 24, stage: 3, type: 'drag',   audioKey: 'music2',  instruction: '【並べ替え】「お前の顔は見たくない」', words: ['FACE', 'YOUR', 'SEE', 'WANNA', "DON'T"], answer: ["DON'T", 'WANNA', 'SEE', 'YOUR', 'FACE'], explanation: 'don\'t wanna see で「〜を見たくない」。' },
    { id: 25, stage: 3, type: 'drag',   audioKey: 'music5',  instruction: '【並べ替え】「君ができることをするんだ（関係代名詞what）」', words: ['CAN', 'YOU', 'WHAT', 'DO'], answer: ['DO', 'WHAT', 'YOU', 'CAN'], explanation: 'what you can は「あなたができること」という名詞のカタマリ。' },
    { id: 26, stage: 3, type: 'drag',   audioKey: 'music3',  instruction: '【並べ替え】「奴らの目には炎がある」', words: ['EYES', 'THEIR', 'IN', 'IS', 'FIRE', 'THE'], answer: ['THE', 'FIRE', 'IS', 'IN', 'THEIR', 'EYES'], explanation: '主語は The fire です。' },
    { id: 27, stage: 3, type: 'drag',   audioKey: 'music3',  instruction: '【並べ替え】「奴らの言葉は本当にハッキリしている」', words: ['CLEAR', 'REALLY', 'ARE', 'WORDS', 'THEIR'], answer: ['THEIR', 'WORDS', 'ARE', 'REALLY', 'CLEAR'], explanation: 'their wordsが複数形なのでare。' },
    { id: 28, stage: 3, type: 'drag',   audioKey: 'music11', instruction: '【並べ替え】「君の戦いがいかに強いかを見せつけながら」', words: ['FIGHT', 'YOUR', 'IS', 'STRONG', 'AND', 'FUNKY', 'HOW', "SHOWIN'"], answer: ["SHOWIN'", 'HOW', 'FUNKY', 'AND', 'STRONG', 'IS', 'YOUR', 'FIGHT'], explanation: 'funky and strong が主語の後に来ます。' },
    { id: 29, stage: 3, type: 'drag',   audioKey: 'music10', instruction: '【並べ替え】「誰も負けたくなどない（三人称単数のsに注意）」', words: ['DEFEATED', 'BE', 'TO', 'WANTS', 'ONE', 'NO'], answer: ['NO', 'ONE', 'WANTS', 'TO', 'BE', 'DEFEATED'], explanation: 'No one（誰も〜ない）が主語の時は三人称単数現在形になるため、後ろの動詞は wants になります。' },
    { id: 30, stage: 3, type: 'drag',   audioKey: 'music12', instruction: '【並べ替え】「誰が正しかろうが関係ない（形式主語It）」', words: ['RIGHT', 'OR', 'WRONG', "WHO\'S", 'MATTER', "DOESN\'T", 'IT'], answer: ['IT', 'DOESN\'T', 'MATTER', "WHO\'S", 'WRONG', 'OR', 'RIGHT'], explanation: 'who節全体が真主語です。' }
];

let activeQuestions = []; 
let currentQuestionIndex = 0;
let score = 0; 
let totalCorrectCount = 0; 
let wrongQuestions = [];
let isReviewMode = false;

let timerEvent;
let timeRemaining;
let timerText;
let instructionText;
let uiContainer;
let currentExpContainer = null; 
let currentInput = ""; 
let typingSlots = []; 
let currentQuestionState = "PLAYING"; 
let isEvaluating = false; 

let onNextCallback = null; 

let buzzMonster; 
let buzzTween; 
let extraBuzzGroup; 

const blockColors = [0xFF3333, 0xFFCC00, 0x33CCFF, 0x9933FF]; 

const correctSoundsList = ['shout_howl', 'shout_dah', 'shout_aaow', 'shout_hee', 'shout_snore', 'shout_lose'];
let correctSoundIndex = 0;

const QWERTY_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M", "◀", "ENT"]
];

function preload() {
    this.load.image('bg', 'assets/bg.png');
    this.load.image('slot', 'assets/slot_base.png');
    this.load.image('block', 'assets/block.png'); 
    
    this.load.image('buzz_normal1', 'assets/buzz-normal1.png');
    this.load.image('buzz_normal2', 'assets/buzz-normal2.png');
    this.load.image('buzz_cry1', 'assets/buzz-cry1.png');
    this.load.image('buzz_cry2', 'assets/buzz-cry2.png');
    this.load.image('buzz_happy1', 'assets/buzz-happy1.png');
    this.load.image('buzz_happy2', 'assets/buzz-happy2.png');
    this.load.image('buzz_mad1', 'assets/buzz-mad1.png');
    this.load.image('buzz_mad2', 'assets/buzz-mad2.png');
    
    for(let i = 1; i <= 13; i++) {
        this.load.audio(`music${i}`, `sounds/${i}.mp3`);
    }
    this.load.audio('shout_howl', 'sounds/JB-howl.mp3');
    this.load.audio('shout_dah', 'sounds/dah.mp3');
    this.load.audio('shout_aaow', 'sounds/michael_aaow.mp3');
    this.load.audio('shout_hee', 'sounds/michael-hee-hee.mp3');
    this.load.audio('shout_snore', 'sounds/snore.mp3');
    this.load.audio('shout_lose', 'sounds/lose-voice.mp3'); 
    this.load.audio('shout_haha', 'sounds/hahaha-zan.mp3'); 
}

function create() {
    this.input.keyboard.off('keydown');
    this.input.off('drag');
    this.input.off('dragend');

    let bg = this.add.image(512, 384, 'bg').setDepth(0);
    bg.setDisplaySize(1024, 768);
    extraBuzzGroup = this.add.group(); 
    
    this.input.keyboard.on('keydown', handleGlobalKeyDown, this);
    showHTMLForm.call(this);
}

function startBuzzFlapping(buzzObj, baseName) {
    if (buzzObj.flapTimer) buzzObj.flapTimer.remove();
    let isFrame1 = true;
    buzzObj.setTexture(`${baseName}1`);
    buzzObj.flapTimer = this.time.addEvent({
        delay: 200,
        callback: () => {
            isFrame1 = !isFrame1;
            if (buzzObj.scene) buzzObj.setTexture(`${baseName}${isFrame1 ? '1' : '2'}`);
        },
        loop: true
    });
}

function applyFlyingTween(scene, target) {
    let nextX = Phaser.Math.Between(50, 970);
    let nextY = Phaser.Math.Between(50, 600);
    let duration = Phaser.Math.Between(4000, 6000); 

    let t = scene.tweens.add({
        targets: target,
        x: nextX,
        y: nextY,
        duration: duration,
        ease: 'Sine.easeInOut',
        onComplete: () => { if(target.scene) applyFlyingTween(scene, target); }
    });
    if (target === buzzMonster) buzzTween = t;
}

function handleGlobalKeyDown(event) {
    let key = event.key.toUpperCase();
    
    if (currentQuestionState === "EXPLANATION") {
        if (key === "ENTER" && onNextCallback) {
            onNextCallback();
        }
        return; 
    }

    if (currentQuestionState !== "PLAYING" || isEvaluating) return; 

    let list = isReviewMode ? wrongQuestions : activeQuestions;
    if (currentQuestionIndex >= list.length) return;
    let q = list[currentQuestionIndex];

    if (q.type === 'typing') {
        if (key === "BACKSPACE") {
            if (currentInput.length > 0) {
                currentInput = currentInput.slice(0, -1);
                let idx = currentInput.length;
                if(typingSlots[idx] && !typingSlots[idx].isSpace) typingSlots[idx].textObj.setText('');
            }
        } else if (key === "ENTER") {
            submitTypingAnswer.call(this, q);
        } else if (/^[A-Z]$/.test(key)) {
            handleTypingBoxInput(key, q);
        }
    } else if (q.type === 'drag') {
        if (key === "ENTER") {
            checkDragAnswer.call(this, q);
        }
    }
}

function showHTMLForm() {
    let existingForm = document.getElementById('login-form-container');
    if(existingForm) existingForm.remove();

    let formDiv = document.createElement('div');
    formDiv.id = 'login-form-container';
    formDiv.style.position = 'absolute';
    formDiv.style.top = '50%';
    formDiv.style.left = '50%';
    formDiv.style.transform = 'translate(-50%, -50%)';
    formDiv.style.width = '440px';
    formDiv.style.padding = '30px';
    formDiv.style.background = 'rgba(26, 26, 26, 0.95)';
    formDiv.style.border = '4px solid #00ff00';
    formDiv.style.borderRadius = '10px';
    formDiv.style.color = '#ffffff';
    formDiv.style.fontFamily = '"Courier New", monospace';
    formDiv.style.textAlign = 'center';
    formDiv.style.boxShadow = '0 0 20px rgba(0,255,0,0.5)';
    formDiv.style.zIndex = '1000';

    formDiv.innerHTML = `
        <h2 style="color: #00ff00; font-size: 22px; margin-bottom: 20px; font-weight: bold;">BEAT IT! 英語テスト</h2>
        <div style="margin-bottom: 12px; text-align: left;">
            <label style="display:block; margin-bottom: 3px; color:#aaa;">GRADE (学年):</label>
            <select id="form-grade" style="width:100%; padding:8px; background:#333; color:#fff; border:1px solid #555;"></select>
        </div>
        <div style="margin-bottom: 12px; text-align: left;">
            <label style="display:block; margin-bottom: 3px; color:#aaa;">CLASS (クラス):</label>
            <select id="form-class" style="width:100%; padding:8px; background:#333; color:#fff; border:1px solid #555;"></select>
        </div>
        <div style="margin-bottom: 12px; text-align: left;">
            <label style="display:block; margin-bottom: 3px; color:#aaa;">NUMBER (出席番号):</label>
            <select id="form-number" style="width:100%; padding:8px; background:#333; color:#fff; border:1px solid #555;"></select>
        </div>
        <div style="margin-bottom: 15px; text-align: left;">
            <label style="display:block; margin-bottom: 3px; color:#aaa;">NAME (氏名):</label>
            <input type="text" id="form-name" placeholder="名前を入力してください" style="width:95%; padding:8px; background:#333; color:#fff; border:1px solid #555; font-weight:bold;">
        </div>
        <div style="margin-bottom: 20px; text-align: left;">
            <label style="display:block; margin-bottom: 5px; color:#ffff00; font-weight:bold;">STAGE SELECT (問題パターン):</label>
            <select id="form-mode" style="width:100%; padding:8px; background:#443300; color:#ffff00; border:2px solid #ffff00; font-weight:bold;">
                <option value="ALL">【一括】第1問 〜 第30問すべて（通し）</option>
                <option value="STAGE1">【10問】ステージ1：単語・熟語タイピング</option>
                <option value="STAGE2">【10問】ステージ2：英文空欄補充タイピング</option>
                <option value="STAGE3">【10問】ステージ3：英語並べ替えパズル</option>
            </select>
        </div>
        <button id="form-start-btn" style="background:#ff3333; color:#fff; border:none; padding:12px 30px; font-size:18px; font-weight:bold; cursor:pointer; width:100%; border-radius:5px; box-shadow: 0 4px #990000;">START GAME</button>
    `;

    document.body.appendChild(formDiv);

    let gradeSel = document.getElementById('form-grade');
    for(let i=1; i<=3; i++) gradeSel.innerHTML += `<option value="${i}">${i}年</option>`;
    
    let classSel = document.getElementById('form-class');
    const classes = 'ABCDEFGHIJ';
    for (let i = 0; i < classes.length; i++) {
        classSel.innerHTML += `<option value="${classes[i]}">${classes[i]}組</option>`;
    }
    
    let numSel = document.getElementById('form-number');
    for(let i=1; i<=60; i++) numSel.innerHTML += `<option value="${i}">${i}番</option>`;

    document.getElementById('form-name').value = studentInfo.name;

    document.getElementById('form-start-btn').addEventListener('click', () => {
        let nameVal = document.getElementById('form-name').value.trim();
        if(!nameVal) { alert("氏名を入力してください！"); return; }

        studentInfo.grade = document.getElementById('form-grade').value;
        studentInfo.class = document.getElementById('form-class').value;
        studentInfo.number = document.getElementById('form-number').value;
        studentInfo.name = nameVal;
        currentSelectedMode = document.getElementById('form-mode').value;

        playCount++;
        wrongQuestions = [];
        isReviewMode = false;

        if (currentSelectedMode === "ALL") activeQuestions = [...quizData];
        else if (currentSelectedMode === "STAGE1") activeQuestions = quizData.filter(q => q.stage === 1);
        else if (currentSelectedMode === "STAGE2") activeQuestions = quizData.filter(q => q.stage === 2);
        else if (currentSelectedMode === "STAGE3") activeQuestions = quizData.filter(q => q.stage === 3);

        const saveKeyPrefix = `${studentInfo.grade}_${studentInfo.class}_${studentInfo.number}_${studentInfo.name}_${currentSelectedMode}`;
        let savedIndex = localStorage.getItem(`progress_${saveKeyPrefix}`);
        let savedScore = localStorage.getItem(`score_${saveKeyPrefix}`);
        let savedCorrect = localStorage.getItem(`correct_${saveKeyPrefix}`);

        if (savedIndex && parseInt(savedIndex) < activeQuestions.length) {
            if (confirm(`【中断データ確認】\n前回の続き（第 ${parseInt(savedIndex) + 1} 問）から再開しますか？`)) {
                currentQuestionIndex = parseInt(savedIndex);
                score = parseFloat(savedScore) || 0;
                totalCorrectCount = parseInt(savedCorrect) || 0;
            } else { currentQuestionIndex = 0; score = 0; totalCorrectCount = 0; }
        } else { currentQuestionIndex = 0; score = 0; totalCorrectCount = 0; }

        formDiv.remove();
        initGame.call(this);
    });
}

function initGame() {
    buzzMonster = this.add.image(Phaser.Math.Between(100, 900), 200, 'buzz_normal1').setDepth(1);
    buzzMonster.setDisplaySize(110, 110); 
    startBuzzFlapping.call(this, buzzMonster, 'buzz_normal');
    applyFlyingTween(this, buzzMonster);

    let monsterCountToSpawn = Math.floor(totalCorrectCount / 10);
    for(let m = 0; m < monsterCountToSpawn; m++) {
        let baseNamePick = Phaser.Math.RND.pick(['buzz_mad', 'buzz_happy', 'buzz_cry']);
        let spawnedBuzz = this.add.image(Phaser.Math.Between(100, 900), Phaser.Math.Between(100, 600), `${baseNamePick}1`).setDepth(1);
        spawnedBuzz.setDisplaySize(110, 110);
        startBuzzFlapping.call(this, spawnedBuzz, baseNamePick);
        extraBuzzGroup.add(spawnedBuzz);
        applyFlyingTween(this, spawnedBuzz);
    }

    this.scoreText = this.add.text(480, 55, 'SCORE:0000', { font: '22px "Press Start 2P"', fill: '#ffffff' }).setDepth(10);
    timerText = this.add.text(512, 90, '30', { font: '38px "Press Start 2P"', fill: '#ffffff' }).setOrigin(0.5).setDepth(10);
    instructionText = this.add.text(512, 215, '', { 
        font: 'bold 16px "Courier New", monospace', fill: '#000000', align: 'center', backgroundColor: '#ffffff', padding: {x: 20, y: 12} 
    }).setOrigin(0.5).setDepth(10);

    let exitBtn = this.add.text(30, 45, '◀ EXIT', { font: 'bold 16px "Press Start 2P"', fill: '#ff3333', backgroundColor: '#222', padding: 10 })
        .setInteractive({ useHandCursor: true }).setDepth(10);
        
    exitBtn.on('pointerdown', () => {
        if(confirm("ここまでのスコアをスプレッドシートに送信してタイトルに戻りますか？")) {
            if(timerEvent) timerEvent.remove();
            extraBuzzGroup.clear(true, true);
            this.sound.stopAll();
            
            if (!isReviewMode) {
                sendScoreToGAS(score, `途中終了 (第${currentQuestionIndex + 1}問でEXIT, Mode: ${currentSelectedMode})`, null);
            }
            this.scene.restart();
        }
    });

    let skipBtn = this.add.text(800, 45, '⏭ SKIP', { font: 'bold 14px "Press Start 2P"', fill: '#ffffff', backgroundColor: '#333333', padding: 10 })
        .setInteractive({ useHandCursor: true }).setDepth(50);
        
    skipBtn.on('pointerdown', () => {
        if (timerEvent) timerEvent.remove();
        let list = isReviewMode ? wrongQuestions : activeQuestions;
        let q = list[currentQuestionIndex];
        if(!isReviewMode && !wrongQuestions.includes(q)) wrongQuestions.push(q);
        
        isEvaluating = false;
        showExplanation.call(this, false);
    });

    uiContainer = this.add.container(0, 0).setDepth(10);
    startQuestion.call(this);
}

function update() {}

function startQuestion() {
    isEvaluating = false; 
    currentQuestionState = "PLAYING"; 
    currentInput = ""; 
    typingSlots = []; 
    slots = []; 
    wordBlocks = [];  
    onNextCallback = null;

    if (currentExpContainer) {
        currentExpContainer.destroy();
        currentExpContainer = null;
    }

    this.input.off('drag');
    this.input.off('dragend');
    uiContainer.removeAll(true);
    instructionText.setVisible(true);
    
    let list = isReviewMode ? wrongQuestions : activeQuestions;
    if (currentQuestionIndex >= list.length) {
        showResultScreen.call(this); return;
    }

    if (!isReviewMode) {
        const saveKeyPrefix = `${studentInfo.grade}_${studentInfo.class}_${studentInfo.number}_${studentInfo.name}_${currentSelectedMode}`;
        localStorage.setItem(`progress_${saveKeyPrefix}`, currentQuestionIndex);
        localStorage.setItem(`score_${saveKeyPrefix}`, score);
        localStorage.setItem(`correct_${saveKeyPrefix}`, totalCorrectCount);
    }

    let q = list[currentQuestionIndex];
    this.scoreText.setText('SCORE:' + Phaser.Utils.String.Pad(Math.round(score), 4, '0', 1));
    instructionText.setText(`QUEST ${currentQuestionIndex + 1} / ${list.length}\n\n${q.instruction}`);

    timeRemaining = 30;
    timerText.setText(Phaser.Utils.String.Pad(timeRemaining, 2, '0', 1)).setScale(1).setFill('#ffffff');
    if (timerEvent) timerEvent.remove();
    timerEvent = this.time.addEvent({ delay: 1000, callback: updateTimer, callbackScope: this, loop: true });

    if (q.type === 'typing') createTypingUI.call(this, q);
    else if (q.type === 'drag') createDragUI.call(this, q);
}

function updateTimer() {
    if (currentQuestionState !== "PLAYING" || isEvaluating) return;
    timeRemaining--;
    timerText.setText(Phaser.Utils.String.Pad(timeRemaining, 2, '0', 1));
    if (timeRemaining <= 3 && timeRemaining > 0) {
        timerText.setFill('#ff3333');
    }
    if (timeRemaining <= 0) {
        timerEvent.remove(); triggerDamageEffect.call(this);
    }
}

function triggerDamageEffect() {
    if (currentQuestionState === "DAMAGE" || currentQuestionState === "EXPLANATION") return; 
    currentQuestionState = "DAMAGE";
    isEvaluating = true; 
    
    if(timerEvent) timerEvent.remove();
    this.sound.stopAll();
    
    // 🔊 連続で間違えても確実に笑い声が鳴るように、一度音の状態をストップしてリセット
    let hahaSound = this.sound.get('shout_haha');
    if (hahaSound) { hahaSound.stop(); } 
    this.sound.play('shout_haha'); 
    
    this.cameras.main.flash(200, 255, 0, 0, 0.5);

    if (buzzMonster) {
        this.tweens.killTweensOf(buzzMonster);
        startBuzzFlapping.call(this, buzzMonster, 'buzz_mad');
        buzzMonster.setDepth(100); 

        this.tweens.add({
            targets: buzzMonster,
            x: 512,
            y: 384,
            displayWidth: 1100, 
            displayHeight: 1100,
            angle: 1080,         
            duration: 500,
            ease: 'Expo.easeOut',
            onComplete: () => {
                this.time.delayedCall(1000, () => {
                    showExplanation.call(this, false);
                });
            }
        });
    } else {
        showExplanation.call(this, false);
    }
}

function handleCorrectAnswer(q) {
    if (currentQuestionState !== "PLAYING") return;
    currentQuestionState = "CORRECT";
    isEvaluating = true; 
    
    if(timerEvent) timerEvent.remove();
    
    let listLength = (isReviewMode) ? wrongQuestions.length : activeQuestions.length;
    if (listLength > 0) {
        score += (100 / listLength);
    }

    if(!isReviewMode) {
        totalCorrectCount++;
        if (totalCorrectCount % 10 === 0) {
            let baseNamePick = Phaser.Math.RND.pick(['buzz_mad', 'buzz_happy', 'buzz_cry']);
            let spawnedBuzz = this.add.image(Phaser.Math.Between(100, 900), Phaser.Math.Between(100, 600), `${baseNamePick}1`).setDepth(1);
            spawnedBuzz.setDisplaySize(110, 110); 
            startBuzzFlapping.call(this, spawnedBuzz, baseNamePick);
            extraBuzzGroup.add(spawnedBuzz);
            applyFlyingTween(this, spawnedBuzz);
        }
    }
    
    let soundKey = correctSoundsList[correctSoundIndex];
    this.sound.play(soundKey);
    correctSoundIndex = (correctSoundIndex + 1) % correctSoundsList.length; 

    this.cameras.main.flash(150, 0, 255, 0, 0.4);

    if (buzzMonster) {
        this.tweens.killTweensOf(buzzMonster);
        startBuzzFlapping.call(this, buzzMonster, 'buzz_cry');
        buzzMonster.setDepth(100); 

        this.tweens.add({
            targets: buzzMonster,
            x: 512,
            y: 384,
            displayWidth: 1100,
            displayHeight: 1100,
            angle: -720,
            duration: 500,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.time.delayedCall(1000, () => {
                    showExplanation.call(this, true);
                });
            }
        });
    } else {
        showExplanation.call(this, true);
    }
}

function submitTypingAnswer(q) {
    if (isEvaluating) return; 

    if (currentInput.replace(/\s+/g, "") === q.answer.replace(/\s+/g, "")) {
        handleCorrectAnswer.call(this, q);
    } else { 
        if(!isReviewMode && !wrongQuestions.includes(q)) wrongQuestions.push(q);
        triggerDamageEffect.call(this); 
    }
}

function handleTypingBoxInput(char, q) {
    if(isEvaluating) return;
    let currentIdx = currentInput.length;
    if (currentIdx >= q.answer.length) return;
    if (q.answer[currentIdx] === " ") { currentInput += " "; currentIdx++; }
    if (typingSlots[currentIdx] && !typingSlots[currentIdx].isSpace) typingSlots[currentIdx].textObj.setText(char);
    currentInput += char;
}

function checkDragAnswer(q) {
    if (isEvaluating) return; 
    
    let freshSelection = [];
    slots.forEach((slot) => {
        let found = wordBlocks.find(b => b.currentSlotIndex !== -1 && slots[b.currentSlotIndex] === slot);
        if (found) freshSelection.push(found.wordValue);
    });
    if (freshSelection.length !== q.answer.length) { alert("すべてのスロットを埋めてください！"); return; }
    
    if (JSON.stringify(freshSelection) === JSON.stringify(q.answer)) handleCorrectAnswer.call(this, q);
    else { 
        if(!isReviewMode && !wrongQuestions.includes(q)) wrongQuestions.push(q);
        triggerDamageEffect.call(this); 
    }
}

function addAudioHintButton(scene, q, yPos) {
    let hintBtn = scene.add.text(512, yPos, '🎵 LISTEN HINT (音声再生) 🎵', {
        font: 'bold 14px "Press Start 2P"', fill: '#ffff00', backgroundColor: '#332200', padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    hintBtn.on('pointerdown', () => {
        if (isEvaluating) return;
        scene.sound.play(q.audioKey);
    });
    uiContainer.add(hintBtn);
}

function createTypingUI(q) {
    let startX = 512 - ((q.answer.length - 1) * 25);
    for (let i = 0; i < q.answer.length; i++) {
        let char = q.answer[i];
        if (char === " ") { typingSlots.push({ isSpace: true }); continue; }
        let slot = this.add.image(startX + (i * 50), 340, 'slot').setDisplaySize(40, 45);
        let txt = this.add.text(startX + (i * 50), 340, '', { font: 'bold 26px "Courier New"', fill: '#ffffff' }).setOrigin(0.5);
        uiContainer.add([slot, txt]);
        typingSlots.push({ isSpace: false, textObj: txt });
    }
    
    addAudioHintButton(this, q, 405);
    
    let kbContainer = this.add.container(0, 470);
    QWERTY_ROWS.forEach((row, rIdx) => {
        let rowX = 512 - ((row.length - 1) * 28); 
        let rowY = rIdx * 55;
        row.forEach((key) => {
            let width = (key === "ENT") ? 65 : 50;
            let btnGraphics = this.add.graphics();
            btnGraphics.fillStyle(blockColors[rIdx % blockColors.length], 1).lineStyle(2, 0xffffff, 1);
            btnGraphics.fillRoundedRect(-width/2, -25, width, 50, 6).strokeRoundedRect(-width/2, -25, width, 50, 6);
            
            btnGraphics.setPosition(rowX, rowY);
            let fontStyle = (key === "ENT" || key === "◀") ? 'bold 12px "Press Start 2P"' : 'bold 18px "Press Start 2P"';
            let btnTxt = this.add.text(rowX, rowY, key, { font: fontStyle, fill: '#ffffff' }).setOrigin(0.5);
            
            let hitArea = this.add.zone(rowX, rowY, width, 50).setInteractive({ useHandCursor: true });
            
            hitArea.on('pointerdown', () => {
                if (currentQuestionState !== "PLAYING" || isEvaluating) return;
                if (key === "◀") {
                    if (currentInput.length > 0) {
                        currentInput = currentInput.slice(0, -1);
                        let idx = currentInput.length;
                        if(typingSlots[idx] && !typingSlots[idx].isSpace) typingSlots[idx].textObj.setText('');
                    }
                } else if (key === "ENT") submitTypingAnswer.call(this, q);
                else handleTypingBoxInput(key, q);
            }); 
            kbContainer.add([btnGraphics, btnTxt, hitArea]); 
            rowX += (key === "ENT") ? 65 : 56;
        });
    }); 
    uiContainer.add(kbContainer);
}

function createDragUI(q) {
    addAudioHintButton(this, q, 260);
    
    let slotCount = q.answer.length;
    let slotSpacing = slotCount > 7 ? 115 : 135; 
    let slotStartX = 512 - ((slotCount - 1) * slotSpacing / 2);
    
    for (let i = 0; i < slotCount; i++) {
        let slot = this.add.image(slotStartX + (i * slotSpacing), 350, 'slot').setDisplaySize(110, 50);
        uiContainer.add(slot);
        slots.push({ x: slotStartX + (i * slotSpacing), y: 350, occupied: false });
    }

    let randomizedWords = [...q.words];
    do {
        Phaser.Utils.Array.Shuffle(randomizedWords);
    } while (JSON.stringify(randomizedWords) === JSON.stringify(q.answer) || JSON.stringify(randomizedWords) === JSON.stringify([...q.answer].reverse()));

    let wordCount = randomizedWords.length;
    let wordSpacing = wordCount > 7 ? 115 : 135; 
    let blockStartX = 512 - ((wordCount - 1) * wordSpacing / 2);
    
    randomizedWords.forEach((word, idx) => {
        let bx = blockStartX + (idx * wordSpacing); 
        let by = 480;
        
        let txt = this.add.text(bx, by, word, { font: 'bold 24px "Courier New"', fill: '#ffffff' }).setOrigin(0.5).setDepth(12);
        let computedWidth = Math.max((word.length * 22) + 45, 120); 

        let block = this.add.image(bx, by, 'block').setDisplaySize(computedWidth, 55).setInteractive({ useHandCursor: true }).setDepth(11);
        block.setTint(blockColors[idx % blockColors.length]);
        
        uiContainer.add([block, txt]);
        this.input.setDraggable(block);
        
        block.originalX = bx; 
        block.originalY = by; 
        block.textObj = txt; 
        block.wordValue = word; 
        block.currentSlotIndex = -1;
        
        block.on('pointerdown', (pointer) => {
            block.clickStartX = pointer.x;
            block.clickStartY = pointer.y;
        });

        block.on('pointerup', (pointer) => {
            if (currentQuestionState !== "PLAYING" || isEvaluating || game.scene.scenes[0].nextInputGuard) return;
            
            let dist = Phaser.Math.Distance.Between(block.clickStartX, block.clickStartY, pointer.x, pointer.y);
            if (dist > 7) return;

            if (block.currentSlotIndex !== -1) {
                slots[block.currentSlotIndex].occupied = false;
                block.currentSlotIndex = -1;
                
                this.tweens.add({
                    targets: [block, block.textObj],
                    x: block.originalX,
                    y: block.originalY,
                    duration: 150,
                    ease: 'Back.easeOut'
                });
            } 
            else {
                let freeSlotIndex = slots.findIndex(s => !s.occupied);
                if (freeSlotIndex !== -1) {
                    slots[freeSlotIndex].occupied = true;
                    block.currentSlotIndex = freeSlotIndex;
                    
                    this.tweens.add({
                        targets: [block, block.textObj],
                        x: slots[freeSlotIndex].x,
                        y: slots[freeSlotIndex].y,
                        duration: 150,
                        ease: 'Quad.easeOut'
                    });
                }
            }
        });

        wordBlocks.push(block);
    });

    let submitBtn = this.add.text(512, 620, ' ◀ ANSWER (決定) ▶ ', {
        font: 'bold 20px "Press Start 2P"', fill: '#ffffff', backgroundColor: '#ff3333', padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    submitBtn.on('pointerdown', () => {
        if (currentQuestionState !== "PLAYING" || isEvaluating) return;
        checkDragAnswer.call(this, q); 
    }); 
    uiContainer.add(submitBtn);

    this.input.off('drag');
    this.input.off('dragend');
    
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        if (currentQuestionState !== "PLAYING" || isEvaluating) return;
        gameObject.x = dragX; gameObject.y = dragY;
        gameObject.textObj.x = dragX; gameObject.textObj.y = dragY;
    });
    
    this.input.on('dragend', (pointer, gameObject) => {
        if (currentQuestionState !== "PLAYING" || isEvaluating) return;
        let closestSlot = null; 
        let maxDistance = 75; 
        let closestSlotIndex = -1;
        
        slots.forEach((s, si) => {
            let distance = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, s.x, s.y);
            if (distance < maxDistance && (!s.occupied || gameObject.currentSlotIndex === si)) { 
                maxDistance = distance; closestSlot = s; closestSlotIndex = si; 
            }
        });
        
        if (gameObject.currentSlotIndex !== -1) { 
            slots[gameObject.currentSlotIndex].occupied = false; gameObject.currentSlotIndex = -1; 
        }
        
        if (closestSlot) { 
            gameObject.x = closestSlot.x; gameObject.y = closestSlot.y; 
            gameObject.textObj.x = closestSlot.x; gameObject.textObj.y = closestSlot.y; 
            closestSlot.occupied = true; gameObject.currentSlotIndex = closestSlotIndex; 
        } else { 
            gameObject.x = gameObject.originalX; gameObject.y = gameObject.originalY; 
            gameObject.textObj.x = gameObject.originalX; gameObject.textObj.y = gameObject.originalY; 
        }
    });
}

function showExplanation(isCorrect) {
    isEvaluating = false; 
    uiContainer.removeAll(true);
    if(timerEvent) timerEvent.remove();
    instructionText.setVisible(false);
    
    if (currentExpContainer) { currentExpContainer.destroy(); }
    
    currentQuestionState = "EXPLANATION";

    if (buzzMonster) {
        this.tweens.killTweensOf(buzzMonster); 
        buzzMonster.setDisplaySize(110, 110);   
        buzzMonster.setAngle(0);                
        buzzMonster.setDepth(1);                
        startBuzzFlapping.call(this, buzzMonster, 'buzz_normal'); 
        applyFlyingTween(this, buzzMonster);    
    }

    let list = isReviewMode ? wrongQuestions : activeQuestions;
    let q = list[currentQuestionIndex];
    
    currentExpContainer = this.add.container(512, 350);
    currentExpContainer.setDepth(150); 
    
    let bgBox = this.add.graphics();
    bgBox.fillStyle(0xffffff, 0.95).lineStyle(4, isCorrect ? 0x00ff00 : 0xff0000, 1).fillRect(-350, -200, 700, 400).strokeRect(-350, -200, 700, 400);
    currentExpContainer.add(bgBox);
    
    let resColor = isCorrect ? "#00aa00" : "#ff0000";
    let resultLabel = this.add.text(0, -150, isCorrect ? "⭕ CORRECT!" : "❌ WRONG...", { font: 'bold 28px "Press Start 2P"', fill: resColor }).setOrigin(0.5);
    currentExpContainer.add(resultLabel);
    
    let qText = this.add.text(0, -90, `問題: ${q.instruction.split('\n')[0]}`, { font: '16px monospace', fill: '#000000', wordWrap: { width: 640 } }).setOrigin(0.5);
    let aText = this.add.text(0, -40, `正解: ${q.type === 'drag' ? q.answer.join(" ") : q.answer}`, { font: 'bold 20px monospace', fill: '#0000ff' }).setOrigin(0.5);
    currentExpContainer.add([qText, aText]);
    
    let expTxt = this.add.text(0, 30, `【解説】\n${q.explanation}`, { font: '16px monospace', fill: '#333333', align: 'center', wordWrap: { width: 620 } }).setOrigin(0.5);
    currentExpContainer.add(expTxt);
    
    if (isCorrect) {
        let nextBtn = this.add.text(0, 140, "NEXT (Enter / タップ) ▶", { font: 'bold 16px "Press Start 2P"', fill: '#ffffff', backgroundColor: '#222222', padding: 10 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        currentExpContainer.add(nextBtn);
        
        const proceedToNext = () => { 
            if (currentExpContainer) { currentExpContainer.destroy(); currentExpContainer = null; }
            currentQuestionIndex++; 
            
            this.nextInputGuard = true;
            this.time.delayedCall(100, () => { this.nextInputGuard = false; });
            
            startQuestion.call(this); 
        };
        nextBtn.on('pointerdown', proceedToNext);
        onNextCallback = proceedToNext; 
    } else {
        let retryBtn = this.add.text(-130, 140, "↺ RETRY (もう一度)", { font: 'bold 16px "Press Start 2P"', fill: '#ffffff', backgroundColor: '#0055ff', padding: 10 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        let nextBtn = this.add.text(130, 140, "NEXT (次へ) ▶", { font: 'bold 16px "Press Start 2P"', fill: '#ffffff', backgroundColor: '#222222', padding: 10 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        currentExpContainer.add([retryBtn, nextBtn]);
        
        const proceedToRetry = () => {
            if (currentExpContainer) { currentExpContainer.destroy(); currentExpContainer = null; }
            startQuestion.call(this); 
        };
        const proceedToNext = () => { 
            if (currentExpContainer) { currentExpContainer.destroy(); currentExpContainer = null; }
            currentQuestionIndex++; 
            
            this.nextInputGuard = true;
            this.time.delayedCall(100, () => { this.nextInputGuard = false; });
            
            startQuestion.call(this); 
        };
        
        retryBtn.on('pointerdown', proceedToRetry);
        nextBtn.on('pointerdown', proceedToNext);
        onNextCallback = proceedToNext; 
    }
}

function showResultScreen() {
    uiContainer.removeAll(true);
    if (currentExpContainer) { currentExpContainer.destroy(); currentExpContainer = null; }
    
    instructionText.setVisible(false); timerText.setVisible(false);
    currentQuestionState = "RESULT";
    const saveKeyPrefix = `${studentInfo.grade}_${studentInfo.class}_${studentInfo.number}_${studentInfo.name}_${currentSelectedMode}`;
    localStorage.removeItem(`progress_${saveKeyPrefix}`); localStorage.removeItem(`score_${saveKeyPrefix}`); localStorage.removeItem(`correct_${saveKeyPrefix}`);
    extraBuzzGroup.clear(true, true);
    if(buzzMonster) { if(buzzMonster.flapTimer) buzzMonster.flapTimer.remove(); buzzMonster.destroy(); buzzMonster = null; }
    
    let finalScore = Math.round(score); 

    let resContainer = this.add.container(512, 384);
    let box = this.add.graphics();
    box.fillStyle(0x111111, 0.95).lineStyle(4, 0x00ff00, 1).fillRect(-350, -250, 700, 500).strokeRect(-350, -250, 700, 500);
    resContainer.add(box);
    let title = this.add.text(0, -190, isReviewMode ? "REVIEW RESULT" : "STAGE COMPLETE", { font: 'bold 32px "Press Start 2P"', fill: '#ffff00' }).setOrigin(0.5);
    let scoreLabel = this.add.text(0, -110, `FINAL SCORE: ${finalScore}`, { font: '24px "Press Start 2P"', fill: '#ffffff' }).setOrigin(0.5);
    resContainer.add([title, scoreLabel]);
    let statusText = this.add.text(0, -40, "最終スコアをスプレッドシートへ送信中...", { font: '16px monospace', fill: '#00ffff' }).setOrigin(0.5);
    resContainer.add(statusText);
    
    if (!isReviewMode) sendScoreToGAS(finalScore, `完全クリア (Mode: ${currentSelectedMode})`, statusText);
    else statusText.setText("復習完了 (再送信なし)");
    
    if (finalScore >= 80) {
        this.sound.play('shout_howl'); 

        let videoEl = document.createElement('video');
        videoEl.id = 'confetti-video-player';
        videoEl.src = 'assets/confetti.mp4';
        videoEl.autoplay = true;
        videoEl.playsInline = true; 
        videoEl.style.position = 'absolute';
        videoEl.style.top = '0';
        videoEl.style.left = '0';
        videoEl.style.width = '100%';
        videoEl.style.height = '100%';
        videoEl.style.objectFit = 'cover';
        videoEl.style.zIndex = '9999';         
        videoEl.style.pointerEvents = 'none';   
        videoEl.style.mixBlendMode = 'screen';  

        document.body.appendChild(videoEl);

        this.time.delayedCall(4000, () => {
            let el = document.getElementById('confetti-video-player');
            if (el) el.remove();
        });
    }

    if (wrongQuestions.length > 0) {
        let reviewBtn = this.add.text(0, 50, `間違えた ${wrongQuestions.length} 問を復習`, { font: 'bold 16px "Press Start 2P"', fill: '#ffffff', backgroundColor: '#ff9900', padding: 12 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        resContainer.add(reviewBtn); reviewBtn.on('pointerdown', () => {
            Phaser.Utils.Array.Shuffle(wrongQuestions); currentQuestionIndex = 0; score = 0; isReviewMode = true; timerText.setVisible(true); resContainer.destroy(); initGame.call(this);
        });
    }
    let restartBtn = this.add.text(0, 160, "◀ TOP MENU", { font: 'bold 18px "Press Start 2P"', fill: '#ffffff', backgroundColor: '#333333', padding: 12 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resContainer.add(restartBtn); restartBtn.on('pointerdown', () => { this.sound.stopAll(); this.scene.restart(); });
}

function sendScoreToGAS(targetScore, note = "", textComponent = null) {
    if (!GAS_WEBAPP_URL) return;
    fetch(GAS_WEBAPP_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: studentInfo.grade, class: studentInfo.class, number: studentInfo.number, name: studentInfo.name, playCount: playCount, score: Math.round(targetScore), note: note })
    })
    .then(() => { if(textComponent) textComponent.setText("✅ スプレッドシートへデータを同期しました！"); })
    .catch((error) => { console.error("GAS Error:", error); if(textComponent) textComponent.setText("❌ 同期失敗"); });
}
