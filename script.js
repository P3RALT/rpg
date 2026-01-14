// BANCO DE DADOS LOCAL
let data = JSON.parse(localStorage.getItem('limbo_db')) || { characters: [], notes: "", initiative: [] };

function save() { localStorage.setItem('limbo_db', JSON.stringify(data)); }

// INDEX: PERSONAGENS
function renderChars() {
    const list = document.getElementById('char-list');
    if(!list) return;
    list.innerHTML = "";
    data.characters.forEach((c, i) => {
        list.innerHTML += `
            <div class="char-card-paper">
                <div onclick="editChar(${i})">
                    <strong>${c.nome || 'Agente Desconhecido'}</strong><br>
                    <small>Nível ${c.nivel || 1}</small>
                </div>
                <button class="del-btn" onclick="askDelete(${i})"><i class="fas fa-trash"></i></button>
            </div>`;
    });
}

function newCharacter() {
    localStorage.removeItem('editing_idx');
    window.location.href = 'page/criacao.html';
}

function editChar(i) {
    localStorage.setItem('editing_idx', i);
    window.location.href = 'page/criacao.html';
}

// REMOÇÃO COM SEGURANÇA
let pendingDelete = null;
function askDelete(i) {
    pendingDelete = i;
    document.getElementById('confirm-modal').style.display = 'flex';
}

function closeModal() { document.getElementById('confirm-modal').style.display = 'none'; }

document.getElementById('confirm-yes')?.addEventListener('click', () => {
    data.characters.splice(pendingDelete, 1);
    save();
    closeModal();
    renderChars();
});

// FICHA: ADICIONAR CAMPOS DINÂMICOS
function addField(containerId, isRitual = false) {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.className = 'dynamic-field';
    div.innerHTML = isRitual 
        ? `<input type="text" placeholder="Ritual (Custo/Efeito)" class="full-input">`
        : `<input type="text" placeholder="Habilidade..." class="full-input">`;
    container.appendChild(div);
}

// SALVAMENTO DA FICHA
function saveCharacter() {
    const idx = localStorage.getItem('editing_idx');
    const char = {
        nome: document.getElementById('char_nome').value,
        nivel: document.getElementById('char_nivel')?.value || 1,
        historia: document.getElementById('char_historia').value,
        // (Aqui você deve mapear todos os IDs de atributos e perícias)
    };
    
    if(idx === null) data.characters.push(char);
    else data.characters[idx] = char;
    
    save();
}

// INICIALIZAÇÃO
if(document.getElementById('char-list')) renderChars();