import datetime
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


# ======== Auth ==========

class ReverseProxied:
    # middleware to handle https behind a reverse proxy
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        environ['wsgi.url_scheme'] = 'https'
        return self.app(environ, start_response)


app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

ENV = os.getenv("ENV", "production")

if ENV != "development":
    app.wsgi_app = ReverseProxied(app.wsgi_app)

if ENV == "development":
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = False
    app.config["SESSION_COOKIE_DOMAIN"] = None
    FRONTEND_URL = "http://localhost:3000"
else:
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = True
    app.config["SESSION_COOKIE_DOMAIN"] = ".calple.date"
    FRONTEND_URL = os.getenv("FRONTEND_URL", "https://calple.date")

app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_PATH"] = "/"
app.config["SESSION_COOKIE_NAME"] = "calple_session"

if ENV == "development":
    CORS_ORIGINS = ["http://localhost:3000"]
else:
    CORS_ORIGINS = [
        "https://calple.date",
        "https://www.calple.date",
    ]

CORS(app, origins=CORS_ORIGINS, supports_credentials=True,
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
        flow.redirect_uri = "https://api.calple.date/google/oauth/callback"

    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
    )
    session["state"] = state
    return redirect(auth_url)


@app.route("/google/oauth/callback")
def oauth2callback():
    state = session.pop("state", None)
    print(f"Callback - Session contents: {session}")
    print(f"Callback - State: {state}")

    if state is None:
        return "Missing OAuth state", 400

    if not os.path.exists(OAUTH_CLIENT_SECRET):
        print(f"ERROR: Client secret file not found at {OAUTH_CLIENT_SECRET}")
        return "OAuth configuration error", 500

    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        OAUTH_CLIENT_SECRET, scopes=SCOPES, state=state
    )

    if ENV == "development":
        flow.redirect_uri = url_for("oauth2callback", _external=True)
    else:
        flow.redirect_uri = "https://api.calple.date/google/oauth/callback"

    # exchange credentials
    authorization_response = request.url
    print(f"Auth response URL: {authorization_response}")

    if ENV != "development" and authorization_response.startswith("http:"):
        authorization_response = authorization_response.replace(
            "http:", "https:", 1)
    print(f"Fixed auth URL: {authorization_response}")

    try:
        flow.fetch_token(
            authorization_response=authorization_response, include_client_id=True)
    except Exception as e:
        print(f"Token exchange error: {str(e)}")
        return f"Authentication error: {str(e)}", 500
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


# ======= DDay API ==========


@app.route("/api/ddays", methods=["GET"])
def get_ddays():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = db.collection("users").document(uid).get()
    if not user_doc.exists:
        return jsonify({"error": "User not found"}), 404

    user_email = user_doc.to_dict().get("email")

    # get days connected to the user (made by the user or connected to the user)
    ddays = []
    ddays_query = db.collection("ddays").where(
        "connectedUsers", "array_contains", user_email
    ).get()

    created_query = db.collection("ddays").where(
        "createdBy", "==", user_email
    ).get()

    all_ddays = list(ddays_query) + list(created_query)
    dday_ids = set()

    for doc in all_ddays:
        if doc.id not in dday_ids:
            dday_data = doc.to_dict()
            dday_data["id"] = doc.id
            # firestore timestamp to ISO string
            if isinstance(dday_data.get("date"), datetime.datetime):
                dday_data["date"] = dday_data["date"].isoformat()
            ddays.append(dday_data)
            dday_ids.add(doc.id)

    return jsonify({"ddays": ddays})


