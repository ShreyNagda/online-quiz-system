from mongoengine import Document, StringField, ListField, IntField

class Question(Document):
    question_no = IntField(required=True)
    text = StringField(required=True)
    category = StringField()
    options = ListField(StringField(max_length=255))
    correct = StringField(required=True)
    code = StringField(required=True)

    # quiz_room = ReferenceField("QuizRoom", reverse_delete_rule='CASCADE')

    meta = {
        'collection': 'questions'  # MongoDB collection name
    }
