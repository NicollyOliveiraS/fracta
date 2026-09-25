import sqlite3
import os
from datetime import datetime
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), "fracta.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Tabela de Turmas
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS turmas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL,
        ano_escolar TEXT NOT NULL
    );
    """)

    # Tabela de Usuários com campo de Turma
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        tipo_usuario TEXT NOT NULL DEFAULT 'aluno',
        turma TEXT,
        ano_escolar TEXT,
        data_cadastro TEXT NOT NULL
    );
    """)

    # Tabela de Histórico de Atividades, Notas, Tentativas, Acertos e Erros
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS atividades_desempenho (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_aluno INTEGER NOT NULL,
        id_capitulo INTEGER NOT NULL,
        titulo_capitulo TEXT NOT NULL,
        ano TEXT NOT NULL,
        turma TEXT NOT NULL,
        tentativas INTEGER DEFAULT 1,
        acertos INTEGER NOT NULL,
        erros INTEGER NOT NULL,
        total_questoes INTEGER NOT NULL,
        nota REAL NOT NULL,
        porcentagem INTEGER NOT NULL,
        concluida INTEGER DEFAULT 0,
        data TEXT NOT NULL,
        FOREIGN KEY(id_aluno) REFERENCES usuarios(id) ON DELETE CASCADE
    );
    """)

    # Inserir turmas padrão
    turmas_iniciais = [
        ("6º A", "6º ano"),
        ("6º B", "6º ano"),
        ("7º A", "7º ano"),
        ("7º B", "7º ano")
    ]
    for nome, ano in turmas_iniciais:
        cursor.execute("INSERT OR IGNORE INTO turmas (nome, ano_escolar) VALUES (?, ?)", (nome, ano))

    # Inserir usuários padrão compatíveis caso o banco seja novo
    cursor.execute("SELECT COUNT(*) as qtd FROM usuarios")
    if cursor.fetchone()["qtd"] == 0:
        usuarios_seed = [
            ("Pedro", "pedro@gmail.com", generate_password_hash("123456"), "professor", None, None, "2026-05-29T18:24:01Z"),
            ("Beatriz Sousa de Andrade", "beatriz.hater@yahoo.com", generate_password_hash("123456"), "aluno", "6º A", "6º ano", "2026-08-28T18:41:12Z"),
            ("Nicolly", "nicolly.oliveira@gmail.com", generate_password_hash("123456"), "aluno", "6º B", "6º ano", "2026-09-05T18:29:31Z"),
            ("Nicolly Oliveira", "nicolly.oliveira.senai1@gmail.com", generate_password_hash("123456"), "aluno", "7º A", "7º ano", "2026-09-18T16:43:31Z"),
            ("Nicolly Oliveira Santos", "nicolly.santos8@portalsesisp.org", generate_password_hash("123456"), "aluno", "7º B", "7º ano", "2026-09-18T18:04:43Z")
        ]
        for u in usuarios_seed:
            cursor.execute("""
            INSERT INTO usuarios (nome, email, senha, tipo_usuario, turma, ano_escolar, data_cadastro)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, u)

        # Adiciona histórico inicial para os alunos para manter compatibilidade
        cursor.execute("SELECT id, turma, ano_escolar FROM usuarios WHERE tipo_usuario = 'aluno'")
        alunos = cursor.fetchall()
        for al in alunos:
            al_id = al["id"]
            al_turma = al["turma"]
            al_ano = al["ano_escolar"]
            # Atividade 1
            cursor.execute("""
            INSERT INTO atividades_desempenho (id_aluno, id_capitulo, titulo_capitulo, ano, turma, tentativas, acertos, erros, total_questoes, nota, porcentagem, concluida, data)
            VALUES (?, 1, 'Capítulo 1 — A origem das frações', ?, ?, 1, 5, 0, 5, 10.0, 100, 1, ?)
            """, (al_id, al_ano, al_turma, "2026-09-20T14:30:00Z"))
            # Atividade 2
            cursor.execute("""
            INSERT INTO atividades_desempenho (id_aluno, id_capitulo, titulo_capitulo, ano, turma, tentativas, acertos, erros, total_questoes, nota, porcentagem, concluida, data)
            VALUES (?, 2, 'Capítulo 2 — A barragem de Bento', ?, ?, 1, 4, 1, 5, 8.0, 80, 0, ?)
            """, (al_id, al_ano, al_turma, "2026-09-22T10:15:00Z"))

    conn.commit()
    conn.close()

init_db()

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "api": "Fracta Local Backend",
        "version": "2.0",
        "status": "online"
    })

@app.route("/turmas", methods=["GET"])
def listar_turmas():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM turmas ORDER BY nome ASC")
    turmas = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(turmas)

@app.route("/usuarios", methods=["GET"])
def listar_usuarios():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, nome, email, tipo_usuario, turma, ano_escolar, data_cadastro
    FROM usuarios
    ORDER BY id ASC
    """)
    usuarios = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(usuarios)

@app.route("/usuarios", methods=["POST"])
def criar_usuario():
    dados = request.get_json(silent=True) or {}
    nome = dados.get("nome", "").strip()
    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "")
    tipo_usuario = dados.get("tipo_usuario", "aluno")
    turma = dados.get("turma")

    if not nome or not email or not senha:
        return jsonify({"erro": "Nome, e-mail e senha são obrigatórios"}), 400

    if tipo_usuario == "aluno":
        if not turma or turma not in ["6º A", "6º B", "7º A", "7º B"]:
            return jsonify({"erro": "Turma é obrigatória para alunos (6º A, 6º B, 7º A ou 7º B)"}), 400
        ano_escolar = "7º ano" if "7" in turma else "6º ano"
    else:
        turma = None
        ano_escolar = None

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM usuarios WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"erro": "E-mail já cadastrado"}), 400

    senha_hash = generate_password_hash(senha)
    data_cadastro = datetime.utcnow().isoformat() + "Z"

    cursor.execute("""
    INSERT INTO usuarios (nome, email, senha, tipo_usuario, turma, ano_escolar, data_cadastro)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (nome, email, senha_hash, tipo_usuario, turma, ano_escolar, data_cadastro))
    novo_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "mensagem": "Usuário cadastrado com sucesso",
        "id": novo_id,
        "usuario": {
            "id": novo_id,
            "nome": nome,
            "email": email,
            "tipo_usuario": tipo_usuario,
            "turma": turma,
            "ano_escolar": ano_escolar
        }
    }), 201

