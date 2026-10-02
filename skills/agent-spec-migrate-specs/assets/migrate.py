#!/usr/bin/env python3
"""agent-spec — migração de specs existentes para o NOVO PROCESSO.

Migra cada `docs/specs/features/{feature}/{version}/` para:
  (1) layout `_run/` — artefatos gerados pelo pipeline saem do topo;
  (2) glossário de status PT (APROVADO/PARCIAL/REJEITADO + CRITICO/ALTO/MEDIO/BAIXO)
      DENTRO dos artefatos gerados;
  (3) refs de path antigas atualizadas (inclusive em specs autoradas).

Seguro por padrão: --dry-run (relatório, não escreve). --apply executa.
Idempotente: pula o que já está em `_run/`. Usa `git mv` (fallback os.rename).

Regras canônicas documentadas em ../references/migration-rules.md.
"""
import argparse
import os
import re
import subprocess
import sys

# ---------------------------------------------------------------- relocações
# (path relativo antigo dentro de {version}) -> (novo, dentro de _run/)
FILE_RELOCATIONS = [
    ("qa-observations.md", "_run/run-report.md"),
    (".workflow-report.md", "_run/workflow-report.md"),
    ("rule-candidates.md", "_run/rule-candidates.md"),
    ("test-cases.json", "_run/test-cases.json"),
    (".qa_context.md", "_run/qa_context.md"),
    ("sdd_state.yaml", "_run/sdd_state.yaml"),
    ("minispec_state.yaml", "_run/minispec_state.yaml"),
]
DIR_RELOCATIONS = [("tasks/.tmp", "_run/tmp")]

# arquivos GERADOS (recebem glossário + H1 + path-refs); o resto = spec
# autorada (recebe SÓ path-refs).
GENERATED_BASENAMES = {"run-report.md", "workflow-report.md", "rule-candidates.md"}

# ----------------------------------------------------------------- glossário
VEREDITO = [
    ("approved_with_observations", "APROVADO_COM_OBSERVACOES"),
    ("skipped_qa_rejected", "PULADO_QA_REJEITOU"),
    ("approved", "APROVADO"),
    ("rejected", "REJEITADO"),
    ("partial", "PARCIAL"),
]
SEV = {"critical": "CRITICO", "high": "ALTO", "medium": "MEDIO", "low": "BAIXO"}

# refs de path antigas -> novas (lookbehind evita re-prefixar o que já migrou)
PATHREF = [
    (r"(?<!_run/)tasks/\.tmp", "_run/tmp"),
    (r"(?<!_run/)\.workflow-report\.md", "_run/workflow-report.md"),
    (r"(?<!_run/)\.qa_context\.md", "_run/qa_context.md"),
    (r"(?<!_run/)qa-observations\.md", "_run/run-report.md"),
    (r"(?<!_run/)rule-candidates\.md", "_run/rule-candidates.md"),
    (r"(?<!_run/)test-cases\.json", "_run/test-cases.json"),
    (r"(?<!_run/)sdd_state\.yaml", "_run/sdd_state.yaml"),
    (r"(?<!_run/)minispec_state\.yaml", "_run/minispec_state.yaml"),
]


def rewrite_glossary(text):
    """EN->PT — aplicado SÓ a artefatos GERADOS (run-report/workflow-report/
    rule-candidates), onde `status:` é sempre veredito de gate. Specs autoradas
    (com `status:` de ciclo de vida) NÃO recebem glossário, então não há o que
    proteger aqui. Risco/reasoning_effort não casam (severidade é delimitada/
    ancorada, nunca palavra solta)."""
    # veredito: word-boundary (cobre `status: rejected` de gate, célula `✅ approved`)
    for en, pt in VEREDITO:
        text = re.sub(r"\b" + re.escape(en) + r"\b", pt, text)
    # severidade delimitada: `x`, "x", **x**
    for en, pt in SEV.items():
        for a, b in ((f"`{en}`", f"`{pt}`"), (f'"{en}"', f'"{pt}"'), (f"**{en}**", f"**{pt}**")):
            text = text.replace(a, b)
    # severidade em bloco de débito do run-report: `### D1 · low · ...`
    text = re.sub(
        r"·\s*(critical|high|medium|low)\s*·",
        lambda m: f"· {SEV[m.group(1)]} ·", text)
    # severidade ancorada à palavra severity/last_severity (logs do workflow-report)
    text = re.sub(
        r"\b(severity|last_severity|severity_trigger)(\s*(?:==|=|:)?\s*)(critical|high|medium|low)\b",
        lambda m: m.group(1) + m.group(2) + SEV[m.group(3)], text)
    # enum pipe-separado
    text = text.replace("critical | high | medium | low", "CRITICO | ALTO | MEDIO | BAIXO")
    return text


def rewrite_pathrefs(text):
    for pat, rep in PATHREF:
        text = re.sub(pat, rep, text)
    return text


def rewrite_h1(text):
    return text.replace("# QA & Tech Review — ", "# Relatório do Run — ")


# ------------------------------------------------------------------ git move
def _git_ok(cwd):
    r = subprocess.run(["git", "rev-parse", "--is-inside-work-tree"],
                       cwd=cwd, capture_output=True, text=True)
    return r.returncode == 0 and r.stdout.strip() == "true"


def move(src, dst, apply, git, root):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not apply:
        return "move"
    moved = False
    if git:
        # git mv rodado da RAIZ do repo, com paths absolutos (preserva histórico)
        r = subprocess.run(["git", "mv", os.path.abspath(src), os.path.abspath(dst)],
                           cwd=root, capture_output=True, text=True)
        moved = r.returncode == 0
    if not moved:
        os.rename(src, dst)
    return "move"


