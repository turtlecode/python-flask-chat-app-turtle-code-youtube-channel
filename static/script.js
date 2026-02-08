// Initialize Socket.IO connection
const socket = io();

// DOM Elements
const loginPanel = document.getElementById('loginPanel');
const chatPanel = document.getElementById('chatPanel');
const usernameInput = document.getElementById('usernameInput');
const loginButton = document.getElementById('loginButton');
const loginError = document.getElementById('loginError');
const currentUsername = document.getElementById('currentUsername');
const logoutButton = document.getElementById('logoutButton');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const usersList = document.getElementById('usersList');

// State variables
let currentUser = null;
let selectedUser = null;
let conversations = {};

// ============ Socket Events ============

socket.on('connection_response', (data) => {
    console.log('Connected to server:', data);
});

socket.on('user_registered', (data) => {
    if (data.success) {
        currentUser = data.username;
        currentUsername.textContent = currentUser;
        
        // Switch to chat panel
        loginPanel.classList.remove('active');
        chatPanel.classList.add('active');
        
        messageInput.focus();
    }
});

socket.on('user_joined', (data) => {
    console.log(`${data.username} joined the chat`);
    updateUsersList();
    addSystemMessage(`${data.username} joined the chat`);
});

socket.on('user_left', (data) => {
    console.log(`${data.username} left the chat`);
    updateUsersList();
    addSystemMessage(`${data.username} left the chat`);
});

socket.on('receive_message', (data) => {
    handleReceivedMessage(data);
});

socket.on('message_sent', (data) => {
    console.log('Message sent successfully:', data);
    messageInput.value = '';
    messageInput.focus();
});

socket.on('conversation_history', (data) => {
    displayConversation(data.messages);
});

socket.on('error', (data) => {
    showError(data.message);
});

// ============ Event Listeners ============

loginButton.addEventListener('click', handleLogin);

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && messageInput.value.trim()) {
        sendMessage();
    }
});

logoutButton.addEventListener('click', handleLogout);

// ============ Handler Functions ============

function handleLogin() {
    const username = usernameInput.value.trim();
    
    if (!username) {
        showError('Please enter a username');
        return;
    }
    
    if (username.length < 3) {
        showError('Username must be at least 3 characters');
        return;
    }
    
    if (username.length > 20) {
        showError('Username must be less than 20 characters');
        return;
    }
    
    // Clear error
    hideError();
    
    // Register user
    socket.emit('register_user', { username: username });
}

function handleLogout() {
    socket.disconnect();
    currentUser = null;
    selectedUser = null;
    conversations = {};
    
    chatPanel.classList.remove('active');
    loginPanel.classList.add('active');
    
    usernameInput.value = '';
    messageInput.value = '';
    clearChatMessages();
    usersList.innerHTML = '';
    
    // Reconnect
    setTimeout(() => {
        socket.connect();
    }, 1000);
}

function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (!messageText) {
        return;
    }
    
    if (!currentUser) {
        showError('Not logged in');
        return;
    }
    
    if (!selectedUser) {
        showError('Please select a user to chat with');
        return;
    }
    
    // Send message
    socket.emit('send_message', {
        sender: currentUser,
        receiver: selectedUser,
        message: messageText,
        type: 'text'
    });
    
    // Add to chat immediately
    addMessageToChat(currentUser, messageText, 'own');
}

// ============ Message Handling ============

function handleReceivedMessage(messageData) {
    const { sender, receiver, content } = messageData;
    
    // Mesaj sadece aktif konuşmaya aitse ekrandaki mesajlara ekle
    if (receiver === currentUser) {
        if (selectedUser === sender) {
            // Aktif konuşmada ise ekrana yazıldır
            addMessageToChat(sender, content, 'other');
        } else {
            // Diğer bir kullanıcıdan mesaj geldi, bildirim göster
            showNotification(`New message from ${sender}`);
        }
    }
    
    // Her durumda conversations'a sakla
    storeMessage(sender, receiver, messageData);
}

function showNotification(text) {
    const notif = document.createElement('div');
    notif.className = 'notif-popup';
    notif.textContent = text;
    document.body.appendChild(notif);
    
    // 3 saniye sonra sil
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

// ============ UI Update Functions ============

function updateUsersList() {
    // Fetch users from server
    fetch('/api/users')
        .then(response => response.json())
        .then(data => {
            const users = data.users.filter(u => u !== currentUser);
            
            usersList.innerHTML = '';
            
            if (users.length === 0) {
                usersList.innerHTML = '<div style="color: #999; font-size: 12px; text-align: center;">No other users online</div>';
                return;
            }
            
            users.forEach(username => {
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                
                if (selectedUser === username) {
                    userItem.classList.add('active');
                }
                
                userItem.innerHTML = `
                    <span class="user-status"></span>
                    <span>${username}</span>
                `;
                
                userItem.addEventListener('click', () => {
                    selectUser(username);
                });
                
                usersList.appendChild(userItem);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

function selectUser(username) {
    selectedUser = username;
    updateUsersList();
    clearChatMessages();
    
    // Load conversation history
    socket.emit('get_conversation', {
        user1: currentUser,
        user2: username
    });
}

function displayConversation(messages) {
    clearChatMessages();
    
    if (messages.length === 0) {
        addSystemMessage(`No previous messages with ${selectedUser}`);
        return;
    }
    
    messages.forEach(msg => {
        const isOwn = msg.sender === currentUser;
        const classType = isOwn ? 'own' : 'other';
        addMessageToChat(msg.sender, msg.content, classType);
    });
}

function addMessageToChat(sender, content, type) {
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group';
    
    // Add sender name if not own message
    if (type === 'other') {
        const senderEl = document.createElement('div');
        senderEl.className = 'message-sender';
        senderEl.textContent = sender;
        messageGroup.appendChild(senderEl);
    }
    
    const messageRow = document.createElement('div');
    messageRow.className = `message-row ${type}`;
    
    const messageBubble = document.createElement('div');
    messageBubble.className = `message-bubble ${type}`;
    messageBubble.textContent = content;
    
    messageRow.appendChild(messageBubble);
    messageGroup.appendChild(messageRow);
    
    // Add timestamp
    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageGroup.appendChild(timeEl);
    
    chatMessages.appendChild(messageGroup);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addSystemMessage(text) {
    const systemMessage = document.createElement('div');
    systemMessage.className = 'message-group';
    systemMessage.innerHTML = `
        <div style="text-align: center; margin: 15px 0;">
            <span style="background-color: #3c3c3c; padding: 8px 12px; border-radius: 5px; color: #999; font-size: 12px;">
                ${text}
            </span>
        </div>
    `;
    
    chatMessages.appendChild(systemMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function clearChatMessages() {
    chatMessages.innerHTML = '';
}

function storeMessage(sender, receiver, messageData) {
    const key = `${sender}-${receiver}`;
    
    if (!conversations[key]) {
        conversations[key] = [];
    }
    
    conversations[key].push(messageData);
}

// ============ Error Handling ============

function showError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
    
    setTimeout(() => {
        hideError();
    }, 3000);
}

function hideError() {
    loginError.classList.remove('show');
    loginError.textContent = '';
}

// ============ Initialization ============

window.addEventListener('load', () => {
    usernameInput.focus();
});