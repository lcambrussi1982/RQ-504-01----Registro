  // ======================================================
  // RQ-504-01 — SCRIPT PRINCIPAL
  // ======================================================

  // Elementos principais
  const form = document.getElementById("formRelatorio");
  const btnSalvar = document.getElementById("btnSalvar");
  const btnPDF = document.getElementById("btnPDF");
  const btnImprimir = document.getElementById("btnImprimir");
  const listaRelatorios = document.getElementById("listaRelatorios");
  const ariaLive = document.getElementById("ariaLive");
  const anoRodape = document.getElementById("ano");

  const fileInput = document.getElementById("fileInput");
  const uploadArea = document.getElementById("uploadArea");
  const imagePreview = document.getElementById("imagePreview");



  // ======================================================
  // FUNÇÃO — Montar relatório a partir do formulário
  // ======================================================
  function gerarRelatorio() {
    const dados = {};

    // --- Identificação ---
    dados.identificacao = {
      ordemProducao: form.ordemProducao.value,
      quantidadeaverificar: form.quantidadeaverificar.value,
      quandoexecutarinspecao: form.quandoexecutarinspecao.value,
      dataRelatorio: form.dataRelatorio.value,
    };

    // --- Produtos ---
    dados.produtos = [];
    form.querySelectorAll("#tabelaProdutos tbody tr").forEach((tr) => {
      const produto = {
        descricao: tr.querySelector("input[name='descricao[]']").value,
        lote: tr.querySelector("input[name='lote[]']").value,
        data: tr.querySelector("input[name='data[]']").value,
        quantidade: tr.querySelector("input[name='quantidade[]']").value,
      };
      if (produto.descricao) dados.produtos.push(produto);
    });

    // --- Ensaios ---
    dados.ensaios = [];
    form.querySelectorAll("#tabelaEnsaios tbody tr").forEach((tr) => {
      const ensaio = {
        tipo: tr.querySelector("select[name='ensaio[]']").value,
        amostras: tr.querySelector("select[name='amostras[]']").value,
        metodo: tr.querySelector("select[name='metodo[]']").value,
        resultado: tr.querySelector("select[name='resultado[]']").value,
      };
      if (ensaio.tipo) dados.ensaios.push(ensaio);
    });

    // --- Normas ---
    dados.normas = [];
    form.querySelectorAll("input[name='nbr[]']:checked").forEach((chk) => {
      dados.normas.push(chk.value);
    });

    // --- Fotos ---
    dados.fotos = [];
    imagePreview.querySelectorAll("img").forEach((img) => {
      dados.fotos.push(img.src);
    });

    return dados;
  }

  // ======================================================
  // FUNÇÃO — Atualizar lista lateral (com excluir)
  // ======================================================
  function atualizarListaRelatorios() {
    listaRelatorios.innerHTML = "";

    Object.keys(localStorage).forEach((chave) => {
      if (chave.startsWith("relatorio_")) {
        const dados = JSON.parse(localStorage.getItem(chave));

        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.marginBottom = "4px";

        // Texto do relatório
        const span = document.createElement("span");
        span.textContent = `#${dados.identificacao.ordemProducao} (${dados.identificacao.dataRelatorio || "sem data"})`;
        span.style.cursor = "pointer";
        span.addEventListener("click", () => carregarRelatorio(dados));

        // Botão excluir
        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "❌";
        btnExcluir.style.border = "none";
        btnExcluir.style.background = "transparent";
        btnExcluir.style.cursor = "pointer";
        btnExcluir.title = "Excluir relatório";

        btnExcluir.addEventListener("click", (e) => {
          e.stopPropagation(); // impede abrir ao clicar
          if (confirm("Tem certeza que deseja excluir este relatório?")) {
            localStorage.removeItem(chave);
            atualizarListaRelatorios();
            ariaLive.textContent = "🗑️ Relatório excluído.";
          }
        });

        li.appendChild(span);
        li.appendChild(btnExcluir);
        listaRelatorios.appendChild(li);
      }
    });
  }

  // ======================================================
  // FUNÇÃO — Salvar no LocalStorage
  // ======================================================
  function salvarRelatorio() {
    const dados = gerarRelatorio();
    if (!dados.identificacao.ordemProducao) {
      alert("Preencha ao menos o Nº da Ficha de Produção.");
      return;
    }

    const chave = `relatorio_${dados.identificacao.ordemProducao}`;
    localStorage.setItem(chave, JSON.stringify(dados));
    atualizarListaRelatorios();
    ariaLive.textContent = "✅ Relatório salvo com sucesso.";
  }

  // ======================================================
  // FUNÇÃO — Carregar relatório
  // ======================================================
  function carregarRelatorio(dados) {
    form.ordemProducao.value = dados.identificacao.ordemProducao || "";
    form.quantidadeaverificar.value = dados.identificacao.quantidadeaverificar || "";
    form.quandoexecutarinspecao.value = dados.identificacao.quandoexecutarinspecao || "";
    form.dataRelatorio.value = dados.identificacao.dataRelatorio || "";

    // limpar tabelas
    document.querySelector("#tabelaProdutos tbody").innerHTML = "";
    document.querySelector("#tabelaEnsaios tbody").innerHTML = "";

    // carregar produtos
    dados.produtos.forEach((p) => adicionarProduto(p));

    // carregar ensaios
    dados.ensaios.forEach((e) => adicionarEnsaio(e));

    // carregar normas
    document.querySelectorAll("input[name='nbr[]']").forEach((chk) => {
      chk.checked = dados.normas.includes(chk.value);
    });

    // carregar imagens
    imagePreview.innerHTML = "";
    dados.fotos.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      imagePreview.appendChild(img);
    });

    ariaLive.textContent = "📂 Relatório carregado.";
  }

  // ======================================================
  // FUNÇÃO — Gerar HTML formatado do relatório
  // ======================================================

  function gerarHTML(dados) {
    return `
      <h2>Relatório de Inspeção</h2>
      
      <h3>Identificação</h3>
      <p><strong>Ficha:</strong> ${dados.identificacao.ordemProducao || "-"}</p>
      <p><strong>Qtd:</strong> ${dados.identificacao.quantidadeaverificar || "-"}</p>
      <p><strong>Quando:</strong> ${dados.identificacao.quandoexecutarinspecao || "-"}</p>
      <p><strong>Data:</strong> ${formatarDataBR(dados.identificacao.dataRelatorio)}</p>

      <h3>Produtos</h3>
      <ul>
        ${dados.produtos.map(p => `
          <li>
            ${p.descricao || "-"} 
            | Lote: ${p.lote || "-"} 
            | Data: ${formatarDataBR(p.data)} 
            | Qtd: ${p.quantidade || "-"}
          </li>`).join("")}
      </ul>

      <h3>Ensaios</h3>
      <ul>
        ${dados.ensaios.map(e => `
          <li>
            ${e.tipo || "-"} 
            | Amostras: ${e.amostras || "-"} 
            | Método: ${e.metodo || "-"} 
            | Resultado: ${e.resultado || "-"}
          </li>`).join("")}
      </ul>

      <h3>Normas</h3>
      <p>${dados.normas.join(", ") || "Nenhuma selecionada"}</p>

      <h3>Fotos</h3>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;">
        ${dados.fotos.map(src => `<img src="${src}" style="max-width:100%;border-radius:6px;">`).join("")}
      </div>
    `;
  }

  // ======================================================
  // UTILIDADE — Formatar data (YYYY-MM-DD -> dd/MM/yyyy)
  // ======================================================
  function formatarDataBR(isoDate) {
    if (!isoDate) return "-";
    const [ano, mes, dia] = isoDate.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  // ======================================================
  // FUNÇÃO — Exportar para PDF (formal, com logo, datas BR)
  // ======================================================
  function exportarPDF() {
    const dados = gerarRelatorio();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // === Data/hora do sistema ===
    const agora = new Date();
    const dataHora =
      agora.toLocaleDateString("pt-BR") + " " + agora.toLocaleTimeString("pt-BR");

    // === Logo ===
    const logo = new Image();
    logo.src = "shiva.png"; // precisa estar na mesma pasta do index.html

    logo.onload = function () {
      // --- Cabeçalho ---
      doc.setDrawColor(225, 38, 45); // accent vermelho
      doc.setLineWidth(1.2);
      doc.addImage(logo, "PNG", 40, 30, 60, 60);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(14, 53, 84); // azul marinho
      doc.text("RQ-504-01 — REGISTRO DE INSPEÇÃO", 120, 60);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text(`Emitido em: ${dataHora}`, 400, 60);

      doc.line(40, 100, 550, 100);

      // === Identificação ===
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(14, 53, 84);
      doc.text("1. IDENTIFICAÇÃO", 40, 120);

      doc.autoTable({
        startY: 130,
        theme: "grid",
        headStyles: {
          fillColor: [14, 53, 84],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: { fillColor: [240, 245, 250] },
        bodyStyles: { fontSize: 10 },
        head: [["Nº Ficha", "Qtd Verificar", "Quando Executar", "Data"]],
        body: [[
          dados.identificacao.ordemProducao || "-",
          dados.identificacao.quantidadeaverificar || "-",
          dados.identificacao.quandoexecutarinspecao || "-",
          formatarDataBR(dados.identificacao.dataRelatorio)
        ]]
      });

      // === Produtos ===
      doc.setTextColor(14, 53, 84);
      doc.text("2. PRODUTOS INSPECIONADOS", 40, doc.lastAutoTable.finalY + 30);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 40,
        theme: "grid",
        headStyles: {
          fillColor: [14, 53, 84],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: { fillColor: [245, 248, 252] },
        bodyStyles: { fontSize: 10 },
        head: [["Produto", "Lote", "Data", "Quantidade"]],
        body: dados.produtos.map((p) => [
          p.descricao || "-",
          p.lote || "-",
          formatarDataBR(p.data),
          p.quantidade || "-",
        ]),
      });

      // === Ensaios ===
      doc.setTextColor(14, 53, 84);
      doc.text("3. ENSAIOS REALIZADOS", 40, doc.lastAutoTable.finalY + 30);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 40,
        theme: "grid",
        headStyles: {
          fillColor: [14, 53, 84],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: { fillColor: [245, 248, 252] },
        bodyStyles: { fontSize: 10 },
        head: [["Ensaio", "Amostras", "Método", "Resultado"]],
        body: dados.ensaios.map((e) => [
          e.tipo || "-",
          e.amostras || "-",
          e.metodo || "-",
          e.resultado || "-",
        ]),
      });

      // === Normas ===
      doc.setTextColor(14, 53, 84);
      doc.text("4. NORMAS APLICADAS", 40, doc.lastAutoTable.finalY + 30);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(
        dados.normas.join(", ") || "Nenhuma selecionada",
        50,
        doc.lastAutoTable.finalY + 50
      );

      // === Fotos ===
      let y = doc.lastAutoTable.finalY + 80;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(14, 53, 84);
      doc.text("5. REGISTRO FOTOGRÁFICO", 40, y);

      y += 20;
      const imgSize = 80;
      const margin = 12;
      let x = 40;
      let col = 0;

      for (let src of dados.fotos) {
        try {
          doc.addImage(src, "JPEG", x, y, imgSize, imgSize);
        } catch (err) {
          console.warn("Erro ao carregar imagem:", err);
        }
        x += imgSize + margin;
        col++;
        if (col === 5) {
          col = 0;
          x = 40;
          y += imgSize + margin;
        }
      }

      // === Rodapé com assinaturas ===
      const paginaAltura = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0);

      // Linhas de assinatura
      doc.line(60, paginaAltura - 120, 250, paginaAltura - 120);
      doc.text("Responsável Técnico", 100, paginaAltura - 105);

      doc.line(300, paginaAltura - 120, 500, paginaAltura - 120);
      doc.text("Supervisor", 370, paginaAltura - 105);

      doc.line(60, paginaAltura - 70, 250, paginaAltura - 70);
      doc.text("Data / Assinatura", 100, paginaAltura - 55);

      doc.line(300, paginaAltura - 70, 500, paginaAltura - 70);
      doc.text("Cliente / Representante", 340, paginaAltura - 55);

      // Rodapé fixo
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        `Relatório gerado automaticamente pelo sistema RQ-504-01 | Emitido em: ${dataHora}`,
        40,
        paginaAltura - 30
      );

      // --- Salvar PDF ---
      doc.save(`Relatorio_${dados.identificacao.ordemProducao || "sem_numero"}.pdf`);
    };
  }








  // ======================================================
