from flask import Blueprint, jsonify, request
from models.quiz_room import QuizRoom
from models.question_model import Question
from models.player_model import Player
from mongoengine.errors import NotUniqueError
import json

rooms_bp = Blueprint('rooms', __name__)


# Endpoint to create a room
@rooms_bp.route("/create", methods=["POST"])
def create_room():
    data = request.json
    room_name = data.get('room_name')
    room_code = data.get('room_code')
    max_players = data.get('max_players')
    if not room_name or not room_code or not max_players:
        return jsonify({'error': 'Missing required fields'})

    try:
        new_room = QuizRoom(
            room_name=room_name,
            room_code=room_code,
            max_players=max_players,
        )
        new_room.save()
        response_data = {
            "message": "Room created successfully!",
            "room_id": str(new_room.id)
        }
        return jsonify(response_data)

    except NotUniqueError as e:
        return jsonify({'error': "Active room with same room code already exists"})
    except Exception as e:
        return jsonify({'error': str(e)})


# Endpoint to get room data
@rooms_bp.route("/<code>", methods=["GET"])
def get_room(code):
    if not code:
        return jsonify({"error": "Invalid room code"}), 500
    try:
        data = QuizRoom.objects.get(room_code=code)
        json_data = json.loads(data.to_json())
        return jsonify(json_data)
        # return jsonify(("Room"))
    except Exception as e:
        return jsonify({"error": "Room code does not exists"})


# Endpoint to start the quiz room
@rooms_bp.route("/<code>/start", methods=["GET"])
def start_quiz_room(code):
    if not code:
        return jsonify({"error": "Invalid room code"})
    room = QuizRoom.objects.get(room_code=code)
    if room.state == "waiting":
        room.state = "active"
        room.save()
        return jsonify({"message": "Quiz has started"})
    elif room.state == "active":
        return jsonify({"error": "Quiz already active"})
    elif room.state == "finished":
        return jsonify({"error": "Quiz already finished"})
        # emit start event through socket
    return jsonify({"message": "Quiz has started"})


# Endpoint to get state of a room
@rooms_bp.route("/<code>/state", methods=["GET"])
def get_room_state(code):
    if not code:
        return jsonify({"error": "Invalid room code"})
    state = QuizRoom.objects.get(room_code=code).state
    return jsonify(state)


# Endpoint to get questions of a room


# Endpoint to get players of a room
@rooms_bp.route("/<code>/players", methods=["GET"])
def get_player(code):
    return QuizRoom.objects.get(room_code=code).players, 200


# Endpoint to finish the quiz
@rooms_bp.route("/<code>/finish", methods=["GET"])
def finish_quiz_room(code):
    room = QuizRoom.objects.get(room_code=code)
    room.state = "finished"
    room.save()
    # emit finish through socket
    return jsonify({"message": "Quiz Room is Finished"}), 200
