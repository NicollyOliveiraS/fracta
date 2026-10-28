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

    # Tabela de Usuários com campo de Turma e Avatar
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        tipo_usuario TEXT NOT NULL DEFAULT 'aluno',
        turma TEXT,
        ano_escolar TEXT,
        avatar TEXT DEFAULT 'avatar-1',
        data_cadastro TEXT NOT NULL
    );
    """)

    # Migração segura para coluna avatar se já existir a tabela
    try:
        cursor.execute("ALTER TABLE usuarios ADD COLUMN avatar TEXT DEFAULT 'avatar-1'")
    except sqlite3.OperationalError:
        pass

    # Tabela de Conquistas Desbloqueadas por Aluno
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conquistas_usuario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_aluno INTEGER NOT NULL,
        conquista_id TEXT NOT NULL,
        nome TEXT NOT NULL,
        descricao TEXT NOT NULL,
        icone TEXT,
        data_desbloqueio TEXT NOT NULL,
        UNIQUE(id_aluno, conquista_id),
        FOREIGN KEY(id_aluno) REFERENCES usuarios(id) ON DELETE CASCADE
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
    SELECT id, nome, email, tipo_usuario, turma, ano_escolar, avatar, data_cadastro
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
    elif tipo_usuario == "professor":
        codigo_acesso = dados.get("codigo_acesso", "")
        if codigo_acesso != "fr4ct4@399":
            return jsonify({"erro": "Código de acesso institucional incorreto."}), 403
        turma = None
        ano_escolar = None
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
    avatar = dados.get("avatar", "avatar-1")

    cursor.execute("""
    INSERT INTO usuarios (nome, email, senha, tipo_usuario, turma, ano_escolar, avatar, data_cadastro)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (nome, email, senha_hash, tipo_usuario, turma, ano_escolar, avatar, data_cadastro))
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
            "ano_escolar": ano_escolar,
            "avatar": avatar
        }
    }), 201

