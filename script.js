document.addEventListener('DOMContentLoaded', () => {
    const keys = document.querySelectorAll('.key');

    function playSound(keyCode) {
        const audio = document.querySelector(`audio[data-key="${keyCode}"]`);
        const key = document.querySelector(`div[data-key="${keyCode}"]`);
        if (!audio) return;
        audio.currentTime = 0; // rewind to the start
        audio.play();
        key.classList.add('playing');
        setTimeout(() => key.classList.remove('playing'), 100);
    }

    keys.forEach(key => key.addEventListener('click', () => {
        const keyCode = key.getAttribute('data-key');
        playSound(keyCode);
    }));

    window.addEventListener('keydown', (e) => {
        playSound(e.keyCode);
    });
});
