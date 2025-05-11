import googleapiclient.discovery
import google_auth_oauthlib.flow
from firebase import FirebaseInit
from dotenv import load_dotenv
from flask import Flask, redirect, url_for, session, request, jsonify

import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # FOR DEVELOPMENT ONLY


load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

OAUTH_CLIENT_SECRET = "client_secret.json"
SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]

db = FirebaseInit().db


@app.route("/google/oauth/login")
def login():
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        OAUTH_CLIENT_SECRET, scopes=SCOPES
    )
    flow.redirect_uri = url_for("oauth2callback", _external=True)
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
    )
    # Store state for later
    session["state"] = state
    return redirect(auth_url)


@app.route("/oauth/callback")
def oauth2callback():
    # Verify state
    state = session.pop("state", None)
    if state is None:
        return "Missing OAuth state", 400

    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        OAUTH_CLIENT_SECRET, scopes=SCOPES, state=state
    )
    flow.redirect_uri = url_for("oauth2callback", _external=True)
    # Exchange code for credentials
    authorization_response = request.url
    flow.fetch_token(
        authorization_response=authorization_response, include_client_id=True)
    creds = flow.credentials

    # Fetch basic profile info
    oauth2 = googleapiclient.discovery.build(
        "oauth2", "v2", credentials=creds
    )
    info = oauth2.userinfo().get().execute()

    # Upsert into Firestore: users collection, doc = Google user ID
    user_ref = db.collection("users").document(info["id"])
    user_ref.set({
        "email": info.get("email"),
        "name": info.get("name"),
        "tokens": {
            "token": creds.token,
            "refresh_token": creds.refresh_token,
            "token_uri": creds.token_uri,
            "client_id": creds.client_id,
            "client_secret": creds.client_secret,
            "scopes": creds.scopes,
        }
    }, merge=True)

    # Keep user ID in session for subsequent requests
    session["user_id"] = info["id"]
    return redirect(url_for("profile"))


@app.route("/profile")
def profile():
    uid = session.get("user_id")
    if not uid:
        return redirect(url_for("login"))

    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        return "User not found", 404

    data = doc.to_dict()
    # Don’t send secrets back to the client
    data.pop("tokens", None)
    return jsonify(data)


@app.route("/google/oauth/logout")
def logout():
    session.clear()
    return redirect("/")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
