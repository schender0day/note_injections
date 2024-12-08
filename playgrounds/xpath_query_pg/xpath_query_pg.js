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

// Parse XML
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(sampleXML, "text/xml");

// Display original XML
document.getElementById('original').textContent = sampleXML;

// Function to explain XPath structure
function explainXPathStructure(xpath) {
    let explanation = '';
    
    if (xpath.includes(' | ')) {
        const parts = xpath.split(' | ');
        parts.forEach((part, index) => {
            explanation += `Part ${index + 1}:\n${explainXPathPart(part)}\n`;
            if (index < parts.length - 1) {
                explanation += '<span class="query-part">|</span> Union operator\n';
            }
        });
        return explanation;
    }
    
    return explainXPathPart(xpath);
}

function explainXPathPart(xpath) {
    let explanation = '';
    
    if (xpath.startsWith('//')) {
        explanation += '<span class="query-part">//</span> Search anywhere in the document\n';
    }

    const parts = xpath.replace(/^\/\//, '').split('/');
    parts.forEach((part, index) => {
        if (part.includes('[')) {
            const [element, condition] = part.split('[');
            explanation += `<span class="query-part">${element}</span> Element name\n`;
            explanation += `<span class="query-part">[${condition}</span> Condition/Filter\n`;
        } else if (part === '..') {
            explanation += `<span class="query-part">..</span> Parent element\n`;
        } else if (part === 'text()') {
            explanation += `<span class="query-part">text()</span> Text content\n`;
        } else {
            explanation += `<span class="query-part">${part}</span> Element name\n`;
        }
    });

    return explanation;
}

// Function to serialize XML node to string
function serializeXMLNodes(nodes) {
    let result = '';
    nodes.forEach(node => {
        const serializer = new XMLSerializer();
        result += serializer.serializeToString(node) + '\n';
    });
    return result;
}

// Function to execute XPath query and update UI
function executeQuery(xpath) {
    const errorMessage = document.getElementById('error-message');
    try {
        const result = document.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null);
        
        let nodes = [];
        let node = result.iterateNext();
        while (node) {
            nodes.push(node);
            node = result.iterateNext();
        }

        document.getElementById('actual-query').textContent = xpath;
        document.getElementById('query-structure').innerHTML = explainXPathStructure(xpath);
        document.getElementById('result').textContent = serializeXMLNodes(nodes);
        
        errorMessage.style.display = 'none';
    } catch (error) {
        errorMessage.textContent = `Error: ${error.message}`;
        errorMessage.style.display = 'block';
        document.getElementById('result').textContent = '';
    }
}

// Add click handlers to preset query buttons
document.querySelectorAll('.query-button').forEach(button => {
    button.addEventListener('click', () => {
        const xpath = button.dataset.xpath;
        executeQuery(xpath);
    });
});

// Add click handler to custom query execute button
document.getElementById('execute-query').addEventListener('click', () => {
    const xpath = document.getElementById('custom-xpath').value.trim();
    if (xpath) {
        executeQuery(xpath);
    }
});

// Add enter key handler to textarea
document.getElementById('custom-xpath').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault();
        const xpath = event.target.value.trim();
        if (xpath) {
            executeQuery(xpath);
        }
    }
});
