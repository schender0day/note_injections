const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<root>
    <bookstore>
        <book category="web">
            <title>Learning XML</title>
            <author>Erik T. Ray</author>
            <year>2003</year>
            <price>39.95</price>
        </book>
        <book category="fiction">
            <title>Snow Crash</title>
            <author>Neal Stephenson</author>
            <year>1992</year>
            <price>49.99</price>
        </book>
        <book category="web">
            <title>XPath Essentials</title>
            <author>David Hunter</author>
            <year>2010</year>
            <price>29.99</price>
        </book>
        <book category="fiction">
            <title>Cryptonomicon</title>
            <author>Neal Stephenson</author>
            <year>1999</year>
            <price>23.99</price>
        </book>
    </bookstore>
    <modules>
        <module>
            <tier>1</tier>
            <title>Introduction to Web</title>
            <description>Basic web concepts</description>
        </module>
        <module>
            <tier>2</tier>
            <title>Advanced JavaScript</title>
            <description>Deep dive into JS</description>
        </module>
        <module>
            <tier>2</tier>
            <title>React Fundamentals</title>
            <description>React basics</description>
        </module>
        <module>
            <tier>3</tier>
            <title>System Architecture</title>
            <description>Advanced system design</description>
        </module>
        <module>
            <tier>3</tier>
            <title>Security Principles</title>
            <description>Core security concepts</description>
        </module>
    </modules>
</root>`;

const questions = [
    {
        question: "Select all book elements",
        answer: "//book",
        hint: "Use // to select elements anywhere in the document"
    },
    {
        question: "Find all books in the 'web' category",
        answer: "//book[@category='web']",
        hint: "Use [@attribute='value'] to filter by attribute"
    },
    {
        question: "Find all books with price over $30",
        answer: "//book[price>30]",
        hint: "Use [condition] to filter elements"
    },
    {
        question: "Find all books by Neal Stephenson",
        answer: "//book[author='Neal Stephenson']",
        hint: "Use element comparison in predicates"
    },
    {
        question: "Select the first book element",
        answer: "//book[1]",
        hint: "Use [1] to select the first element"
    },
    {
        question: "Select all book titles",
        answer: "//book/title",
        hint: "Use / to select child elements"
    },
    {
        question: "Find books with 'XML' in the title",
        answer: "//book[contains(title,'XML')]",
        hint: "Use contains() function for partial text matching"
    },
    {
        question: "Get titles of Neal Stephenson books",
        answer: "//book[author='Neal Stephenson']/title",
        hint: "Combine predicates with child selection"
    },
    {
        question: "Get titles of tier 2 and 3 modules",
        answer: "//module[tier=2]/title | //module[tier=3]/title",
        hint: "Use | to combine multiple queries"
    },
    {
        question: "Find books with 'XML' or 'XPath' in title",
        answer: "//book[contains(title,'XML') or contains(title,'XPath')]",
        hint: "Use 'or' to combine conditions"
    },
    {
        question: "Find modules starting with 'Advanced'",
        answer: "//module[starts-with(title,'Advanced')]",
        hint: "Use starts-with() for prefix matching"
    },
    {
        question: "Find books with titles longer than 15 characters",
        answer: "//book[string-length(title)>15]",
        hint: "Use string-length() to check text length"
    },
    {
        question: "Find books priced between $30-$40",
        answer: "//book[price>=30 and price<=40]",
        hint: "Use 'and' to combine numeric comparisons"
    },
    {
        question: "Find books published in or after 2000",
        answer: "//book[year>=2000]",
        hint: "Use numeric comparison for dates"
    },
    {
        question: "Find all non-beginner modules (tier not 1)",
        answer: "//module[tier!=1]",
        hint: "Use != for not equal comparison"
    },
    {
        question: "Find web category books under $35",
        answer: "//book[@category='web' and price<35]",
        hint: "Combine attribute and element conditions"
    },
    {
        question: "Find the last book in the bookstore",
        answer: "//book[last()]",
        hint: "Use last() function to select last element"
    },
    {
        question: "Select first two books",
        answer: "//book[position()<=2]",
        hint: "Use position() function for index-based selection"
    },
    {
        question: "Find all child elements of books",
        answer: "//book/*",
        hint: "Use * wildcard to select all children"
    },
    {
        question: "Count total number of books",
        answer: "count(//book)",
        hint: "Use count() function to count elements"
    }
];

let currentQuestion = 0;
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(sampleXML, "text/xml");

// Display original XML
document.getElementById('original').textContent = sampleXML;

function displayQuestion() {
    const question = questions[currentQuestion];
    document.getElementById('question-number').textContent = currentQuestion + 1;
    document.getElementById('total-questions').textContent = questions.length;
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('xpath-input').value = '';
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('query-result').textContent = '';
    
    // Update navigation buttons
    document.getElementById('prev-button').disabled = currentQuestion === 0;
    document.getElementById('next-button').disabled = currentQuestion === questions.length - 1;
}

function showAnswer() {
    const answer = questions[currentQuestion].answer;
    document.getElementById('xpath-input').value = answer;
    evaluateXPath(answer);
}

function evaluateXPath(xpath) {
    try {
        const result = document.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null);
        let node;
        let output = '';
        let count = 0;

        if (xpath.startsWith('count(')) {
            output = result.numberValue;
        } else {
            while (node = result.iterateNext()) {
                output += (count > 0 ? '\n' : '') + node.outerHTML || node.textContent;
                count++;
            }
        }

        document.getElementById('query-result').textContent = output || 'No results found';
    } catch (error) {
        document.getElementById('query-result').textContent = 'Error evaluating XPath: ' + error.message;
    }
}

function checkAnswer() {
    const userXPath = document.getElementById('xpath-input').value.trim();
    const correctXPath = questions[currentQuestion].answer;
    const feedback = document.getElementById('feedback');
    
    try {
        // Get user's result
        const userResult = document.evaluate(userXPath, xmlDoc, null, XPathResult.ANY_TYPE, null);
        const correctResult = document.evaluate(correctXPath, xmlDoc, null, XPathResult.ANY_TYPE, null);
        
        // Convert results to arrays for comparison
        const userNodes = [];
        const correctNodes = [];
        let node;
        
        while (node = userResult.iterateNext()) userNodes.push(node);
        while (node = correctResult.iterateNext()) correctNodes.push(node);

        // Compare results
        const correct = userNodes.length === correctNodes.length &&
                      userNodes.every((node, i) => node.isEqualNode(correctNodes[i]));

        feedback.className = correct ? 'feedback success' : 'feedback error';
        feedback.textContent = correct ? 
            'Correct! Well done!' :
            'Not quite right. Try again! Hint: ' + questions[currentQuestion].hint;
        feedback.style.display = 'block';

        if (correct) {
            document.getElementById('next-button').disabled = false;
        }

        // Show query results
        evaluateXPath(userXPath);
    } catch (error) {
        feedback.className = 'feedback error';
        feedback.textContent = 'Invalid XPath syntax. Try again! Hint: ' + questions[currentQuestion].hint;
        feedback.style.display = 'block';
        document.getElementById('query-result').textContent = 'Error: Invalid XPath syntax';
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        displayQuestion();
    }
}

// Initialize first question
displayQuestion();
