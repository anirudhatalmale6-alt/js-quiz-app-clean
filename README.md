# Quiz app — clean reference version

Plain HTML / CSS / JavaScript. No frameworks, no build step, no server.
Double-click `index.html` and it runs.

```
index.html    markup + the elements the script talks to
style.css     all styling
script.js     all logic, including the questions array
```

## Using your own questions

Everything lives in the `questions` array at the top of `script.js`.
Add or remove questions freely — the "Question X of Y" counter, the
progress bar and the final score all read their numbers from
`questions.length`, so nothing else needs changing.

```js
{
  question: "Your question text?",
  answers: [
    { text: "Option A", correct: false },
    { text: "Option B", correct: true  },   // exactly one true per question
    { text: "Option C", correct: false }
  ]
}
```

Two rules: `correct` must be a real boolean (`true` / `false`, no quotes),
and exactly one answer per question gets `correct: true`.

## The three bugs, and why they happen

### 1. Score goes up on wrong answers

The tutorial version marks the right answer with a data attribute and then
checks it like this:

```js
button.dataset.correct = answer.correct;      // writes the STRING "false"
// ...
if (selectedBtn.dataset.correct) { score++; } // "false" is truthy → always runs
```

`dataset` values are always strings, and every non-empty string is truthy in
JavaScript — including `"false"`. So the condition passes on every answer and
the score climbs no matter what you click.

This version never round-trips through the DOM: the answer object itself is
captured in the click handler's closure, so the check is against a real
boolean (`script.js`, `selectAnswer`). If you prefer keeping the data
attribute, the safe form is `if (btn.dataset.correct === "true")` — the
`=== "true"` is the part the tutorial leaves out.

### 2. A question gets skipped and the counter is wrong

Caused by `currentQuestionIndex++` appearing in two places — usually once in
the answer-click handler and once in the Next button handler — so the index
jumps by two. In this version `handleNextButton()` is the only function in
the whole file that touches the index. The counter itself renders
`currentQuestionIndex + 1` (the index is zero-based) out of
`questions.length` rather than a hard-coded 5.

### 3. Restart doesn't reset the score

`let score = 0` at the top of the file only runs once, when the page loads.
If Restart calls something that resets the index but not the score, the old
points carry over. Here `startQuiz()` is the single entry point used for both
the first run and Restart, and it resets `currentQuestionIndex`, `score` and
`answered` together.

## Extra guard

Clicking an answer twice quickly used to score the same question twice. The
`answered` flag plus disabling the buttons after a choice prevents that.

## Tests

`test_quiz.py` (in the parent folder) drives the app in a real browser and
asserts: the counter runs 1→5 with no skips, five wrong answers score 0,
five correct score 5, a 2-correct/3-wrong run scores 2, Restart returns to
"Question 1 of 5" / "Score: 0", and a double-click can't double-score.
