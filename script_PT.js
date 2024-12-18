let currentQuestionIndex = 0;
const questions = document.querySelectorAll('.question');
const nextBtn = document.querySelectorAll('#nextBtn');  // Selecting all next buttons
const prevBtn = document.querySelectorAll('#prevBtn');  // Selecting all next buttons
const nextBtns = document.querySelectorAll('.navigation #nextBtn');  // Selects each next button within navigation divs
const prevBtns = document.querySelectorAll('.navigation #prevBtn');  // Selects each prev button if implemented
const finishBtn = document.getElementById('finishBtn');
const emailSignup = document.getElementById('emailSignup');
const thankYouPage = document.getElementById('thankYouPage');
const newsletterEmail = document.getElementById('newsletterEmail');
const subscribeBtn = document.getElementById('subscribeBtn');
const closeSignup = document.getElementById('closeSignup');
const googleSheetUrl = "https://script.google.com/macros/s/AKfycbywndZm9nw_VvL5L_m_7magRrT_izEC-p4qzVDYmr-AfB4S797t-S20HQwcEO90fg_k/exec"; // Replace with your Google Apps Script Web App URL
let responses = {}; // Track user responses

// Function to show the current question
function showQuestion(index) {
    questions.forEach((question, idx) => {
        question.classList.remove('active');
        if (idx === index) {
            question.classList.add('active');
        }
    });

    // Hide "Previous" button on the first question
    prevBtn.style.display = index === 0 ? 'none' : 'inline-block';

    // Show "Next" button on all except the last two pages (email sign-up and thank you)
    nextBtns.forEach(btn => {
        btn.style.display = index === questions.length - 2 ? 'none' : 'inline-block';
    });

    // Show "Finish" button on question 12
    if (index === questions.length - 3) {
        finishBtn.style.display = 'inline-block';
    } else {
        finishBtn.style.display = 'none';
    }
}

// Event listener for the "Finish" button
finishBtn.addEventListener('click', () => {
    showQuestion(currentQuestionIndex + 1); // Go to the next page (question 13)
});

// Event listener for answer buttons
document.querySelectorAll('.answer-btn').forEach(button => {
    button.addEventListener('click', () => {
        const questionId = button.closest('.question').id;
        const questionNumber = questionId.replace('question', '');
        responses[`q${questionNumber}`] = button.textContent;
        document.querySelectorAll(`#${questionId} .answer-btn`).forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    });
});

// Function to submit quiz responses to Google Sheets
function submitQuiz() {
    const formData = new URLSearchParams();

    // Add each response to the formData
    for (const [key, value] of Object.entries(responses)) {
        formData.append(key, value);
    }

    // Disable the Finish Button to Prevent Multiple Submissions
    finishBtn.disabled = true;

    fetch(googleSheetUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString() // Convert to proper form encoding
    })
    .then(response => response.text())
    .then(result => {
        console.log('Success:', result);
        finishBtn.disabled = false; // Re-enable after successful submission

        // Show the email sign-up form after quiz submission
        document.querySelector('.navigation').style.display = "none"; // Hide all navigation buttons
        questions[currentQuestionIndex].style.display = "none"; // Hide quiz
        emailSignup.style.display = "block"; // Show email sign-up

    });
}

function checkAnswer(button, userAnswer) {
    const correctAnswer = '~141 Kg';  // Set the correct answer here
    const feedbackMessage = document.getElementById("feedbackMessage");
    const buttons = button.parentElement.querySelectorAll(".answer-btn");

    // Disable all buttons after selection
    buttons.forEach(btn => {
        btn.disabled = true;
    });

    // Check if the selected answer is correct
    if (userAnswer === correctAnswer) {
        // If the selected answer is correct
        button.style.backgroundColor = "green";  // Turn selected button green
        feedbackMessage.textContent = "Correct!";
        feedbackMessage.style.color = "white";
    } else {
        // If the selected answer is incorrect
        button.style.backgroundColor = "red";  // Turn selected button red
        feedbackMessage.textContent = `Incorrect! The correct answer is ${correctAnswer}.`;
        feedbackMessage.style.color = "white";
        
        // Highlight the correct answer in green
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.style.backgroundColor = "green";
            }
        });
    }
}

// Function to display only the current question
function showQuestion(index) {
    questions.forEach((question, idx) => {
        question.classList.toggle('active', idx === index);
    });
}

// Display the first question (intro or other)
showQuestion(currentQuestionIndex);

// Handle "Next" button for all questions
document.querySelectorAll('.navigation #nextBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const currentQuestion = questions[currentQuestionIndex];
        const feedbackMessage = currentQuestion.querySelector('.feedbackMessage');
        
        // If current question is "intro", skip answer requirement
        if (currentQuestion.id === "intro") {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
            return;
        }

        // Check if an answer has been selected
        const selectedAnswer = currentQuestion.querySelector('.answer-btn.selected');
        
        if (selectedAnswer) {
            // Clear feedback and advance if answered
            feedbackMessage.textContent = "";
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        } else {
            // Show feedback and shake if no answer is selected
            feedbackMessage.textContent = "Por favor faça uma seleção antes de proseguir.";
            feedbackMessage.style.color = "red";
            currentQuestion.classList.add('shake');

            // Remove shake animation after a short delay
            setTimeout(() => {
                currentQuestion.classList.remove('shake');
            }, 300);
        }
    });
});

// Add event listeners for selecting an answer
document.querySelectorAll('.answer-btn').forEach(button => {
    button.addEventListener('click', () => {
        const question = button.closest('.question');
        const feedbackMessage = question.querySelector('.feedbackMessage');
        
        // Clear feedback message when an answer is selected
        feedbackMessage.textContent = "";
        
        // Mark the selected answer and remove the selection from others
        question.querySelectorAll('.answer-btn').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    });
});

// Function to scroll by a minimal amount to trigger address bar collapse
function hideAddressBar() {
    window.scrollTo(0, 1);
}

// Run the function on load to hide the address bar
window.addEventListener('load', hideAddressBar);

// Calculate the viewport height and set the CSS variable
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Check if the questionnaire has already been completed (in any language)
function checkIfCompleted() {
    const completed = localStorage.getItem('questionnaireCompleted');
    if (completed) {
        document.body.innerHTML = `
            <div class="completion-message">
                <h2>Obrigado!</h2>
                <p>Você já completou este questionário em Português ou Inglês. <br>Agradeço a sua participação!</p>
            </div>`;
        return true;
    }
    return false;
}

// Mark questionnaire as completed and store it in localStorage (applies to both languages)
function markAsCompleted() {
    localStorage.setItem('questionnaireCompleted', 'true');
}

// Modify the finish button event to include the localStorage logic
finishBtn.addEventListener('click', () => {
    markAsCompleted();  // Store completion status
    submitQuiz();       // Call the existing quiz submission function
});

// Initialize the questionnaire only if it hasn't been completed
if (!checkIfCompleted()) {
    showQuestion(currentQuestionIndex);  // Start questionnaire
}


// Initial calculation
setViewportHeight();

// Recalculate on resize (when the address bar shows/hides)
window.addEventListener('resize', setViewportHeight);

function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Calculate on load and on resize
window.addEventListener('load', setViewportHeight);
window.addEventListener('resize', setViewportHeight);

function showThankYouPage() {
    emailSignup.style.display = "none";
    thankYouPage.style.display = "block";
}

// Modify the finish button click to call submitQuiz
finishBtn.addEventListener('click', submitQuiz);

// Subscribe button handler to send only the email address
subscribeBtn.addEventListener('click', subscribeNewsletter);