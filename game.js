const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
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

// 🔗 スプレッドシートの送信先URL
const GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxFuDr_Q4pLHg-ywJOipHcgTKgm5m072Jbw8LtsWldjphlLvebIrYPdv2MeHy2how6v/exec";

let studentInfo = { grade: 1, class: 'A', number: 1, name: '' };
let playCount = 0; 
let currentSelectedMode = "ALL"; 

let slots = [];             
let wordBlocks = []; 

// 🎯 クイズデータ
const quizData = [
    // === STAGE 1: 単語部門 (10問) ===
    { id: 1,  stage: 1, type: 'choice', audioKey: 'music1',  instruction: '【単語】歌詞に出てくる "queen"（beauty queen）の、この曲の文脈における正しい意味はどれ？', choices: ['本物の女王（王室の女性）', 'トランプの「Q」のカード', '（ミスコンなどの）女王、美女', '母親、年上の女性'], answer: '（ミスコンなどの）女王、美女', explanation: 'スライド4に登場する "beauty queen" は「（映画のワンシーンに出てくるような）美女」を意味する単語です。' },
    { id: 2,  stage: 1, type: 'choice', audioKey: 'music1',  instruction: '【単語】歌詞に出てくる "scene"（movie scene）の正しい意味はどれ？', choices: ['（映画などの）シーン、場面', 'カメラのレンズ', '映画館の座席', 'セリフ、台本'], answer: '（映画などの）シーン、場面', explanation: 'スライド4の語彙タグ通り、"movie scene" で「映画のワンシーン（場面環境）」という意味になります。' },
    { id: 3,  stage: 1, type: 'choice', audioKey: 'music11', instruction: '【単語】歌詞に出てくる動詞 "claim"（She\'s just a girl who claims...）の正しい意味はどれ？', choices: ['～を優しく褒める', '（根拠がないのに）～だと主張する、言い張る', '静かに諦める', '友達に紹介する'], answer: '（根拠がないのに）～だと主張する、言い張る', explanation: 'スライド14の語彙タグに「claim：〜だと主張する、言い張る」と記載されており、根拠のない主張というニュアンスが含まれます。' },
    { id: 4,  stage: 1, type: 'choice', audioKey: 'music10', instruction: '【単語】歌詞に出てくる "lover"（Billie Jean is not my lover）の正しい意味はどれ？', choices: ['親友', 'ファン', '恋人', '仕事のパートナー'], answer: '恋人', explanation: 'スライド13に記載の通り、"lover" は「恋人」を意味し、マイケルが彼女との交際関係を否定している重要な単語です。' },
    { id: 5,  stage: 1, type: 'choice', audioKey: 'music12', instruction: '【単語】スライド15の解説にある、一般的な「子供」を指す客観的な単語はどれ？', choices: ['son', 'kid', 'girl', 'baby'], answer: 'kid', explanation: 'スライド15に「Kidは一般的な『子供』という客観的な言葉」と解説されています。' },
    { id: 6,  stage: 1, type: 'choice', audioKey: 'music12', instruction: '【単語】スライド15の解説にある、血縁関係を表す「自分の息子」という意味の強い単語はどれ？', choices: ['kid', 'son', 'boy', 'friend'], answer: 'son', explanation: 'スライド15に「Sonは『自分の息子』という血縁を表す強い言葉」と解説されています。' },
    { id: 7,  stage: 1, type: 'choice', audioKey: 'music9',  instruction: '【単語】歌詞に出てくる "lie"（\'Cause the lie becomes the truth）の正しい意味はどれ？', choices: ['嘘（うそ）', '秘密', '噂（うわさ）', '約束'], answer: '嘘（うそ）', explanation: 'スライド12の語彙タグにある通り、"lie" は「嘘」を意味する名詞です。' },
    { id: 8,  stage: 1, type: 'choice', audioKey: 'music9',  instruction: '【単語】歌詞に出てくる "truth"（\'Cause the lie becomes the truth）の正しい意味はどれ？', choices: ['言い訳', '真実、事実', '過去', '未来'], answer: '真実、事実', explanation: 'スライド12の語彙タグにある通り、"truth" は「真実、事実」を意味する名詞です。' },
    { id: 9,  stage: 1, type: 'choice', audioKey: 'music6',  instruction: '【単語】歌詞の "Be careful of what you do" に出てくる "careful" の正しい意味はどれ？', choices: ['注意深い、気をつける', '楽しそうな、陽気な', '怒りっぽい、不機嫌な', '退屈な、つまらない'], answer: '注意深い、気をつける', explanation: 'スライド9の解説の通り、"careful" は「注意深い、気をつける」という意味の形容詞です。' },
    { id: 10, stage: 1, type: 'choice', audioKey: 'music7',  instruction: '【単語】歌詞に出てくる "heart"（breakin\' young girls\' hearts）の、この文脈における正しい意味（比喩）はどれ？', choices: ['心臓、脈拍', '心、気持ち、愛情', '体調、健康', '記憶、思い出'], answer: '心、気持ち、愛情', explanation: 'スライド10に登場する "heart" は、単なる心臓ではなく、女の子たちの「心・気持ち」を指しています。' },

    // === STAGE 2: 熟語・表現部門 (10問) ===
    { id: 11, stage: 2, type: 'choice', audioKey: 'music2',  instruction: '【熟語・表現】スライド5に解説がある “Don\'t mind” の、この歌詞における正しい役割（ニュアンス）はどれ？', choices: ['相手を励ます「ドンマイ！」', '失礼な質問やアプローチをする前の「クッション言葉」', '「私は何も気にしない」という強い拒絶', '過去の失敗を忘れてほしいときの言葉'], answer: '失礼な質問やアプローチをする前の「クッション言葉」', explanation: 'スライド5の「Don\'t mind」の解説に「失礼な質問をする前のクッション言葉です」と書かれています。' },
    { id: 12, stage: 2, type: 'choice', audioKey: 'music7',  instruction: '【熟語・表現】スライド10に書かれている熟語 "go around ~ing" が持つ、特有のマイナスな響き（ニュアンス）はどれ？', choices: ['あちこち楽しく歩き回る', '不誠実なこと（噂流しや浮気など）をして回る', '計画を立てて慎重に進める', 'たくさんの友達を作って回る'], answer: '不誠実なこと（噂流しや浮気など）をして回る', explanation: 'スライド10に「特に『不誠実なことをして回る』という否定的な響きがあります」と解説されています。' },
    { id: 13, stage: 2, type: 'choice', audioKey: 'music1',  instruction: '【熟語・表現】スライド4の語彙タグに書かれている "more like" の日本語訳として最も適切なものはどれ？', choices: ['もっと好きである', '～に非常によく似ている', 'むしろ〜に近い、どちらかと言えば～だ', '以前のように戻る'], answer: 'むしろ〜に近い、どちらかと言えば～だ', explanation: 'スライド4の語彙タグに「more like：むしろ〜に近い」と記載されています。' },
    { id: 14, stage: 2, type: 'choice', audioKey: 'music4',  instruction: '【熟語・表現】スライド7の熟語解説に書かれている "cause a scene" の正しい意味はどれ？', choices: ['人前で目立つような騒動・トラブルを起こす', '映画の素晴らしいワンシーンを撮影する', '誰にも見つからないように静かに立ち去る', '事件の理由を詳しく説明する'], answer: '人前で目立つような騒動・トラブルを起こす', explanation: 'スライド7の解説に「cause a scene：注目を浴びようとして騒動を起こすこと」と書かれています。' },
    { id: 15, stage: 2, type: 'choice', audioKey: 'music3',  instruction: '【熟語・表現】スライド6にある円形ステージの比喩表現 "in the round" が、この曲の中で象徴している状況（意味）はどれ？', choices: ['大勢のダンサーと楽しく円になって踊ること', '世間の好奇の目に晒され、逃げ場のない疑惑の中心に立たされること', 'ステージの端っこで目立たないように踊ること', '映画の丸いスクリーンに映し出されること'], answer: '世間の好奇の目に晒され、逃げ場のない疑惑の中心に立たされること', explanation: 'スライド6に「世間の好奇の目に晒され、逃げ場のない疑惑の中心に立たされることの比喩的な表現」と解説されています。' },
    { id: 16, stage: 2, type: 'choice', audioKey: 'music6',  instruction: '【熟語・表現】スライド9の歌詞 “Be careful of what you do” で使われている表現 "Be careful of ~" の意味はどれ？', choices: ['～を心から楽しみにする', '～を怖がって逃げ出す', '～に気をつけなさい、慎重になりなさい', '～を他人に自慢する'], answer: '～に気をつけなさい、慎重になりなさい', explanation: 'スライド9に記載の通り、"Be careful of ~" は相手に行動の注意を促す重要表現です。' },
    { id: 17, stage: 2, type: 'choice', audioKey: 'music5',  instruction: '【熟語・表現】スライド8に解説がある “dreamed of ~ing” （dreamed of bein\' the one）の意味はどれ？', choices: ['～になることを夢見た', '～になることを諦めた', '～になったことを後悔した', '～になるのが怖かった'], answer: '～になることを夢見た', explanation: 'スライド8の解説にある通り、「dream of ~ing」で「～することを夢見る」という表現になります。' },
    { id: 18, stage: 2, type: 'choice', audioKey: 'music7',  instruction: '【熟語・表現】スライド10の歌詞に出てくる "break someone\'s heart"（breakin\' young girls\' hearts）の正しい意味はどれ？', choices: ['（人の）心を傷つける、悲しませる', '（人の）心臓の病気を治す', '（人に）隠し事をする', '（人を）大声で驚かせる'], answer: '（人の）心を傷つける、悲しませる', explanation: 'スライド10に記載の通り、"break one\'s heart" で「（主に恋愛などで相手の）心を傷つける、振る」という意味の定番の熟語表現です。' },
    { id: 19, stage: 2, type: 'choice', audioKey: 'music8',  instruction: '【熟語・表現】スライド11の歌詞 “Be careful of who you love” の意味として正しいものはどれ？', choices: ['誰に愛されているかを自慢しなさい', '誰を愛するかは慎重になりなさい（気をつけなさい）', '愛する人と一緒に遠くへ逃げなさい', '誰も愛してはいけない'], answer: '誰を愛するかは慎重になりなさい（気をつけなさい）', explanation: 'スライド11に解説されている通り、前作の「行動（what you do）」に続き、「愛する相手（who you love）」にも慎重になれという教訓の表現です。' },
    { id: 20, stage: 2, type: 'choice', audioKey: 'music11', instruction: '【熟語・表現】スライド14の歌詞 “She\'s just a girl...” に出てくる "just a girl" の持つニュアンスはどれ？', choices: ['「ただの（大したことのない）女の子」と、相手の主張を切り捨てるニュアンス', '「特別な、運命の女の子」というお気に入りのニュアンス', '「まだ幼い子供の女の子」という意味', '「非常に危険で恐ろしい女性」という意味'], answer: '「ただの（大したことのない）女の子」と、相手の主張を切り捨てるニュアンス', explanation: 'スライド14の文脈通り、"just" をつけることで「彼女はただ（言い張っているだけ）の女の子に過ぎない」と、疑惑を否定する表現になっています。' },

    // === STAGE 3: 並べ替え部門 (10問) ===
    { id: 21, stage: 3, type: 'drag',   audioKey: 'music6',  instruction: '【並べ替え】スライド9：歌詞「自分の行動には気をつけなさい」', words: ['WHAT', 'CAREFUL', 'DO', 'OF', 'BE', 'YOU'], answer: ['BE', 'CAREFUL', 'OF', 'WHAT', 'YOU', 'DO'], explanation: 'Be careful of what you do となります。' },
    { id: 22, stage: 3, type: 'drag',   audioKey: 'music11', instruction: '【並べ替え】スライド14：歌詞「彼女はただ、僕がパパだと言い張っているだけの女の子んだ」', words: ['THAT', 'WHO', 'A GIRL', 'SHE\'S', 'CLAIMS', 'JUST', 'I AM THE ONE'], answer: ['SHE\'S', 'JUST', 'A GIRL', 'WHO', 'CLAIMS', 'THAT', 'I AM THE ONE'], explanation: 'She\'s just a girl who claims that I am the one となります。' },
    { id: 23, stage: 3, type: 'drag',   audioKey: 'music1',  instruction: '【並べ替え】スライド4：歌詞「彼女は映画のワンシーンに出てくる美女のようだった」', words: ['MORE', 'QUEEN', 'MOVIE', 'LIKE', 'A BEAUTY', 'SHE', 'FROM A', 'WAS', 'SCENE'], answer: ['SHE', 'WAS', 'MORE', 'LIKE', 'A BEAUTY', 'QUEEN', 'FROM A', 'MOVIE', 'SCENE'], explanation: 'She was more like a beauty queen from a movie scene となります。' },
    { id: 24, stage: 3, type: 'drag',   audioKey: 'music3',  instruction: '【並べ替え】スライド6：歌詞「円形のフロアで踊る主役（男）」となるように [ the one ] に続く形を完成させよう。', words: ['FLOOR', 'WILL', 'ON', 'WHO', 'DANCE', 'THE', 'IN THE ROUND'], answer: ['WHO', 'WILL', 'DANCE', 'ON', 'THE', 'FLOOR', 'IN THE ROUND'], explanation: '...the one who will dance on the floor in the round となります。' },
    { id: 25, stage: 3, type: 'drag',   audioKey: 'music10', instruction: '【並べ替え】スライド13：歌詞「ビリー・ジーンは僕の恋人じゃない」', words: ['LOVER', 'IS', 'MY', 'BILLIE JEAN', 'NOT'], answer: ['BILLIE JEAN', 'IS', 'NOT', 'MY', 'LOVER'], explanation: 'Billie Jean is not my lover となります。' },
    { id: 26, stage: 3, type: 'drag',   audioKey: 'music12', instruction: '【並べ替え】スライド15：歌詞「でもあの子は僕の息子じゃない」', words: ['IS', 'MY', 'THE KID', 'SON', 'BUT', 'NOT'], answer: ['BUT', 'THE KID', 'IS', 'NOT', 'MY', 'SON'], explanation: 'But the kid is not my son となります。' },
    { id: 27, stage: 3, type: 'drag',   audioKey: 'music8',  instruction: '【並べ替え】スライド11：歌詞「誰を愛するかは慎重に選びなさい」', words: ['OF', 'YOU', 'CAREFUL', 'WHO', 'LOVE', 'BE'], answer: ['BE', 'CAREFUL', 'OF', 'WHO', 'YOU', 'LOVE'], explanation: 'Be careful of who you love となります。' },
    { id: 28, stage: 3, type: 'drag',   audioKey: 'music7',  instruction: '【並べ替え】スライド10：歌詞「若い女の子たちの心を傷つけて回るんじゃないぞ」', words: ['HEARTS', 'DON\'T', 'AROUND', 'BREAKIN\'', 'YOUNG GIRLS\'', 'GO'], answer: ['DON\'T', 'GO', 'AROUND', 'BREAKIN\'', 'YOUNG GIRLS\'', 'HEARTS'], explanation: '...don\'t go around breakin\' young girls\' hearts となります。' },
    { id: 29, stage: 3, type: 'drag',   audioKey: 'music4',  instruction: '【並べ替え】スライド7：歌詞「彼女は僕に名前をビリー・ジーンだと言った」', words: ['ME', 'HER NAME', 'WAS', 'SHE', 'BILLIE JEAN', 'TOLD'], answer: ['SHE', 'TOLD', 'ME', 'HER NAME', 'WAS', 'BILLIE JEAN'], explanation: 'She told me her name was Billie Jean となります。' },
    { id: 30, stage: 3, type: 'drag',   audioKey: 'music9',  instruction: '【並べ替え】スライド12：歌詞「なぜなら嘘が真実になってしまうからだ」', words: ['THE TRUTH', '\'CAUSE', 'BECOMES', 'THE LIE'], answer: ['\'CAUSE', 'THE LIE', 'BECOMES', 'THE TRUTH'], explanation: '\'Cause the lie becomes the truth となります。' }
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

// 🔊 オーディオオブジェクト管理用変数
let bgmSound = null;
let currentActiveVoice = null;

const blockColors = [0xFF3333, 0xFFCC00, 0x33CCFF, 0x9933FF]; 

// 🎉 正解時のシャウト音声リスト
const correctSoundsList = ['shout_howl', 'shout_dah', 'shout_aaow', 'shout_hee', 'shout_snore', 'shout_lose'];
let correctSoundIndex = 0;

// ❌ 不正解時の音声リスト（交代交代で再生する4つのサウンド）
const wrongSoundsList = ['hahaha_zan', 'atatata', 'kuririn', 'your_blood'];
let wrongSoundIndex = 0;

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
    
    // 🎵 常時ループ再生用BGM
    this.load.audio('bgm_intro', 'sounds/uji-ueda.mp3');

    for(let i = 1; i <= 13; i++) {
        this.load.audio(`music${i}`, `sounds/${i}.mp3`);
    }
    this.load.audio('shout_howl', 'sounds/JB-howl.mp3');
    this.load.audio('shout_dah', 'sounds/dah.mp3');
    this.load.audio('shout_aaow', 'sounds/michael_aaow.mp3');
    this.load.audio('shout_hee', 'sounds/michael-hee-hee.mp3');
    this.load.audio('shout_snore', 'sounds/snore.mp3');
    this.load.audio('shout_lose', 'sounds/lose-voice.mp3'); 
    
    // ❌ 不正解時の音声群
    this.load.audio('hahaha_zan', 'sounds/hahaha-zan.mp3'); 
    this.load.audio('atatata', 'sounds/atatata.mp3'); 
    this.load.audio('kuririn', 'sounds/kuririn.mp3'); 
    this.load.audio('your_blood', 'sounds/your-blood.mp3'); 
}

