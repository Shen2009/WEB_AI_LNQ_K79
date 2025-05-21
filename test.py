from flask import Flask, render_template, request
import google.generativeai as genai

app = Flask(__name__)
client = genai.configure(api_key="AIzaSyCPUEoGr6GsEo6TkBT-dg9E0PJUJcm5JqE")
model = genai.GenerativeModel("gemini-pro")
@app.route("/")
def index():

@app.route("/chat", methods = ["POST"])
