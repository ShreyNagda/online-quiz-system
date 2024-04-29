from mongoengine import Document, IntField, StringField, ReferenceField, ListField, DictField

class Player(Document):
    player_id = StringField(required=True, unique=True)
    player_name = StringField(required=True, max_length=100)
    current_score = IntField(default=0)
    room_code = StringField(required=True)
    meta = {
        'collection': 'players'  # MongoDB collection name
    }
