/* ------------------------------------------------------------------
   Quiz app - plain JavaScript, no libraries, no build step.

   To use your own questions: replace the objects in the `questions`
   array below. Everything else adapts automatically - the "Question X
   of Y" counter, the progress bar and the final score all read their
   numbers from questions.length, so you can have 5 questions or 50.

   Rules for the questions array:
     - each question needs `question` (a string) and `answers` (a list)
     - each answer needs `text` (a string) and `correct` (true / false)
     - mark exactly ONE answer per question as correct: true
       (true / false as real booleans, NOT the strings "true"/"false")
------------------------------------------------------------------ */

const questions = [
  {
    question: "Which planet is closest to the Sun?",
    answers: [
      { text: "Venus",   correct: false },
      { text: "Mercury", correct: true  },
      { text: "Mars",    correct: false },
      { text: "Earth",   correct: false }
    ]
  },
  {
    question: "How many continents are there on Earth?",
    answers: [
      { text: "Five",  correct: false },
      { text: "Six",   correct: false },
      { text: "Seven", correct: true  },
      { text: "Eight", correct: false }
    ]
  },
  {
    question: "What is the largest ocean on Earth?",
    answers: [
      { text: "Atlantic Ocean", correct: false },
      { text: "Indian Ocean",   correct: false },
      { text: "Arctic Ocean",   correct: false },
      { text: "Pacific Ocean",  correct: true  }
    ]
  },
  {
    question: "Which language runs in a web browser?",
    answers: [
      { text: "Java",       correct: false },
      { text: "C",          correct: false },
      { text: "Python",     correct: false },
      { text: "JavaScript", correct: true  }
    ]
  },
  {
    question: "What does CSS stand for?",
    answers: [
      { text: "Central Style Sheets",   correct: false },
      { text: "Cascading Style Sheets", correct: true  },
      { text: "Cascading Simple Sheets", correct: false },
      { text: "Cars SUVs Sailboats",    correct: false }
    ]
  }
];

/* ---- elements ---- */

const questionElement     = document.getElementById("question");
const answerButtonsElement = document.getElementById("answer-buttons");
const nextButton          = document.getElementById("next-btn");
const progressTextElement = document.getElementById("progress-text");
const scoreTextElement    = document.getElementById("score-text");
const progressFillElement = document.getElementById("progress-fill");

/* ---- state ---- */

let currentQuestionIndex = 0;
let score = 0;
let answered = false;   // has the current question already been answered?

/* ------------------------------------------------------------------
   startQuiz() - the single entry point, used for the first run AND
   for Restart.

   FIX FOR BUG 3: score is reset to 0 right here. In the tutorial
   version `let score = 0` only ran once when the file loaded, so
   restarting reset the question index but carried the old points
   over. Because Restart calls this same function, everything that
   needs resetting is reset in one place.
------------------------------------------------------------------ */
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  answered = false;

  nextButton.innerHTML = "Next";
  showQuestion();
}

/* ------------------------------------------------------------------
   showQuestion() - draws whatever question currentQuestionIndex
   currently points at. It does NOT change the index; see bug 2 below.
------------------------------------------------------------------ */
function showQuestion() {
  resetState();

  const currentQuestion = questions[currentQuestionIndex];

  /* FIX FOR BUG 2 (the counter): the index is zero-based, so the
     human-readable number is index + 1, and the total always comes
     from questions.length rather than a hard-coded 5. */
  progressTextElement.innerHTML =
    "Question " + (currentQuestionIndex + 1) + " of " + questions.length;
  scoreTextElement.innerHTML = "Score: " + score;
  progressFillElement.style.width =
    ((currentQuestionIndex / questions.length) * 100) + "%";

  questionElement.innerHTML = currentQuestion.question;

  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerHTML = answer.text;
    answerButtonsElement.appendChild(button);

    /* FIX FOR BUG 1: the answer object itself is captured here in the
       closure, so `answer.correct` is a real boolean when we check it.
       The tutorial stored it as button.dataset.correct, and dataset
       values are ALWAYS strings - which makes the string "false"
       truthy, so `if (btn.dataset.correct)` passed on every answer and
       the score went up no matter what you clicked. */
    button.addEventListener("click", () => selectAnswer(answer));
  });
}

/* ---- clear the previous question's buttons ---- */
function resetState() {
  answered = false;
  nextButton.style.display = "none";

  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild);
  }
}

/* ------------------------------------------------------------------
   selectAnswer() - runs when the user clicks one of the answers.
   Note what is NOT in here: currentQuestionIndex is never touched.
------------------------------------------------------------------ */
function selectAnswer(chosenAnswer) {
  /* Ignore extra clicks once the question has been answered -
     otherwise a fast double-click scores the same question twice. */
  if (answered) return;
  answered = true;

  /* FIX FOR BUG 1, part 2: `chosenAnswer.correct` is a genuine
     boolean (true / false), so this only increments on a real
     correct answer. If you would rather keep the data attribute
     approach, the equivalent safe check is:
         if (button.dataset.correct === "true")
     - the === "true" comparison is the part the tutorial left out. */
  if (chosenAnswer.correct === true) {
    score++;
  }

  scoreTextElement.innerHTML = "Score: " + score;

  /* Colour every button: green on the correct one, red on the wrong
     one the user picked. Then lock them all. */
  Array.from(answerButtonsElement.children).forEach((button, i) => {
    const answer = questions[currentQuestionIndex].answers[i];

    if (answer.correct === true) {
      button.classList.add("correct");
    } else if (answer === chosenAnswer) {
      button.classList.add("incorrect");
    }

    button.disabled = true;
  });

  /* Last question? Turn Next into Show results. */
  if (currentQuestionIndex === questions.length - 1) {
    nextButton.innerHTML = "Show results";
  } else {
    nextButton.innerHTML = "Next";
  }

  nextButton.style.display = "block";
}

/* ------------------------------------------------------------------
   handleNextButton() - the ONLY place in the whole file that
   increments currentQuestionIndex.

   FIX FOR BUG 2 (the skipped question): in the tutorial version the
   index got bumped in two places - once when an answer was clicked
   and again when Next was pressed - so it jumped by 2 and a question
   was skipped, which also threw the counter out. Keeping the
   increment in exactly one function makes that impossible.
------------------------------------------------------------------ */
function handleNextButton() {
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

/* ---- final screen ---- */
function showResults() {
  resetState();

  progressTextElement.innerHTML = "Finished";
  scoreTextElement.innerHTML = "Score: " + score;
  progressFillElement.style.width = "100%";

  questionElement.innerHTML =
    "<div class='result'>" +
      "<div class='result-score'>" + score + " / " + questions.length + "</div>" +
      "<div class='result-message'>" + resultMessage() + "</div>" +
    "</div>";

  nextButton.innerHTML = "Play again";
  nextButton.style.display = "block";
}

function resultMessage() {
  const percent = (score / questions.length) * 100;

  if (percent === 100) return "Perfect score.";
  if (percent >= 60)   return "Nicely done.";
  if (percent > 0)     return "Worth another go.";
  return "Better luck next time.";
}

/* ------------------------------------------------------------------
   One click handler on the Next button, which behaves differently
   depending on whether the quiz is finished.

   Note it calls startQuiz() for the restart - NOT showQuestion() -
   which is what guarantees the score goes back to zero (bug 3).
------------------------------------------------------------------ */
nextButton.addEventListener("click", () => {
  const finished = currentQuestionIndex >= questions.length;

  if (finished) {
    startQuiz();
  } else {
    handleNextButton();
  }
});

startQuiz();
