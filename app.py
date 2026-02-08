from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
import os
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'

socketio = SocketIO(app, cors_allowed_origins="*")

# Store active users and conversations
active_users = {}
conversations = {}


def get_timestamp():
    """Get current timestamp"""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')


@app.route('/api/users', methods=['GET'])
def get_users():
    """Get list of active users"""
    users_list = list(active_users.keys())
    return jsonify({'users': users_list})


@socketio.on('connect')
def handle_connect():
    """Handle user connection"""
    print(f'Client connected: {request.sid}')
    emit('connection_response', {'data': 'Connected to server'})


@socketio.on('register_user')
def handle_register(data):
    """Register a new user"""
    username = data.get('username', '').strip()
    
    if not username:
        emit('error', {'message': 'Username cannot be empty'})
        return
    
    if username in active_users:
        emit('error', {'message': 'Username already taken'})
        return
    
    # Register user
    active_users[username] = {
        'sid': request.sid,
        'connected_at': get_timestamp(),
        'status': 'online'
    }
    
    # Notify all users about new user
    socketio.emit('user_joined', {
        'username': username,
        'timestamp': get_timestamp(),
        'total_users': len(active_users)
    })
    
    # Send success response
    emit('user_registered', {
        'username': username,
        'success': True,
        'active_users': list(active_users.keys())
    })
    
    print(f'User registered: {username}')


@socketio.on('send_message')
def handle_message(data):
    """Handle incoming messages - Only 1:1 private messages"""
    sender = data.get('sender', 'Anonymous')
    receiver = data.get('receiver')
    message_text = data.get('message', '').strip()
    message_type = data.get('type', 'text')
    
    # Validation
    if not message_text:
        emit('error', {'message': 'Message cannot be empty'})
        return
    
    if sender not in active_users:
        emit('error', {'message': 'User not registered'})
        return
    
    if not receiver or receiver not in active_users:
        emit('error', {'message': 'Please select a valid user to chat with'})
        return
    
    # Create message object
    message_obj = {
        'sender': sender,
        'receiver': receiver,
        'content': message_text,
        'type': message_type,
        'timestamp': get_timestamp(),
        'message_id': f"{sender}_{get_timestamp().replace(' ', '_').replace(':', '')}"
    }
    
    # Store conversation
    conversation_key = tuple(sorted([sender, receiver]))
    
    if conversation_key not in conversations:
        conversations[conversation_key] = []
    
    conversations[conversation_key].append(message_obj)
    
    # Send only to receiver
    socketio.emit('receive_message', message_obj, 
                 to=active_users[receiver]['sid'])
    
    print(f'Message from {sender} to {receiver}: {message_text[:50]}')
    
    # Send confirmation to sender
    emit('message_sent', {
        'success': True,
        'message_id': message_obj['message_id'],
        'timestamp': get_timestamp()
    })


@socketio.on('get_conversation')
def handle_get_conversation(data):
    """Get conversation history between two users"""
    user1 = data.get('user1')
    user2 = data.get('user2')
    
    if not user1 or not user2:
        emit('error', {'message': 'Invalid users'})
        return
    
    conversation_key = tuple(sorted([user1, user2]))
    messages = conversations.get(conversation_key, [])
    
    emit('conversation_history', {
        'user1': user1,
        'user2': user2,
        'messages': messages
    })


@socketio.on('disconnect')
def handle_disconnect():
    """Handle user disconnection"""
    # Find and remove user
    for username, user_info in list(active_users.items()):
        if user_info['sid'] == request.sid:
            del active_users[username]
            socketio.emit('user_left', {
                'username': username,
                'timestamp': get_timestamp(),
                'total_users': len(active_users)
            })
            print(f'User disconnected: {username}')
            break


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Run the application
    print("Starting messaging server...")
    print("Server running on http://localhost:5000")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)