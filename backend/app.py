import googleapiclient.discovery
import google_auth_oauthlib.flow
from firebase import FirebaseInit
from dotenv import load_dotenv
from flask import Flask, redirect, url_for, session, request, jsonify
from flask_cors import CORS

import os
# only for local development
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'


load_dotenv()

# handle cliend secret for google cloud run
client_secret_content = os.environ.get('CLIENT_SECRET_JSON')
if client_secret_content:
    with open('client_secret.json', 'w') as f:
        f.write(client_secret_content)

# middleware to handle https behind a reverse proxy


class ReverseProxied:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        environ['wsgi.url_scheme'] = 'https'
        return self.app(environ, start_response)


app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

ENV = os.getenv("ENV", "development")

if ENV != "development":
    app.wsgi_app = ReverseProxied(app.wsgi_app)

if ENV == "development":
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = False
    app.config["SESSION_COOKIE_DOMAIN"] = None
    FRONTEND_URL = "http://localhost:3000"
else:
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = True
    app.config["SESSION_COOKIE_DOMAIN"] = "calple.date"
    FRONTEND_URL = os.getenv("FRONTEND_URL", "https://calple.date")

app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_PATH"] = "/"
app.config["SESSION_COOKIE_NAME"] = "calple_session"

CORS(app, origins=[FRONTEND_URL], supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Set-Cookie"])

# oauth constants
OAUTH_CLIENT_SECRET = "client_secret.json"
SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]

# firebase initialization
db = FirebaseInit().db


@app.route("/google/oauth/login")
def login():
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        OAUTH_CLIENT_SECRET, scopes=SCOPES
    )

    if ENV == "development":
        flow.redirect_uri = url_for("oauth2callback", _external=True)
    else:
        flow.redirect_uri = f"https://{request.host}/google/oauth/callback"

    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
    )
    session["state"] = state
    return redirect(auth_url)


@app.route("/google/oauth/callback")
def oauth2callback():
    state = session.pop("state", None)
    if state is None:
        return "Missing OAuth state", 400

    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        OAUTH_CLIENT_SECRET, scopes=SCOPES, state=state
    )

    if ENV == "development":
        flow.redirect_uri = url_for("oauth2callback", _external=True)
    else:
        flow.redirect_uri = f"https://{request.host}/google/oauth/callback"

    # exchange credentials
    authorization_response = request.url
    flow.fetch_token(
        authorization_response=authorization_response, include_client_id=True)
    creds = flow.credentials

    # fetch user info
    oauth2 = googleapiclient.discovery.build(
        "oauth2", "v2", credentials=creds
    )
    info = oauth2.userinfo().get().execute()

    # upsert user info into firebase
    # check if user already exists
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

    # set session
    session["user_id"] = info["id"]

    return redirect(FRONTEND_URL)


@app.route("/api/auth/status")
def auth_status():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"authenticated": False}), 200

    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        return jsonify({"authenticated": False}), 200

    data = doc.to_dict()
    # IMPORTANT: remove token info from the response
    data.pop("tokens", None)

    return jsonify({
        "authenticated": True,
        "user": data
    })


@app.route("/google/oauth/logout")
def logout():
    session.clear()
    return redirect(f"{FRONTEND_URL}")


if __name__ == "__main__":
    if ENV == "development":
        app.run(host="127.0.0.1", port=5000, debug=True)
    else:
        port = int(os.environ.get("PORT", 5000))
        app.run(host="0.0.0.0", port=port)
