// XML data store
const xmlData = `
<users>
    <user>
        <name first="Kaylie" last="Grenvile"/>
        <id>1</id>
        <username>kgrenvile</username>
        <password>8a24367a1f46c141048752f2d5bbd14b</password>
    </user>
    <user>
        <name first="Admin" last="Admin"/>
        <id>2</id>
        <username>obfuscatedadminuser</username>
        <password>21232f297a57a5a743894a0e4a801fc3</password>
    </user>
    <user>
        <name first="Academy" last="Student"/>
        <id>3</id>
        <username>htb-stdnt</username>
        <password>295362c2618a05ba3899904a6a3f5bc0</password>
    </user>
</users>
`;

// Parse XML
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlData, "text/xml");

// Challenge tracking
let currentChallenge = 'challenge1';
const challengeProgress = {
    challenge1: false,
    challenge2: false,
    challenge3: false
};

// Function to switch between challenges
function switchTab(challengeId) {
    // Hide all challenges
    document.querySelectorAll('.challenge').forEach(challenge => {
        challenge.classList.remove('active');
    });
    
    // Show selected challenge
    document.getElementById(challengeId).classList.add('active');
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[onclick="switchTab('${challengeId}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    currentChallenge = challengeId;
    
    // Reset forms
    document.querySelectorAll('.login-form input').forEach(input => {
        input.value = '';
    });
    document.querySelectorAll('#login-result, #login-result-blind').forEach(div => {
        div.textContent = '';
        div.className = '';
    });
}

// Function to show hints
function showHint(hintId) {
    const hintElement = document.getElementById(hintId);
    if (hintElement) {
        hintElement.classList.toggle('hidden');
    }
}

// Function to update progress
function updateProgress(challengeId) {
    if (challengeProgress[challengeId]) {
        const progressItem = document.querySelector(`.progress-item:nth-child(${parseInt(challengeId.slice(-1))})`);
        if (progressItem) {
            const status = progressItem.querySelector('.status');
            status.classList.remove('incomplete');
            status.classList.add('complete');
        }
    }
}

// Function to update XPath query display
function updateXPathDisplay(username, password) {
    const queryDisplay = document.getElementById('xpath-display');
    if (!queryDisplay) return;

    let query = '';
    switch (currentChallenge) {
        case 'challenge1':
            query = `/users/user[username/text()='${username}' and password/text()='${password}']`;
            break;
        case 'challenge2':
            query = `/users/user[username/text()='${username}' and password/text()='${password}' and name/@first='Admin']`;
            break;
        case 'challenge3':
            query = `boolean(/users/user[username/text()='${username}' and password/text()='${password}'])`;
            break;
    }
    queryDisplay.textContent = query;
}

// Function to execute XPath query
function executeXPathQuery(username, password) {
    try {
        let query = '';
        switch (currentChallenge) {
            case 'challenge1':
                query = `/users/user[username/text()='${username}' and password/text()='${password}']`;
                break;
            case 'challenge2':
                query = `/users/user[username/text()='${username}' and password/text()='${password}' and name/@first='Admin']`;
                break;
            case 'challenge3':
                query = `/users/user[username/text()='${username}' and password/text()='${password}']`;
                break;
        }

        const evaluator = new XPathEvaluator();
        const result = evaluator.evaluate(query, xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        
        return {
            success: result.snapshotLength > 0,
            matchCount: result.snapshotLength,
            error: null
        };
    } catch (error) {
        return {
            success: false,
            matchCount: 0,
            error: error.message
        };
    }
}

// Function to check challenge completion
function checkChallengeCompletion(result, username) {
    switch (currentChallenge) {
        case 'challenge1':
            // Basic bypass - any successful login
            if (result.success && result.matchCount > 0) {
                challengeProgress.challenge1 = true;
            }
            break;
        case 'challenge2':
            // Admin access - must access admin account
            if (result.success && username.toLowerCase().includes('admin')) {
                challengeProgress.challenge2 = true;
            }
            break;
        case 'challenge3':
            // Blind injection - must extract admin password
            if (result.success && username === 'obfuscatedadminuser') {
                challengeProgress.challenge3 = true;
            }
            break;
    }
    updateProgress(currentChallenge);
}

// Function to handle authentication
function authenticate() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const resultDiv = document.getElementById('login-result');
    
    // Update XPath query display
    updateXPathDisplay(username, password);
    
    // Execute query
    const result = executeXPathQuery(username, password);
    
    if (result.error) {
        resultDiv.className = 'error';
        resultDiv.textContent = `Error: ${result.error}`;
        return;
    }
    
    if (result.success) {
        resultDiv.className = 'success';
        let message = `Authentication successful! Found ${result.matchCount} matching user(s).`;
        
        // Check for challenge completion
        checkChallengeCompletion(result, username);
        
        if (challengeProgress[currentChallenge]) {
            message += ' Challenge completed! 🎉';
        }
        
        resultDiv.textContent = message;
    } else {
        resultDiv.className = 'error';
        resultDiv.textContent = 'Authentication failed. Invalid username or password.';
    }
}

// Function to handle blind authentication (Challenge 3)
function authenticateBlind() {
    const username = document.getElementById('username-blind').value;
    const password = document.getElementById('password-blind').value;
    const resultDiv = document.getElementById('login-result-blind');
    
    // Execute query
    const result = executeXPathQuery(username, password);
    
    // Only show success/failure
    resultDiv.className = result.success ? 'success' : 'error';
    resultDiv.textContent = result.success ? 'Login successful' : 'Login failed';
    
    // Check for challenge completion
    if (result.success) {
        checkChallengeCompletion(result, username);
    }
}

// Function to highlight XML syntax
function highlightXML() {
    const xmlContent = document.getElementById('xml-content');
    if (!xmlContent) return;

    let highlighted = xmlContent.textContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(".*?")/g, '<span style="color: #ce9178;">$1</span>')
        .replace(/(&lt;\/?[a-z]+&gt;)/g, '<span style="color: #569cd6;">$1</span>');
    
    xmlContent.innerHTML = highlighted;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    highlightXML();
    
    // Add input event listeners to update query display
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput && passwordInput) {
        usernameInput.addEventListener('input', (e) => {
            updateXPathDisplay(e.target.value, passwordInput.value);
        });
        
        passwordInput.addEventListener('input', (e) => {
            updateXPathDisplay(usernameInput.value, e.target.value);
        });
    }
    
    // Initial query display
    updateXPathDisplay('username', 'password');
});
