
document.addEventListener("DOMContentLoaded", () => {
    carregarLembretes(); // Carrega os lembretes na página
    carregarClientes("clienteId"); // Carrega os clientes na página
    carregarClientes("clienteIdModal"); // Carrega os clientes no modal
    carregarMensagens("mensagemId"); // Carrega as mensagens na página
    carregarMensagens("mensagemIdModal"); // Carrega as mensagens no modal
    verificarLembretes();
    setInterval(verificarLembretes, 60000); // Verifica a cada minuto
});

// Listar lembretes
async function carregarLembretes() {
    try {
        const response = await fetch("http://localhost:3000/lembretes");
        const lembretes = await response.json();

        const lista = document.getElementById("listaLembretes");
        lista.innerHTML = "";

        if (lembretes.length === 0) {
            lista.innerHTML = "<tr><td colspan='4'>Nenhum lembrete cadastrado</td></tr>";
        } else {
            lembretes.forEach((lembrete) => {

                const tr = document.createElement("tr");

                const dataCompleta = formatarData(lembrete.data_alvo);
                const [data, hora] = dataCompleta.split(" ");

                tr.innerHTML = `
                    <td>${lembrete.id}</td>
                    <td>${lembrete.cliente_nome}</td>  <!-- Nome do cliente -->
                    <td>${lembrete.mensagem_texto}</td>  <!-- Texto da mensagem -->
                    <td>${data} às ${hora}</td>  <!-- Data e hora do lembrete -->
                    <td>
                        <button onclick="abrirModalEdicao(${lembrete.id}, '${lembrete.cliente_id}', '${lembrete.mensagem_id}', '${formatarData(lembrete.data_alvo)}')">✏️</button>
                        <button onclick="enviarLembrete('${lembrete.cliente_telefone}','${lembrete.mensagem_texto}')"><img src="./img/wpp1x.png"></button>
                        <button onclick="excluirLembrete(${lembrete.id})">❌</button>
                    </td>
                `;
                lista.appendChild(tr)
            });
        }
    } catch (error) {
        console.error("❌ Erro ao carregar lembretes", error);
    }
}

// Excluir lembrete
async function excluirLembrete(id) {
    if (confirm("Tem certeza que deseja excluir este lembrete?")) {
      try {
        const response = await fetch(`http://localhost:3000/lembretes/${id}`, { method: "DELETE" });

        // Verifica se o status da resposta é OK (200)
        if (response.ok) {
          alert("Lembrete excluído com sucesso!");
          carregarLembretes();  // Atualiza a lista de lembretes
        } else {
          const result = await response.json();
          alert(`Falha ao excluir o lembrete: ${result.error || 'Erro desconhecido'}`);
        }
      } catch (error) {
        console.error("Erro ao excluir lembrete", error);
      }
    }
}

// Função para editar um lembrete
function editarLembrete(id, clienteId, mensagemId, dataHoraLembrete) {
    const [data, hora] = dataHoraLembrete.split(" ");
    document.getElementById("clienteId").value = clienteId;
    document.getElementById("mensagemId").value = mensagemId;
    document.getElementById("dataLembrete").value = data;
    document.getElementById("horaLembrete").value = hora.substring(0, 5);
    document.getElementById("lembreteId").value = id;
}

