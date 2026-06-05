#!/usr/bin/env python3
"""
VulnApp - Aplicação Web Intencionalmente Vulnerável
Para testes de bug bounty e pentest a fundo

Vulnerabilidades incluídas:
1. SQL Injection
2. XSS (Stored e Reflected)
3. IDOR
4. CSRF
5. Broken Authentication
6. Path Traversal
7. Insecure Deserialization
8. Command Injection
9. LFI/RFI
10. SSTI

Autor: Jarvis | Mestre: Ibatle
"""

from flask import Flask, request, render_template_string, make_response, redirect, url_for, session, jsonify
import sqlite3
import os
import json
import pickle
import hashlib
import base64
import subprocess
from pathlib import Path

app = Flask(__name__)
app.secret_key = 'vulnapp_secret_key_12345'

DB_PATH = 'vuln_app.db'

# ============================================================================
# DATABASE SETUP
# ============================================================================

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        password TEXT,
        email TEXT,
        role TEXT,
        balance REAL
    )''')
    
    # Posts table (for XSS)
    c.execute('''CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY,
        title TEXT,
        content TEXT,
        author TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Comments table (for stored XSS)
    c.execute('''CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY,
        post_id INTEGER,
        user_id INTEGER,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Products table (for IDOR)
    c.execute('''CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT,
        price REAL,
        owner_id INTEGER,
        secret_info TEXT
    )''')
    
    # Insert sample data
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        # Admin user
        c.execute("INSERT INTO users VALUES (1, 'admin', 'admin123', 'admin@vulnapp.local', 'admin', 10000.00)")
        # Regular users
        c.execute("INSERT INTO users VALUES (2, 'user1', 'password1', 'user1@test.com', 'user', 500.00)")
        c.execute("INSERT INTO users VALUES (3, 'user2', 'password2', 'user2@test.com', 'user', 250.00)")
        c.execute("INSERT INTO users VALUES (4, 'guest', 'guest123', 'guest@test.com', 'user', 0.00)")
    
    c.execute("SELECT COUNT(*) FROM posts")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO posts (id, title, content, author) VALUES (1, 'Welcome', 'Welcome to VulnApp!', 'admin')")
        c.execute("INSERT INTO posts (id, title, content, author) VALUES (2, 'Test Post', 'This is a test post', 'user1')")
    
    c.execute("SELECT COUNT(*) FROM products")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO products VALUES (1, 'Laptop', 999.99, 1, 'Secret: admin owns this')")
        c.execute("INSERT INTO products VALUES (2, 'Phone', 599.99, 2, 'Secret: user1 owns this')")
        c.execute("INSERT INTO products VALUES (3, 'Tablet', 399.99, 3, 'Secret: user2 owns this')")
    
    conn.commit()
    conn.close()

# ============================================================================
# VULNERABILITY 1: SQL Injection (Login)
# ============================================================================

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '')
        password = request.form.get('password', '')
        
        # VULNERABLE: String concatenation in SQL
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
        c.execute(query)
        user = c.fetchone()
        conn.close()
        
        if user:
            session['user_id'] = user[0]
            session['username'] = user[1]
            session['role'] = user[4]
            return f"<h1>Welcome {user[1]}!</h1><p>Role: {user[4]}</p><p>Email: {user[3]}</p><a href='/'>Home</a>"
        else:
            return "<h1>Login Failed</h1><p>Invalid credentials</p><a href='/login'>Try Again</a>"
    
    return '''
    <h1>Login</h1>
    <form method="POST">
        <input type="text" name="username" placeholder="Username"><br>
        <input type="password" name="password" placeholder="Password"><br>
        <button type="submit">Login</button>
    </form>
    <p>Hint: Try SQL injection with username: <code>admin' OR '1'='1' --</code></p>
    '''

# ============================================================================
# VULNERABILITY 2: SQL Injection (Search)
# ============================================================================

@app.route('/search')
def search():
    q = request.args.get('q', '')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # VULNERABLE: String concatenation
    query = f"SELECT * FROM users WHERE username LIKE '%{q}%'"
    c.execute(query)
    results = c.fetchall()
    conn.close()
    
    output = f"<h1>Search Results for: {q}</h1>"
    for user in results:
        output += f"<p>ID: {user[0]} | User: {user[1]} | Pass: {user[2]} | Email: {user[3]} | Role: {user[4]} | Balance: {user[5]}</p>"
    output += "<p><a href='/'>Home</a></p>"
    
    return output

# ============================================================================
# VULNERABILITY 3: Reflected XSS
# ============================================================================

@app.route('/greet')
def greet():
    name = request.args.get('name', 'Guest')
    # VULNERABLE: No sanitization
    return f"<h1>Hello, {name}!</h1><p><a href='/'>Home</a></p>"

# ============================================================================
# VULNERABILITY 4: Stored XSS
# ============================================================================

@app.route('/posts', methods=['GET', 'POST'])
def posts():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    if request.method == 'POST':
        title = request.form.get('title', '')
        content = request.form.get('content', '')
        author = session.get('username', 'anonymous')
        
        # VULNERABLE: No sanitization
        c.execute(f"INSERT INTO posts (title, content, author) VALUES ('{title}', '{content}', '{author}')")
        conn.commit()
        return redirect('/posts')
    
    c.execute("SELECT * FROM posts")
    all_posts = c.fetchall()
    conn.close()
    
    output = "<h1>Posts</h1>"
    for post in all_posts:
        # VULNERABLE: Rendering user input directly
        output += f"<div><h3>{post[1]}</h3><p>{post[2]}</p><small>By: {post[3]} | {post[4]}</small></div><hr>"
    
    output += '''
    <h2>Create Post</h2>
    <form method="POST">
        <input type="text" name="title" placeholder="Title"><br>
        <textarea name="content" placeholder="Content"></textarea><br>
        <button type="submit">Post</button>
    </form>
    <p><a href='/'>Home</a></p>
    '''
    return output

# ============================================================================
# VULNERABILITY 5: IDOR (Insecure Direct Object Reference)
# ============================================================================

@app.route('/profile/<int:user_id>')
def profile(user_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # VULNERABLE: No authorization check - anyone can access any profile
    c.execute(f"SELECT * FROM users WHERE id={user_id}")
    user = c.fetchone()
    conn.close()
    
    if user:
        return f"""
        <h1>Profile</h1>
        <p>ID: {user[0]}</p>
        <p>Username: {user[1]}</p>
        <p>Password: {user[2]}</p>
        <p>Email: {user[3]}</p>
        <p>Role: {user[4]}</p>
        <p>Balance: ${user[5]}</p>
        <p><a href='/'>Home</a></p>
        """
    return "User not found"

# ============================================================================
# VULNERABILITY 6: IDOR (Products)
# ============================================================================

@app.route('/product/<int:product_id>')
def product(product_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # VULNERABLE: No authorization check
    c.execute(f"SELECT * FROM products WHERE id={product_id}")
    product = c.fetchone()
    conn.close()
    
    if product:
        return f"""
        <h1>Product</h1>
        <p>ID: {product[0]}</p>
        <p>Name: {product[1]}</p>
        <p>Price: ${product[2]}</p>
        <p>Owner ID: {product[3]}</p>
        <p>Secret Info: {product[4]}</p>
        <p><a href='/'>Home</a></p>
        """
    return "Product not found"

# ============================================================================
# VULNERABILITY 7: Path Traversal
# ============================================================================

@app.route('/download')
def download():
    filename = request.args.get('file', 'default.txt')
    # VULNERABLE: No path validation
    filepath = os.path.join('uploads', filename)
    
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        return f"<h1>File: {filename}</h1><pre>{content}</pre><p><a href='/'>Home</a></p>"
    except:
        return f"Error reading file: {filename}"

# ============================================================================
# VULNERABILITY 8: Command Injection
# ============================================================================

@app.route('/ping', methods=['GET', 'POST'])
def ping():
    if request.method == 'POST':
        host = request.form.get('host', '127.0.0.1')
        # VULNERABLE: Direct command execution
        try:
            result = subprocess.check_output(f"ping -c 1 {host}", shell=True, text=True, timeout=10)
            return f"<h1>Ping Result</h1><pre>{result}</pre><p><a href='/'>Home</a></p>"
        except Exception as e:
            return f"<h1>Error</h1><p>{str(e)}</p><p><a href='/'>Home</a></p>"
    
    return '''
    <h1>Network Test</h1>
    <form method="POST">
        <input type="text" name="host" placeholder="IP or Hostname"><br>
        <button type="submit">Ping</button>
    </form>
    <p><a href='/'>Home</a></p>
    '''

# ============================================================================
# VULNERABILITY 9: Insecure Deserialization
# ============================================================================

@app.route('/deserialize', methods=['POST'])
def deserialize():
    data = request.form.get('data', '')
    try:
        decoded = base64.b64decode(data)
        # VULNERABLE: Unsafe deserialization
        obj = pickle.loads(decoded)
        return f"<h1>Deserialized</h1><p>Type: {type(obj)}</p><p>Value: {obj}</p><p><a href='/'>Home</a></p>"
    except Exception as e:
        return f"<h1>Error</h1><p>{str(e)}</p><p><a href='/'>Home</a></p>"

# ============================================================================
# VULNERABILITY 10: SSTI (Server-Side Template Injection)
# ============================================================================

@app.route('/template')
def template_render():
    tpl = request.args.get('tpl', 'Hello {{ name }}')
    name = request.args.get('name', 'Guest')
    
    # VULNERABLE: Direct template rendering with user input
    template = f"""
    <h1>Template Render</h1>
    <p>Template: {tpl}</p>
    <p>Result: {render_template_string(tpl, name=name)}</p>
    <p><a href='/'>Home</a></p>
    """
    return template

# ============================================================================
# VULNERABILITY 11: CSRF (No token validation)
# ============================================================================

@app.route('/transfer', methods=['POST'])
def transfer():
    # VULNERABLE: No CSRF token
    from_account = request.form.get('from', '')
    to_account = request.form.get('to', '')
    amount = request.form.get('amount', '0')
    
    return f"""
    <h1>Transfer Complete</h1>
    <p>From: {from_account}</p>
    <p>To: {to_account}</p>
    <p>Amount: ${amount}</p>
    <p><a href='/'>Home</a></p>
    """

# ============================================================================
# VULNERABILITY 12: Broken Access Control (Admin)
# ============================================================================

@app.route('/admin')
def admin_panel():
    # VULNERABLE: Only checks if logged in, not role
    if 'user_id' not in session:
        return redirect('/login')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM users")
    users = c.fetchall()
    conn.close()
    
    output = "<h1>Admin Panel</h1>"
    for user in users:
        output += f"<p>ID: {user[0]} | User: {user[1]} | Pass: {user[2]} | Role: {user[4]} | Balance: {user[5]}</p>"
    output += "<p><a href='/'>Home</a></p>"
    return output

# ============================================================================
# VULNERABILITY 13: Information Disclosure
# ============================================================================

@app.route('/api/users')
def api_users():
    # VULNERABLE: No authentication, returns all users
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM users")
    users = c.fetchall()
    conn.close()
    
    return jsonify([{
        'id': u[0],
        'username': u[1],
        'password': u[2],
        'email': u[3],
        'role': u[4],
        'balance': u[5]
    } for u in users])

# ============================================================================
# VULNERABILITY 14: XXE (XML External Entity)
# ============================================================================

@app.route('/xml', methods=['POST'])
def parse_xml():
    xml_data = request.data.decode()
    try:
        import xml.etree.ElementTree as ET
        # VULNERABLE: Allows external entities
        root = ET.fromstring(xml_data)
        return f"<h1>XML Parsed</h1><p>Tag: {root.tag}</p><p>Text: {root.text}</p><p><a href='/'>Home</a></p>"
    except Exception as e:
        return f"<h1>Error</h1><p>{str(e)}</p>"

# ============================================================================
# HOME PAGE
# ============================================================================

@app.route('/')
def home():
    return """
    <h1>VulnApp - Intentionally Vulnerable Web Application</h1>
    <p>For bug bounty and pentest training</p>
    <hr>
    <h2>Vulnerabilities</h2>
    <ul>
        <li><a href='/login'>1. SQL Injection (Login)</a></li>
        <li><a href='/search?q=test'>2. SQL Injection (Search)</a></li>
        <li><a href='/greet?name=Guest'>3. Reflected XSS</a></li>
        <li><a href='/posts'>4. Stored XSS</a></li>
        <li><a href='/profile/1'>5. IDOR (User Profiles)</a></li>
        <li><a href='/product/1'>6. IDOR (Products)</a></li>
        <li><a href='/download?file=default.txt'>7. Path Traversal</a></li>
        <li><a href='/ping'>8. Command Injection</a></li>
        <li><a href='/template?tpl=Hello%20{{name}}'>10. SSTI</a></li>
        <li><a href='/admin'>12. Broken Access Control (Admin)</a></li>
        <li><a href='/api/users'>13. Information Disclosure</a></li>
    </ul>
    <p>Try: <a href='/login'>Login</a> | <a href='/admin'>Admin Panel</a></p>
    """

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    init_db()
    os.makedirs('uploads', exist_ok=True)
    
    # Create test files
    with open('uploads/default.txt', 'w') as f:
        f.write('This is a default file')
    with open('uploads/secret.txt', 'w') as f:
        f.write('FLAG{path_traversal_success}')
    
    print("[VulnApp] Starting vulnerable web application...")
    print("[VulnApp] URL: http://localhost:5000")
    print("[VulnApp] 14 vulnerabilities included")
    app.run(host='0.0.0.0', port=5000, debug=True)