@app.route("/api/ddays", methods=["POST"])
def create_dday():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = db.collection("users").document(uid).get()
    user_email = user_doc.to_dict().get("email")

    data = request.json
    required_fields = ["title", "date", "isAnnual"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # get existing connections for the user
    connection = None
    connections = db.collection("connections").where(
        "status", "==", "active").where("user1", "==", user_email).get()
    if not connections:
        connections = db.collection("connections").where(
            "status", "==", "active").where("user2", "==", user_email).get()

    # get partner's email from the first active connection
    partner_email = None
    if connections and len(list(connections)) > 0:
        connection = list(connections)[0].to_dict()
        partner_email = connection["user2"] if connection["user1"] == user_email else connection["user1"]

    # create dday document with automatically connected users
    connected_users = data.get("connectedUsers", [])
    if partner_email and partner_email not in connected_users:
        connected_users.append(partner_email)

    # create new dday document
    dday_ref = db.collection("ddays").document()
    dday_data = {
        "title": data["title"],
        "date": datetime.datetime.fromisoformat(data["date"]),
        "description": data.get("description", ""),
        "isAnnual": data["isAnnual"],
        "createdBy": user_email,
        "connectedUsers": data.get("connectedUsers", []),
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now()
    }
    dday_ref.set(dday_data)

    dday_data["id"] = dday_ref.id
    dday_data["date"] = dday_data["date"].isoformat()
    return jsonify({"dday": dday_data}), 201


@app.route("/api/ddays/<string:id>", methods=["PUT"])
def update_dday(id):
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = db.collection("users").document(uid).get()
    user_email = user_doc.to_dict().get("email")

    dday_ref = db.collection("ddays").document(id)
    dday_doc = dday_ref.get()

    if not dday_doc.exists:
        return jsonify({"error": "D-Day not found"}), 404

    dday_data = dday_doc.to_dict()

    # check user permission
    if dday_data["createdBy"] != user_email and user_email not in dday_data.get("connectedUsers", []):
        return jsonify({"error": "You don't have permission to update this D-Day"}), 403

    data = request.json
    update_data = {}

    if "title" in data:
        update_data["title"] = data["title"]

    if "description" in data:
        update_data["description"] = data["description"]

    if "date" in data:
        update_data["date"] = datetime.datetime.fromisoformat(data["date"])

    if "isAnnual" in data:
        update_data["isAnnual"] = data["isAnnual"]

    if "connectedUsers" in data:
        update_data["connectedUsers"] = data["connectedUsers"]

    update_data["updatedAt"] = datetime.datetime.now()

    dday_ref.update(update_data)

    updated_doc = dday_ref.get()
    updated_data = updated_doc.to_dict()
    updated_data["id"] = id

    if isinstance(updated_data.get("date"), datetime.datetime):
        updated_data["date"] = updated_data["date"].isoformat()

    return jsonify({"dday": updated_data})


@app.route("/api/ddays/<string:id>", methods=["DELETE"])
def delete_dday(id):
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = db.collection("users").document(uid).get()
    user_email = user_doc.to_dict().get("email")

    dday_ref = db.collection("ddays").document(id)
    dday_doc = dday_ref.get()

    if not dday_doc.exists:
        return jsonify({"error": "D-Day not found"}), 404

    dday_data = dday_doc.to_dict()

    # check user permission
    if dday_data["createdBy"] != user_email:
        return jsonify({"error": "Only the creator can delete this D-Day"}), 403

    dday_ref.delete()

    return jsonify({"message": "D-Day deleted successfully"})


# ======== user connection API ==========
@app.route("/api/connection", methods=["GET"])
def get_connection():
    """Get current user's connection"""
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = db.collection("users").document(uid).get()
    user_email = user_doc.to_dict().get("email")

    # find active connections for the user
    connections = db.collection("connections").where(
        "status", "==", "active").where("user1", "==", user_email).get()

    if not connections:
        connections = db.collection("connections").where(
            "status", "==", "active").where("user2", "==", user_email).get()

    if not connections or len(list(connections)) == 0:
        return jsonify({"connected": False})

    # first connection found
    connection = list(connections)[0]
    connection_data = connection.to_dict()

    # partner's email
    partner_email = connection_data["user2"] if connection_data["user1"] == user_email else connection_data["user1"]

    # partner user info
    partner_user = db.collection("users").where(
        "email", "==", partner_email).get()
    partner_info = None
    if partner_user:
        partner_info = list(partner_user)[0].to_dict()
        if "passwordHash" in partner_info:
            del partner_info["passwordHash"]

    return jsonify({
        "connected": True,
        "connectionId": connection.id,
        "partner": partner_info
    })


@app.route("/api/connection/invite", methods=["POST"])
def invite_connection():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = db.collection("users").document(uid).get()
    user_email = user_doc.to_dict().get("email")

    data = request.json
    if not data or "email" not in data:
        return jsonify({"error": "Missing email parameter"}), 400

    target_email = data["email"].lower().strip()

    # self connection check
    if target_email == user_email:
        return jsonify({"error": "Cannot connect to yourself"}), 400

    # check if target user exists
    target_users = db.collection("users").where(
        "email", "==", target_email).get()
    if not target_users or len(list(target_users)) == 0:
        return jsonify({"error": "User not found"}), 404

    # check if connection already exists
    existing = db.collection("connections").where(
        "user1", "==", user_email).where("user2", "==", target_email).get()
    if not existing:
        existing = db.collection("connections").where(
            "user1", "==", target_email).where("user2", "==", user_email).get()

    if existing and len(list(existing)) > 0:
        conn = list(existing)[0].to_dict()
        if conn["status"] == "active":
            return jsonify({"error": "Already connected to this user"}), 400
        elif conn["status"] == "pending":
            return jsonify({"error": "Invitation already pending"}), 400

    # create new connection invitation
    connection_ref = db.collection("connections").document()
    connection_ref.set({
        "user1": user_email,
        "user2": target_email,
        "status": "pending",
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now()
    })

    return jsonify({
        "message": "Invitation sent successfully",
        "connectionId": connection_ref.id
    })


@app.route("/api/connection/pending", methods=["GET"])
def get_pending_invitations():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = db.collection("users").document(uid).get()
    user_email = user_doc.to_dict().get("email")

    # get invitations where current user is user2
    pending = db.collection("connections").where(
        "status", "==", "pending").where("user2", "==", user_email).get()

    invitations = []
    for invite in pending:
        invite_data = invite.to_dict()
        inviter_email = invite_data["user1"]

        # get inviter's name
        inviter = db.collection("users").where(
            "email", "==", inviter_email).get()
        inviter_name = None
        if inviter:
            inviter_name = list(inviter)[0].to_dict().get("name")

        invitations.append({
            "id": invite.id,
            "from": {
                "email": inviter_email,
                "name": inviter_name
            },
            "createdAt": invite_data["createdAt"].isoformat() if isinstance(invite_data["createdAt"], datetime.datetime) else invite_data["createdAt"]
        })

    return jsonify({"invitations": invitations})


@app.route("/api/connection/<string:connection_id>/accept", methods=["POST"])
def accept_invitation(connection_id):
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = db.collection("users").document(uid).get()
    user_email = user_doc.to_dict().get("email")

    # get the connection invitation
    conn_ref = db.collection("connections").document(connection_id)
    conn = conn_ref.get()

    if not conn.exists:
        return jsonify({"error": "Invitation not found"}), 404

    conn_data = conn.to_dict()

    # verify this user is the invitee
    if conn_data["user2"] != user_email:
        return jsonify({"error": "Not authorized to accept this invitation"}), 403

    # check if the invitation is already accepted
    if conn_data["status"] == "active":
        return jsonify({"error": "Invitation already accepted"}), 400

    # accept the invitation
    conn_ref.update({
        "status": "active",
        "updatedAt": datetime.datetime.now()
    })

    if conn_data["status"] == "pending":
        conn_ref.update({
            "status": "active",
            "updatedAt": datetime.datetime.now()
        })

        user1_email = conn_data["user1"]  # inviter
        user2_email = conn_data["user2"]  # invitee

        # IMPORTANT: Update existing events to include both users in connectedUsers
        # 1. Get events created by user1 (inviter) and add user2 to them
        user1_events = db.collection("ddays").where(
            "createdBy", "==", user1_email).get()
        for event in user1_events:
            event_ref = db.collection("ddays").document(event.id)
            event_data = event.to_dict()
            connected_users = set(event_data.get("connectedUsers", []))
            connected_users.add(user2_email)
            event_ref.update({"connectedUsers": list(connected_users)})

        # 2. Get events created by user2 (invitee/current user) and add user1 to them
        user2_events = db.collection("ddays").where(
            "createdBy", "==", user2_email).get()
        for event in user2_events:
            event_ref = db.collection("ddays").document(event.id)
            event_data = event.to_dict()
            connected_users = set(event_data.get("connectedUsers", []))
            connected_users.add(user1_email)
            event_ref.update({"connectedUsers": list(connected_users)})

    return jsonify({"message": "Connection accepted"})


@app.route("/api/connection/<string:connection_id>/reject", methods=["POST"])
def reject_invitation(connection_id):
    # reject or cancle connection
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = db.collection("users").document(uid).get()
    user_email = user_doc.to_dict().get("email")

    # get the connection invitation
    conn_ref = db.collection("connections").document(connection_id)
    conn = conn_ref.get()

    if not conn.exists:
        return jsonify({"error": "Invitation not found"}), 404

    conn_data = conn.to_dict()

    # verify this user is the invitee
    if conn_data["user1"] != user_email and conn_data["user2"] != user_email:
        return jsonify({"error": "Not authorized to reject this invitation"}), 403

    # delete all related events
    user1_email = conn_data["user1"]
    user2_email = conn_data["user2"]

    # IMPORTANT: remove all access to each other's events
    user1_events = db.collection("ddays").where(
        "createdBy", "==", user1_email).get()
    for event in user1_events:
        event_ref = db.collection("ddays").document(event.id)
        event_data = event.to_dict()
        connected_users = set(event_data.get("connectedUsers", []))
        if user2_email in connected_users:
            connected_users.discard(user2_email)
        event_ref.update({"connectedUsers": list(connected_users)})

    user2_events = db.collection("ddays").where(
        "createdBy", "==", user2_email).get()
    for event in user2_events:
        event_ref = db.collection("ddays").document(event.id)
        event_data = event.to_dict()
        connected_users = set(event_data.get("connectedUsers", []))
        if user1_email in connected_users:
            connected_users.discard(user1_email)
        event_ref.update({"connectedUsers": list(connected_users)})

    # delete the connection invitation
    conn_ref.delete()

    return jsonify({"message": "Connection removed successfully"})


# ======== run ==========
if __name__ == "__main__":
    if ENV == "development":
        app.run(host="127.0.0.1", port=5000, debug=True)
    else:
        port = int(os.environ.get("PORT", 5000))
        app.run(host="0.0.0.0", port=port)
