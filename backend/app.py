from flask import Flask
from routes.check import check_bp

app = Flask(__name__)

app.register_blueprint(check_bp)
print(app.url_map)

@app.route("/")
def home():
    return "Phishing Detection Backend Running"

if __name__ == "__main__":
    app.run(debug=True)


@app.route("/test")
def test():
    return "Test route works"