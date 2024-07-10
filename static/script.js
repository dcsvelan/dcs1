async function getDrugClass() {
    const drugName = document.getElementById('drugName').value;

    const response = await fetch('/get_drug_class', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ drug_name: drugName }),
    });
    const data = await response.json();

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';  // Clear previous results

    if (response.ok) {
        const table = document.createElement('table');

        // Create table body
        const tbody = document.createElement('tbody');
        const orderedClassTypes = [
            "Contraindications",
            "Contraindications (MoA)",
            "Contraindications (Effects)",
            "Contraindications (Chem)",
            "Effects",
            "MoA",
            "Drug Class",
            "To Treat"
        ];

        orderedClassTypes.forEach(classType => {
            if (data.classes[classType].length > 0) {
                const row = document.createElement('tr');
                const tdRela = document.createElement('td');
                tdRela.textContent = classType;
                row.appendChild(tdRela);

                const tdClasses = document.createElement('td');
                tdClasses.textContent = data.classes[classType].join(', ');
                row.appendChild(tdClasses);

                tbody.appendChild(row);
            }
        });

        table.appendChild(tbody);
        resultDiv.appendChild(table);

        // Store the result text for TTS and download
        document.getElementById('resultText').value = resultDiv.innerText;
    } else {
        resultDiv.textContent = `Error: ${data.error}`;
    }
}

function downloadResults() {
    const text = document.getElementById('resultText').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drug_class_results.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

async function handleTTS() {
    const text = document.getElementById('resultText').value;
    await fetch('/speak', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
    });
}

// New function for chatbot interaction
async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    const chatMessages = document.getElementById('chat-messages');

    // Display user message
    chatMessages.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;

    // Clear input field
    document.getElementById('user-input').value = '';

    // Get chatbot response
    const response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: userInput }),
    });
    const data = await response.json();

    // Display chatbot response
    chatMessages.innerHTML += `<p><strong>Chatbot:</strong> ${data.response}</p>`;

    // Scroll to bottom of chat messages
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add event listener for Enter key in user input
document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});