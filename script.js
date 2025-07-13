document.addEventListener('DOMContentLoaded', () => {
    const flagImage = document.getElementById('flag-image');
    const optionsContainer = document.getElementById('options-container');
    const scoreElement = document.getElementById('score');
    const roundElement = document.getElementById('round');

    let score = 0;
    let currentRound = 1;
    const totalRounds = 20;
    let countries = [];
    let gameQueue = [];

    async function fetchCountries() {
        try {
            const res = await fetch('https://restcountries.com/v3.1/all?fields=name,translations,flags,cca2');
            const data = await res.json();

            return data
                .filter(c => c.flags?.png && (c.translations?.por?.common || c.name?.common))
                .map(c => ({
                    ...c,
                    displayName: c.translations?.por?.common || c.name.common
                }));
        } catch {
            return getFallbackCountries();
        }
    }

    function getFallbackCountries() {
        return [
            { displayName: 'Brasil', flags: { png: 'https://flagcdn.com/w320/br.png' } },
            { displayName: 'França', flags: { png: 'https://flagcdn.com/w320/fr.png' } },
            { displayName: 'Japão', flags: { png: 'https://flagcdn.com/w320/jp.png' } },
            { displayName: 'Canadá', flags: { png: 'https://flagcdn.com/w320/ca.png' } },
        ];
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function setupGame() {
        score = 0;
        currentRound = 1;
        gameQueue = shuffle([...countries]).slice(0, totalRounds);
        updateScore();
        loadNextRound();
    }

    function updateScore() {
        scoreElement.textContent = score;
        roundElement.textContent = `${currentRound}/${totalRounds}`;
    }

    function loadNextRound() {
        if (currentRound > totalRounds) {
            return setupGame();
        }

        const correctCountry = gameQueue[currentRound - 1];
        flagImage.src = correctCountry.flags.png;
        flagImage.alt = `Bandeira de ${correctCountry.displayName}`;

        const options = generateOptions(correctCountry);
        renderOptions(options, correctCountry.displayName);
    }

    function generateOptions(correct) {
        const others = shuffle([...countries].filter(c => c.displayName !== correct.displayName));
        const wrong = others.slice(0, 3).map(c => c.displayName);
        return shuffle([correct.displayName, ...wrong]);
    }

    function renderOptions(options, correctAnswer) {
        optionsContainer.innerHTML = '';
        options.forEach(name => {
            const btn = document.createElement('button');
            btn.textContent = name;
            btn.addEventListener('click', () => handleAnswer(btn, name, correctAnswer));
            optionsContainer.appendChild(btn);
        });
    }

    function handleAnswer(btn, selected, correct) {
        const buttons = optionsContainer.querySelectorAll('button');
        buttons.forEach(b => b.disabled = true);

        if (selected === correct) {
            btn.classList.add('true');
            score++;
        } else {
            btn.classList.add('false');
            buttons.forEach(b => {
                if (b.textContent === correct) {
                    b.classList.add('true');
                }
            });
        }

        updateScore();
        currentRound++;
        setTimeout(loadNextRound, 1200);
    }

    // Init
    fetchCountries().then(result => {
        countries = result;
        setupGame();
    });
});
