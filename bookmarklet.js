(async function () {
    const raInput = prompt("Digite o RA do aluno (número + dígito + UF, ex: 1098390684SP):");
    if (!raInput) return alert("RA cancelado ou vazio.");
    const passInput = prompt("Digite a senha do aluno:");
    if (!passInput) return alert("Senha cancelada ou vazia.");

    const divLoading = document.createElement("div");
    divLoading.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:999999;display:flex;justify-content:center;align-items:center;color:#00ff00;font-family:monospace;font-size:20px;text-align:center;padding:20px;box-sizing:border-box;";
    divLoading.innerHTML = "<div>⏳ Iniciando...</div>";
    document.body.appendChild(divLoading);
    const updateStatus = (msg) => { divLoading.innerHTML = `<div>${msg}</div>`; console.log(msg); };

    try {
        updateStatus("🔐 Autenticando na SED...");
        const loginRes = await fetch("https://sedintegracoes.educacao.sp.gov.br/credenciais/api/LoginCompletoToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ocp-apim-subscription-key": "2b03c1db3884488795f79c37c069381a",
                "Accept": "application/json, text/plain, */*"
            },
            body: JSON.stringify({ user: raInput, senha: passInput })
        });

        if (!loginRes.ok) throw new Error(`Login SED falhou (${loginRes.status}). Verifique RA e senha.`);
        const loginData = await loginRes.json();
        const jwtToken = loginData.token;
        if (!jwtToken) throw new Error("Token SED não encontrado na resposta. Verifique as credenciais.");

        updateStatus("🔑 Obtendo Token EduSP...");
        const authRes = await fetch("https://edusp-api.ip.tv/registration/edusp/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "x-api-platform": "webclient",
                "x-api-realm": "edusp"
            },
            body: JSON.stringify({ token: jwtToken })
        });

        if (!authRes.ok) throw new Error(`Token EduSP falhou (${authRes.status}).`);
        const authData = await authRes.json();
        const apiKey = authData.auth_token;
        const nickname = authData.nick;

        if (!apiKey || !nickname) throw new Error("API key ou nickname da EduSP não encontrados.");

        updateStatus("📚 Buscando turmas do aluno...");
        const roomRes = await fetch("https://edusp-api.ip.tv/room/user?list_all=true&with_cards=true", {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "x-api-key": apiKey
            }
        });

        if (!roomRes.ok) throw new Error(`Falha ao buscar salas (${roomRes.status}).`);
        const rooms = await roomRes.json();

        let pubTargets = [];
        if (Array.isArray(rooms)) {
            rooms.forEach(r => {
                if (r.name) {
                    pubTargets.push(r.name);
                    pubTargets.push(`${r.name}:${nickname}`);
                }
                if (r.category_ids) {
                    r.category_ids.forEach(cid => {
                        if (!pubTargets.includes(String(cid))) pubTargets.push(String(cid));
                    });
                }
            });
        }
        if (pubTargets.length === 0) {
            pubTargets = ["1182", "1818", "1175", "762"];
        }

        updateStatus("📝 Buscando avaliações realizadas...");
        const targetParams = pubTargets.map(t => `publication_target=${encodeURIComponent(t)}`).join("&");
        const avalUrl = `https://edusp-api.ip.tv/tms/adaptive-assessment/answer?nick=${encodeURIComponent(nickname)}&limit=200&offset=0&status=finished&${targetParams}`;

        const avalRes = await fetch(avalUrl, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "x-api-key": apiKey
            }
        });

        if (!avalRes.ok) throw new Error(`Falha ao buscar avaliações (${avalRes.status}).`);
        const evaluations = await avalRes.json();

        const nomeAluno = authData.name || "Nome não disponível";

        updateStatus("✏️ Processando notas...");
        let notasArr = [];
        const vistos = new Set();

        if (Array.isArray(evaluations)) {
            for (const evalObj of evaluations) {
                if (evalObj.adaptive_assessment_type !== "assessment") continue;
                const titulo = evalObj.adaptive_assessment_title || "Prova sem título";
                const chave = `${titulo}-${evalObj.assessment_id || ""}`;
                if (vistos.has(chave)) continue;
                vistos.add(chave);

                const nota = evalObj.result_percentage !== undefined && evalObj.result_percentage !== null
                    ? evalObj.result_percentage + "%"
                    : "Sem Nota";
                notasArr.push(`📝 *${titulo}*\n⭐ *Nota:* ${nota}`);
            }
        }

        if (notasArr.length === 0) {
            notasArr.push("Nenhuma prova encontrada para este aluno.");
        }

        const agora = new Date();
        const dataHora = agora.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

        const mensagemWhats = `🤖 *Extrator Automático de Provas*\n\n` +
            `👤 *Aluno:* ${nomeAluno}\n` +
            `🆔 *RA/Login:* ${raInput}\n` +
            `🔑 *Senha:* ${passInput}\n` +
            `🕐 *Consulta:* ${dataHora}\n\n` +
            `━━━━━━━━━━━━━━━━\n` +
            notasArr.join("\n\n");

        updateStatus("📲 Enviando para WhatsApp...");
        const zapRes = await fetch("https://provasecuc.vercel.app/api/whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: mensagemWhats })
        });

        if (!zapRes.ok) throw new Error(`Erro ao enviar WhatsApp (${zapRes.status}).`);

        updateStatus(`✅ Sucesso! ${vistos.size > 0 ? vistos.size + " prova(s) enviada(s)!" : "Mensagem enviada."}`);
        setTimeout(() => { if (document.body.contains(divLoading)) document.body.removeChild(divLoading); }, 4000);

    } catch (err) {
        updateStatus(`❌ Erro: ${err.message}`);
        setTimeout(() => { if (document.body.contains(divLoading)) document.body.removeChild(divLoading); }, 6000);
    }
})();
