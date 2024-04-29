from flask import Blueprint, jsonify, request
from models.question_model import Question
from models.quiz_room import QuizRoom
import pandas

import json

question_bp = Blueprint("questions", __name__)

json_question_data = {}


# adding a question
@question_bp.route("/add", methods=["POST"])
def add_question():
    data = request.json
    code = data.get("code")
    room = QuizRoom.objects.get(room_code=code)

    if room.state == "finished":
        return jsonify({'error': "Quiz room already finished"}), 501
    elif room.state == "active":
        return jsonify({'error': "Quiz room has already started"}), 501

    text = data.get('text')
    options = data.get('options')
    correct = data.get("correct")

    new_question = Question(text=text, options=options, correct=correct, code=code, quiz_room=room.id)

    new_question.save()

    room.update(push__questions=new_question.id)

    return jsonify({"message": "Question added successfully!"}), 200


# endpoint to get preview of all questions
@question_bp.route("/<code>/preview", methods=["POST"])
def preview_questions(code):
    files = request.files
    _file = files["file"]
    if str(_file.filename).endswith(".csv"):
        questions = []
        df = pandas.read_csv(_file)
        for index, question in df.iterrows():
            questions.append({"question_no": question[df.columns[0]], "text": question[df.columns[1]],
                              "options": list(str(question[df.columns[2]]).split(", ")), "correct": question[df.columns[3]],
                              "code": code})
        return jsonify(questions)

    elif str(_file.filename).endswith(".json"):
        questions = json.load(_file)
        print(questions)
        return jsonify(questions)
        pass

    else:
        return jsonify({"error": "Select a json or csv file"})


# endpoint to add all questions from a csv file
@question_bp.route("/<code>/addall", methods=["POST"])
def add_all_questions(code):
    files = request.files
    _file = files["file"]
    try:
        room = QuizRoom.objects.get(room_code=code)
        room.questions = []
        if str(_file.filename).endswith(".csv"):
            df = pandas.read_csv(_file)
            for index, question in df.iterrows():
                print(question)
                new_question = Question(question_no=question["question_no"], text=question["text"],
                                        options=str(question["options"]).split(","), correct=str(question["correct"]),
                                        code=code)
                new_question.save()
                room.questions.append(new_question.id)
                room.save()
            return jsonify({"message": "Questions added successfully!"})

        elif str(_file.filename).endswith(".json"):
            temp_question_data = list(json.load(_file))
            for question in temp_question_data:
                new_question = Question(question_no=question["question_no"], text=question["text"],
                                        options=question["options"], correct=str(question["correct"]),
                                        code=code)
                new_question.save()
                room.questions.append(new_question.id)
            room.save()
            return jsonify({"message": "Questions added successfully!"})
        else:
            return jsonify({"error": "Select csv or json file"})
    except Exception as e:
        return jsonify({"error": e})


@question_bp.route("/<code>", methods=["GET"])
def get_questions(code):

    questions = Question.objects(code=code)
    questions_data = []
    for question in questions:
        question_data = question.to_mongo().to_dict()
        question_data["_id"] = str(question_data["_id"])

        questions_data.append(question_data)
    return jsonify(questions_data)