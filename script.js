// script.js

// BANCO DE DADOS LOCAL
let data = {
    characters: [],
    notes: "",
    initiative: [],
    diceRolls: [],
    campaignDay: 1,
    lastSave: new Date().toISOString()
};

// Inicialização do banco de dados
function initDatabase() {
    const saved = localStorage.getItem('limbo_db');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            data = {
                ...data,
                ...parsed,
                initiative: parsed.initiative || [],
                diceRolls: parsed.diceRolls || [],
                campaignDay: parsed.campaignDay || 1
            };
        } catch (e) {
            console.error("Erro ao carregar dados:", e);
            showAlert("Erro ao carregar dados salvos. Um novo banco será criado.");
        }
    }
    save();
    updateStats();
}

// Salvar dados
function save() {
    data.lastSave = new Date().toISOString();
    try {
        localStorage.setItem('limbo_db', JSON.stringify(data));
    } catch (e) {
        console.error("Erro ao salvar dados:", e);
        showAlert("Erro ao salvar dados. Verifique o espaço de armazenamento.");
    }
}

// INDEX: PERSONAGENS
function renderChars() {
    const list = document.getElementById('char-list');
    if (!list) return;
    
    if (data.characters.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ghost"></i>
                <p>Nenhum agente registrado</p>
                <p class="empty-hint">Crie seu primeiro personagem para começar</p>
            </div>`;
        return;
    }
    
    list.innerHTML = "";
    data.characters.forEach((c, i) => {
        const card = document.createElement('div');
        card.className = 'char-card-paper';
        card.innerHTML = `
            <div onclick="editChar(${i})">
                <strong>${c.nome || 'Agente Desconhecido'}</strong><br>
                <small>Nível ${c.nivel || 1} | ${c.origem || 'Origem desconhecida'}</small>
            </div>
            <button class="del-btn" onclick="event.stopPropagation(); askDelete(${i})">
                <i class="fas fa-trash"></i>
            </button>`;
        list.appendChild(card);
    });
    updateStats();
}

function newCharacter() {
    localStorage.removeItem('editing_idx');
    window.location.href = 'criacao.html';
}

function editChar(i) {
    if (i >= 0 && i < data.characters.length) {
        localStorage.setItem('editing_idx', i.toString());
        window.location.href = 'criacao.html';
    } else {
        showAlert("Índice de personagem inválido.");
    }
}

// INICIATIVA
function addInitiative() {
    const nameInput = document.getElementById('init-name');
    const valInput = document.getElementById('init-val');
    
    const name = nameInput.value.trim();
    const value = parseInt(valInput.value) || 0;
    
    if (!name) {
        showAlert("Digite um nome para a iniciativa.");
        return;
    }
    
    data.initiative.push({ name, value });
    data.initiative.sort((a, b) => b.value - a.value);
    save();
    renderInitiative();
    
    nameInput.value = "";
    valInput.value = "";
    nameInput.focus();
}

function renderInitiative() {
    const list = document.getElementById('init-list');
    if (!list) return;
    
    if (data.initiative.length === 0) {
        list.innerHTML = '<li style="text-align: center; color: var(--ink-faded); font-style: italic;">Nenhuma iniciativa registrada</li>';
        return;
    }
    
    list.innerHTML = "";
    data.initiative.forEach((item, i) => {
        const li = document.createElement('li');
        li.className = i === 0 ? 'highlight' : '';
        li.innerHTML = `
            <span>${item.name}</span>
            <span class="init-value">${item.value}</span>
        `;
        list.appendChild(li);
    });
}

function clearInitiative() {
    if (data.initiative.length === 0) return;
    
    if (confirm("Tem certeza que deseja limpar toda a ordem de iniciativa?")) {
        data.initiative = [];
        save();
        renderInitiative();
    }
}

// DADOS
function rollDice(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    const roll = {
        type: `d${sides}`,
        result: result,
        timestamp: new Date().toLocaleTimeString(),
        isCritical: result === sides || result === 1
    };
    
    data.diceRolls.unshift(roll);
    if (data.diceRolls.length > 10) {
        data.diceRolls = data.diceRolls.slice(0, 10);
    }
    
    save();
    renderDiceLog();
    
    // Feedback visual
    const diceType = document.querySelector(`.dice-btn[onclick="rollDice(${sides})"] .dice-type`);
    if (diceType) {
        const originalText = diceType.textContent;
        diceType.textContent = result;
        diceType.style.color = roll.isCritical ? (result === sides ? '#2e7d32' : '#c62828') : 'var(--stain-red)';
        diceType.style.transform = 'scale(1.3)';
        
        setTimeout(() => {
            diceType.textContent = originalText;
            diceType.style.color = '';
            diceType.style.transform = '';
        }, 1000);
    }
    
    updateStats();
}

function renderDiceLog() {
    const log = document.getElementById('dice-log');
    if (!log) return;
    
    const logHeader = log.querySelector('.log-header') || document.createElement('div');
    logHeader.className = 'log-header';
    logHeader.textContent = 'ÚLTIMOS LANÇAMENTOS';
    
    log.innerHTML = '';
    log.appendChild(logHeader);
    
    if (data.diceRolls.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.color = 'var(--ink-faded)';
        emptyMsg.style.fontStyle = 'italic';
        emptyMsg.style.padding = '20px';
        emptyMsg.textContent = 'Nenhum dado lançado ainda';
        log.appendChild(emptyMsg);
        return;
    }
    
    data.diceRolls.forEach(roll => {
        const rollDiv = document.createElement('div');
        rollDiv.style.marginBottom = '5px';
        rollDiv.style.padding = '5px 10px';
        rollDiv.style.borderLeft = `3px solid ${roll.isCritical ? (roll.result === parseInt(roll.type.substring(1)) ? '#2e7d32' : '#c62828') : 'var(--stain-brown)'}`;
        rollDiv.style.background = roll.isCritical ? (roll.result === parseInt(roll.type.substring(1)) ? 'rgba(46, 125, 50, 0.1)' : 'rgba(198, 40, 40, 0.1)') : 'transparent';
        
        rollDiv.innerHTML = `
            <span style="font-weight: bold; color: var(--stain-teal)">${roll.type}</span>
            <span style="margin: 0 10px">→</span>
            <span style="font-weight: bold; font-size: 1.1em; color: ${roll.isCritical ? (roll.result === parseInt(roll.type.substring(1)) ? '#2e7d32' : '#c62828') : 'var(--ink-dark)'}">
                ${roll.result}
            </span>
            <span style="float: right; color: var(--ink-faded); font-size: 0.8em">${roll.timestamp}</span>
        `;
        log.appendChild(rollDiv);
    });
}

// ANOTAÇÕES
function saveNotes() {
    const notes = document.getElementById('campaign-notes');
    if (notes) {
        data.notes = notes.value;
        save();
        
        const count = document.getElementById('notes-count');
        if (count) {
            count.textContent = `${notes.value.length} caracteres`;
        }
    }
}

function loadNotes() {
    const notes = document.getElementById('campaign-notes');
    const count = document.getElementById('notes-count');
    if (notes && count) {
        notes.value = data.notes || "";
        count.textContent = `${notes.value.length} caracteres`;
        
        // Auto-save a cada 5 segundos
        notes.addEventListener('input', () => {
            count.textContent = `${notes.value.length} caracteres`;
            debounce(saveNotes, 5000)();
        });
    }
}

// MODAIS
let pendingDelete = null;

function askDelete(i) {
    if (i >= 0 && i < data.characters.length) {
        pendingDelete = i;
        document.getElementById('confirm-modal').style.display = 'flex';
    }
}

function closeModal() {
    document.getElementById('confirm-modal').style.display = 'none';
    pendingDelete = null;
}

function showAlert(message) {
    const alertModal = document.getElementById('alert-modal');
    const alertMessage = document.getElementById('alert-message');
    if (alertModal && alertMessage) {
        alertMessage.textContent = message;
        alertModal.style.display = 'flex';
    }
}

function closeAlert() {
    document.getElementById('alert-modal').style.display = 'none';
}

// ESTATÍSTICAS
function updateStats() {
    document.getElementById('total-chars').textContent = data.characters.length;
    document.getElementById('total-rolls').textContent = data.diceRolls.length;
    
    const avgLevel = data.characters.length > 0 
        ? Math.round(data.characters.reduce((sum, c) => sum + (parseInt(c.nivel) || 1), 0) / data.characters.length * 10) / 10
        : 0;
    document.getElementById('avg-level').textContent = avgLevel;
    
    document.getElementById('campaign-days').textContent = data.campaignDay;
}

// EXPORTAÇÃO DE DADOS
function exportData() {
    const exportData = {
        ...data,
        exportDate: new Date().toISOString(),
        exportVersion: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `limbo_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showAlert("Dados exportados com sucesso!");
}

// UTILITÁRIOS
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('pt-BR', options);
}

