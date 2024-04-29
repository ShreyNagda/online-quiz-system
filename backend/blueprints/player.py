from flask import Blueprint, jsonify, request
from models.quiz_room import QuizRoom
from models.player_model import Player

import secrets
import json

player_bp = Blueprint('player', __name__)


# new player is added to the database
@player_bp.route("/new", methods=["POST"])
def new_player():
    data = request.json
    code = data.get("code")
    room = QuizRoom.objects.get(room_code=code)
    if room.state == "finished":
        return jsonify({'error': "Quiz room already finished"})
    elif room.state == "active":
        return jsonify({'error': "Quiz room has already started"})
    player_name = data.get("player_name")
    player_id = code + str(secrets.randbelow(10000))
    if room.players is not None:
        for player in room.players:
            print(player)
            if player.player_name == player_name:
                return jsonify({"error": "Nickname {} is already used in the current room".format(player_name)})
            elif player.player_id == player_id:
                player_id = code + str(secrets.randbelow(10000))

    newplayer = Player(player_name=player_name, player_id=player_id, room_code=code)
    newplayer.save()
    room.update(push__players=newplayer.id)

    return jsonify({"message": "{} entered the room {}".format(player_name, code), "id": player_id}, )


# getting the data of the player
@player_bp.route("/get/<player_id>", methods=["GET"])
def get_player(player_id):
    if player_id is not None:
        print("playerid: ", player_id)
        player_data = Player.objects.get(player_id=player_id)
        return jsonify(json.loads(player_data.to_json()))
    return jsonify({"error": "Either host or player_id empty"})


# getting the score of the player
@player_bp.route("/<player_id>/score", methods=["GET"])
def get_score(player_id):
    if player_id != None:
        return jsonify({"score": Player.objects.get(player_id=player_id).current_score})
    return jsonify({"error": "Either host or player_id empty"})


@player_bp.route("/<player_id>/update", methods=["POST"])
def update_score(player_id):
    # code = request.json["code"]
    question = request.json["question"]
    time = request.json["time"]
    option = request.json["option"]
    player = Player.objects.get(player_id=player_id)
    if question["correct"] == option:
        print("Correct Answer")
        player.current_score += time
        player.save()
        return jsonify("Correct Answer!")

    return jsonify("Wrong Answer! Correct Answer was ", question['correct'])


@player_bp.route("/getall/<code>", methods=["GET"])
def get_players(code):
    players = list(Player.objects(room_code=code))
    players_data = []
    for player in players:
        player_data = player.to_mongo().to_dict()
        player_data["_id"] = str(player_data["_id"])
        players_data.append(player_data)
    return jsonify(players_data)


@player_bp.route("/leaderboard/<code>", methods=["GET"])
def get_leaderboard(code):
    players_data = []
    players = list(Player.objects(room_code=code).order_by('-current_score'))
    print(players)
    for player in players:
        data = player.to_mongo().to_dict()
        data["_id"] = str(data["_id"])
        players_data.append(data)
    print(players)
    return jsonify(players_data)
    pass
