from flask import Flask, render_template, request
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
import markdown as md

app = Flask(__name__)
client = genai.configure(api_key="AIzaSyCPUEoGr6GsEo6TkBT-dg9E0PJUJcm5JqE")
model = genai.GenerativeModel(model_name="gemini-2.5-flash-preview-05-20")

@app.route("/", methods = ["GET", "POST"])
def chat():
    try:
        question_text = ""
        if request.method == "POST":
            user = request.form["input"]
            if user:
                question = model.generate_content(user)
                question_text = md.markdown(question.text)
            else: 
                question_text = "Lỗi xin vui lòng nhập nội dung..." 
    except genai.types.ResourceExhausted as e:
        question_text = "Hết lượt nhập."
    return render_template("index.html", question = question_text)

if __name__ == "__main__":
    app.run(debug=True)