# Messaging Application

A real-time messaging application built with Flask, Socket.IO, and modern web technologies.

## 📺 Tutorial

For a complete step-by-step tutorial on building this application, check out the YouTube channel:
👉 **[TurtleCode - YouTube Channel](https://www.youtube.com/@turtlecode)**

---

## Features

- **Real-time Messaging**: Send and receive messages instantly using WebSockets
- **User Management**: Register with a username and see online users
- **Private Messaging**: Send messages to specific users
- **Broadcast Messages**: Send messages to all connected users
- **File Sharing**: Share images with other users
- **Conversation History**: View previous messages between users
- **User Presence**: See which users are online in real-time
- **Clean UI**: Modern, responsive dark-themed interface

## Requirements

- Python 3.7+
- pip (Python package manager)

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd messaging-app
```

2. **Create a virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

## Running the Application

1. **Start the Flask server**
```bash
python app.py
```

2. **Open in browser**
   - Navigate to `http://localhost:5000`
   - Open multiple tabs/windows to test messaging between users

3. **Use the application**
   - Enter a username and click Login
   - Select a user from the online users list to chat with
   - Or click "Broadcast to All" to send to everyone
   - Upload images using the attachment button

## File Structure

```
messaging-app/
├── app.py                 # Flask server with Socket.IO
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # HTML template
├── static/
│   ├── style.css         # CSS styling
│   └── script.js         # Frontend JavaScript
├── uploads/              # Uploaded files directory
├── .gitignore           # Git ignore file
└── README.md            # This file
```

## Configuration

### Change Secret Key

Edit `app.py` and change the `SECRET_KEY`:

```python
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
```

### Adjust File Upload Settings

In `app.py`:

```python
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'}  # Allowed types
```

## API Endpoints

### REST Endpoints

- `GET /` - Serve main page
- `GET /api/users` - Get list of active users

### Socket.IO Events

**Client to Server:**
- `register_user` - Register a new user
- `send_message` - Send a text message
- `upload_file` - Upload a file
- `get_conversation` - Get conversation history
- `disconnect` - User disconnects

**Server to Client:**
- `connection_response` - Server acknowledgment
- `user_registered` - User successfully registered
- `user_joined` - New user joined
- `user_left` - User disconnected
- `receive_message` - New message received
- `message_sent` - Message sent confirmation
- `file_uploaded` - File upload confirmation
- `conversation_history` - Previous messages
- `error` - Error message

## Security Considerations

⚠️ **This is a demo application. For production use:**

1. Implement proper authentication (JWT, OAuth)
2. Add message encryption
3. Validate all user inputs
4. Implement rate limiting
5. Add CORS restrictions
6. Use HTTPS/WSS in production
7. Store files securely outside web root
8. Implement database for message persistence

## Troubleshooting

### Port 5000 already in use
```bash
# Change port in app.py
socketio.run(app, port=5001)
```

### Connection issues
- Check firewall settings
- Ensure Socket.IO is properly installed
- Check browser console for errors

### File upload not working
- Check `uploads/` directory exists
- Verify file size is under limit
- Ensure correct file format

## Future Enhancements

- User profiles and avatars
- Message encryption
- Message reactions/emoji support
- User typing indicators
- Message search
- Message deletion
- Groups/Channels
- Voice/Video calling
- Database persistence
- Mobile app

## License

MIT License - feel free to use this for personal or commercial projects

## Support

For issues and questions, please create an issue on the repository.
