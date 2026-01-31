class PianoEngine {
    constructor() {
        this.pianoContainer = document.getElementById('piano-88');
        this.pianoWrapper = document.querySelector('.piano-container-88');
        this.sustain = false;
        this.labelsVisible = true;
        this.sampler = null;
        this.isLoaded = false;
        this.activeTutorial = null;
        this.tutorialTimeouts = [];
        this.baseOctave = 3;

        this.init();
    }

    async init() {
        // Professional Sampling: Map available files to core octaves 
        // Tone.js will pitch-shift to cover the full 88-key range (A0-C8)
        this.sampler = new Tone.Sampler({
            urls: {
                "C3": "key01.mp3", "C#3": "key02.mp3", "D3": "key03.mp3", "D#3": "key04.mp3",
                "E3": "key05.mp3", "F3": "key06.mp3", "F#3": "key07.mp3", "G3": "key08.mp3",
                "G#3": "key09.mp3", "A3": "key10.mp3", "A#3": "key11.mp3", "B3": "key12.mp3",
                "C4": "key13.mp3", "C#4": "key14.mp3", "D4": "key15.mp3", "D#4": "key16.mp3",
                "E4": "key17.mp3", "F4": "key18.mp3", "F#4": "key19.mp3", "G4": "key20.mp3",
                "G#4": "key21.mp3", "A4": "key22.mp3", "A#4": "key23.mp3", "B4": "key24.mp3"
            },
            baseUrl: "sounds/",
            onload: () => {
                this.isLoaded = true;
                console.log("PianoMaster Engine: Samples Loaded Successfully");
            }
        }).toDestination();

        this.generate88Keys();
        this.setupEvents();
    }

    generate88Keys() {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        let html = '';
        const keyMap = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';'];

        for (let octave = 0; octave <= 8; octave++) {
            for (let i = 0; i < 12; i++) {
                const note = notes[i];
                if (octave === 0 && i < 9) continue;
                if (octave === 8 && i > 0) break;

                const isBlack = note.includes('#');
                const noteName = note + octave;

                html += `<div class="key ${isBlack ? 'black-key' : 'white-key'}" 
                              data-note="${noteName}">
                            <span class="key-label"></span>
                         </div>`;
            }
        }
        this.pianoContainer.innerHTML = html;
        this.keys = document.querySelectorAll('.key');
        this.updateKeyMappings();
    }

    updateKeyMappings() {
        const keyMap = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';'];
        this.keys.forEach(k => {
            k.removeAttribute('data-key');
            k.querySelector('.key-label').innerText = '';
        });

        let keyIdx = 0;
        const startNote = `C${this.baseOctave}`;
        const endNote = `E${this.baseOctave + 1}`;

        let mapping = false;
        this.keys.forEach(k => {
            if (k.dataset.note === startNote) mapping = true;
            if (mapping && keyIdx < keyMap.length) {
                const key = keyMap[keyIdx++];
                k.setAttribute('data-key', key);
                k.querySelector('.key-label').innerText = key.toUpperCase();
            }
            if (k.dataset.note === endNote) mapping = false;
        });

        const octDisplay = document.getElementById('current-octave');
        if (octDisplay) octDisplay.innerText = `Octave: ${this.baseOctave}`;
    }

    shiftOctave(dir) {
        this.baseOctave = Math.max(1, Math.min(6, this.baseOctave + dir));
        this.updateKeyMappings();
        // Scroll to the new octave view
        const startKey = document.querySelector(`.key[data-note="C${this.baseOctave}"]`);
        if (startKey) this.scrollToNote(startKey.dataset.note);
    }

    scrollToNote(note) {
        const key = document.querySelector(`.key[data-note="${note}"]`);
        if (key && this.pianoWrapper) {
            const offset = key.offsetLeft - (this.pianoWrapper.offsetWidth / 2) + (key.offsetWidth / 2);
            this.pianoWrapper.scrollTo({ left: offset, behavior: 'smooth' });
        }
    }

    setupEvents() {
        this.keys.forEach(key => {
            key.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.playNote(key.dataset.note);
            });
            ['mouseup', 'mouseleave'].forEach(evt => {
                key.addEventListener(evt, () => this.stopNote(key.dataset.note));
            });
        });

        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const keyElement = document.querySelector(`.key[data-key="${e.key.toLowerCase()}"]`);
            if (keyElement) this.playNote(keyElement.dataset.note);
            if (e.code === 'Space') this.toggleSustain(true);
        });

        window.addEventListener('keyup', (e) => {
            const keyElement = document.querySelector(`.key[data-key="${e.key.toLowerCase()}"]`);
            if (keyElement) this.stopNote(keyElement.dataset.note);
            if (e.code === 'Space') this.toggleSustain(false);
        });

        document.getElementById('sustain-btn').addEventListener('click', () => this.toggleSustain(!this.sustain));
    }

    playNote(note, isTutorial = false) {
        if (!this.isLoaded) return;

        Tone.start();
        this.sampler.triggerAttack(note);

        const key = document.querySelector(`.key[data-note="${note}"]`);
        if (key) {
            key.classList.add('playing');
            if (isTutorial) {
                key.classList.add('tutorial-highlight');
                this.scrollToNote(note); // Auto-scroll to follow the song!
            }
        }
    }

    stopNote(note) {
        if (!this.sustain) {
            this.sampler.triggerRelease(note);
            const key = document.querySelector(`.key[data-note="${note}"]`);
            if (key) {
                key.classList.remove('playing');
                key.classList.remove('tutorial-highlight');
            }
        }
    }

    toggleSustain(state) {
        this.sustain = state;
        const btn = document.getElementById('sustain-btn');
        if (btn) btn.classList.toggle('active', this.sustain);
        if (!this.sustain) {
            this.sampler.releaseAll();
            this.keys.forEach(k => k.classList.remove('playing'));
        }
    }

    toggleLabels() {
        this.labelsVisible = !this.labelsVisible;
        this.keys.forEach(k => k.style.color = this.labelsVisible ? '' : 'transparent');
    }

    playSong(song) {
        this.clearTutorial();

        const status = document.getElementById('tutorial-status');
        if (status) status.innerText = `Now Playing: ${song.title} (${song.artist})`;

        this.activeTutorial = true;

        // Use Tone.Part or Transport for precise long-form playback
        song.notes.forEach(item => {
            const timeoutId = setTimeout(() => {
                if (!this.activeTutorial) return;
                this.playNote(item.note, true);

                // Release after a short duration
                setTimeout(() => {
                    this.stopNote(item.note);
                }, 400);
            }, item.time * 1000);

            this.tutorialTimeouts.push(timeoutId);
        });
    }

    clearTutorial() {
        this.activeTutorial = null;
        this.tutorialTimeouts.forEach(id => clearTimeout(id));
        this.tutorialTimeouts = [];

        const status = document.getElementById('tutorial-status');
        if (status) status.innerText = "";

        this.keys.forEach(k => {
            k.classList.remove('playing');
            k.classList.remove('tutorial-highlight');
        });
    }
}

