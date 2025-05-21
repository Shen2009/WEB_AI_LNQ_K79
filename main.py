from flask import Flask, render_template, request, redirect, url_for
import google.generativeai as genai

app = Flask(__name__)
genai.configure(api_key="AIzaSyCPUEoGr6GsEo6TkBT-dg9E0PJUJcm5JqE") 
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["GET", "POST"])
def chat():
    user_input = ""
    bot_response = ""
    if request.method == "POST":
        user_input = request.form["input"]
        if user_input:
            try:
                #chatbot trả lời bằng tiếng Việt
                prompt = f"Trả lời bằng tiếng Việt: {user_input}"
                response = model.generate_content(prompt)
                bot_response = response.text
            except Exception as e:
                bot_response = f"Lỗi: {str(e)}"
        else:
            bot_response = "Vui lòng nhập câu hỏi."
    return render_template("chat.html", user_input=user_input, bot_response=bot_response)

if __name__ == "__main__":
    app.run(debug=True)