# ------------------------------------------------------------------ por feature
def discover(root):
    feats = []
    base = os.path.join(root, "docs", "specs", "features")
    if not os.path.isdir(base):
        return feats
    for feature in sorted(os.listdir(base)):
        fdir = os.path.join(base, feature)
        if not os.path.isdir(fdir):
            continue
        for version in sorted(os.listdir(fdir)):
            vdir = os.path.join(fdir, version)
            if os.path.isdir(vdir):
                feats.append(vdir)
    return feats


def has_old_layout(vdir):
    for old, _ in FILE_RELOCATIONS:
        if os.path.exists(os.path.join(vdir, old)):
            return True
    for old, _ in DIR_RELOCATIONS:
        if os.path.isdir(os.path.join(vdir, old)):
            return True
    return False


def _target_relpath(vdir, abs_path):
    """Identidade PÓS-migração de um arquivo (para decidir glossário/H1 de forma
    idêntica em dry-run e apply). Mapeia relocações de arquivo e de diretório."""
    rel = os.path.relpath(abs_path, vdir).replace(os.sep, "/")
    for old, new in FILE_RELOCATIONS:
        if rel == old:
            return new
    for old, new in DIR_RELOCATIONS:
        if rel.startswith(old + "/"):
            return new + rel[len(old):]
    return rel


def migrate_feature(vdir, apply, git, log, root):
    rel = vdir
    actions = {"moved": [], "rewritten": [], "skipped": []}

    # 1) reescrita de conteúdo PRIMEIRO (decidida pela identidade-alvo), depois
    #    a relocação move o arquivo já corrigido. dry-run e apply: mesma lógica.
    for dirpath, dirnames, filenames in os.walk(vdir):
        if "_run" in dirpath.split(os.sep) and "tmp" in dirpath.split(os.sep):
            pass  # tmp efêmero ainda recebe pathrefs; sem tratamento especial
        for fn in filenames:
            if not fn.endswith((".md", ".json", ".yaml")):
                continue
            p = os.path.join(dirpath, fn)
            target = _target_relpath(vdir, p)
            target_base = target.rsplit("/", 1)[-1]
            with open(p, encoding="utf-8") as f:
                orig = f.read()
            new = rewrite_pathrefs(orig)
            if target.startswith("_run/") and target_base in GENERATED_BASENAMES:
                new = rewrite_glossary(new)
                if target_base == "run-report.md":
                    new = rewrite_h1(new)
            if new != orig:
                actions["rewritten"].append(os.path.relpath(p, vdir) + f"  (→ {target})")
                if apply:
                    with open(p, "w", encoding="utf-8") as f:
                        f.write(new)

    # 2) relocações de arquivo (git mv do arquivo já reescrito)
    for old, new in FILE_RELOCATIONS:
        src, dst = os.path.join(vdir, old), os.path.join(vdir, new)
        if not os.path.exists(src):
            continue
        if os.path.exists(dst):
            actions["skipped"].append(f"{old} (destino já existe)")
            continue
        move(src, dst, apply, git, root)
        actions["moved"].append(f"{old} → {new}")

    # 3) relocação de diretório (.tmp)
    for old, new in DIR_RELOCATIONS:
        src, dst = os.path.join(vdir, old), os.path.join(vdir, new)
        if not os.path.isdir(src):
            continue
        if os.path.exists(dst):
            actions["skipped"].append(f"{old}/ (destino já existe)")
            continue
        move(src, dst, apply, git, root)
        actions["moved"].append(f"{old}/ → {new}/")

    # relatório por feature
    if actions["moved"] or actions["rewritten"] or actions["skipped"]:
        log.append(f"\n### {rel}")
        for m in actions["moved"]:
            log.append(f"    mv   {m}")
        for r in actions["rewritten"]:
            log.append(f"    edit {r}")
        for s in actions["skipped"]:
            log.append(f"    skip {s}")
    return actions


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".", help="raiz do projeto host")
    ap.add_argument("--apply", action="store_true", help="executa (padrão: dry-run)")
    ap.add_argument("--feature", default=None, help="migrar só um {version} dir específico")
    args = ap.parse_args()

    apply = args.apply
    git = _git_ok(args.root)
    mode = "APPLY" if apply else "DRY-RUN (nada escrito)"
    print(f"=== agent-spec migrate-specs — {mode} | git mv: {git} ===")

    if args.feature:
        feats = [args.feature]
    else:
        feats = discover(args.root)

    if not feats:
        print("Nenhuma feature em docs/specs/features/**. Nada a migrar.")
        return 0

    log, total_mv, total_ed, pending = [], 0, 0, 0
    for vdir in feats:
        if not has_old_layout(vdir) and not args.feature:
            # já migrado (ou nunca rodou) — checa se ainda há refs/glossário a corrigir
            pass
        a = migrate_feature(vdir, apply, git, log, args.root)
        total_mv += len(a["moved"])
        total_ed += len(a["rewritten"])
        if a["moved"] or a["rewritten"]:
            pending += 1

    print("\n".join(log) if log else "  Tudo já no novo processo. Nada a fazer.")
    print(f"\n=== {pending} feature(s) | {total_mv} relocação(ões) | {total_ed} arquivo(s) reescrito(s) ===")
    if not apply and (total_mv or total_ed):
        print("Revise acima e rode com --apply para executar.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
