from htmldiff2 import render_html_diff
import mammoth
from flask import Flask, render_template, request, send_file
import io
import os
import pypandoc # <-- ADDED: Import pypandoc
import tempfile # <-- ADDED: Import the tempfile module

app = Flask(__name__)

# This route is unchanged
@app.route('/')
def index():
    return render_template('index.html')

# This route is unchanged
@app.route('/compare', methods=['POST'])
def compare():
    base_file = request.files['base_file']
    new_file = request.files['new_file']
    base_html = mammoth.convert_to_html(io.BytesIO(base_file.read())).value
    new_html = mammoth.convert_to_html(io.BytesIO(new_file.read())).value
    comparison_html = render_html_diff(base_html, new_html)
    return render_template(
        'result.html',
        comparison_html=comparison_html,
        base_html=base_html,
        new_html=new_html,
    )

# --- REPLACE YOUR OLD EXPORT FUNCTION WITH THIS ONE ---
@app.route('/export', methods=['POST'])
def export_docx():
    """Receives edited HTML and converts it to DOCX using a temporary file."""
    html_content = request.data.decode('utf-8')
    temp_file_path = None # Initialize to None

    try:
        # 1. Create a named temporary file that won't be deleted automatically.
        # We need a real file path to give to pypandoc.
        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as temp:
            temp_file_path = temp.name

        # 2. Tell pypandoc to write the DOCX output directly to our temp file.
        pypandoc.convert_text(
            html_content,
            'docx',
            format='html',
            outputfile=temp_file_path
        )

        # 3. Send the generated file to the user for download.
        return send_file(
            temp_file_path,
            as_attachment=True,
            download_name='version_3.docx',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    finally:
        # 4. CRUCIAL: Clean up by deleting the temporary file from the server
        # after it has been sent to the user.
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # Default to 5000 if PORT not set
    app.run(host='0.0.0.0', port=port, debug=True)
