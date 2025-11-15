// Phishing Quiz Data
const quizData = [
    {
        email: `Subject: URGENT: Verify your account immediately
From: security@gmail-security-team.com
To: user@gmail.com

Your Gmail account has been compromised. Click here to verify:
https://gmail-security-team.com/verify-account

Failure to verify within 24 hours will result in permanent suspension.`,
        isPhishing: true,
        explanation: "This is PHISHING. Red flags: fake domain 'gmail-security-team.com', urgent threats, suspicious link, and Google never sends emails like this."
    },
    {
        email: `Subject: Meeting reminder - Project Review
From: manager@company.com
To: team@company.com

Hi team,

Just a reminder about our project review meeting tomorrow at 2 PM in Conference Room A.

Please bring your progress reports.

Best regards,
Sarah`,
        isPhishing: false,
        explanation: "This is LEGITIMATE. It's from a company domain, has normal business content, no suspicious links, and reasonable tone."
    },
    {
        email: `Subject: Your package delivery failed
From: delivery@fedx-delivery.net
To: customer@email.com

We attempted to deliver your package but failed. 
Reschedule delivery: http://fedx-delivery.net/reschedule

Package will be returned if not claimed within 48 hours.`,
        isPhishing: true,
        explanation: "This is PHISHING. Red flags: misspelled domain 'fedx-delivery.net' (should be fedex.com), creates urgency, and suspicious link."
    },
    {
        email: `Subject: Library book renewal confirmation
From: library@university.edu
To: student@university.edu

Dear Student,

Your library books have been successfully renewed until March 15th.

No further action required.

University Library`,
        isPhishing: false,
        explanation: "This is LEGITIMATE. Official university domain, normal library communication, no suspicious requests or links."
    },
    {
        email: `Subject: Congratulations! You've won $1,000,000
From: lottery@mega-winner-2024.org
To: lucky@email.com

You have been selected as our grand prize winner!
Claim your prize: http://mega-winner-2024.org/claim

Send your bank details to process the payment immediately.`,
        isPhishing: true,
        explanation: "This is PHISHING. Classic scam: fake lottery, suspicious domain, requests bank details, and too-good-to-be-true offer."
    }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

function startQuiz() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');
    loadQuestion();
}

function loadQuestion() {
    const question = quizData[currentQuestion];
    document.getElementById('emailContent').textContent = question.email;
    document.getElementById('questionCounter').textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
    
    // Update progress bar
    const progress = ((currentQuestion + 1) / quizData.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Reset options
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('correct', 'incorrect');
        option.style.pointerEvents = 'auto';
    });
    
    // Hide explanation and next button
    document.getElementById('explanation').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    answered = false;
}

function selectAnswer(userAnswer) {
    if (answered) return;
    
    answered = true;
    const question = quizData[currentQuestion];
    const isCorrect = userAnswer === question.isPhishing;
    
    if (isCorrect) {
        score++;
    }
    
    // Show results on options
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.style.pointerEvents = 'none';
        
        // Highlight correct answer
        if ((option.classList.contains('phishing') && question.isPhishing) ||
            (option.classList.contains('legitimate') && !question.isPhishing)) {
            option.classList.add('correct');
        }
        
        // Show user's incorrect choice
        if ((option.classList.contains('phishing') && userAnswer === true && !isCorrect) ||
            (option.classList.contains('legitimate') && userAnswer === false && !isCorrect)) {
            option.classList.add('incorrect');
        }
    });
    
    // Show explanation
    const explanationDiv = document.getElementById('explanation');
    explanationDiv.textContent = question.explanation;
    explanationDiv.className = `explanation ${isCorrect ? 'correct' : 'incorrect'}`;
    explanationDiv.classList.remove('hidden');
    
    // Show next button
    document.getElementById('nextBtn').classList.remove('hidden');
    document.getElementById('nextBtn').textContent = 
        currentQuestion < quizData.length - 1 ? 'Next Question' : 'View Results';
}

function nextQuestion() {
    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
    
    const percentage = Math.round((score / quizData.length) * 100);
    document.getElementById('finalScore').textContent = `${score}/${quizData.length} (${percentage}%)`;
    
    let message = '';
    if (percentage >= 80) {
        message = '🎉 Excellent! You\'re great at spotting phishing emails!';
    } else if (percentage >= 60) {
        message = '👍 Good job! Keep practicing to improve your skills.';
    } else {
        message = '📚 Keep learning! Review phishing indicators and try again.';
    }
    
    document.getElementById('scoreMessage').innerHTML = `<p style="font-size: 18px; color: #2c3e50; margin: 20px 0;">${message}</p>`;
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}