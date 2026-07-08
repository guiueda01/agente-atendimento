let messageHistory = [];

function appendMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerText = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const apiKeyInput = document.getElementById('apiKey');
    const userInputElement = document.getElementById('userInput');

    if (!userInputElement || !apiKeyInput) return;

    const apiKey = apiKeyInput.value.trim();
    const userText = userInputElement.value.trim();

    if (!userText) return;

    if (!apiKey) {
        alert("Por favor, insira sua API Key do OpenRouter no painel lateral para conversar com o Francisco.");
        return;
    }

    // Exibe texto do cliente
    appendMessage(userText, 'user');
    userInputElement.value = '';

    // Estado digitando...
    appendMessage("Francisco está digitando...", 'assistant');
    const chatMessages = document.getElementById('chatMessages');
    const loadingMessage = chatMessages ? chatMessages.lastChild : null;

    // Monta payload usando a constante global do prompt.js
    const messagesToSend = [
        { role: "system", content: FRANCISCO_PROMPT },
        ...messageHistory,
        { role: "user", content: userText }
    ];

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://localhost:3000', 
                'X-Title': 'Consultor Francisco'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3-8b-instruct', 
                messages: messagesToSend,
                temperature: 0.6
            })
        });

        if (loadingMessage) loadingMessage.remove();

        const data = await response.json();

        if (response.ok && data.choices && data.choices[0]) {
            const reply = data.choices[0].message.content;
            
            appendMessage(reply, 'assistant');
            
            messageHistory.push({ role: "user", content: userText });
            messageHistory.push({ role: "assistant", content: reply });
        } else {
            const errorMsg = data.error ? data.error.message : "Erro desconhecido";
            appendMessage(`Erro na API do OpenRouter: ${errorMsg}`, 'assistant');
        }

    } catch (error) {
        if (loadingMessage) loadingMessage.remove();
        appendMessage("Erro de conexão ao tentar falar com o consultor.", 'assistant');
        console.error(error);
    }
}

function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '<div class="message assistant">Olá! Sou o Francisco. Vamos reiniciar nossa conversa. Que tipo de veículo você busca hoje?</div>';
    }
    messageHistory = [];
}