import googleapiclient.discovery
import google_auth_oauthlib.flow
from firebase import FirebaseInit
from dotenv import load_dotenv
from flask import Flask, redirect, url_for, session, request, jsonify
from flask_cors import CORS

import secrets
import time

import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # FOR DEVELOPMENT ONLY


load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

client_secret_content = os.environ.get('CLIENT_SECRET_JSON')
if client_secret_content:
    with open('client_secret.json', 'w') as f:
        f.write(client_secret_content)


class ReverseProxied:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        environ['wsgi.url_scheme'] = 'https'
        return self.app(environ, start_response)


app = Flask(__name__)
app.wsgi_app = ReverseProxied(app.wsgi_app)
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_DOMAIN"] = None
app.config["SESSION_COOKIE_PATH"] = "/"
app.config["SESSION_COOKIE_NAME"] = "calple_session"

app.secret_key = os.getenv("SECRET_KEY")

# for development only
# CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
CORS(app, origins=[FRONTEND_URL], supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Set-Cookie"])


OAUTH_CLIENT_SECRET = "client_secret.json"
SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]

db = FirebaseInit().db

# google oauth2.0 setup


@app.route("/google/oauth/login")
def login():
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        OAUTH_CLIENT_SECRET, scopes=SCOPES
    )

    if 'run.app' in request.host_url:
        # When running on Cloud Run
        flow.redirect_uri = f"https://{request.host}/google/oauth/callback"
    else:
        # When running locally
        flow.redirect_uri = url_for("oauth2callback", _external=True)

    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
    )
    # Store state for later
    session["state"] = state
    return redirect(auth_url)


@app.route("/google/oauth/callback")
def oauth2callback():
    # Verify state
    state = session.pop("state", None)
    if state is None:
        return "Missing OAuth state", 400

    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        OAUTH_CLIENT_SECRET, scopes=SCOPES, state=state
    )

    if 'run.app' in request.host_url:
        # When running on Cloud Run
        flow.redirect_uri = f"https://{request.host}/google/oauth/callback"
    else:
        # When running locally
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

    temp_token = secrets.token_hex(16)  # 32 character random hex string
    expires = int(time.time()) + 300    # 5 minutes from now

    # Store token in Firebase
    token_ref = db.collection("auth_tokens").document(temp_token)
    token_ref.set({
        "user_id": info["id"],
        "expires": expires
    })

    # return redirect(url_for("auth_status"))
    return redirect(f"{FRONTEND_URL}?auth_token={temp_token}")


@app.route("/api/auth/exchange-token")
def exchange_token():
    token = request.args.get("token")
    if not token:
        return jsonify({"success": False, "error": "Missing token"}), 400

    # Get token from Firebase
    token_doc = db.collection("auth_tokens").document(token).get()
    if not token_doc.exists:
        return jsonify({"success": False, "error": "Invalid token"}), 401

    token_data = token_doc.to_dict()

    # Check if token is expired
    if token_data["expires"] < int(time.time()):
        # Clean up expired token
        db.collection("auth_tokens").document(token).delete()
        return jsonify({"success": False, "error": "Token expired"}), 401

    # Set session
    session["user_id"] = token_data["user_id"]

    # Clean up used token
    db.collection("auth_tokens").document(token).delete()

    return jsonify({"success": True})


@app.route("/api/auth/status")
def auth_status():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"authenticated": False}), 401

    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        return jsonify({"authenticated": False}), 401

    data = doc.to_dict()
    # Don't send secrets back to the client
    data.pop("tokens", None)
    return jsonify({
        "authenticated": True,
        "user": data
    })


@app.route("/google/oauth/logout")
def logout():
    session.clear()
    return redirect(f"{FRONTEND_URL}")


# if __name__ == "__main__":
    # app.run(host="127.0.0.1", port=5000, debug=True)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
