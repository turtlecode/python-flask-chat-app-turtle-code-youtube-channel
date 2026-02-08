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

## License

MIT License - feel free to use this for personal or commercial projects

## Support

For issues and questions, please create an issue on the repository.
