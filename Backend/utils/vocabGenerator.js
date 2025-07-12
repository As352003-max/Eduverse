function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

function generateVocabProblem(moduleTopic, difficulty) {
    const vocabData = {
        'default': [
            { word: 'apple', definition: 'A common fruit that grows on trees.' },
            { word: 'banana', definition: 'A long curved fruit which grows in clusters.' },
            { word: 'cat', definition: 'A small domesticated carnivorous mammal.' },
            { word: 'dog', definition: 'A domesticated carnivorous mammal that typically has a long snout, an acute sense of smell, and a barking, howling, or whining voice.' },
            { word: 'house', definition: 'A building for human habitation, especially one that is lived in by a family or small group of people.' }
        ],
        'science-biology': [
            { word: 'photosynthesis', definition: 'The process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water.' },
            { word: 'mitochondria', definition: 'An organelle found in large numbers in most cells, in which the biochemical processes of respiration and energy production occur.' }
        ]
    };

    const words = vocabData[moduleTopic] || vocabData['default'];
    const selected = words[Math.floor(Math.random() * words.length)];

    let hint = '_'.repeat(selected.word.length);
    if (difficulty === 'easy') {
        const revealCount = Math.floor(selected.word.length / 3);
        const revealedIndices = new Set();
        while (revealedIndices.size < revealCount) {
            revealedIndices.add(Math.floor(Math.random() * selected.word.length));
        }
        for (let i = 0; i < selected.word.length; i++) {
            if (revealedIndices.has(i)) {
                hint = hint.substring(0, i) + selected.word[i] + hint.substring(i + 1);
            }
        }
    } else if (difficulty === 'medium') {
        hint = shuffleString(selected.word);
    }

    return {
        word: selected.word.toLowerCase(),
        definition: selected.definition,
        hint: hint,
        imageUrl: selected.imageUrl || null
    };
}

module.exports = {
    generateVocabProblem
};