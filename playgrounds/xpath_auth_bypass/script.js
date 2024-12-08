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

// Function to update XPath query display
function updateXPathDisplay(username, password) {
    const queryDisplay = document.getElementById('xpath-display');
    queryDisplay.textContent = `/users/user[username/text()='${username}' and password/text()='${password}']`;
}

// Function to simulate XPath query execution
function executeXPathQuery(username, password) {
    try {
        // Create an XPath expression
        const query = `/users/user[username/text()='${username}' and password/text()='${password}']`;
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
        resultDiv.textContent = `Authentication successful! Found ${result.matchCount} matching user(s).`;
    } else {
        resultDiv.className = 'error';
        resultDiv.textContent = 'Authentication failed. Invalid username or password.';
    }
}

// Function to set payload from examples
function setPayload(element) {
    const payload = element.querySelector('code').textContent;
    document.getElementById('username').value = payload;
    document.getElementById('password').value = payload;
    
    // Update XPath query display with the payload
    updateXPathDisplay(payload, payload);
}

// Function to highlight XML syntax
function highlightXML() {
    const xmlContent = document.getElementById('xml-content');
    let highlighted = xmlContent.textContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(".*?")/g, '<span style="color: #e74c3c;">$1</span>')
        .replace(/(&lt;\/?[a-z]+&gt;)/g, '<span style="color: #2980b9;">$1</span>');
    
    xmlContent.innerHTML = highlighted;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    highlightXML();
    
    // Add input event listeners to update query display
    document.getElementById('username').addEventListener('input', (e) => {
        updateXPathDisplay(e.target.value, document.getElementById('password').value);
    });
    
    document.getElementById('password').addEventListener('input', (e) => {
        updateXPathDisplay(document.getElementById('username').value, e.target.value);
    });
    
    // Initial query display
    updateXPathDisplay('username', 'password');
});
