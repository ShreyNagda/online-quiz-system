from mongoengine import Document, StringField, IntField, ListField, ReferenceField

class QuizRoom(Document):
    room_name = StringField(required=True, max_length=100)
    room_code = StringField(required=True, unique=True, max_length=4)
    max_players = IntField(required=True)
    players = ListField(ReferenceField('Player'))  # Reference to Player model
    questions = ListField(ReferenceField('Question'),  reverse_delete_rule='CASCADE')  # Reference to Question model
    state = StringField(default='waiting', max_length=20)

    meta = {
        'collection': 'quiz_rooms'  # MongoDB collection name
    }
