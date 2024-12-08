document.addEventListener('DOMContentLoaded', function() {
    // Load XML data
    let xmlDoc = null;
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<database>
    <streets>
        <street>
            <streetname>MARKET</streetname>
            <fullstreetname>MARKET STREET</fullstreetname>
        </street>
        <street>
            <streetname>BARCELONA</streetname>
            <fullstreetname>BARCELONA AVENUE</fullstreetname>
        </street>
        <street>
            <streetname>MISSION</streetname>
            <fullstreetname>MISSION STREET</fullstreetname>
        </street>
        <street>
            <streetname>VALENCIA</streetname>
            <fullstreetname>VALENCIA STREET</fullstreetname>
        </street>
    </streets>
    <users>
        <user>
            <username>admin</username>
            <password>admin123</password>
            <role>administrator</role>
        </user>
        <user>
            <username>john</username>
            <password>password123</password>
            <role>user</role>
        </user>
        <user>
            <username>alice</username>
            <password>secret456</password>
            <role>user</role>
        </user>
    </users>
</database>`;

    const parser = new DOMParser();
    xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const form = document.getElementById('streetSearchForm');
    const resultsDiv = document.getElementById('results');
    const lastRequestDiv = document.getElementById('lastRequest');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const searchQuery = document.getElementById('searchQuery').value;
        const displayField = document.querySelector('input[name="f"]:checked').value;

        // Display the request
        const requestInfo = `GET /?q=${encodeURIComponent(searchQuery)}&f=${displayField} HTTP/1.1
Host: localhost
User-Agent: Mozilla/5.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Connection: keep-alive`;

        lastRequestDiv.textContent = requestInfo;

        try {
            // Construct and execute XPath query
            let xpathQuery;
            
            // Check if the query contains potential injection
            if (searchQuery.includes("|")) {
                // Handle injection attempts that try to retrieve all data
                const parts = searchQuery.split("|");
                const mainQuery = parts[0].trim();
                const injectedQuery = parts[1].trim();
                
                // Execute the injected query
                xpathQuery = injectedQuery;
            } else {
                // Normal query
                xpathQuery = `/database/streets/street[contains(text(), '${searchQuery}')]/${displayField}`;
            }

            const result = evaluateXPath(xmlDoc, xpathQuery);
            displayResults(result);
        } catch (error) {
            resultsDiv.textContent = `Error: ${error.message}`;
        }
    });

    function evaluateXPath(xmlDoc, xpath) {
        try {
            const evaluator = new XPathEvaluator();
            const expression = evaluator.createExpression(xpath);
            const result = expression.evaluate(
                xmlDoc,
                XPathResult.ANY_TYPE,
                null
            );

            let nodes = [];
            let node;
            switch (result.resultType) {
                case XPathResult.STRING_TYPE:
                    return [result.stringValue];
                case XPathResult.NUMBER_TYPE:
                    return [result.numberValue];
                case XPathResult.BOOLEAN_TYPE:
                    return [result.booleanValue];
                case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
                case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
                    while ((node = result.iterateNext())) {
                        nodes.push(node.textContent);
                    }
                    return nodes;
                default:
                    return [];
            }
        } catch (error) {
            throw new Error(`XPath evaluation failed: ${error.message}`);
        }
    }

    function displayResults(results) {
        if (results.length === 0) {
            resultsDiv.textContent = "No results found.";
            return;
        }

        resultsDiv.textContent = results.join('\n');
    }
});
