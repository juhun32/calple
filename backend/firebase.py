import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials


class FirebaseInit:
    def __init__(self):
        # Initialize the app with a service account, granting admin privileges
        self.cred = credentials.Certificate("firebase_credentials.json")
        self.app = firebase_admin.initialize_app(self.cred)
        self.db = firestore.client()