class AppManager {
    constructor() {
        this.engine = new PianoEngine();
        this.library = new LibraryManager(this);
        this.init();
    }

    init() {
        this.showView('home');
        this.renderFeatured();
    }

    showView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
        const view = document.getElementById(`view-${viewName}`);
        if (view) view.style.display = 'block';

        document.querySelectorAll('header nav a').forEach(a => a.classList.remove('active'));
        const navItem = document.getElementById(`nav-${viewName}`);
        if (navItem) navItem.classList.add('active');

        // Scroll to top
        window.scrollTo(0, 0);
    }

    renderFeatured() {
        // Show 4 featured songs on home page
        const featured = SONG_DATABASE.slice(0, 4);
        const grid = document.getElementById('featured-grid');
        if (grid) grid.innerHTML = featured.map(song => this.createSongCard(song)).join('');
    }

    createSongCard(song) {
        return `
            <div class="song-card" onclick="app.startPractice('${song.id}')">
                <span class="badge">${song.difficulty}</span>
                <h3>${song.title}</h3>
                <p>${song.artist} • ${song.genre}</p>
                <div style="font-size: 0.7rem; margin-top: 10px; color: var(--gold); font-weight: 700;">TAP TO LEARN</div>
            </div>
        `;
    }

    startPractice(songId) {
        const song = SONG_DATABASE.find(s => s.id === songId);
        this.showView('practice');
        if (song) {
            // Buffer time for Tone.js to be ready and UI to transition
            setTimeout(() => this.engine.playSong(song), 500);
        }
    }
}

class LibraryManager {
    constructor(app) {
        this.app = app;
        this.container = document.getElementById('main-library-grid');
        this.currentCategory = 'All';
        this.render();
    }

    render(songs = SONG_DATABASE) {
        if (this.container) {
            this.container.innerHTML = songs.map(song => this.app.createSongCard(song)).join('');
        }
    }

    filterSongs() {
        const query = document.getElementById('song-search').value.toLowerCase();
        const filtered = SONG_DATABASE.filter(s =>
            (this.currentCategory === 'All' || s.genre === this.currentCategory) &&
            (s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query))
        );
        this.render(filtered);
    }

    filterCategory(cat) {
        this.currentCategory = cat;
        document.querySelectorAll('.filter-btn').forEach(b => {
            const btnText = b.innerText.trim();
            b.classList.toggle('active', btnText === cat);
        });
        this.filterSongs();
    }
}

const app = new AppManager();
