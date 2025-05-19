import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
import os
import json


class FirebaseInit:
    def __init__(self):
        firebase_creds_content = os.environ.get('FIREBASE_CREDENTIALS_JSON')

        if firebase_creds_content:
            with open('firebase_credentials.json', 'w') as f:
                f.write(firebase_creds_content)
            self.cred = credentials.Certificate('firebase_credentials.json')
        else:
            self.cred = credentials.Certificate("firebase_credentials.json")

        self.app = firebase_admin.initialize_app(self.cred)
        self.db = firestore.client()
