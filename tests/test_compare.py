import io
import os
import sys
from docx import Document

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from app import app


def create_docx(text: str) -> bytes:
    document = Document()
    document.add_paragraph(text)
    buffer = io.BytesIO()
    document.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()


def test_compare_route_returns_all_html():
    client = app.test_client()
    base_content = create_docx("Base text")
    new_content = create_docx("New text")
    data = {
        'base_file': (io.BytesIO(base_content), 'base.docx'),
        'new_file': (io.BytesIO(new_content), 'new.docx'),
    }
    response = client.post('/compare', data=data, content_type='multipart/form-data')
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    assert 'Base text' in html
    assert 'New text' in html
    # side-by-side container should be present
    assert 'side-by-side' in html
