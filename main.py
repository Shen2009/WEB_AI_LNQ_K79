from flask import Flask, render_template, request
import google.generativeai as genai

app = Flask(__name__)
client = genai.configure(api_key="AIzaSyCPUEoGr6GsEo6TkBT-dg9E0PJUJcm5JqE")
model = genai.GenerativeModel(model_name="models/gemini-2.5-flash-preview-05-20")

@app.route("/", methods = ["GET", "POST"])
def chat():
    question_text = ""
    if request.method == "POST":
        user = request.form["input"]
        if user:
            question = model.generate_content(user)
            question_text = question.text
        else:
            question_text = "Lỗi xin vui lòng thử lại..."
    else:
        print("Xin hãy nhập vào chatbox ")
    return render_template("index.html", question = question_text)

if __name__ == "__main__":
    app.run(debug=True)