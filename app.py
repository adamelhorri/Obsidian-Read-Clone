from flask import Flask, render_template, request, jsonify
import os
import markdown2
import main

app = Flask(__name__)
root_directory = "c:/Users/ADAM/Desktop/PROJECT X/python reader/Obsidian Vault"
graph = main.build_graph(root_directory)
graph_data = main.get_graph_data(graph)
md_files_content = main.read_md_files(root_directory)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/graph')
def get_graph():
    return jsonify(graph_data)

@app.route('/readmd', methods=['POST'])
def read_md():
    title = request.json['title']
    content = md_files_content.get(title, f"Le fichier '{title}' n'a pas été trouvé.")
    return jsonify({'content': content})

if __name__ == '__main__':
    app.run(debug=True)
