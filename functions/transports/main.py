from flask import Flask
from firebase_functions import https_fn
import application

app = Flask(__name__)


@https_fn.on_request(region='europe-west1')
def flask_transports(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()


app.register_blueprint(application.bp, url_prefix="/api/transports")
