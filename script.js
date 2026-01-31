class PianoEngine {
    constructor() {
        this.keys = document.querySelectorAll('.key');
        this.sustain = false;
        this.activeNotes = new Map();
        this.labelsVisible = true;
        
        this.init();
    }

    init() {
        // Click and Touch events
        this.keys.forEach(key => {
            ['mousedown', 'touchstart'].forEach(evt => {
                key.addEventListener(evt, (e) => {
                    e.preventDefault();
                    this.playNote(key.dataset.note);
                });
            });

            ['mouseup', 'mouseleave', 'touchend'].forEach(evt => {
                key.addEventListener(evt, () => this.stopNote(key.dataset.note));
            });
        });

        // Keyboard events
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const key = e.key.toLowerCase();
            const keyElement = document.querySelector(`.key[data-key="${key}"]`);
            if (keyElement) this.playNote(keyElement.dataset.note);
            if (e.code === 'Space') this.toggleSustain(true);
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            const keyElement = document.querySelector(`.key[data-key="${key}"]`);
            if (keyElement) this.stopNote(keyElement.dataset.note);
            if (e.code === 'Space') this.toggleSustain(false);
        });

        // Controls
        document.getElementById('toggle-labels').addEventListener('click', () => this.toggleLabels());
        document.getElementById('sustain-btn').addEventListener('click', () => this.toggleSustain(!this.sustain));

        // Song cards
        document.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', () => {
                const song = card.querySelector('h3').innerText;
                this.playTutorial(song);
            });
        });
    }

    playNote(note) {
        const audio = document.querySelector(`audio[data-note="${note}"]`);
        const keyElement = document.querySelector(`.key[data-note="${note}"]`);
        
        if (!audio || !keyElement) return;

        // Visual feedback
        keyElement.classList.add('playing');

        // Audio logic
        const clone = audio.cloneNode();
        clone.play();
        this.activeNotes.set(note, clone);
    }

    stopNote(note) {
        const keyElement = document.querySelector(`.key[data-note="${note}"]`);
        if (keyElement) keyElement.classList.remove('playing');

        if (!this.sustain) {
            const audio = this.activeNotes.get(note);
            if (audio) {
                // Fade out effect
                let vol = 1;
                const interval = setInterval(() => {
                    vol -= 0.1;
                    if (vol <= 0) {
                        audio.pause();
                        clearInterval(interval);
                    } else {
                        audio.volume = vol;
                    }
                }, 20);
            }
        }
    }

    toggleSustain(state) {
        this.sustain = state;
        const btn = document.getElementById('sustain-btn');
        if (this.sustain) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
            // Stop all notes that are no longer pressed
            this.activeNotes.clear();
        }
    }

    toggleLabels() {
        this.labelsVisible = !this.labelsVisible;
        this.keys.forEach(key => {
            key.style.color = this.labelsVisible ? '' : 'transparent';
        });
        document.getElementById('toggle-labels').innerText = this.labelsVisible ? 'Hide Labels' : 'Show Labels';
    }

    playTutorial(songName) {
        console.log(`Starting tutorial for: ${songName}`);
        alert(`Starting "Guided Play" for ${songName}. Follow the glowing keys!`);
        
        // Mock tutorial sequence for "Imagine"
        if (songName === 'Imagine') {
            const sequence = ['C3', 'E3', 'G3', 'C3', 'E3', 'G3'];
            let i = 0;
            const timer = setInterval(() => {
                if (i >= sequence.length) {
                   clearInterval(timer);
                   return;
                }
                const note = sequence[i];
                const key = document.querySelector(`.key[data-note="${note}"]`);
                key.style.boxShadow = '0 0 30px var(--gold)';
                setTimeout(() => key.style.boxShadow = '', 400);
                i++;
            }, 600);
        }
    }
}

// Initialize the engine
document.addEventListener('DOMContentLoaded', () => {
    new PianoEngine();
});
