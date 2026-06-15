from flask import Flask
from routes.check import check_bp
from routes.history import history_bp
from routes.stats import stats_bp


app = Flask(__name__)

app.register_blueprint(check_bp)
app.register_blueprint(history_bp)
app.register_blueprint(stats_bp)

@app.route("/")
def home():
    return "Running"

if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5000, debug=False)


