# Handoff către GitHub — pași exacți

**Status: BLOCKED_CREDENTIAL.** Repo-ul local este complet și commit-uit. Push-ul nu se
poate face din acest mediu: nu există `gh`, nu există token GitHub, nu există
`~/.git-credentials`.

---

## Ce lipsește

| Necesar | Stare |
|---|---|
| `gh` CLI | neinstalat |
| GitHub token (`GH_TOKEN` / `GITHUB_TOKEN` / PAT) | absent din `~/.hermes/.env` |
| `~/.git-credentials` | absent |
| git identity global | neconfigurat (repo-ul are identitate **locală** doar) |

---

## Varianta A — Alex rulează local (recomandat)

```bash
cd /home/alana/workspace/sandbox/ui-stack/automatizaria-v5-chatgpt

# 1. autentificare (o singură dată)
gh auth login          # sau: export GH_TOKEN=<token-cu-scope repo>

# 2. creează repo-ul privat și împinge AMBELE branch-uri
gh repo create automatizaria-v5-chatgpt --private --source=. --remote=origin --push

# 3. asigură-te că branch-ul de lucru urcă și el
git push -u origin main
git push -u origin automatizaria-v5-chatgpt

# 4. setează branch-ul de lucru ca default (opțional, pentru ChatGPT)
gh repo edit --default-branch automatizaria-v5-chatgpt
```

## Varianta B — cu token, fără `gh`

```bash
cd /home/alana/workspace/sandbox/ui-stack/automatizaria-v5-chatgpt
git remote add origin https://<TOKEN>@github.com/<user>/automatizaria-v5-chatgpt.git
git push -u origin main
git push -u origin automatizaria-v5-chatgpt
```

> Nu pune tokenul în `.git/config` permanent. Folosește `gh auth login` sau un
> credential helper; altfel rămâne în clar pe disc.

---

## Ce vede ChatGPT după push

- `main` → **baseline V4 înghețat** (referință imutabilă)
- `automatizaria-v5-chatgpt` → branch-ul de lucru (același commit de start)
- `README-HANDOFF.md` → contextul complet, starea reală, ce nu se atinge
- `qa-evidence-v4/` → 25 capturi QA desktop = dovada verificării
- `dist/` → **nu** este în repo (output de build; `npm run build` îl regenerează)

---

## Verificări înainte de push (deja făcute)

- [x] build `npm run build` → PASS
- [x] arborele git rămâne CLEAN după rebuild
- [x] `node_modules` exclus
- [x] `dist/` exclus (build-ul șterge `dist/qa/` — comiterea lui ar strica QA-ul)
- [x] scanare de secrete în `src/`, `public/`, `dist/`, `index.html` → curat
- [x] V4 original nealterat (hash arbore `src` identic înainte/după)

---

## Limitări de care să ții cont

1. **QA mobile lipsește** pentru V4. Nu prezenta build-ul ca „verificat complet".
2. Capturile QA sunt **desktop-only**.
3. Repo-ul nu conține `node_modules`; primul pas la destinatar este `npm install`.
4. Push-ul necesită acțiunea lui Alex (token sau `gh auth login`).
