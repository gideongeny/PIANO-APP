const SONG_DATABASE = [
    {
        id: "imagine",
        title: "Imagine",
        artist: "John Lennon",
        difficulty: "Beginner",
        genre: "Pop",
        notes: [
            { note: "C3", time: 0 }, { note: "E3", time: 0.5 }, { note: "G3", time: 1.0 },
            { note: "C3", time: 1.5 }, { note: "E3", time: 2.0 }, { note: "G3", time: 2.5 },
            { note: "F3", time: 3.0 }, { note: "A3", time: 3.5 }, { note: "C4", time: 4.0 }
        ]
    },
    {
        id: "fur-elise",
        title: "Fur Elise",
        artist: "Beethoven",
        difficulty: "Intermediate",
        genre: "Classical",
        notes: [
            { note: "E4", time: 0 }, { note: "D#4", time: 0.25 }, { note: "E4", time: 0.5 },
            { note: "D#4", time: 0.75 }, { note: "E4", time: 1.0 }, { note: "B3", time: 1.25 },
            { note: "D4", time: 1.5 }, { note: "C4", time: 1.75 }, { note: "A3", time: 2.0 }
        ]
    },
    {
        id: "someone-like-you",
        title: "Someone Like You",
        artist: "Adele",
        difficulty: "Beginner",
        genre: "Pop",
        notes: [
            { note: "A2", time: 0 }, { note: "E3", time: 0.5 }, { note: "A3", time: 1.0 }, { note: "E3", time: 1.5 }
        ]
    },
    {
        id: "clair-de-lune",
        title: "Clair de Lune",
        artist: "Debussy",
        difficulty: "Advanced",
        genre: "Classical",
        notes: []
    },
    { id: "bohemian-rhapsody", title: "Bohemian Rhapsody", artist: "Queen", difficulty: "Intermediate", genre: "Rock", notes: [] },
    { id: "let-it-be", title: "Let It Be", artist: "The Beatles", difficulty: "Beginner", genre: "Pop", notes: [] },
    { id: "hallelujah", title: "Hallelujah", artist: "Leonard Cohen", difficulty: "Beginner", genre: "Pop", notes: [] },
    { id: "clocks", title: "Clocks", artist: "Coldplay", difficulty: "Intermediate", genre: "Pop", notes: [] },
    { id: "river-flows-in-you", title: "River Flows in You", artist: "Yiruma", difficulty: "Intermediate", genre: "Instrumental", notes: [] },
    { id: "all-of-me", title: "All of Me", artist: "John Legend", difficulty: "Beginner", genre: "R&B", notes: [] },
    { id: "perfect", title: "Perfect", artist: "Ed Sheeran", difficulty: "Beginner", genre: "Pop", notes: [] },
    { id: "november-rain", title: "November Rain", artist: "Guns N' Roses", difficulty: "Intermediate", genre: "Rock", notes: [] },
    { id: "golden-hour", title: "Golden Hour", artist: "JVKE", difficulty: "Advanced", genre: "Pop", notes: [] },
    // Generating 87 more entries to reach 100...
];

// Dynamically generate the rest of the 100 songs for the demo
const genres = ["Pop", "Classical", "Jazz", "Rock", "Movie Theme", "R&B"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];

for (let i = SONG_DATABASE.length; i < 100; i++) {
    SONG_DATABASE.push({
        id: `song-${i}`,
        title: `Masterpiece #${i + 1}`,
        artist: `Virtuoso Artist ${i}`,
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        genre: genres[Math.floor(Math.random() * genres.length)],
        notes: []
    });
}

if (typeof module !== 'undefined') {
    module.exports = SONG_DATABASE;
}
