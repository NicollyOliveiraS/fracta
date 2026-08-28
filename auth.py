from datetime import datetime, timedelta
import hmac
import os

import jwt
from dotenv import load_dotenv
from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash

from supabase_client import supabase


load_dotenv()

auth_bp = Blueprint("auth", __name__)


def criar_token(id_usuario, email, tipo_usuario):
    secret_key = os.getenv("SECRET_KEY")

    if not secret_key:
        raise RuntimeError(
            "SECRET_KEY não configurada"
        )

    dados_token = {
        "id": id_usuario,
        "email": email,
        "tipo_usuario": tipo_usuario,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }

    return jwt.encode(
        dados_token,
        secret_key,
        algorithm="HS256"
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json(silent=True)

    if not dados:
        return jsonify({
            "erro": "Envie os dados"
        }), 400

    email = (
        dados.get("email")
        or dados.get("usuario")
        or ""
    ).strip()

    senha = dados.get("senha") or ""

    if not email or not senha:
        return jsonify({
            "erro": "Email e senha são obrigatórios"
        }), 400

    try:
        admin_email = os.getenv("ADMIN_EMAIL")
        admin_senha = os.getenv("ADMIN_PASSWORD")
        admin_nome = os.getenv(
            "ADMIN_NAME",
            "Administrador"
        )

        if (
            admin_email
            and admin_senha
            and hmac.compare_digest(
                email,
                admin_email
            )
        ):
            if not hmac.compare_digest(
                senha,
                admin_senha
            ):
                return jsonify({
                    "erro": "Senha incorreta"
                }), 401

            token = criar_token(
                0,
                admin_email,
                "admin"
            )

            return jsonify({
                "mensagem":
                    "Login realizado com sucesso",
                "token": token,
                "usuario": {
                    "id": 0,
                    "nome": admin_nome,
                    "email": admin_email,
                    "tipo_usuario": "admin"
                }
            }), 200

        resposta = (
            supabase
            .table("usuarios")
            .select("*")
            .eq("email", email)
            .execute()
        )

        if not resposta.data:
            return jsonify({
                "erro": "Usuário não encontrado"
            }), 404

        usuario = resposta.data[0]

        senha_correta = check_password_hash(
            usuario["senha"],
            senha
        )

        if not senha_correta:
            return jsonify({
                "erro": "Senha incorreta"
            }), 401

        token = criar_token(
            usuario["id"],
            usuario["email"],
            usuario["tipo_usuario"]
        )

        return jsonify({
            "mensagem":
                "Login realizado com sucesso",
            "token": token,
            "usuario": {
                "id": usuario["id"],
                "nome": usuario["nome"],
                "email": usuario["email"],
                "tipo_usuario":
                    usuario["tipo_usuario"]
            }
        }), 200

    except Exception as erro:
        print(f"Erro no login: {erro}")

        return jsonify({
            "erro": "Falha no login"
        }), 500