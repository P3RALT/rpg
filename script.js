// --- BANCO DE DADOS (LOCALSTORAGE) ---
// Carrega os dados ou cria um objeto vazio se for a primeira vez
let db = JSON.parse(localStorage.getItem('limbo_db')) || { 
    characters: [], 
    notes: "", 
    initiative: [] 
};

// Função global para salvar qualquer alteração
function saveDB() {
    localStorage.setItem('limbo_db', JSON.stringify(db));
}

// --- LÓGICA DA PÁGINA INDEX (PAINEL) ---
// Este bloco só roda se encontrar o elemento 'char-list' (exclusivo da index)
if (document.getElementById('char-list')) {
    renderChars();
    
    const notesArea = document.getElementById('campaign-notes');
    if (notesArea) {
        notesArea.value = db.notes || "";
        notesArea.addEventListener('input', (e) => {
            db.notes = e.target.value;
            saveDB();
        });
    }
}

function renderChars() {
    const list = document.getElementById('char-list');
    if (!list) return;
    list.innerHTML = "";
    
    db.characters.forEach((c, i) => {
        list.innerHTML += `
            <div class="char-card-paper">
                <div onclick="editChar(${i})" style="flex-grow:1; cursor:pointer;">
                    <strong>${c.nome || 'AGENTE DESCONHECIDO'}</strong><br>
                    <small>Nível ${c.nivel || 1}</small>
                </div>
                <button class="del-btn" onclick="askDelete(${i})" style="border:none; background:none; color:red; cursor:pointer; padding:10px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>`;
    });
}

function newCharacter() {
    localStorage.removeItem('editing_idx'); // Garante que é um novo
    window.location.href = 'criacao.html';
}

function editChar(i) {
    localStorage.setItem('editing_idx', i); // Salva qual estamos editando
    window.location.href = 'criacao.html';
}

// --- MODAL DE REMOÇÃO ---
let pendingDelete = null;
function askDelete(i) {
    pendingDelete = i;
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.style.display = 'none';
}

// Atribui o evento ao botão "SIM" do modal se ele existir
document.getElementById('confirm-yes')?.addEventListener('click', () => {
    if (pendingDelete !== null) {
        db.characters.splice(pendingDelete, 1);
        saveDB();
        closeModal();
        renderChars();
    }
});

// --- LÓGICA DA PÁGINA DE CRIAÇÃO (FICHA) ---
if (document.getElementById('ficha-container')) {
    const idx = localStorage.getItem('editing_idx');
    if (idx !== null) {
        loadCharacterData(idx);
    }
}

// Função para adicionar campos de Habilidade/Ritual (+)
function addField(containerId, placeholder) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const input = document.createElement('input');
    input.type = "text";
    input.placeholder = placeholder;
    input.className = "full-input dynamic-input";
    input.style.width = "100%";
    input.style.marginBottom = "5px";
    input.style.display = "block";
    container.appendChild(input);
}

function saveCharacter() {
    const idx = localStorage.getItem('editing_idx');
    
    // Captura dados dos campos
    const char = {
        nome: document.getElementById('char_nome').value || "Agente sem Nome",
        nivel: document.getElementById('char_nivel')?.value || 1,
        historia: document.getElementById('char_historia')?.value || "",
        atributos: {},
        pericias: {},
        habilidades: {
            profissao: Array.from(document.querySelectorAll('#prof-list input')).map(i => i.value),
            conexao: Array.from(document.querySelectorAll('#conn-list input')).map(i => i.value),
            rituais: Array.from(document.querySelectorAll('#rit-list input')).map(i => i.value)
        }
    };

    // Salva Atributos (IDs que começam com attr_)
    document.querySelectorAll('input[id^="attr_"]').forEach(el => char.atributos[el.id] = el.value);
    // Salva Perícias (IDs que começam com sk_)
    document.querySelectorAll('input[id^="sk_"]').forEach(el => char.pericias[el.id] = el.value);
    
    if (idx === null || idx === undefined) {
        db.characters.push(char);
    } else {
        db.characters[idx] = char;
    }
    
    saveDB();
    window.location.href = 'index.html';
}

function loadCharacterData(idx) {
    const c = db.characters[idx];
    if (!c) return;

    // Campos básicos
    document.getElementById('char_nome').value = c.nome || "";
    if(document.getElementById('char_nivel')) document.getElementById('char_nivel').value = c.nivel || 1;
    if(document.getElementById('char_historia')) document.getElementById('char_historia').value = c.historia || "";

    // Atributos e Perícias
    for (let id in c.atributos) {
        const el = document.getElementById(id);
        if (el) el.value = c.atributos[id];
    }
    for (let id in c.pericias) {
        const el = document.getElementById(id);
        if (el) el.value = c.pericias[id];
    }

    // Recria campos dinâmicos (+)
    if (c.habilidades) {
        c.habilidades.profissao.forEach(val => { addField('prof-list', 'Habilidade...'); document.querySelector('#prof-list input:last-child').value = val; });
        c.habilidades.conexao.forEach(val => { addField('conn-list', 'Conexão...'); document.querySelector('#conn-list input:last-child').value = val; });
        c.habilidades.rituais.forEach(val => { addField('rit-list', 'Ritual...'); document.querySelector('#rit-list input:last-child').value = val; });
    }
}

// --- PDF ---
function generatePDF() {
    const element = document.getElementById('ficha-container');
    const nome = document.getElementById('char_nome').value || "Agente";
    const opt = {
        margin: 5,
        filename: `Limbo_Ficha_${nome}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}