// FUNÇÃO — Imprimir (formal, cores 60-30-10, layout melhorado)
// ======================================================
function imprimirRelatorio() {
  const dados = gerarRelatorio();
  const agora = new Date();
  const dataHora =
    agora.toLocaleDateString("pt-BR") + " " + agora.toLocaleTimeString("pt-BR");

  const html = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Relatório de Inspeção</title>
    <style>
      body {
        font-family: "Helvetica", Arial, sans-serif;
        margin: 40px;
        color: #0E3554;
        line-height: 1.5;
      }
      header {
        display: flex;
        align-items: center;
        border-bottom: 3px solid #E1262D;
        padding-bottom: 12px;
        margin-bottom: 25px;
      }
      header img {
        width: 70px;
        height: 70px;
        margin-right: 18px;
      }
      header h1 {
        font-size: 1.6rem;
        margin: 0;
        color: #0E3554;
      }
      header small {
        display: block;
        font-size: 0.8rem;
        color: #5C6B84;
      }
      section {
        margin-bottom: 28px;
      }
      h2 {
        font-size: 1.15rem;
        margin-bottom: 10px;
        border-left: 5px solid #0E3554;
        padding-left: 8px;
        color: #0E3554;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      th, td {
        border: 1px solid #ccc;
        padding: 8px;
        font-size: 0.9rem;
      }
      th {
        background: #0E3554;
        color: white;
        text-align: center;
      }
      tr:nth-child(even) td {
        background: #f6f8fb;
      }
      ul {
        padding-left: 20px;
        margin: 0;
      }
      .assinaturas {
        margin-top: 60px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 60px;
        text-align: center;
      }
      .assinaturas div {
        border-top: 1px solid #000;
        padding-top: 6px;
        font-size: 0.9rem;
      }
      footer {
        font-size: 0.75rem;
        color: #555;
        text-align: center;
        margin-top: 50px;
        border-top: 1px solid #ddd;
        padding-top: 6px;
      }
      .fotos img {
        max-width: 120px;
        margin: 5px;
        border: 1px solid #ccc;
        border-radius: 6px;
      }
    </style>
  </head>
  <body>
    <header>
      <img src="shiva.png" alt="Logo">
      <div>
        <h1>RQ-504-01 — Registro de Inspeção</h1>
        <small>Emitido em: ${dataHora}</small>
      </div>
    </header>

    <section>
      <h2>1. Identificação</h2>
      <table>
        <tr><th>Nº Ficha</th><td>${dados.identificacao.ordemProducao || "-"}</td></tr>
        <tr><th>Qtd Verificar</th><td>${dados.identificacao.quantidadeaverificar || "-"}</td></tr>
        <tr><th>Quando Executar</th><td>${dados.identificacao.quandoexecutarinspecao || "-"}</td></tr>
        <tr><th>Data</th><td>${formatarDataBR(dados.identificacao.dataRelatorio)}</td></tr>
      </table>
    </section>

    <section>
      <h2>2. Produtos Inspecionados</h2>
      <table>
        <thead>
          <tr><th>Produto</th><th>Lote</th><th>Data</th><th>Qtd</th></tr>
        </thead>
        <tbody>
          ${dados.produtos.map(p => `
            <tr>
              <td>${p.descricao||"-"}</td>
              <td>${p.lote||"-"}</td>
              <td>${formatarDataBR(p.data)}</td>
              <td style="text-align:center">${p.quantidade||"-"}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </section>

    <section>
      <h2>3. Ensaios Realizados</h2>
      <table>
        <thead>
          <tr><th>Ensaio</th><th>Amostras</th><th>Método</th><th>Resultado</th></tr>
        </thead>
        <tbody>
          ${dados.ensaios.map(e => `
            <tr>
              <td>${e.tipo||"-"}</td>
              <td style="text-align:center">${e.amostras||"-"}</td>
              <td>${e.metodo||"-"}</td>
              <td style="text-align:center">${e.resultado||"-"}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </section>

    <section>
      <h2>4. Normas Aplicadas</h2>
      <p>${dados.normas.join(", ") || "Nenhuma selecionada"}</p>
    </section>

    <section>
      <h2>5. Registro Fotográfico</h2>
      <div class="fotos">
        ${dados.fotos.length 
          ? dados.fotos.map(f => `<img src="${f}" alt="Foto do relatório">`).join("") 
          : "<p>Nenhuma foto anexada</p>"}
      </div>
    </section>

    <div class="assinaturas">
      <div>Responsável Técnico</div>
      <div>Supervisor</div>
      <div>Data / Assinatura</div>
      <div>Cliente / Representante</div>
    </div>

    <footer>
      Relatório gerado automaticamente pelo sistema RQ-504-01 — ${dataHora}
    </footer>
  </body>
  </html>
  `;

  const w = window.open("", "PRINT", "height=700,width=900");
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}


  // ======================================================
  // ADICIONAR/REMOVER LINHAS
  // ======================================================
  function adicionarProduto(p = {}) {
    const tbody = document.querySelector("#tabelaProdutos tbody");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" name="descricao[]" value="${p.descricao||""}" required placeholder="Produto"></td>
      <td><input type="text" name="lote[]" value="${p.lote||""}" placeholder="Lote"></td>
      <td><input type="date" name="data[]" value="${p.data||""}"></td>
      <td><input type="number" name="quantidade[]" min="1" value="${p.quantidade||""}"></td>
      <td><button type="button" class="remover">❌</button></td>
    `;
    tbody.appendChild(tr);
  }

  function adicionarEnsaio(e = {}) {
    const tbody = document.querySelector("#tabelaEnsaios tbody");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <select name="ensaio[]" required>
          <option value="">Selecione...</option>
          <option value="phi" ${e.tipo==="phi"?"selected":""}>Pressão hidrostática (PHI)</option>
          <option value="vacuo" ${e.tipo==="vacuo"?"selected":""}>Vácuo</option>
          <option value="dimensional" ${e.tipo==="dimensional"?"selected":""}>Dimensional</option>
          <option value="impacto" ${e.tipo==="impacto"?"selected":""}>Impacto</option>
        </select>
      </td>
      <td>
        <select name="amostras[]" required>
          <option value="">Selecione...</option>
          ${["01","02","05","10"].map(n=>`<option ${e.amostras===n?"selected":""}>${n}</option>`).join("")}
        </select>
      </td>
      <td>
        <select name="metodo[]" required>
          <option value="">Selecione...</option>
          <option value="visual" ${e.metodo==="visual"?"selected":""}>Visual</option>
          <option value="gabarito" ${e.metodo==="gabarito"?"selected":""}>Gabarito</option>
          <option value="0.5k15" ${e.metodo==="0.5k15"?"selected":""}>0,5 Kgf/cm² × 15 min</option>
        </select>
      </td>
      <td>
        <select name="resultado[]" required>
          <option value="">Selecione...</option>
          <option value="aprovado" ${e.resultado==="aprovado"?"selected":""}>Aprovado</option>
          <option value="reprovado" ${e.resultado==="reprovado"?"selected":""}>Reprovado</option>
        </select>
      </td>
      <td><button type="button" class="remover">❌</button></td>
    `;
    tbody.appendChild(tr);
  }

  // Remover linhas
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remover")) {
      e.target.closest("tr").remove();
    }
  });

  // Botões adicionar linha
  document.getElementById("addLinha").addEventListener("click", () => adicionarProduto());
  document.getElementById("addEnsaio").addEventListener("click", () => adicionarEnsaio());

  // ======================================================
  // UPLOAD DE FOTOS — Drag & Drop + Preview múltiplo
  // ======================================================
  function handleFiles(files) {
    for (let file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        imagePreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  }

  fileInput.addEventListener("change", () => {
    handleFiles(fileInput.files);
  });

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });
  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });
  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });

// ======================================================
// TEMA — Dialog com persistência no localStorage
// ======================================================
const btnTemas = document.getElementById("btnTemas");
const dlgTemas = document.getElementById("dlgTemas");

// Função para aplicar tema
function aplicarTema(tema) {
  if (!tema) return;
  document.documentElement.setAttribute("data-theme", tema);
  localStorage.setItem("tema", tema);
  const radio = dlgTemas.querySelector(`input[name='tema'][value="${tema}"]`);
  if (radio) radio.checked = true;
}

// Abrir diálogo
btnTemas.addEventListener("click", () => {
  dlgTemas.showModal();
  const primeiroRadio = dlgTemas.querySelector("input[name='tema']");
  if (primeiroRadio) primeiroRadio.focus();
});

// Submeter escolha de tema
dlgTemas.addEventListener("submit", (e) => {
  e.preventDefault();
  const temaSelecionado = dlgTemas.querySelector("input[name='tema']:checked");
  if (temaSelecionado) {
    aplicarTema(temaSelecionado.value);
  }
  dlgTemas.close();
});

// Fechar ao clicar fora ou pressionar Esc
dlgTemas.addEventListener("click", (e) => {
  const rect = dlgTemas.getBoundingClientRect();
  if (
    e.clientX < rect.left || e.clientX > rect.right ||
    e.clientY < rect.top || e.clientY > rect.bottom
  ) {
    dlgTemas.close();
  }
});

// Carregar tema salvo ao iniciar
document.addEventListener("DOMContentLoaded", () => {
  const temaSalvo = localStorage.getItem("tema");
  if (temaSalvo) aplicarTema(temaSalvo);
});


  // ======================================================
  // EVENTOS BOTÕES
  // ======================================================
  btnSalvar.addEventListener("click", salvarRelatorio);
  btnPDF.addEventListener("click", exportarPDF);
  btnImprimir.addEventListener("click", imprimirRelatorio);

  // ======================================================
  // UTILIDADE — Ano no rodapé + lista inicial
  // ======================================================
  anoRodape.textContent = new Date().getFullYear();
  atualizarListaRelatorios();


