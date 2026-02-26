# 📚 Extrator de Provas Paulista e Avaliações Diagnósticas — SP

Bookmarklet para extrair automaticamente as notas das **Provas Paulista** e **Avaliações Diagnósticas** do sistema **Sala do Futuro** (SED-SP) e enviar para WhatsApp.

---

## 🚀 Como usar

### 1. Adicione o bookmarklet ao navegador

Crie um novo favorito no seu navegador com o nome que quiser (ex: `📝 Extrator Provas`) e cole o código abaixo como **URL**:

```
javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/orickmaxx/provasecuc-bookmarklet@main/bookmarklet.js?t='+Date.now();document.body.appendChild(s);})()
```

### 2. Execute

1. Acesse [saladofuturo.educacao.sp.gov.br](https://saladofuturo.educacao.sp.gov.br/)
2. Clique no favorito criado
3. Digite o **RA + Dígito + UF** do aluno (ex: `1098390684SP`)
4. Digite a **senha** do aluno
5. Aguarde — os resultados serão enviados automaticamente para o WhatsApp

---

## 📲 Mensagem enviada ao WhatsApp

```
🤖 Extrator Automático de Provas

👤 Aluno: NOME COMPLETO DO ALUNO
🆔 RA/Login: 1098390684SP
🔑 Senha: ••••••••
🕐 Consulta: 26/02/2026 18:40:43

━━━━━━━━━━━━━━━━
📝 3ª série - Língua Portuguesa
⭐ Nota: 67%

📝 3ª série - Matemática
⭐ Nota: 82%
```

---

## 🔄 Fluxo do script

```
Browser (favorito clicado)
      │
      ├─ 1. POST LoginCompletoToken  ──────────────► SED
      │        └─ retorna: JWT da SED
      │
      ├─ 2. POST /registration/edusp/token  ────────► EduSP API
      │        └─ retorna: auth_token + nick + name
      │
      ├─ 3. GET /room/user  ────────────────────────► EduSP API
      │        └─ retorna: salas → publication_targets
      │
      ├─ 4. GET /adaptive-assessment/answer  ───────► EduSP API
      │        └─ retorna: provas finalizadas + notas
      │
      └─ 5. POST provasecuc.vercel.app/api/whatsapp ► Vercel (servidor)
                  └─ dispara mensagem via Green API
```

> **Por que usa a Vercel?** A chave da API do WhatsApp (Green API) fica guardada como variável de ambiente secreta no servidor. O bookmarklet só envia o texto — nunca expõe credenciais.

---

## ⚙️ Atualização automática

O favorito sempre carrega a **versão mais recente** do script diretamente via [jsDelivr CDN](https://cdn.jsdelivr.net/gh/orickmaxx/provasecuc-bookmarklet@main/bookmarklet.js). Não precisa recriar o favorito ao atualizar o código.