// INICIALIZAÇÃO DA PÁGINA
document.addEventListener('DOMContentLoaded', function() {
    initDatabase();
    
    // Configurar data atual
    const currentDate = document.getElementById('current-date');
    if (currentDate) {
        currentDate.textContent = formatDate(new Date());
    }
    
    // Inicializar elementos da página
    renderChars();
    renderInitiative();
    renderDiceLog();
    loadNotes();
    
    // Configurar confirmação de exclusão
    const confirmYes = document.getElementById('confirm-yes');
    if (confirmYes) {
        confirmYes.addEventListener('click', function() {
            if (pendingDelete !== null) {
                data.characters.splice(pendingDelete, 1);
                save();
                renderChars();
                closeModal();
                showAlert("Personagem excluído com sucesso.");
            }
        });
    }
    
    // Configurar tecla Enter para iniciativa
    const initName = document.getElementById('init-name');
    const initVal = document.getElementById('init-val');
    
    if (initName && initVal) {
        initName.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                initVal.focus();
            }
        });
        
        initVal.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addInitiative();
            }
        });
    }
    
    // Configurar auto-save para anotações
    const notes = document.getElementById('campaign-notes');
    if (notes) {
        notes.addEventListener('input', debounce(saveNotes, 2000));
    }
    
    console.log("Sistema LIMBO inicializado com sucesso!");
});