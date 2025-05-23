from flask import Flask, render_template, request, session, jsonify, redirect, url_for
import google.generativeai as genai
import sqlite3
import markdown as md
import uuid
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'chimtokhonglochetdoi'
genai.configure(api_key="AIzaSyCPUEoGr6GsEo6TkBT-dg9E0PJUJcm5JqE") 
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

# Hàm khởi tạo cơ sở dữ liệu
def init_db():
    with sqlite3.connect("chat_history.db") as conn:
        cursor = conn.cursor()
        # Tạo bảng nếu chưa có
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_input TEXT NOT NULL,
                bot_response TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        # Kiểm tra và thêm cột session_id nếu chưa có
        cursor.execute("PRAGMA table_info(chat_history)")
        columns = [info[1] for info in cursor.fetchall()]
        if 'session_id' not in columns:
            cursor.execute('ALTER TABLE chat_history ADD COLUMN session_id TEXT DEFAULT NULL')
        # Kiểm tra và thêm cột timestamp nếu chưa có
        if 'timestamp' not in columns:
            cursor.execute('ALTER TABLE chat_history ADD COLUMN timestamp DATETIME')
            # Cập nhật timestamp cho các dòng hiện có
            cursor.execute("UPDATE chat_history SET timestamp = CURRENT_TIMESTAMP WHERE timestamp IS NULL")
        conn.commit()

init_db()

@app.route("/", methods=["GET", "POST"])
def index():
    session.clear()
    user_input = session.get('user_input', '')
    bot_response = session.get('bot_response', '')
    history = []
    
    with sqlite3.connect("chat_history.db") as conn:
        cursor = conn.cursor()
        query = "SELECT user_input, bot_response FROM chat_history ORDER BY id DESC LIMIT 5"
        cursor.execute(query)
        history = cursor.fetchall()
        history = history[::-1]
        
    if request.method == "POST":
        user_input = request.form.get('input', '')
        if user_input:
            try:
                prompt = f"Trả lời: {user_input}"
                response = model.generate_content(prompt)
                bot_response = md.markdown(response.text)
                
                with sqlite3.connect("chat_history.db") as conn:
                    cursor = conn.cursor()
                    cursor.execute(
                        "INSERT INTO chat_history (user_input, bot_response) VALUES (?, ?)",
                        (user_input, bot_response)
                    )
                    conn.commit()
                history.append((user_input, bot_response))
                if len(history) > 5:
                    history.pop(0)
            except Exception as e:
                bot_response = f"Lỗi: {str(e)}"
        else:
            bot_response = "Vui lòng nhập câu hỏi."
        session['user_input'] = user_input
        session['bot_response'] = bot_response
        chat_body_html = render_template('chat_body.html', user_input=user_input, bot_response=bot_response)
        return chat_body_html
    return render_template("index.html", user_input=user_input, bot_response=bot_response, history=history)

@app.route("/chat", methods=["GET", "POST"])
def chat():
    session.clear()  # Reset session khi vào /chat
    history = []
    try:
        with sqlite3.connect("chat_history.db") as conn:
            cursor = conn.cursor()
            query = "SELECT user_input, bot_response FROM chat_history ORDER BY id DESC LIMIT 5"
            cursor.execute(query)
            history = cursor.fetchall()
            history = history[::-1]
    except sqlite3.OperationalError as e:
        return f"Lỗi cơ sở dữ liệu: {str(e)}"
    
    if request.method == "POST":
        user_input = request.form.get('input', '')
        if user_input:
            try:
                prompt = f"Trả lời: {user_input}"
                response = model.generate_content(prompt)
                bot_response = md.markdown(response.text)
                
                with sqlite3.connect("chat_history.db") as conn:
                    cursor = conn.cursor()
                    cursor.execute(
                        "INSERT INTO chat_history (user_input, bot_response) VALUES (?, ?)",
                        (user_input, bot_response)
                    )
                    conn.commit()
                history.append((user_input, bot_response))
                if len(history) > 5:
                    history.pop(0)
                return jsonify({'bot_response': bot_response})
            except Exception as e:
                return jsonify({'bot_response': f'Lỗi: {str(e)}'})
        else:
            return jsonify({'bot_response': 'Vui lòng nhập câu hỏi.'})
    
    return render_template("chat.html", history=history)

@app.route("/save_session", methods=["POST"])
def save_session():
    session_id = str(uuid.uuid4())
    user_inputs = request.form.getlist('user_inputs[]')
    bot_responses = request.form.getlist('bot_responses[]')
    
    try:
        with sqlite3.connect("chat_history.db") as conn:
            cursor = conn.cursor()
            for user_input, bot_response in zip(user_inputs, bot_responses):
                cursor.execute("PRAGMA table_info(chat_history)")
                columns = [info[1] for info in cursor.fetchall()]
                if 'session_id' in columns:
                    cursor.execute(
                        "UPDATE chat_history SET session_id = ? WHERE user_input = ? AND bot_response = ?",
                        (session_id, user_input, bot_response)
                    )
            conn.commit()
        return jsonify({'status': 'success', 'session_id': session_id})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route("/history")
def history():
    conn = sqlite3.connect("chat_history.db")
    cursor = conn.cursor()
    # Kiểm tra xem cột timestamp có tồn tại không
    cursor.execute("PRAGMA table_info(chat_history)")
    columns = [info[1] for info in cursor.fetchall()]
    if 'timestamp' in columns:
        cursor.execute("SELECT user_input, bot_response, timestamp FROM chat_history ORDER BY id DESC")
    else:
        cursor.execute("SELECT user_input, bot_response, 'N/A' AS timestamp FROM chat_history ORDER BY id DESC")
    row = cursor.fetchall()
    conn.close()
    return render_template("history.html", history=row)

if __name__ == "__main__":
    app.run(debug=True)