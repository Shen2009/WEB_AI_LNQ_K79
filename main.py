from flask import Flask, render_template, request, session, jsonify
import google.generativeai as genai

app = Flask(__name__)
app.secret_key = 'chimtokhonglochetdoi'
genai.configure(api_key="AIzaSyCPUEoGr6GsEo6TkBT-dg9E0PJUJcm5JqE") 
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

@app.route("/", methods=["GET", "POST"])
def index():
    user_input = session.get('user_input', '')
    bot_response = session.get('bot_response', '')
    if request.method == "POST":
        user_input = request.form.get('input', '')
        if user_input:
            try:
                prompt = f"Trả lời bằng tiếng Việt: {user_input}"
                response = model.generate_content(prompt)
                bot_response = response.text
            except Exception as e:
                bot_response = f"Lỗi: {str(e)}"
        else:
            bot_response = "Vui lòng nhập câu hỏi."
        session['user_input'] = user_input
        session['bot_response'] = bot_response
        # Render chat_body.html và trả về chuỗi HTML
        chat_body_html = render_template('chat_body.html', user_input=user_input, bot_response=bot_response)
        return chat_body_html
    return render_template("index.html", user_input=user_input, bot_response=bot_response)

if __name__ == "__main__":
    app.run(debug=True)