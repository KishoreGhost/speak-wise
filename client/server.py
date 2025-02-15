from flask import Flask, jsonify
from flask_cors import CORS  # Add this line
import subprocess
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/run-script', methods=['GET'])
def run_script():
    script_path = os.path.join(os.getcwd(), "./FaceReco.py")  # Adjust the script path

    try:
        result = subprocess.run(["python", script_path], capture_output=True, text=True)
        return jsonify({"output": result.stdout, "error": result.stderr})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
