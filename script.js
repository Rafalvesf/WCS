let currentQuestionIndex = 0;
const questions = document.querySelectorAll('.question');
const nextBtns = document.querySelectorAll('#nextBtn');  // Selecting all next buttons
const prevBtn = document.querySelectorAll('#prevBtn');  // Selecting all next buttons
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
    // Event listeners for "Next" buttons
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        }
    });
});
    prevBtn.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                showQuestion(currentQuestionIndex);
            }
        });
});

finishBtn.addEventListener('click', () => {
    // Hide questions and show email sign-up
    document.querySelector('.navigation').style.display = "none";
    questions[currentQuestion].style.display = "none";
    emailSignup.style.display = "block";
    btn.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        }
    });
});

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
        alert('Quiz completed and data sent to Google Sheets!');
        finishBtn.disabled = false; // Re-enable after successful submission

        // Show the email sign-up form after quiz submission
        document.querySelector('.navigation').style.display = "none"; // Hide all navigation buttons
        questions[currentQuestionIndex].style.display = "none"; // Hide quiz
        emailSignup.style.display = "block"; // Show email sign-up
    });
}

// Function to send only the email address for newsletter subscription to Google Sheets
function subscribeNewsletter() {
    const email = newsletterEmail.value.trim();

    if (email) {
        // Disable the Subscribe Button to Prevent Multiple Submissions
        subscribeBtn.disabled = true;

        const formData = new URLSearchParams();
        formData.append("newsletterEmail", email); // Add email to formData

        fetch(googleSheetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString() // Convert to proper form encoding
        })
        .then(response => response.text())
        .then(result => {
            console.log('Newsletter Success:', result);
            alert('Thank you for subscribing to our newsletter!');
            subscribeBtn.disabled = false; // Re-enable after successful submission
            showThankYouPage(); // Show the thank you page
        });
    } else {
        alert("Please enter a valid email.");
    }
}

// Modify the finish button click to call submitQuiz
finishBtn.addEventListener('click', submitQuiz);

// Subscribe button handler to send only the email address
subscribeBtn.addEventListener('click', subscribeNewsletter);

// Close button handler to skip email sign-up and go to the thank you page
closeSignup.addEventListener('click', showThankYouPage);

// Function to show the thank you page
function showThankYouPage() {
    emailSignup.style.display = "none";
    thankYouPage.style.display = "block";
}