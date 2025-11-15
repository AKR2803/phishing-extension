// Phishing Quiz Data - Full Question Bank
const allQuizData = [
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
    },
    {
        email: `Subject: Password reset request
From: noreply@payp4l-security.com
To: user@email.com

We received a request to reset your PayPal password.
Reset now: https://payp4l-security.com/reset

If you didn't request this, your account may be compromised.`,
        isPhishing: true,
        explanation: "This is PHISHING. Red flags: fake domain 'payp4l-security.com' (uses '4' instead of 'a'), creates fear about account compromise."
    },
    {
        email: `Subject: Team lunch tomorrow
From: hr@company.com
To: all-staff@company.com

Hi everyone,

Don't forget about our team lunch tomorrow at 12:30 PM at Mario's Restaurant.

Please confirm your attendance by replying to this email.

Thanks,
HR Team`,
        isPhishing: false,
        explanation: "This is LEGITIMATE. Official company domain, normal HR communication, reasonable request for RSVP."
    },
    {
        email: `Subject: Your Netflix subscription expires today
From: billing@netfl1x-support.net
To: customer@email.com

Your Netflix subscription will expire in 2 hours.
Update payment: http://netfl1x-support.net/billing

Failure to update will result in service termination.`,
        isPhishing: true,
        explanation: "This is PHISHING. Red flags: fake domain 'netfl1x-support.net' (uses '1' instead of 'i'), creates urgency, threatens service termination."
    },
    {
        email: `Subject: Course registration reminder
From: registrar@university.edu
To: students@university.edu

Dear Students,

This is a reminder that course registration for Spring semester begins Monday, November 20th at 8:00 AM.

Please log into the student portal to register for your classes.

Registrar's Office`,
        isPhishing: false,
        explanation: "This is LEGITIMATE. Official university domain, normal academic communication, directs to official student portal."
    },
    {
        email: `Subject: Security Alert: Unusual Activity
From: security@amaz0n-alerts.com
To: customer@email.com

We detected unusual activity on your Amazon account.
Secure your account: https://amaz0n-alerts.com/secure

Click within 1 hour or your account will be suspended.`,
        isPhishing: true,
        explanation: "This is PHISHING. Red flags: fake domain 'amaz0n-alerts.com' (uses '0' instead of 'o'), creates urgency with 1-hour deadline."
    },
    {
        email: `Subject: Invoice #12345 - Payment Due
From: accounting@supplier.com
To: finance@company.com

Dear Finance Team,

Please find attached invoice #12345 for services rendered in October.
Payment terms: Net 30 days

Thank you,
Accounting Department`,
        isPhishing: false,
        explanation: "This is LEGITIMATE. Business-to-business communication, normal invoice process, reasonable payment terms."
    },
    {
        email: `Subject: IRS Tax Refund - Action Required
From: refunds@irs-gov-refunds.org
To: taxpayer@email.com

You are eligible for a $2,847 tax refund.
Claim now: http://irs-gov-refunds.org/claim

Provide your SSN and bank details to process immediately.`,
        isPhishing: true,
        explanation: "This is PHISHING. Red flags: fake IRS domain, requests SSN and bank details, too-good-to-be-true refund amount."
    },
    {
        email: `Subject: Welcome to the team!
From: manager@company.com
To: newemployee@company.com

Hi John,

Welcome to the team! Your first day is Monday, December 4th at 9:00 AM.

Please report to HR on the 3rd floor for orientation.

Looking forward to working with you!
Sarah`,
        isPhishing: false,
        explanation: "This is LEGITIMATE. Official company domain, normal onboarding communication, specific details about first day."
    },
    {
        email: `Subject: Microsoft Office License Expired
From: licensing@micr0soft-renewal.net
To: user@email.com

Your Microsoft Office license has expired.
Renew immediately: https://micr0soft-renewal.net/renew

Enter your credit card details to continue using Office.`,
        isPhishing: true,
        explanation: "This is PHISHING. Red flags: fake domain 'micr0soft-renewal.net' (uses '0' instead of 'o'), requests credit card details."
    },
    {
        email: `Subject: Quarterly report ready for review
From: analyst@company.com
To: executives@company.com

Dear Executive Team,

The Q3 quarterly report is now available for your review in the shared drive.

Please let me know if you have any questions.

Best regards,
Data Analytics Team`,
        isPhishing: false,
        explanation: "This is LEGITIMATE. Internal company communication, references shared drive, professional tone."
    },
    {
        email: `Subject: Apple ID Suspended - Verify Now
From: security@apple-id-verification.org
To: user@email.com

Your Apple ID has been suspended due to suspicious activity.
Verify identity: https://apple-id-verification.org/verify

Provide your Apple ID password and credit card info to restore access.`,
        isPhishing: true,
        explanation: "This is PHISHING. Red flags: fake Apple domain, requests password and credit card info, creates fear about suspension."
    },
    {
        email: `Subject: Holiday party invitation
From: events@company.com
To: all-employees@company.com

Dear Team,

You're invited to our annual holiday party on December 15th at 6:00 PM.
Location: Grand Ballroom, Downtown Hotel

Please RSVP by December 10th.

Event Planning Committee`,
        isPhishing: false,
        explanation: "This is LEGITIMATE. Official company domain, normal event invitation, reasonable RSVP deadline."
    },
    {
        email: `Subject: Bank Account Verification Required
From: security@chase-bank-alerts.net
To: customer@email.com

Dear Valued Customer,

We need to verify your account information immediately.
Verify here: https://chase-bank-alerts.net/verify

Provide your account number, SSN, and PIN to avoid account closure.`,
        isPhishing: true,
        explanation: "This is PHISHING. Red flags: fake bank domain, requests sensitive info (account number, SSN, PIN), threatens account closure."
    },
    {
        email: `Subject: Software update available
From: it@company.com
To: all-users@company.com

Dear Users,

A critical security update is available for your work computer.
Please install the update during your next restart.

Contact IT if you need assistance.

IT Department`,
        isPhishing: false,
        explanation: "This is LEGITIMATE. Official company IT communication, normal software update notice, offers support contact."
    },
    {
        email: `Subject: Facebook Account Hacked - Secure Now
From: alerts@facebook-security-team.org
To: user@email.com

Your Facebook account has been hacked!
Secure account: https://facebook-security-team.org/secure

Change your password immediately or lose your account forever.`,
        isPhishing: true,
        explanation: "This is PHISHING. Red flags: fake Facebook domain, creates panic about hacking, threatens permanent account loss."
    },
    {
        email: `Subject: Prescription ready for pickup
From: pharmacy@cvs.com
To: customer@email.com

Dear Customer,

Your prescription for John Smith is ready for pickup at CVS Pharmacy.
Store: 123 Main Street
Phone: (555) 123-4567

Pharmacy hours: 9 AM - 9 PM

CVS Pharmacy`,
        isPhishing: false,
        explanation: "This is LEGITIMATE. Official CVS domain, normal pharmacy notification, includes store details and contact info."
    },
    {
        email: `Subject: Google Drive Storage Full - Upgrade Now
From: storage@g00gle-drive-alerts.com
To: user@email.com

Your Google Drive storage is 99% full.
Upgrade storage: https://g00gle-drive-alerts.com/upgrade

Enter payment details to avoid losing your files.`,
        isPhishing: true,
        explanation: "This is PHISHING. Red flags: fake Google domain 'g00gle-drive-alerts.com' (uses '00' instead of 'oo'), threatens file loss."
    },
    {
        email: `Subject: Conference call rescheduled
From: assistant@company.com
To: team@company.com

Hi Team,

The client conference call scheduled for 3 PM today has been moved to 4 PM.
Dial-in details remain the same.

Thanks,
Executive Assistant`,
        isPhishing: false,
        explanation: "This is LEGITIMATE. Official company domain, normal scheduling communication, provides clear information about changes."
    },
    {
        email: `Subject: WhatsApp Verification Code: 123456
From: verify@whatsapp-security.net
To: user@email.com

Your WhatsApp verification code is: 123456
Don't share this code with anyone.

If you didn't request this, click here: https://whatsapp-security.net/report`,
        isPhishing: true,
        explanation: "This is PHISHING. Red flags: fake WhatsApp domain, real WhatsApp never sends verification codes via email, suspicious reporting link."
    },
    {
        email: `Subject: Expense report approved
From: finance@company.com
To: employee@company.com

Dear Employee,

Your expense report #ER-2024-156 has been approved for $247.83.
Reimbursement will appear in your next paycheck.

Finance Department`,
        isPhishing: false,
        explanation: "This is LEGITIMATE. Official company domain, normal expense report process, specific report number and amount."
    }
];

// Selected quiz data (will be populated with random questions)
let quizData = [];

let currentQuestion = 0;
let score = 0;
let answered = false;

// Function to randomly select 10 questions
function selectRandomQuestions() {
    const shuffled = [...allQuizData].sort(() => 0.5 - Math.random());
    quizData = shuffled.slice(0, 10);
}

// Initialize event listeners when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('restartQuizBtn').addEventListener('click', restartQuiz);
    
    // Add click listeners to options
    document.addEventListener('click', function(e) {
        if (e.target.closest('.option')) {
            const option = e.target.closest('.option');
            const answer = option.getAttribute('data-answer') === 'true';
            selectAnswer(answer);
        }
    });
});

function startQuiz() {
    selectRandomQuestions(); // Select random questions
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
    quizData = []; // Clear previous questions
    
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}