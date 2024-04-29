from flask import Flask, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS, cross_origin

from flask_socketio import SocketIO, emit, send, join_room, leave_room

from mongoengine import connect

from blueprints.rooms import rooms_bp
from blueprints.player import player_bp
from blueprints.questions import question_bp

MONGO_URI = "mongodb+srv://shreynagda:shrey0308@cluster0.zxdkj5v.mongodb.net?retryWrites=true&w=majority&appName=Cluster0"
SECRET = "secret@123"

app = Flask(__name__)

app.config['secret'] = SECRET
app.config['MONGODB_DB'] = "quiz"
app.config['MONGODB_URI'] = MONGO_URI

# CORS error solving
CORS(app, origins="*")

socket = SocketIO(app, cors_allowed_origins='*')


@socket.on("connect")
def handle_connect():
    send("Client connected!")


@socket.on("disconnect")
def handle_disconnect():
    send("Client disconnected!")


@socket.on("message")
def handle_message(data):
    print("message", data)
    send(data, broadcast=True)


@socket.on("join")
def on_join(data):
    name = data["name"]
    room = data["room"]
    join_room(room)
    if name == "host":
        send(f"Room {room} created!", to=room, broadcast=True)
    else:
        send(f"{name} joined the room {room}", to=room, broadcast=True)


@socket.on("leave")
def on_leave(data):
    name = data["name"]
    room = data["room"]
    send(f"{name} has left the room {room}", to=room, broadcast=True)
    leave_room(room)


@socket.on("start")
def start(data):
    room = data["room"]
    send("start", to=room, broadcast=True)

@socket.on("finished")
def finish(data):
    room = data["room"]
    send("finished", to=room, broadcast=True)
    leave_room(room)


# Connecting the mongoengine
connect(
    db=app.config["MONGODB_DB"],
    host=app.config["MONGODB_URI"]
)


@app.route("/")
def home():
    return jsonify("Server Running!")


# Registering all blueprints
app.register_blueprint(rooms_bp, url_prefix='/rooms')
app.register_blueprint(player_bp, url_prefix="/player")
app.register_blueprint(question_bp, url_prefix="/questions")

if __name__ == "__main__":
    socket.run(app, debug=True, port=8080)