function create() {
    this.input.keyboard.off('keydown');
    this.input.off('drag');
    this.input.off('dragend');

    let bg = this.add.image(512, 384, 'bg').setDepth(0);
    bg.setDisplaySize(1024, 768);
    extraBuzzGroup = this.add.group(); 
    
    // 🎵 BGM初期化
    if (!bgmSound) {
        bgmSound = this.sound.add('bgm_intro', { loop: true, volume: 0.4 });
    }

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

    if (q.type === 'choice') {
        if (/^[1-4]$/.test(key)) {
            let idx = parseInt(key) - 1;
            if (q.choices[idx]) {
                if (q.choices[idx] === q.answer) {
                    handleCorrectAnswer.call(this, q);
                } else {
                    if(!isReviewMode && !wrongQuestions.includes(q)) wrongQuestions.push(q);
                    triggerDamageEffect.call(this);
                }
            }
        }
    } else if (q.type === 'typing') {
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
        <h2 style="color: #00ff00; font-size: 22px; margin-bottom: 20px; font-weight: bold;">Billie Jean スライド連動テスト</h2>
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
                <option value="STAGE1">【10問】ステージ1：英単語部門</option>
                <option value="STAGE2">【10問】ステージ2：英熟語・表現部門</option>
                <option value="STAGE3">【10問】ステージ3：歌詞並べ替えパズル</option>
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
        
        if (bgmSound && !bgmSound.isPlaying) {
            bgmSound.play();
        }
        
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

    this.scoreText = this.add.text(480, 45, 'SCORE:0000', { font: '22px "Press Start 2P"', fill: '#ffffff' }).setDepth(10);
    timerText = this.add.text(512, 85, '30', { font: '38px "Press Start 2P"', fill: '#ffffff' }).setOrigin(0.5).setDepth(10);
    instructionText = this.add.text(512, 165, '', { 
        font: 'bold 15px "Courier New", monospace', fill: '#000000', align: 'center', backgroundColor: '#ffffff', padding: {x: 20, y: 12}, wordWrap: { width: 900 }
    }).setOrigin(0.5).setDepth(10);

    let exitBtn = this.add.text(30, 35, '◀ EXIT', { font: 'bold 16px "Press Start 2P"', fill: '#ff3333', backgroundColor: '#222', padding: 10 })
        .setInteractive({ useHandCursor: true }).setDepth(10);
        
    exitBtn.on('pointerdown', () => {
        if(confirm("ここまでのスコアをスプレッドシートに送信してタイトルに戻りますか？")) {
            if(timerEvent) timerEvent.remove();
            extraBuzzGroup.clear(true, true);
            
            if(currentActiveVoice) { currentActiveVoice.stop(); currentActiveVoice = null; }
            this.sound.stopAll();
            bgmSound = null;
            
            if (!isReviewMode) {
                sendScoreToGAS(score, `途中終了 (第${currentQuestionIndex + 1}問でEXIT, Mode: ${currentSelectedMode})`, null);
            }
            this.scene.restart();
        }
    });

    let skipBtn = this.add.text(820, 35, '⏭ SKIP', { font: 'bold 14px "Press Start 2P"', fill: '#ffffff', backgroundColor: '#333333', padding: 10 })
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
    
    if (currentActiveVoice && currentActiveVoice.isPlaying) {
        currentActiveVoice.stop();
        currentActiveVoice = null;
    }
    if (bgmSound && bgmSound.isPaused) {
        bgmSound.resume();
    }

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

    if (q.type === 'choice') createChoiceUI.call(this, q);
    else if (q.type === 'typing') createTypingUI.call(this, q);
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
    
    if (bgmSound && bgmSound.isPlaying) bgmSound.pause();
    if (currentActiveVoice && currentActiveVoice.isPlaying) { currentActiveVoice.stop(); currentActiveVoice = null; }
    
    let wrongSoundKey = wrongSoundsList[wrongSoundIndex];
    this.sound.play(wrongSoundKey); 
    wrongSoundIndex = (wrongSoundIndex + 1) % wrongSoundsList.length; 

    this.cameras.main.flash(200, 255, 0, 0, 0.5);

    if (buzzMonster) {
        this.tweens.killTweensOf(buzzMonster);
        
        let wrongFace = (wrongSoundIndex % 2 === 0) ? 'buzz_mad' : 'buzz_cry';
        startBuzzFlapping.call(this, buzzMonster, wrongFace);
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
    
    if (bgmSound && bgmSound.isPlaying) bgmSound.pause();
    if (currentActiveVoice && currentActiveVoice.isPlaying) { currentActiveVoice.stop(); currentActiveVoice = null; }

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
        
        startBuzzFlapping.call(this, buzzMonster, 'buzz_happy');
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

function createChoiceUI(q) {
    addAudioHintButton(this, q, 240);
    
    q.choices.forEach((choice, idx) => {
        let btnY = 320 + (idx * 75);
        let btnGraphics = this.add.graphics();
        btnGraphics.fillStyle(blockColors[idx % blockColors.length], 1).lineStyle(2, 0xffffff, 1);
        btnGraphics.fillRoundedRect(512 - 400, btnY - 28, 800, 56, 8).strokeRoundedRect(512 - 400, btnY - 28, 800, 56, 8);
        
        // ⭕ 文字の削れ防止（metrics）を追加し、位置を +2 下げ、Depthを12に設定
        let choiceTxt = this.add.text(512, btnY + 2, `${idx + 1}. ${choice}`, { 
            font: 'bold 16px "Courier New", monospace', 
            fill: '#ffffff', 
            wordWrap: { width: 760 }, 
            align: 'center',
            metrics: { fontSize: 24, ascent: 20, descent: 4 }
        }).setOrigin(0.5).setDepth(12);
        
        let hitArea = this.add.zone(512, btnY, 800, 56).setInteractive({ useHandCursor: true });
        
        hitArea.on('pointerdown', () => {
            if (currentQuestionState !== "PLAYING" || isEvaluating) return;
            if (choice === q.answer) {
                handleCorrectAnswer.call(this, q);
            } else {
                if(!isReviewMode && !wrongQuestions.includes(q)) wrongQuestions.push(q);
                triggerDamageEffect.call(this);
            }
        });
        uiContainer.add([btnGraphics, choiceTxt, hitArea]);
    });
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
        
        if (currentActiveVoice && currentActiveVoice.isPlaying) {
            currentActiveVoice.stop();
        }

        if (bgmSound && bgmSound.isPlaying) {
            bgmSound.pause();
        }

        currentActiveVoice = scene.sound.add(q.audioKey, { volume: 1.0 });
        currentActiveVoice.play();

        currentActiveVoice.on('complete', () => {
            if (bgmSound && bgmSound.isPaused && currentQuestionState === "PLAYING") {
                bgmSound.resume();
            }
        });
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
    addAudioHintButton(this, q, 270);
    
    let slotCount = q.answer.length;
    let slotSpacing = slotCount > 7 ? 115 : 135; 
    let slotStartX = 512 - ((slotCount - 1) * slotSpacing / 2);
    
    for (let i = 0; i < slotCount; i++) {
        let slot = this.add.image(slotStartX + (i * slotSpacing), 370, 'slot').setDisplaySize(115, 50);
        uiContainer.add(slot);
        slots.push({ x: slotStartX + (i * slotSpacing), y: 370, occupied: false });
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
        let by = 500;
        
        let txt = this.add.text(bx, by, word, { font: 'bold 20px "Courier New"', fill: '#ffffff' }).setOrigin(0.5).setDepth(12);
        let computedWidth = Math.max((word.length * 18) + 30, 115); 

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

    let submitBtn = this.add.text(512, 630, ' ◀ ANSWER (決定) ▶ ', {
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
    
    currentExpContainer = this.add.container(512, 380);
    currentExpContainer.setDepth(150); 
    
    let bgBox = this.add.graphics();
    bgBox.fillStyle(0xffffff, 0.95).lineStyle(4, isCorrect ? 0x00ff00 : 0xff0000, 1).fillRect(-420, -220, 840, 440).strokeRect(-420, -220, 840, 440);
    currentExpContainer.add(bgBox);
    
    let resColor = isCorrect ? "#00aa00" : "#ff0000";
    let resultLabel = this.add.text(0, -170, isCorrect ? "⭕ CORRECT!" : "❌ WRONG...", { font: 'bold 28px "Press Start 2P"', fill: resColor }).setOrigin(0.5);
    currentExpContainer.add(resultLabel);
    
    let qText = this.add.text(0, -110, `問題: ${q.instruction.replace('【単語】','').replace('【熟語・表現】','')}`, { font: 'bold 15px monospace', fill: '#000000', wordWrap: { width: 760 }, align: 'center' }).setOrigin(0.5);
    let aText = this.add.text(0, -40, `正解: ${q.type === 'drag' ? q.answer.join(" ") : q.answer}`, { font: 'bold 18px monospace', fill: '#0000ff', wordWrap: { width: 760 }, align: 'center' }).setOrigin(0.5);
    currentExpContainer.add([qText, aText]);
    
    let expTxt = this.add.text(0, 40, `【解説】\n${q.explanation}`, { font: '16px monospace', fill: '#333333', align: 'center', wordWrap: { width: 760 } }).setOrigin(0.5);
    currentExpContainer.add(expTxt);
    
    if (isCorrect) {
        let nextBtn = this.add.text(0, 160, "NEXT (Enter / タップ) ▶", { font: 'bold 16px "Press Start 2P"', fill: '#ffffff', backgroundColor: '#222222', padding: 10 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        currentExpContainer.add(nextBtn);
        
        const proceedToNext = () => { 
            if (currentExpContainer) { currentExpContainer.destroy(); currentExpContainer = null; }
            currentQuestionIndex++; 
            
            this.nextInputGuard = true;
            this.time.delayedCall(100, () => { this.nextInputGuard = false; });
            
            if (bgmSound && bgmSound.isPaused) {
                bgmSound.resume();
            }
            startQuestion.call(this); 
        };
        nextBtn.on('pointerdown', proceedToNext);
        onNextCallback = proceedToNext; 
    } else {
        let retryBtn = this.add.text(-130, 160, "↺ RETRY (もう一度)", { font: 'bold 16px "Press Start 2P"', fill: '#ffffff', backgroundColor: '#0055ff', padding: 10 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        let nextBtn = this.add.text(130, 160, "NEXT (次へ) ▶", { font: 'bold 16px "Press Start 2P"', fill: '#ffffff', backgroundColor: '#222222', padding: 10 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        currentExpContainer.add([retryBtn, nextBtn]);
        
        const proceedToRetry = () => {
            if (currentExpContainer) { currentExpContainer.destroy(); currentExpContainer = null; }
            if (bgmSound && bgmSound.isPaused) {
                bgmSound.resume();
            }
            startQuestion.call(this); 
        };
        const proceedToNext = () => { 
            if (currentExpContainer) { currentExpContainer.destroy(); currentExpContainer = null; }
            currentQuestionIndex++; 
            
            this.nextInputGuard = true;
            this.time.delayedCall(100, () => { this.nextInputGuard = false; });
            
            if (bgmSound && bgmSound.isPaused) {
                bgmSound.resume();
            }
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
        if (bgmSound && bgmSound.isPlaying) bgmSound.pause();
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
    resContainer.add(restartBtn); restartBtn.on('pointerdown', () => { 
        if(currentActiveVoice) { currentActiveVoice.stop(); currentActiveVoice = null; }
        this.sound.stopAll(); 
        bgmSound = null;
        this.scene.restart(); 
    });
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
