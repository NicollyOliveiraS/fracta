import sqlite3

conn = sqlite3.connect("fracta.db")
conn.row_factory = sqlite3.Row
c = conn.cursor()

c.execute("""
    SELECT id, nome, email, tipo_usuario
    FROM usuarios
    WHERE tipo_usuario = 'aluno'
    AND (turma IS NULL OR turma = '')
""")
deletar = c.fetchall()

print("Alunos SEM turma (serao deletados):")
if not deletar:
    print("  Nenhum.")
for r in deletar:
    print(f"  ID {r['id']} | {r['nome']} | {r['email']}")

c.execute("""
    DELETE FROM usuarios
    WHERE tipo_usuario = 'aluno'
    AND (turma IS NULL OR turma = '')
""")
print(f"\nDeletados: {c.rowcount} registro(s).")
conn.commit()
conn.close()
print("Banco atualizado.")
