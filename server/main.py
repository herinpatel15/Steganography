from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import stepic
from PIL import Image

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def homePage():
    return jsonify({"massage": "hello world!"})

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "file not upload"})

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "file is not selected"})

    if file:
        try:
            img = Image.open(file)
            decode = stepic.decode(img)
            decode_data = str(decode)

            file.save(os.path.join(app.config['UPLOAD_FOLDER'], "output.png"))

            return jsonify({
                "message": "This image is already convert in stago...",
                "textData": decode_data,
                "downloadLink": "download_image",
                "class": "green"
            })
        except:
            return jsonify({
                "message": "This file is not encoded so pleas first create stago image...",
                "textData": "",
                "downloadLink": 'error',
                "class": "red"
            })


@app.route("/create", methods=["POST"])
def create_file():
    if "file" not in request.files:
        return jsonify({"error": "file not upload"})

    file = request.files["file"]
    text = request.form.get("textData")

    if file.filename == "":
        return jsonify({"error": "file is not selected"})

    if file:
        try:
            img = Image.open(file)
            img_stegano = stepic.encode(img, text.encode())

            img_decode = stepic.decode(img_stegano)
            image_decode_data = str(img_decode)

            img_stegano.save(os.path.join(
                app.config['UPLOAD_FOLDER'], "output.png"))

            return jsonify({
                "message": "create image successfully...",
                "textData": image_decode_data,
                "downloadLink": "download_image",
                "class": "green"
            })
        except:
            return jsonify({
                "message": "This file is not encoded so pleas first create stago image...",
                "textData": "",
                "downloadLink": 'error',
                "class": "red"
            })


@app.route("/download_image")
def download_image():
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], "output.png")
    return send_file(img_path, as_attachment=True)


if __name__ == '__main__':
    app.run()
