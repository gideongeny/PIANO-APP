class PianoEngine {
    constructor() {
        this.pianoContainer = document.getElementById('piano-88');
        this.sustain = false;
        this.labelsVisible = true;
        this.sampler = null;
        this.isLoaded = false;
        this.activeTutorial = null;

        this.init();
    }

    async init() {
        // Initialize Tone.js Sampler with 24 existing samples for the demo
        // and pitch-shift for the full 88 range
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
                console.log("Piano Samples Loaded");
            }
        }).toDestination();

        this.generate88Keys();
        this.setupEvents();
    }

    generate88Keys() {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        let html = '';

        // Piano starts from A0 and ends at C8
        // For simplicity in the demo, let's span from A0 to C8 (88 keys)
        const keyMap = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';'];
        let keyIdx = 0;

        for (let octave = 0; octave <= 8; octave++) {
            for (let i = 0; i < 12; i++) {
                const note = notes[i];
                if (octave === 0 && i < 9) continue; // Start at A0 (idx 9)
                if (octave === 8 && i > 0) break;    // End at C8 (idx 0)

                const isBlack = note.includes('#');
                const noteName = note + octave;
                const keyboardKey = (octave >= 3 && octave <= 4) ? (keyMap[keyIdx++] || '') : '';

                html += `<div class="key ${isBlack ? 'black-key' : 'white-key'}" 
                              data-note="${noteName}" 
                              data-key="${keyboardKey}">
                            ${keyboardKey.toUpperCase()}
                         </div>`;
            }
        }
        this.pianoContainer.innerHTML = html;
        this.keys = document.querySelectorAll('.key');
    }

    setupEvents() {
        this.keys.forEach(key => {
            key.addEventListener('mousedown', () => this.playNote(key.dataset.note));
            key.addEventListener('mouseup', () => this.stopNote(key.dataset.note));
            key.addEventListener('mouseleave', () => this.stopNote(key.dataset.note));
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
            if (isTutorial) key.classList.add('tutorial-highlight');
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
        btn.classList.toggle('active', this.sustain);
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
        if (!song.notes || song.notes.length === 0) {
            alert("This song is coming soon!");
            return;
        }

        document.getElementById('tutorial-status').innerText = `Playing: ${song.title}`;
        let index = 0;

        const playNext = () => {
            if (index >= song.notes.length) {
                this.clearTutorial();
                return;
            }

            const { note, time } = song.notes[index];
            this.playNote(note, true);

            setTimeout(() => {
                this.stopNote(note);
                index++;
                playNext();
            }, 500); // Fixed tempo for demo
        };

        this.activeTutorial = true;
        playNext();
    }

    clearTutorial() {
        this.activeTutorial = null;
        document.getElementById('tutorial-status').innerText = "";
        this.keys.forEach(k => k.classList.remove('tutorial-highlight'));
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
        document.getElementById(`view-${viewName}`).style.display = 'block';

        // Update nav active state
        document.querySelectorAll('header nav a').forEach(a => a.classList.remove('active'));
        const navItem = document.getElementById(`nav-${viewName}`);
        if (navItem) navItem.classList.add('active');
    }

    renderFeatured() {
        const featured = SONG_DATABASE.slice(0, 4);
        const grid = document.getElementById('featured-grid');
        grid.innerHTML = featured.map(song => this.createSongCard(song)).join('');
    }

    createSongCard(song) {
        return `
            <div class="song-card" onclick="app.startPractice('${song.id}')">
                <span class="badge">${song.difficulty}</span>
                <h3>${song.title}</h3>
                <p>${song.artist} • ${song.genre}</p>
            </div>
        `;
    }

    startPractice(songId) {
        const song = SONG_DATABASE.find(s => s.id === songId);
        this.showView('practice');
        if (song) {
            setTimeout(() => this.engine.playSong(song), 1000);
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
        this.container.innerHTML = songs.map(song => this.app.createSongCard(song)).join('');
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
            b.classList.toggle('active', b.innerText === cat);
        });
        this.filterSongs();
    }
}

const app = new AppManager();