// Carregar clientes dinamicamente
async function carregarClientes(tipoModal) {
    try {
        const response = await fetch("http://localhost:3000/clientes");
        const clientes = await response.json();
        const select = document.getElementById(tipoModal);

        // Limpa opções anteriores para evitar duplicação
        select.innerHTML = '<option value="">Selecione um cliente</option>';

        // Carrega as opções dos clientes no select
        clientes.forEach((cliente) => {
            const option = document.createElement("option");
            option.value = cliente.id;
            option.textContent = cliente.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar clientes", error);
    }
}

// Carregar mensagens dinamicamente
async function carregarMensagens(tipoModal) {
    try {
        const response = await fetch("http://localhost:3000/mensagens");
        const mensagens = await response.json();
        const select = document.getElementById(tipoModal);

        // Limpa opções anteriores para evitar duplicação
        select.innerHTML = '<option value="">Selecione uma mensagem</option>';

        mensagens.forEach((mensagem) => {
            const option = document.createElement("option");
            option.value = mensagem.id;
            option.textContent = mensagem.conteudo;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar mensagens", error);
    }
}

// Função para formatar a data
function formatarData(dataSQL) {

    const data = new Date(dataSQL.replace(" ", "T")); // Garante compatibilidade
    if (isNaN(data.getTime())) return "Data inválida";

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês começa do zero
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');

    return `${dia}-${mes}-${ano} ${horas}:${minutos}`;
}

// Função para abrir o modal de edição de lembrete
function abrirModalEdicao(id, cliente_id, mensagem_id, dataHoraLembrete) {

    const data = dataHoraLembrete.substring(0, 10);
    const hora = dataHoraLembrete.substring(11, 16);
    const dataInvertida = inverterData(data); //Inverte a data para o formato yyyy-mm-dd
    document.getElementById("modalEdicao").style.display = "block"; // Abre o modal
    document.getElementById("lembreteIdModal").value = id;
    document.getElementById("clienteIdModal").value = cliente_id;
    document.getElementById("mensagemIdModal").value = mensagem_id;
    document.getElementById("dataLembreteModal").value = dataInvertida;
    document.getElementById("horaLembreteModal").value = hora;
}

//Modal de confirmação de envio de lembrete
function abrirModalEnvio(cliente, telefone, mensagem, data) {
    document.getElementById("modalEnvio").style.display = "block";
    data = formatarData(data);
    document.getElementById("clienteEnvio").innerHTML = cliente;
    document.getElementById("telefoneEnvio").innerHTML =  telefone;
    document.getElementById("dataEnvio").innerHTML = data;
    document.getElementById("mensagemEnvio").innerHTML = mensagem;
    const primeiroNome = cliente.split(" ")[0]; // Pega o primeiro nome do cliente
    falar("Alerta de lembrete! Você tem um novo lembrete! Cliente: " + cliente + ". Mensagem: " + mensagem); // Chama a função de leitura por voz
}

// Função para fechar o modal de edição de lembrete
function fecharModal(tipoModal) {
    document.getElementById(tipoModal).style.display = "none";

    if(tipoModal === "modalEnvio") {
        interromperAlarme(); // Interrompe o alarme ao fechar o modal de envio
    }
}

function inverterData(data) {
    return data.split('-').reverse().join('-');
}

// Cadastrar um novo lembrete
document.getElementById("formLembrete")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const clienteId = document.getElementById("clienteId").value;
    const mensagemId = document.getElementById("mensagemId").value;
    const dataLembrete = document.getElementById("dataLembrete").value;
    const horaLembrete = document.getElementById("horaLembrete").value;
    const dataHoraLembrete = `${dataLembrete} ${horaLembrete}:00`;
    try {
        await fetch("http://localhost:3000/lembretes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clienteId, mensagemId, dataHoraLembrete}),
        });

        alert("Lembrete cadastrado!");
        document.getElementById("clienteId").selectedIndex = 0; // Limpa o select de clientes
        document.getElementById("mensagemId").selectedIndex = 0; // Limpa o select de mensagens
        document.getElementById("dataLembrete").value = ''; // Limpa o campo de data
        document.getElementById("horaLembrete").value = "09:00"; // Limpa o campo de hora
        carregarLembretes();
    } catch (error) {
        console.error("Erro ao cadastrar lembrete", error);
        alert("Falha ao cadastrar lembrete. Tente novamente.");
    }
});

// Lógica para editar os dados escolhidos
document.getElementById("formModalLembrete").addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = document.getElementById("lembreteIdModal").value;
    const clienteId = document.getElementById("clienteIdModal").value;
    const mensagemId = document.getElementById("mensagemIdModal").value;
    const data = document.getElementById("dataLembreteModal").value;
    const hora = document.getElementById("horaLembreteModal").value;
    const dataHoraLembrete = `${data} ${hora}:00`;

    const lembrete = { clienteId, mensagemId, dataHoraLembrete };

    if (id) {
        await fetch(`http://localhost:3000/lembretes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lembrete)
        });
    }

    fecharModal("modalEdicao"); // Fecha o modal de edição
    carregarLembretes();
});

async function verificarLembretes() {
    try {
        const response = await fetch("http://localhost:3000/lembretes");
        const lembretes = await response.json();
        const agora = new Date();

        // Cria uma fila de lembretes pendentes
        const filaLembretes = lembretes.filter(lembrete => lembrete.status === "pendente");

        // Processa os lembretes um por vez
        filaLembretes.forEach((lembrete, index) => {
            // Verifica se o lembrete já passou do horário ou é o horário exato
            lembrete = filaLembretes[index];
            const dataLembrete = new Date(lembrete.data_alvo.replace(" ", "T"));

            // Se o lembrete já passou do horário ou é o horário exato, toca o alarme
            if (
                    dataLembrete.getTime() < agora.getTime() || 
                    dataLembrete.getTime() === agora.getTime()
            ) {
                tocarAlarme(lembrete);
                abrirModalEnvio(lembrete.cliente_nome, lembrete.cliente_telefone, lembrete.mensagem_texto, lembrete.data_alvo);
                console.log("Alerta de lembrete! Você tem um novo lembrete! Cliente: " + lembrete.cliente_nome + ". Mensagem: " + lembrete.mensagem_texto); // Teste
                //await atualizarStatusLembrete(lembrete.id); //Atualiza o status do lembrete para 'enviado'
            }
        })
    } catch (error) {
        console.error("Erro ao verificar lembretes", error);
    }
}

// Lógica para ativar o alarme
function tocarAlarme(lembrete) {

    let alarmeContainer = document.getElementById('alarme-container');
    let mensagem = document.getElementById('mensagem');
    let alarmeSom = document.getElementById('alarme-som');
    let timeoutStatus = document.getElementById('timeout-status').value; // Pega o valor do timeoutStatus

    // Ativar o alarme
    alarmeContainer.classList.add('ativo');
    mensagem.innerHTML = 'ALERTA! VOCÊ TEM UMA NOVA NOTIFICAÇÃO!';
    alarmeSom.play(); // Tocar som do alarme
    alarmeSom.loop = true; // Repetir o som do alarme

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Alarme de Lembrete", {
            body: `⏰ Hora do lembrete!\n📌 Cliente: ${lembrete.cliente_nome}\n💬 Mensagem: ${lembrete.mensagem_texto}`,
            icon: "icone.png", // Adicione um ícone ao projeto (opcional)
        });
    }

    // Opcional: Desativar o alarme após 5 segundos
    if(timeoutStatus === 'true'){
        let tempo = 0; // 15 segundos é igual a 15000 milissegundos
        tempo = document.getElementById('timeout-number').value * 1000; // Pega o valor do tempo definido pelo usuário

        setTimeout(function() {
            alarmeContainer.classList.remove('ativo');
            mensagem.innerHTML = 'NENHUMA NOTIFICAÇÃO ATIVA';
            alarmeSom.pause();
            alarmeSom.currentTime = 0; // Resetar o áudio
            fecharModal("modalEnvio"); // Fecha o modal de envio
        }, tempo); // Desativa após o tempo ser definido
    }
}

// Função para interromper o alarme
 function interromperAlarme() {
    const alarmeContainer = document.getElementById('alarme-container');
    const alarmeSom = document.getElementById('alarme-som');

    if (alarmeContainer.classList.contains('ativo')) {
        alarmeContainer.classList.remove('ativo');
        mensagem.innerHTML = 'NENHUMA NOTIFICAÇÃO ATIVA';
        alarmeSom.pause();
        alarmeSom.currentTime = 0; // Resetar o áudio
    }
}

// Função para atualizar o status do lembrete para 'enviado'
async function atualizarStatusLembrete(id) {
    try {
        await fetch(`http://localhost:3000/lembretes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'enviado' })
        });
    } catch (error) {
        console.error("Erro ao atualizar status do lembrete", error);
    }
}

