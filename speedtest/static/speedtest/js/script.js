// 1. SELECTING ELEMENTS
const textDisplay = document.getElementById('text-display');
const typingInput = document.getElementById('typing-input');
const nameInput = document.getElementById('username-input');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');

// 2. INITIAL VARIABLES
let timer = 60;
let isStarting = false;
let interval = null;
// const quote = "The quick brown fox jumps over the lazy dog. Programming in Django makes web development fast and efficient.";

// // 3. THE "GHOST TEXT" SETUP
// textDisplay.innerHTML = quote.split('').map(char => `<span>${char}</span>`).join('');
// const characters = textDisplay.querySelectorAll('span');


// 2.1 GET THE TEXT FROM DJANGO
const quote = textDisplay.innerText.trim(); // Grab the text inside the div

// 3 THE "GHOST TEXT" SETUP (This stays the same)
textDisplay.innerHTML = quote.split('').map(char => `<span>${char}</span>`).join('');
const characters = textDisplay.querySelectorAll('span');

// 4. PERSISTENT NAME LOGIC (LocalStorage)
// Load previous name if it exists
nameInput.value = localStorage.getItem('typing_name') || 'Guest';

// 5. SMART FOCUS LOGIC
// If user presses a key, only focus the game input if they aren't typing their name
window.addEventListener('keydown', () => {
    if (document.activeElement !== nameInput && typingInput.disabled !== true) {
        typingInput.focus();
    }
});

// 6. THE CORE ENGINE
typingInput.addEventListener('input', () => {
    // Only start timer if it's the first character and user isn't in name field
    if (!isStarting && document.activeElement === typingInput) {
        startTimer();
    }
    
    const inputVal = typingInput.value.split('');
    const quoteLength = characters.length;
    let correctChars = 0;

    characters.forEach((charSpan, index) => {
        const char = inputVal[index];
        
        if (char == null) {
            charSpan.className = ''; 
        } else if (char === charSpan.innerText) {
            charSpan.className = 'correct'; 
            correctChars++;
        } else {
            charSpan.className = 'incorrect'; 
        }
    });

    updateStats(correctChars, inputVal.length);

    // FINISH LINE CHECK
    if (inputVal.length >= quoteLength) {
        finishTest();
    }
});

// 7. TIMER LOGIC
function startTimer() {
    isStarting = true;
    interval = setInterval(() => {
        if (timer > 0) {
            timer--;
            timerDisplay.innerText = timer;
        } else {
            finishTest();
        }
    }, 1000);
}

// 8. CALCULATION LOGIC
function updateStats(correct, total) {
    const timeSpent = 60 - timer; // Seconds
    const timeInMinutes = timeSpent / 60;

    if (timeSpent > 0) {
        // Correct Fix: (Correct Characters / 5) / Time in Minutes
        const wpm = Math.round((correct / 5) / timeInMinutes);
        wpmDisplay.innerText = wpm;
        
        // Accuracy stays the same (Percentage of correct vs total)
        const accuracy = Math.round((correct / total) * 100);
        accuracyDisplay.innerText = accuracy || 100;
    }
}

// 9. COMPLETION & AJAX LOGIC
function finishTest() {
    clearInterval(interval);
    typingInput.disabled = true;

    const finalWpm = parseInt(wpmDisplay.innerText);
    const finalAccuracy = parseInt(accuracyDisplay.innerText);
    const playerName = nameInput.value || "Anonymous";

    // Save name for next visit
    localStorage.setItem('typing_name', playerName);

    // Send to Django + MySQL
    fetch('/save-score/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') 
        },
        body: JSON.stringify({
            username: playerName,
            wpm: finalWpm,
            accuracy: finalAccuracy
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success') {
            alert(`Great job ${playerName}! Data saved to MySQL.`);
            location.reload(); // Reload to update the Leaderboard
        }
    })
    .catch(error => console.error('Error:', error));
}

// 10. DJANGO SECURITY HELPER
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}