@app.route("/usuarios/limpar-sem-turma", methods=["DELETE"])
def limpar_alunos_sem_turma():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        DELETE FROM usuarios
        WHERE tipo_usuario = 'aluno'
        AND (turma IS NULL OR turma = '')
    """)
    deletados = cursor.rowcount
    conn.commit()
    conn.close()
    return jsonify({"mensagem": f"{deletados} aluno(s) sem turma removido(s).", "deletados": deletados}), 200

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
            "ano_escolar": usuario["ano_escolar"],
            "avatar": usuario["avatar"] if "avatar" in usuario.keys() and usuario["avatar"] else "avatar-1"
        }
    }), 200

AVATARES_VALIDOS = [
    f"avatar-{i}" for i in range(1, 17)
]

def verificar_e_conceder_conquistas(cursor, id_aluno):
    conquistas_ganhas = []
    data_iso = datetime.utcnow().isoformat() + "Z"
    
    cursor.execute("SELECT * FROM atividades_desempenho WHERE id_aluno = ?", (id_aluno,))
    atividades = [dict(r) for r in cursor.fetchall()]
    total_ativ = len(atividades)
    if total_ativ == 0:
        return conquistas_ganhas
    
    # 1. Primeiro Passo (realizou primeira atividade)
    cursor.execute("""
    INSERT OR IGNORE INTO conquistas_usuario (id_aluno, conquista_id, nome, descricao, icone, data_desbloqueio)
    VALUES (?, 'primeiro_passo', 'Primeiros Passos', 'Realizou sua primeira atividade na plataforma', 'flag', ?)
    """, (id_aluno, data_iso))
    if cursor.rowcount > 0:
        conquistas_ganhas.append("primeiro_passo")
        
    # 2. Nota Máxima (nota 10.0)
    if any(a["nota"] >= 10.0 for a in atividades):
        cursor.execute("""
        INSERT OR IGNORE INTO conquistas_usuario (id_aluno, conquista_id, nome, descricao, icone, data_desbloqueio)
        VALUES (?, 'nota_maxima', 'Nota Máxima', 'Obteve nota 10 em um desafio de frações', 'star', ?)
        """, (id_aluno, data_iso))
        if cursor.rowcount > 0:
            conquistas_ganhas.append("nota_maxima")
            
    # 3. 100% de Acertos
    if any(a["porcentagem"] == 100 for a in atividades):
        cursor.execute("""
        INSERT OR IGNORE INTO conquistas_usuario (id_aluno, conquista_id, nome, descricao, icone, data_desbloqueio)
        VALUES (?, 'cem_porcento', '100% Acertos', 'Acertou todas as questões de um capítulo', 'check-badge', ?)
        """, (id_aluno, data_iso))
        if cursor.rowcount > 0:
            conquistas_ganhas.append("cem_porcento")

    # 4. Capítulos concluídos distintos
    caps_concluidos = set([a["id_capitulo"] for a in atividades if a["concluida"] == 1])
    
    # Explorador Dedicado (>= 3 capítulos concluídos)
    if len(caps_concluidos) >= 3:
        cursor.execute("""
        INSERT OR IGNORE INTO conquistas_usuario (id_aluno, conquista_id, nome, descricao, icone, data_desbloqueio)
        VALUES (?, 'explorador_dedicado', 'Explorador da Trilha', 'Concluiu mais de 50% da trilha de frações', 'map', ?)
        """, (id_aluno, data_iso))
        if cursor.rowcount > 0:
            conquistas_ganhas.append("explorador_dedicado")

    # Mestre das Frações (todos os 5 capítulos concluídos)
    if len(caps_concluidos) >= 5:
        cursor.execute("""
        INSERT OR IGNORE INTO conquistas_usuario (id_aluno, conquista_id, nome, descricao, icone, data_desbloqueio)
        VALUES (?, 'mestre_supremo', 'Mestre das Frações', 'Completou todos os 5 capítulos da trilha de Silas', 'trophy', ?)
        """, (id_aluno, data_iso))
        if cursor.rowcount > 0:
            conquistas_ganhas.append("mestre_supremo")

    # 6. Estudante Focado (3 ou mais atividades realizadas)
    if total_ativ >= 3:
        cursor.execute("""
        INSERT OR IGNORE INTO conquistas_usuario (id_aluno, conquista_id, nome, descricao, icone, data_desbloqueio)
        VALUES (?, 'estudante_focado', 'Estudante Focado', 'Realizou 3 ou mais atividades na plataforma', 'sparkles', ?)
        """, (id_aluno, data_iso))
        if cursor.rowcount > 0:
            conquistas_ganhas.append("estudante_focado")

    return conquistas_ganhas

@app.route("/avatares", methods=["GET"])
def listar_avatares():
    return jsonify({
        "avatares": [
            {"id": f"avatar-{i}", "nome": f"Avatar {i}", "caminho": f"img/avatares/avatar-{i}.svg"}
            for i in range(1, 17)
        ]
    })

@app.route("/usuarios/<int:id_usuario>", methods=["GET"])
def obter_usuario(id_usuario):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, nome, email, tipo_usuario, turma, ano_escolar, avatar, data_cadastro
        FROM usuarios WHERE id = ?
    """, (id_usuario,))
    u = cursor.fetchone()
    if not u:
        conn.close()
        return jsonify({"erro": "Usuário não encontrado"}), 404

    # Busca estatísticas do aluno
    cursor.execute("SELECT * FROM atividades_desempenho WHERE id_aluno = ?", (id_usuario,))
    atividades = [dict(r) for r in cursor.fetchall()]
    
    # Melhores notas por capítulo
    melhores_por_cap = {}
    for a in atividades:
        cap = a["id_capitulo"]
        if cap not in melhores_por_cap or a["nota"] > melhores_por_cap[cap]["nota"]:
            melhores_por_cap[cap] = a

    notas_validas = [v["nota"] for v in melhores_por_cap.values()]
    media_geral = round(sum(notas_validas) / len(notas_validas), 1) if notas_validas else 0.0

    cursor.execute("SELECT conquista_id, nome, descricao, icone, data_desbloqueio FROM conquistas_usuario WHERE id_aluno = ?", (id_usuario,))
    conquistas = [dict(r) for r in cursor.fetchall()]
    conn.close()

    dados_usuario = dict(u)
    dados_usuario["media_geral"] = media_geral
    dados_usuario["total_atividades"] = len(atividades)
    dados_usuario["capitulos_concluidos"] = len([v for v in melhores_por_cap.values() if v["concluida"] == 1])
    dados_usuario["conquistas"] = conquistas

    return jsonify(dados_usuario)

