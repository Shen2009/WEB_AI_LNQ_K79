from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import sqlite3
import markdown
import atexit

app = Flask(__name__)
app.secret_key = 'chimtokhonglochetdoi'
genai.configure(api_key="AIzaSyCPUEoGr6GsEo6TkBT-dg9E0PJUJcm5JqE") 
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

# Hàm lưu trữ lịch sử
def init_db():
    with sqlite3.connect("chat_history.db") as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_input TEXT NOT NULL,
                bot_response TEXT NOT NULL
            )
        ''')
        conn.commit()

# Hàm xóa cơ sở dữ liệu khi server dừng
def clear_database():
    try:
        with sqlite3.connect("chat_history.db") as conn:
            cursor = conn.cursor()
            cursor.execute("DROP TABLE IF EXISTS chat_history")
            conn.commit()
        print("Đã xóa bảng chat_history khi dừng server.")
    except Exception as e:
        print(f"Lỗi khi xóa bảng chat_history: {str(e)}")

#HHàm clear_database khi server dừng
atexit.register(clear_database)
init_db()

# Hàm lấy lịch sử trò chuyện
def get_chat_history(limit=5):
    with sqlite3.connect("chat_history.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_input, bot_response FROM chat_history ORDER BY id DESC LIMIT ?", (limit,))
        return cursor.fetchall()[::-1]

# Hàm xử lý tin nhắn
def process_message(user_input):
    try:
        prompt = f"Trả lời: {user_input}"
        response = model.generate_content(prompt)
        bot_response = markdown.markdown(response.text)  
        
        with sqlite3.connect("chat_history.db") as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO chat_history (user_input, bot_response) VALUES (?, ?)",
                (user_input, bot_response)
            )
            conn.commit()
            
        return bot_response
    except Exception as e:
        return f"Lỗi: {str(e)}"

@app.route("/", methods=["GET", "POST"])
def index():
    user_input = ""
    bot_response = ""
    history = get_chat_history()
    
    if request.method == "POST":
        user_input = request.form.get('input', '').strip()
        if user_input:
            bot_response = process_message(user_input)
            history = get_chat_history()
        else:
            bot_response = "Vui lòng nhập câu hỏi..."
    
    return render_template("index.html", user_input=user_input, bot_response=bot_response, history=history)

@app.route("/chat", methods=["GET", "POST"])
def chat():
    user_input = ""
    bot_response = ""
    history = get_chat_history()
    
    if request.method == "POST":
        user_input = request.form.get('input', '').strip()
        if user_input:
            bot_response = process_message(user_input)
            history = get_chat_history()
        else:
            bot_response = "Vui lòng nhập câu hỏi..."
    
    return render_template("chat.html", user_input=user_input, bot_response=bot_response, history=history)

# Xem lịch sử chatbot
@app.route("/history")
def history():
    with sqlite3.connect("chat_history.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_input, bot_response FROM chat_history ORDER BY id DESC")
        history = cursor.fetchall()
    return render_template("history.html", history=history)

@app.route("/send_message", methods=["POST"])
def send_message():
    user_input = request.form.get('input', '').strip()
    if user_input:
        bot_response = process_message(user_input)
        history = get_chat_history()
        return jsonify({
            'status': 'success',
            'user_input': user_input,
            'bot_response': bot_response,
            'history': history
        })
    return jsonify({'status': 'error', 'message': 'Vui lòng nhập câu hỏi.'})

# Thêm xóa lịch sử
@app.route("/clear_history", methods=["POST"])
def clear_history():
    with sqlite3.connect("chat_history.db") as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_history")
        conn.commit()
    return jsonify({'status': 'success'})

if __name__ == "__main__":
    app.run(debug=True)