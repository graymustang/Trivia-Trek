//Global variables
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let timer = null;
const timePerQuestion = 15;
let timeRemaining = timePerQuestion;


//Start button calls a function to start the game
const startButton = document.getElementById('startButton');
startButton.addEventListener("click", () => {
    startGame();
});

//Function that starts the game
function startGame(){
    const difficultySelect = document.getElementById('difficulty');
    const categorySelect = document.getElementById('category');

    const difficulty = difficultySelect.value;
    const category = categorySelect.value;

    //alert(`Starting game with: ${difficulty}, ${category}`);

    getQuestions(difficulty, category);
}

// Function that gets questions from API

async function getQuestions(difficulty, category){
    const amount = 5;

    const url = `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}&category=${category}&type=multiple`;

    //Error check
    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.response_code !==0) {
            alert("Could not load the questions. Please try again.");
            return;
        }

        const questions = data.results.map(formatQuestion)
        
        startQuiz(questions);
    } catch(err) {
        console.error(err);
        alert("Network error, please try again.");
    }
}

//Format the questions how I want them
function formatQuestion(apiQuestion){
    const allAnswers = [...apiQuestion.incorrect_answers, apiQuestion.correct_answer];

    //Shuffle
    for (let i = allAnswers.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }

    const correctIndex = allAnswers.indexOf(apiQuestion.correct_answer);

    return {
        text: apiQuestion.question,
        answers: allAnswers,
        correctIndex: correctIndex,
    };
}


//Clear the welcome screen, move into game screen
function startQuiz(questions){
    currentQuestions = questions;
    currentIndex = 0;
    score = 0;

    document.getElementById('welcome').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    showCurrentQuestion();
}

//Shows whatever the current question is
function showCurrentQuestion(){
    const q = currentQuestions[currentIndex];
    const gameScreen = document.getElementById('game');

    let answerHTML = "";
    q.answers.forEach((answer, i) => {
        answerHTML += `
        <button class="answerButton" data-index="${i}">
            ${answer}
        </button>
        `;
    });
        gameScreen.innerHTML = `
        <h2>Question ${currentIndex + 1} of ${currentQuestions.length}</h2>
        <p id="timerText"></p>
        <p class="text-wrapper">${q.text}</p>
        <div class="answers">
            ${answerHTML}
        </div>
        `;

        const answerButtons = gameScreen.querySelectorAll('.answerButton');
        answerButtons.forEach(btn => {
            btn.addEventListener('click', onAnswerClick);
        });
        startTimer();
}

//When the answer button is clicked
function onAnswerClick(event){

    clearTimer();
    const button = event.currentTarget;
    const selectedIndex = Number(button.getAttribute('data-index'));
    const q = currentQuestions[currentIndex];

    if (selectedIndex === q.correctIndex){
        score++;
        alert("Correct!")
    } else {
        alert(`Incorrect. The correct answer was: ${q.answers[q.correctIndex]}`);
    }
    currentIndex++;

    if (currentIndex < currentQuestions.length){
        showCurrentQuestion();
    } else {
        summary();
    }
}

//Show a summary of the game at the end
function summary(){
    const gameScreen = document.getElementById('game');
    const total = currentQuestions.length;
    const percent = Math.round((score / total) * 100)

    let rank = "Novice";
    if (percent >= 80) rank = "Trivia Master";
    else if (percent < 80 && percent >= 60) rank = "Pro";
    else if (percent < 60) rank = "Still learning";

    clearTimer();
    gameScreen.innerHTML = `
        <h2>Game Over</h2>
        <p class="text-wrapper">You scored ${score} out of ${total} (${percent}%).</p>
        <p class="text-wrapper">Your rank: <strong>${rank}</strong></p>
        <button id="playAgainButton" class="startButton">Play Again</button>
    `;

    document.getElementById('playAgainButton').addEventListener('click', () => {
        document.getElementById('welcome').style.display = 'block';
        document.getElementById('game').style.display = 'none';
    });
}

//start the time, clear it, and then update it.
function startTimer() {
    timeRemaining = timePerQuestion;
    updateTimerText();

    clearTimer();

    timer = setInterval(() => {
        timeRemaining--;
        updateTimerText();

        if (timeRemaining <= 0) {
            clearTimer();
            timesUp();
        }
    }, 1000);
}

function clearTimer() {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
    }
}

function updateTimerText() {
    const timerText = document.getElementById("timerText");
    if (timerText) {
        timerText.textContent = `Time left: ${timeRemaining} seconds`;
    }
}

function timesUp() {
    const q = currentQuestions[currentIndex];

    alert(`Time is up! The correct answer was: ${q.answers[q.correctIndex]}`);

    currentIndex++;

    if (currentIndex < currentQuestions.length) {
        showCurrentQuestion();
    } else {
        summary(); 
    }
}