@app.route("/usuarios/<int:id_usuario>", methods=["DELETE"])
def deletar_usuario(id_usuario):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM usuarios WHERE id = ?", (id_usuario,))
    conn.commit()
    conn.close()
    return jsonify({"mensagem": "Usuário excluído com sucesso"}), 200

@app.route("/login", methods=["POST"])
def login():
    dados = request.get_json(silent=True) or {}
    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "")

    if not email or not senha:
        return jsonify({"erro": "Email e senha são obrigatórios"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE email = ?", (email,))
    usuario = cursor.fetchone()
    conn.close()

    if not usuario or not check_password_hash(usuario["senha"], senha):
        return jsonify({"erro": "Credenciais inválidas"}), 401

    return jsonify({
        "mensagem": "Login realizado com sucesso",
        "token": f"token-fracta-{usuario['id']}",
        "usuario": {
            "id": usuario["id"],
            "nome": usuario["nome"],
            "email": usuario["email"],
            "tipo_usuario": usuario["tipo_usuario"],
            "turma": usuario["turma"],
            "ano_escolar": usuario["ano_escolar"]
        }
    }), 200

@app.route("/atividades", methods=["POST"])
def registrar_atividade():
    dados = request.get_json(silent=True) or {}
    id_aluno = dados.get("id_aluno")
    id_capitulo = dados.get("id_capitulo")
    titulo_capitulo = dados.get("titulo_capitulo", f"Capítulo {id_capitulo}")
    acertos = int(dados.get("acertos", 0))
    total_questoes = int(dados.get("total_questoes", 5))

    if not id_aluno or not id_capitulo:
        return jsonify({"erro": "id_aluno e id_capitulo são obrigatórios"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE id = ?", (id_aluno,))
    aluno = cursor.fetchone()
    if not aluno:
        conn.close()
        return jsonify({"erro": "Aluno não encontrado"}), 404

    turma = aluno["turma"] or "6º A"
    ano = aluno["ano_escolar"] or ("7º ano" if "7" in turma else "6º ano")
    erros = total_questoes - acertos
    nota = round((acertos / total_questoes) * 10, 1)
    porcentagem = round((acertos / total_questoes) * 100)
    concluida = 1 if porcentagem >= 85 else 0
    data_iso = datetime.utcnow().isoformat() + "Z"

    # Quantidade de tentativas anteriores
    cursor.execute("""
    SELECT COUNT(*) as total FROM atividades_desempenho
    WHERE id_aluno = ? AND id_capitulo = ?
    """, (id_aluno, id_capitulo))
    tentativas = cursor.fetchone()["total"] + 1

    cursor.execute("""
    INSERT INTO atividades_desempenho (id_aluno, id_capitulo, titulo_capitulo, ano, turma, tentativas, acertos, erros, total_questoes, nota, porcentagem, concluida, data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (id_aluno, id_capitulo, titulo_capitulo, ano, turma, tentativas, acertos, erros, total_questoes, nota, porcentagem, concluida, data_iso))
    conn.commit()
    conn.close()

    return jsonify({
        "mensagem": "Atividade registrada com sucesso",
        "nota": nota,
        "concluida": bool(concluida),
        "tentativas": tentativas
    }), 201

@app.route("/desempenho", methods=["GET"])
def obter_desempenho():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, nome, email, turma, ano_escolar FROM usuarios WHERE tipo_usuario = 'aluno'")
    alunos = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT * FROM atividades_desempenho")
    atividades = [dict(row) for row in cursor.fetchall()]
    conn.close()

    contagem_turmas = {"6º A": 0, "6º B": 0, "7º A": 0, "7º B": 0}
    soma_notas_turmas = {"6º A": 0, "6º B": 0, "7º A": 0, "7º B": 0}
    qtd_notas_turmas = {"6º A": 0, "6º B": 0, "7º A": 0, "7º B": 0}

    for al in alunos:
        t = al.get("turma") or "6º A"
        if t in contagem_turmas:
            contagem_turmas[t] += 1
        else:
            contagem_turmas["6º A"] += 1

    total_acertos = 0
    total_questoes = 0

    for ativ in atividades:
        t = ativ.get("turma") or "6º A"
        if t in soma_notas_turmas:
            soma_notas_turmas[t] += ativ["nota"]
            qtd_notas_turmas[t] += 1
        total_acertos += ativ["acertos"]
        total_questoes += ativ["total_questoes"]

    medias_turmas = {}
    for t in contagem_turmas:
        medias_turmas[t] = round(soma_notas_turmas[t] / qtd_notas_turmas[t], 1) if qtd_notas_turmas[t] > 0 else 0.0

    porcentagem_media = round((total_acertos / total_questoes) * 100) if total_questoes > 0 else 0

    return jsonify({
        "total_alunos": len(alunos),
        "alunos_por_turma": contagem_turmas,
        "media_por_turma": medias_turmas,
        "total_atividades": len(atividades),
        "porcentagem_media_acertos": porcentagem_media
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