function enviarLembrete(){
    const tel = parseInt(document.getElementById('telefoneEnvio').textContent);
    if (isNaN(tel)) {
        alert('Telefone inválido!');
        return;
    }

    let msg = encodeURIComponent(document.getElementById('mensagemEnvio').textContent);
    //msg = encodeURIComponent(msg); // Codifica a mensagem para URL NÃO TESTADO

    // Fecha o modal de envio e interrompe o alarme naquele minuto.
    fecharModal("modalEnvio");

    // Envio com o WhatsApp
    window.open(`https://wa.me/${tel}?text=${msg}`, '_blank');
}

function falar(texto) {
    const voices = window.speechSynthesis.getVoices(); // Carrega as vozes disponíveis;

    try {
        const msg = new SpeechSynthesisUtterance(texto);
        msg.voice = voices[1]; // Define a voz 0 para "Microsoft Masculino" e 1 para "Microsoft Maria"
        msg.rate = 1.4; // Define a velocidade da fala
        window.speechSynthesis.speak(msg); // Fala o texto
    }
    catch (error) {
        console.error("Erro ao carregar vozes", error);
    }
}

// Evento para alternar o status do timeout
document.getElementById("timeout-status").addEventListener('click', function() {
    const timeoutStatusElement = document.getElementById('timeout-status');
    const timeoutStatus = timeoutStatusElement.getAttribute('value');
    if (timeoutStatus === "false") {
        timeoutStatusElement.setAttribute('value', "true");
        timeoutStatusElement.className = "ativo"; // Adiciona a classe 'ativo' para mudar a cor do botão
        timeoutStatusElement.innerHTML = "DESATIVAR TIMEOUT";
    } else if (timeoutStatus === "true") {
        timeoutStatusElement.setAttribute('value', "false");
        timeoutStatusElement.classList.remove('ativo'); // Retira a classe 'ativo' para mudar o botão de volta ao padrão
        timeoutStatusElement.innerHTML = "ATIVAR TIMEOUT";
    }
});

/*document.getElementById('dataLembrete').addEventListener('change', function() {
    let dataLembrete = document.getElementById('dataLembrete').value;
    let dataAtual = new Date();
    let data = new Date(dataLembrete);
    if (data < dataAtual) {
        alert('Data inválida! Selecione uma data futura.\n Data do lembrete: ' + data + " - Data atual: " + dataAtual);
        document.getElementById('dataLembrete').value = '';
    }
});*/