@app.route("/usuarios/<int:id_usuario>/avatar", methods=["PUT"])
def atualizar_avatar(id_usuario):
    dados = request.get_json(silent=True) or {}
    avatar = dados.get("avatar", "").strip()

    if not avatar or avatar not in AVATARES_VALIDOS:
        return jsonify({"erro": "Identificador de avatar inválido"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM usuarios WHERE id = ?", (id_usuario,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"erro": "Usuário não encontrado"}), 404

    cursor.execute("UPDATE usuarios SET avatar = ? WHERE id = ?", (avatar, id_usuario))
    conn.commit()
    conn.close()

    return jsonify({
        "mensagem": "Foto de perfil atualizada com sucesso",
        "avatar": avatar
    }), 200

@app.route("/usuarios/<int:id_usuario>/turma", methods=["PUT"])
def atualizar_turma_usuario(id_usuario):
    dados = request.get_json(silent=True) or {}
    nova_turma = dados.get("turma", "").strip()

    turmas_validas = ["6º A", "6º B", "7º A", "7º B"]
    if not nova_turma or nova_turma not in turmas_validas:
        return jsonify({"erro": "Turma inválida. Escolha entre 6º A, 6º B, 7º A ou 7º B."}), 400

    ano_escolar = "7º ano" if "7" in nova_turma else "6º ano"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, tipo_usuario FROM usuarios WHERE id = ?", (id_usuario,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({"erro": "Usuário não encontrado"}), 404

    cursor.execute("UPDATE usuarios SET turma = ?, ano_escolar = ? WHERE id = ?", (nova_turma, ano_escolar, id_usuario))
    conn.commit()
    conn.close()

    return jsonify({
        "mensagem": "Turma do aluno atualizada com sucesso",
        "turma": nova_turma,
        "ano_escolar": ano_escolar
    }), 200

@app.route("/turmas/<turma_nome>/alunos", methods=["GET"])
def listar_alunos_da_turma(turma_nome):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, nome, email, turma, ano_escolar, avatar, data_cadastro
        FROM usuarios
        WHERE tipo_usuario = 'aluno' AND turma = ?
        ORDER BY nome ASC
    """, (turma_nome,))
    alunos = [dict(r) for r in cursor.fetchall()]

    # Enriquece com médias calculadas com base nas melhores notas válidas
    for aluno in alunos:
        cursor.execute("SELECT id_capitulo, nota, concluida FROM atividades_desempenho WHERE id_aluno = ?", (aluno["id"],))
        atividades = cursor.fetchall()
        melhores = {}
        for ativ in atividades:
            cap = ativ["id_capitulo"]
            if cap not in melhores or ativ["nota"] > melhores[cap]["nota"]:
                melhores[cap] = ativ
        notas = [m["nota"] for m in melhores.values()]
        aluno["media"] = round(sum(notas) / len(notas), 1) if notas else 0.0
        aluno["capitulos_concluidos"] = len([m for m in melhores.values() if m["concluida"] == 1])

    conn.close()
    return jsonify(alunos)

@app.route("/usuarios/<int:id_usuario>/conquistas", methods=["GET"])
def obter_conquistas_usuario(id_usuario):
    conn = get_db()
    cursor = conn.cursor()

    # Garante que conquistas merecidas sejam sincronizadas
    verificar_e_conceder_conquistas(cursor, id_usuario)
    conn.commit()

    cursor.execute("""
        SELECT conquista_id, nome, descricao, icone, data_desbloqueio
        FROM conquistas_usuario
        WHERE id_aluno = ?
        ORDER BY data_desbloqueio ASC
    """, (id_usuario,))
    desbloqueadas = [dict(r) for r in cursor.fetchall()]
    conn.close()

    todas_conquistas = [
        {"id": "primeiro_passo", "nome": "Primeiros Passos", "descricao": "Realizou sua primeira atividade na plataforma", "icone": "flag"},
        {"id": "nota_maxima", "nome": "Nota Máxima", "descricao": "Obteve nota 10 em um desafio de frações", "icone": "star"},
        {"id": "cem_porcento", "nome": "100% Acertos", "descricao": "Acertou todas as questões de um capítulo", "icone": "check-badge"},
        {"id": "explorador_dedicado", "nome": "Explorador da Trilha", "descricao": "Concluiu mais de 50% da trilha de frações", "icone": "map"},
        {"id": "mestre_supremo", "nome": "Mestre das Frações", "descricao": "Completou todos os 5 capítulos da trilha de Silas", "icone": "trophy"},
        {"id": "estudante_focado", "nome": "Estudante Focado", "descricao": "Realizou 3 ou mais atividades na plataforma", "icone": "sparkles"}
    ]

    desbloqueadas_ids = {c["conquista_id"]: c for c in desbloqueadas}

    resultado = []
    for c in todas_conquistas:
        conq_id = c["id"]
        if conq_id in desbloqueadas_ids:
            resultado.append({
                **c,
                "desbloqueada": True,
                "data_desbloqueio": desbloqueadas_ids[conq_id]["data_desbloqueio"]
            })
        else:
            resultado.append({
                **c,
                "desbloqueada": False,
                "data_desbloqueio": None
            })

    return jsonify(resultado)

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
    erros = max(0, total_questoes - acertos)
    nota = round((acertos / total_questoes) * 10, 1)
    porcentagem = round((acertos / total_questoes) * 100)
    
    # REGRA DE APROVAÇÃO: Mínimo 70% de aproveitamento (7 em 10, 4 em 5 = 80% > 70%, etc.)
    aprovado_nesta = 1 if porcentagem >= 70 else 0
    data_iso = datetime.utcnow().isoformat() + "Z"

    # Verifica se o capítulo anterior foi concluído em qualquer tentativa prévia
    if id_capitulo > 1:
        cursor.execute(
            "SELECT MAX(concluida) as ja_concluido FROM atividades_desempenho WHERE id_aluno = ? AND id_capitulo = ?",
            (id_aluno, id_capitulo - 1)
        )
        prev = cursor.fetchone()
        if not prev or prev["ja_concluido"] != 1:
            conn.close()
            return jsonify({"erro": "É necessário concluir o capítulo anterior antes de registrar este capítulo."}), 403

    # Verifica se o capítulo já foi concluído anteriormente para preservar o status
    cursor.execute(
        "SELECT MAX(concluida) as ja_concluido FROM atividades_desempenho WHERE id_aluno = ? AND id_capitulo = ?",
        (id_aluno, id_capitulo)
    )
    ja_tinha_concluido = cursor.fetchone()["ja_concluido"] or 0
    concluida = 1 if (aprovado_nesta == 1 or ja_tinha_concluido == 1) else 0

    # Quantidade de tentativas anteriores para este capítulo
    cursor.execute("""
    SELECT COUNT(*) as total FROM atividades_desempenho
    WHERE id_aluno = ? AND id_capitulo = ?
    """, (id_aluno, id_capitulo))
    tentativas = cursor.fetchone()["total"] + 1

    cursor.execute("""
    INSERT INTO atividades_desempenho (id_aluno, id_capitulo, titulo_capitulo, ano, turma, tentativas, acertos, erros, total_questoes, nota, porcentagem, concluida, data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (id_aluno, id_capitulo, titulo_capitulo, ano, turma, tentativas, acertos, erros, total_questoes, nota, porcentagem, concluida, data_iso))

    # Verifica e desbloqueia conquistas automaticamente no backend
    novas_conquistas = verificar_e_conceder_conquistas(cursor, id_aluno)

    conn.commit()
    conn.close()

    return jsonify({
        "mensagem": "Atividade registrada com sucesso",
        "nota": nota,
        "porcentagem": porcentagem,
        "aprovado": bool(aprovado_nesta),
        "concluida": bool(concluida),
        "tentativas": tentativas,
        "novas_conquistas": novas_conquistas
    }), 201

@app.route("/ranking/<turma>", methods=["GET"])
def ranking_turma(turma):
    conn = get_db()
    cursor = conn.cursor()

    # Busca alunos da turma
    cursor.execute("""
        SELECT id, nome, turma, avatar FROM usuarios
        WHERE tipo_usuario = 'aluno' AND turma = ?
    """, (turma,))
    alunos = [dict(row) for row in cursor.fetchall()]

    resultado = []
    for aluno in alunos:
        cursor.execute("""
            SELECT id_capitulo, nota, concluida FROM atividades_desempenho
            WHERE id_aluno = ?
        """, (aluno["id"],))
        todas_atividades = [dict(r) for r in cursor.fetchall()]

        # Considera a melhor nota de cada capítulo realizado
        melhores_por_cap = {}
        for a in todas_atividades:
            cap = a["id_capitulo"]
            if cap not in melhores_por_cap or a["nota"] > melhores_por_cap[cap]["nota"]:
                melhores_por_cap[cap] = a

        notas = [v["nota"] for v in melhores_por_cap.values()]
        media = round(sum(notas) / len(notas), 1) if notas else 0.0
        resultado.append({
            "id": aluno["id"],
            "nome": aluno["nome"],
            "turma": aluno["turma"],
            "avatar": aluno.get("avatar") or "avatar-1",
            "media": media,
            "total_atividades": len(notas),
            "capitulos_concluidos": len([v for v in melhores_por_cap.values() if v["concluida"] == 1])
        })

    conn.close()

    resultado.sort(key=lambda x: (x["media"], x["capitulos_concluidos"]), reverse=True)
    return jsonify(resultado)

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
