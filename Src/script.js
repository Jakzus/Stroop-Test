  // Color word and color arrays
        const colorWords = ['Rød', 'Blå', 'Grøn', 'Lilla', 'Orange'];
        const colors = ['r', 'b', 'g', 'l', 'o'];
        const colorNames = {
            'r': 'Red',
            'b': 'Blue',
            'g': 'Green',
            'l': 'Purple',
            'o': 'Orange'
        };
        const colorMap = {
            'r': '#CC0000',
            'b': '#2340D9',
            'g': '#2ecc71',
            'l': '#711BDE',
            'o': '#F79A2A'
        };

        // Game state
        let gameState = {
            isRunning: false,
            isPaused: false,
            currentWord: null,
            currentColor: null,
            timeLeft: 30 * 60, // 30 minutes in seconds
            timerInterval: null,
            wordTimerInterval: null,
            wordTimeLeft: 2,
            wordAnswered: false,
            // Time window tracking (0-2 min, 14-16 min, 28-30 min)
            window1: { correct: 0, total: 0 },  // 0-2 minutes
            window2: { correct: 0, total: 0 },  // 14-16 minutes
            window3: { correct: 0, total: 0 }   // 28-30 minutes
        };

        // Check which time window we're currently in
        function getCurrentTimeWindow() {
            const elapsed = (30 * 60) - gameState.timeLeft;
            
            if (elapsed >= 0 && elapsed < 120) return 'window1';      // 0-2 min
            if (elapsed >= 840 && elapsed < 960) return 'window2';    // 14-16 min
            if (elapsed >= 1680 && elapsed < 1800) return 'window3';  // 28-30 min
            
            return null;
        }

        // Get random element from array
        function getRandomElement(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        // Blank screen between words (0.4 sec blank, then show next word)
        function blankScreen() {
            document.getElementById('feedback').textContent = '';
            document.getElementById('feedback').className = 'feedback';
            document.getElementById('colorWord').textContent = '';
            setTimeout(showNextWord, 490);
        }

        // Handle key press
        function handleKeyPress(event) {
            if (!gameState.isRunning || gameState.isPaused || gameState.wordAnswered) return;

            const key = event.key.toLowerCase();
            if (!colors.includes(key)) return;

            gameState.wordAnswered = true;
            clearInterval(gameState.wordTimerInterval);
            
            const isCorrect = key === gameState.currentColor;
            const currentWindow = getCurrentTimeWindow();
            
            // Only track if in a tracked time window
            if (currentWindow) {
                gameState[currentWindow].total++;
                if (isCorrect) {
                    gameState[currentWindow].correct++;
                }
                // Log result to console
                console.log(`[${currentWindow}] Word: "${gameState.currentWord}" (${gameState.currentColor}) | Answer: ${key} | Result: ${isCorrect ? 'CORRECT ✓' : 'INCORRECT ✗'}`);
            }

            if (isCorrect) {
                document.getElementById('feedback').textContent = '✓ Korrekt!';
                document.getElementById('feedback').className = 'feedback correct';
            } else {
                document.getElementById('feedback').textContent = `✗ Forkert!`;
                document.getElementById('feedback').className = 'feedback incorrect';
            }

            // Show blank screen after result display
            setTimeout(blankScreen, 500);
        }

        // Show next word
        function showNextWord() {
            gameState.wordAnswered = false;
            gameState.wordTimeLeft = 2;
            gameState.currentWord = getRandomElement(colorWords);
            gameState.currentColor = getRandomElement(colors);
            
            const wordDisplay = document.getElementById('colorWord');
            wordDisplay.textContent = gameState.currentWord;
            wordDisplay.style.color = colorMap[gameState.currentColor];
            
            document.getElementById('feedback').textContent = '';
            document.getElementById('feedback').className = 'feedback';

            // Start 2-second timer for this word
            clearInterval(gameState.wordTimerInterval);
            gameState.wordTimerInterval = setInterval(() => {
                gameState.wordTimeLeft--;

                if (gameState.wordTimeLeft <= 0) {
                    clearInterval(gameState.wordTimerInterval);
                    if (!gameState.wordAnswered) {
                        gameState.wordAnswered = true;
                        const currentWindow = getCurrentTimeWindow();
                        
                        // Only track if in a tracked time window
                        if (currentWindow) {
                            gameState[currentWindow].total++;
                            // Log timeout to console
                            console.log(`[${currentWindow}] Word: "${gameState.currentWord}" (${gameState.currentColor}) | Answer: TIMEOUT | Result: INCORRECT ✗`);
                        }
                        
                        document.getElementById('feedback').textContent = `Forkert!`;
                        document.getElementById('feedback').className = 'feedback incorrect';
                        setTimeout(blankScreen, 500);
                    }
                }
            }, 1000);
        }

        // Start the test
        function startTest() {
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('mainContainer').classList.remove('hidden');
            document.getElementById('testScreen').classList.remove('hidden');
            document.getElementById('endScreen').classList.add('hidden');
            
            gameState.isRunning = true;
            gameState.timeLeft = 30 * 60;
            gameState.window1 = { correct: 0, total: 0 };
            gameState.window2 = { correct: 0, total: 0 };
            gameState.window3 = { correct: 0, total: 0 };

            // Add keyboard listener
            document.addEventListener('keydown', handleKeyPress);

            // Start main timer
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = setInterval(() => {
                gameState.timeLeft--;

                if (gameState.timeLeft <= 0) {
                    endTest();
                }
            }, 1000);

            // Show first word
            showNextWord();
        }

        // Pause the test
        function pauseTest() {
            gameState.isPaused = true;
            clearInterval(gameState.timerInterval);
            clearInterval(gameState.wordTimerInterval);
            
            document.getElementById('testScreen').classList.add('hidden');
            document.getElementById('pauseScreen').classList.remove('hidden');
        }

        // Resume the test
        function resumeTest() {
            gameState.isPaused = false;
            document.getElementById('pauseScreen').classList.add('hidden');
            document.getElementById('testScreen').classList.remove('hidden');
            
            // Restart main timer
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = setInterval(() => {
                gameState.timeLeft--;

                if (gameState.timeLeft <= 0) {
                    endTest();
                }
            }, 1000);

            // Continue with next word if needed
            if (gameState.currentWord) {
                // Restart word timer
                gameState.wordTimeLeft = 2;
                gameState.wordTimerInterval = setInterval(() => {
                    gameState.wordTimeLeft--;

                    if (gameState.wordTimeLeft <= 0) {
                        clearInterval(gameState.wordTimerInterval);
                        if (!gameState.wordAnswered) {
                            gameState.wordAnswered = true;
                            const currentWindow = getCurrentTimeWindow();
                            
                            if (currentWindow) {
                                gameState[currentWindow].total++;
                            }
                            
                            document.getElementById('feedback').textContent = `Forkert!`;
                            document.getElementById('feedback').className = 'feedback incorrect';
                            setTimeout(blankScreen, 500);
                        }
                    }
                }, 1000);
            }
        }

        // End the test
        function endTest() {
            gameState.isRunning = false;
            gameState.isPaused = false;
            clearInterval(gameState.timerInterval);
            clearInterval(gameState.wordTimerInterval);
            document.removeEventListener('keydown', handleKeyPress);
            
            document.getElementById('pauseScreen').classList.add('hidden');
            document.getElementById('testScreen').classList.add('hidden');
            document.getElementById('endScreen').classList.remove('hidden');
            
            // Update window 1 (0-2 minutes)
            const w1Accuracy = gameState.window1.total === 0 ? 0 : Math.round((gameState.window1.correct / gameState.window1.total) * 100);
            const w1AvgTime = gameState.window1.total === 0 ? 0 : (120 / gameState.window1.total).toFixed(2);
            document.getElementById('window1Correct').textContent = gameState.window1.correct;
            document.getElementById('window1Incorrect').textContent = gameState.window1.total - gameState.window1.correct;
            document.getElementById('window1Accuracy').textContent = w1Accuracy + '%';
            document.getElementById('window1AvgTime').textContent = w1AvgTime + 's';

            
            // Update window 2 (14-16 minutes)
            const w2Accuracy = gameState.window2.total === 0 ? 0 : Math.round((gameState.window2.correct / gameState.window2.total) * 100);
            const w2AvgTime = gameState.window2.total === 0 ? 0 : (120 / gameState.window2.total).toFixed(2);
            document.getElementById('window2Correct').textContent = gameState.window2.correct;
            document.getElementById('window2Incorrect').textContent = gameState.window2.total - gameState.window2.correct;
            document.getElementById('window2Accuracy').textContent = w2Accuracy + '%';
            document.getElementById('window2AvgTime').textContent = w2AvgTime + 's';

            // Update window 3 (28-30 minutes)
            const w3Accuracy = gameState.window3.total === 0 ? 0 : Math.round((gameState.window3.correct / gameState.window3.total) * 100);
            const w3AvgTime = gameState.window3.total === 0 ? 0 : (120 / gameState.window3.total).toFixed(2);
            document.getElementById('window3Correct').textContent = gameState.window3.correct;
            document.getElementById('window3Incorrect').textContent = gameState.window3.total - gameState.window3.correct;
            document.getElementById('window3Accuracy').textContent = w3Accuracy + '%';
            document.getElementById('window3AvgTime').textContent = w3AvgTime + 's';
        }

        // Reset the test
        function resetTest() {
            document.getElementById('startScreen').classList.remove('hidden');
            document.getElementById('mainContainer').classList.add('hidden');
            document.getElementById('pauseScreen').classList.add('hidden');
            document.getElementById('endScreen').classList.add('hidden');
            document.getElementById('testScreen').classList.remove('hidden');
            
            gameState = {
                isRunning: false,
                isPaused: false,
                currentWord: null,
                currentColor: null,
                timeLeft: 30 * 60,
                timerInterval: null,
                wordTimerInterval: null,
                wordTimeLeft: 2,
                wordAnswered: false,
                window1: { correct: 0, total: 0 },
                window2: { correct: 0, total: 0 },
                window3: { correct: 0, total: 0 }
            };
        }