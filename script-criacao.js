// script-criacao.js - Funcionalidades específicas da página de criação

// Banco de dados
let editingIndex = null;
let characterData = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do localStorage
    const savedData = localStorage.getItem('limbo_db');
    data = savedData ? JSON.parse(savedData) : { characters: [], notes: "", initiative: [], diceRolls: [] };
    
    // Verificar se está editando
    editingIndex = localStorage.getItem('editing_idx');
    
    if (editingIndex !== null) {
        editingIndex = parseInt(editingIndex);
        if (data.characters[editingIndex]) {
            characterData = data.characters[editingIndex];
            loadCharacter(characterData);
            console.log(`Editando personagem: ${characterData.nome || 'Sem nome'}`);
        } else {
            console.log("Índice de personagem inválido, criando novo.");
            editingIndex = null;
        }
    } else {
        console.log("Criando novo personagem.");
    }
    
    // Configurar cálculos automáticos
    setupAutoCalculations();
    
    // Configurar eventos
    setupEventListeners();
});

// Carregar dados do personagem
function loadCharacter(char) {
    // Informações básicas
    document.getElementById('char_nome').value = char.nome || '';
    document.getElementById('char_nivel').value = char.nivel || 1;
    document.getElementById('char_xp').value = char.xp || 0;
    document.getElementById('char_origin').textContent = char.origem || 'NÃO DEFINIDA';
    document.getElementById('char_connection').textContent = char.conexao || 'NÃO DEFINIDA';
    document.getElementById('char_level').textContent = `NÍVEL ${char.nivel || 1}`;
    
    // Atributos
    document.getElementById('attr_forca').value = char.atributos?.forca || 1;
    document.getElementById('attr_agilidade').value = char.atributos?.agilidade || 1;
    document.getElementById('attr_vigor').value = char.atributos?.vigor || 1;
    document.getElementById('attr_inteligencia').value = char.atributos?.inteligencia || 1;
    document.getElementById('attr_sabedoria').value = char.atributos?.sabedoria || 1;
    document.getElementById('attr_social').value = char.atributos?.social || 1;
    
    // Perícias
    const habilidades = char.habilidades || {};
    document.getElementById('sk_atletismo').value = habilidades.atletismo || 0;
    document.getElementById('sk_acrobacia').value = habilidades.acrobacia || 0;
    document.getElementById('sk_furtividade').value = habilidades.furtividade || 0;
    document.getElementById('sk_prestidigitacao').value = habilidades.prestidigitacao || 0;
    document.getElementById('sk_ciencias').value = habilidades.ciencias || 0;
    document.getElementById('sk_historia').value = habilidades.historia || 0;
    document.getElementById('sk_investigacao').value = habilidades.investigacao || 0;
    document.getElementById('sk_ocultismo').value = habilidades.ocultismo || 0;
    document.getElementById('sk_tecnologia').value = habilidades.tecnologia || 0;
    document.getElementById('sk_oficio').value = habilidades.oficio || 0;
    document.getElementById('sk_intuicao').value = habilidades.intuicao || 0;
    document.getElementById('sk_medicina').value = habilidades.medicina || 0;
    document.getElementById('sk_religiao').value = habilidades.religiao || 0;
    document.getElementById('sk_sobrevivencia').value = habilidades.sobrevivencia || 0;
    document.getElementById('sk_atualidades').value = habilidades.atualidades || 0;
    document.getElementById('sk_enganacao').value = habilidades.enganacao || 0;
    document.getElementById('sk_intimidacao').value = habilidades.intimidacao || 0;
    document.getElementById('sk_persuasao').value = habilidades.persuasao || 0;
    
    // Status vitais
    document.getElementById('char_vida').value = char.vida || '10/10';
    document.getElementById('char_pe').value = char.pe || '5/5';
    document.getElementById('char_sanidade').value = char.sanidade || '80%';
    document.getElementById('char_defesa').value = char.defesa || 10;
    
    // Profissão
    document.getElementById('prof_nome').value = char.profissao?.nome || '';
    document.getElementById('prof_nivel').value = char.profissao?.nivel || 1;
    document.getElementById('prof_gatilho').value = char.profissao?.gatilho || '';
    document.getElementById('prof_recompensa').value = char.profissao?.recompensa || '';
    
    // Habilidades de conexão
    const conexaoList = document.getElementById('conexao-list');
    conexaoList.innerHTML = '';
    if (char.conexoes && char.conexoes.length > 0) {
        char.conexoes.forEach(conexao => {
            addField('conexao-list', false, conexao.nome, conexao.descricao);
        });
    }
    
    // Rituais
    const rituaisList = document.getElementById('rituais-list');
    rituaisList.innerHTML = '';
    if (char.rituais && char.rituais.length > 0) {
        char.rituais.forEach(ritual => {
            addField('rituais-list', true, ritual.nome, `${ritual.custo}|${ritual.detalhes}`);
        });
    }
    
    // Inventário
    document.getElementById('char_dinheiro').value = char.inventario?.dinheiro || 'CR$ 0';
    
    // Descrição
    document.getElementById('char_descricao').value = char.descricao || '';
    document.getElementById('char_historia').value = char.historia || '';
    document.getElementById('char_traumas').value = char.traumas || '';
    
    // Atualizar barras de status
    updateStatusBars();
}

// Salvar personagem
function saveCharacter() {
    // Coletar dados do formulário
    const character = {
        id: editingIndex !== null ? data.characters[editingIndex]?.id || Date.now() : Date.now(),
        nome: document.getElementById('char_nome').value.trim() || 'Agente Sem Nome',
        nivel: parseInt(document.getElementById('char_nivel').value) || 1,
        xp: parseInt(document.getElementById('char_xp').value) || 0,
        origem: document.getElementById('char_origin').textContent,
        conexao: document.getElementById('char_connection').textContent,
        dataCriacao: editingIndex !== null ? data.characters[editingIndex]?.dataCriacao : new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
        
        // Atributos
        atributos: {
            forca: parseInt(document.getElementById('attr_forca').value) || 1,
            agilidade: parseInt(document.getElementById('attr_agilidade').value) || 1,
            vigor: parseInt(document.getElementById('attr_vigor').value) || 1,
            inteligencia: parseInt(document.getElementById('attr_inteligencia').value) || 1,
            sabedoria: parseInt(document.getElementById('attr_sabedoria').value) || 1,
            social: parseInt(document.getElementById('attr_social').value) || 1
        },
        
        // Perícias
        habilidades: {
            atletismo: parseInt(document.getElementById('sk_atletismo').value) || 0,
            acrobacia: parseInt(document.getElementById('sk_acrobacia').value) || 0,
            furtividade: parseInt(document.getElementById('sk_furtividade').value) || 0,
            prestidigitacao: parseInt(document.getElementById('sk_prestidigitacao').value) || 0,
            ciencias: parseInt(document.getElementById('sk_ciencias').value) || 0,
            historia: parseInt(document.getElementById('sk_historia').value) || 0,
            investigacao: parseInt(document.getElementById('sk_investigacao').value) || 0,
            ocultismo: parseInt(document.getElementById('sk_ocultismo').value) || 0,
            tecnologia: parseInt(document.getElementById('sk_tecnologia').value) || 0,
            oficio: parseInt(document.getElementById('sk_oficio').value) || 0,
            intuicao: parseInt(document.getElementById('sk_intuicao').value) || 0,
            medicina: parseInt(document.getElementById('sk_medicina').value) || 0,
            religiao: parseInt(document.getElementById('sk_religiao').value) || 0,
            sobrevivencia: parseInt(document.getElementById('sk_sobrevivencia').value) || 0,
            atualidades: parseInt(document.getElementById('sk_atualidades').value) || 0,
            enganacao: parseInt(document.getElementById('sk_enganacao').value) || 0,
            intimidacao: parseInt(document.getElementById('sk_intimidacao').value) || 0,
            persuasao: parseInt(document.getElementById('sk_persuasao').value) || 0
        },
        
        // Status vitais
        vida: document.getElementById('char_vida').value,
        pe: document.getElementById('char_pe').value,
        sanidade: document.getElementById('char_sanidade').value,
        defesa: parseInt(document.getElementById('char_defesa').value) || 10,
        
        // Profissão
        profissao: {
            nome: document.getElementById('prof_nome').value,
            nivel: parseInt(document.getElementById('prof_nivel').value) || 1,
            gatilho: document.getElementById('prof_gatilho').value,
            recompensa: document.getElementById('prof_recompensa').value
        },
        
        // Habilidades de conexão
        conexoes: getDynamicFieldsData('conexao-list'),
        
        // Rituais
        rituais: getDynamicFieldsData('rituais-list', true),
        
        // Inventário
        inventario: {
            dinheiro: document.getElementById('char_dinheiro').value
        },
        
        // Descrição
        descricao: document.getElementById('char_descricao').value,
        historia: document.getElementById('char_historia').value,
        traumas: document.getElementById('char_traumas').value
    };
    
    // Salvar no banco de dados
    if (editingIndex !== null) {
        // Atualizar personagem existente
        data.characters[editingIndex] = character;
    } else {
        // Adicionar novo personagem
        data.characters.push(character);
    }
    
    // Salvar no localStorage
    localStorage.setItem('limbo_db', JSON.stringify(data));
    
    // Feedback visual
    showNotification('Personagem salvo com sucesso!');
    
    // Redirecionar após 1 segundo
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Adicionar campo dinâmico
function addField(containerId, isRitual = false, presetName = '', presetDesc = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'dynamic-field';
    
    if (isRitual) {
        // Campo para rituais
        fieldDiv.innerHTML = `
            <input type="text" class="field-input" placeholder="Nome do ritual" value="${presetName}">
            <input type="text" class="field-input" placeholder="Custo (PE/San)" value="${presetDesc.split('|')[0] || ''}">
            <input type="text" class="field-input" placeholder="Execução, Alcance, Duração" value="${presetDesc.split('|')[1] || ''}">
            <button class="btn-remove" onclick="removeField(this)">×</button>
        `;
    } else {
        // Campo para habilidades de conexão
        fieldDiv.innerHTML = `
            <input type="text" class="field-input" placeholder="Nome da habilidade" value="${presetName}">
            <textarea class="field-input" placeholder="Descrição da habilidade...">${presetDesc}</textarea>
            <button class="btn-remove" onclick="removeField(this)">×</button>
        `;
    }
    
    container.appendChild(fieldDiv);
}

// Remover campo dinâmico
function removeField(button) {
    const fieldDiv = button.parentElement;
    fieldDiv.remove();
}

// Obter dados dos campos dinâmicos
function getDynamicFieldsData(containerId, isRitual = false) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    
    const fields = [];
    const fieldDivs = container.querySelectorAll('.dynamic-field');
    
    fieldDivs.forEach(div => {
        const inputs = div.querySelectorAll('.field-input');
        
        if (isRitual && inputs.length >= 3) {
            fields.push({
                nome: inputs[0].value,
                custo: inputs[1].value,
                detalhes: inputs[2].value
            });
        } else if (!isRitual && inputs.length >= 2) {
            fields.push({
                nome: inputs[0].value,
                descricao: inputs[1].value
            });
        }
    });
    
    return fields;
}

// Gerar PDF
function generatePDF() {
    // Elemento a ser convertido para PDF
    const element = document.querySelector('.sheet-container');
    
    // Opções para o PDF
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `ficha_limbo_${document.getElementById('char_nome').value || 'personagem'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            scrollY: 0
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
        },
        pagebreak: { mode: ['css', 'legacy'] }
    };
    
    // Gerar PDF
    html2pdf().set(opt).from(element).save();
    
    // Feedback visual
    showNotification('Gerando PDF...');
}

// Configurar cálculos automáticos
function setupAutoCalculations() {
    // Calcular vida baseada em vigor
    const vigorInput = document.getElementById('attr_vigor');
    const vidaInput = document.getElementById('char_vida');
    
    vigorInput.addEventListener('change', function() {
        const vigor = parseInt(this.value) || 1;
        const vidaMax = vigor * 5 + 5; // Fórmula: (Vigor * 5) + 5
        const currentValue = vidaInput.value.split('/')[0] || vidaMax;
        vidaInput.value = `${Math.min(parseInt(currentValue), vidaMax)}/${vidaMax}`;
        updateStatusBar('char_vida');
    });
    
    // Calcular PE baseado em sabedoria
    const sabedoriaInput = document.getElementById('attr_sabedoria');
    const peInput = document.getElementById('char_pe');
    
    sabedoriaInput.addEventListener('change', function() {
        const sabedoria = parseInt(this.value) || 1;
        const peMax = sabedoria * 3 + 2; // Fórmula: (Sabedoria * 3) + 2
        const currentValue = peInput.value.split('/')[0] || peMax;
        peInput.value = `${Math.min(parseInt(currentValue), peMax)}/${peMax}`;
        updateStatusBar('char_pe');
    });
    
    // Calcular defesa baseada em agilidade
    const agilidadeInput = document.getElementById('attr_agilidade');
    const defesaInput = document.getElementById('char_defesa');
    
    agilidadeInput.addEventListener('change', function() {
        const agilidade = parseInt(this.value) || 1;
        const baseDefesa = 8 + agilidade; // Defesa base: 8 + Agilidade
        defesaInput.value = baseDefesa;
    });
}

// Atualizar barras de status
function updateStatusBars() {
    updateStatusBar('char_vida');
    updateStatusBar('char_pe');
    updateStatusBar('char_sanidade');
}

function updateStatusBar(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    
    const value = input.value;
    const container = input.parentElement.querySelector('.bar-container');
    const fill = container.querySelector('.bar-fill');
    const label = container.querySelector('.bar-label');
    
    if (value.includes('/')) {
        // Formato: atual/máximo
        const [atual, maximo] = value.split('/').map(v => parseInt(v) || 0);
        const percent = maximo > 0 ? (atual / maximo) * 100 : 0;
        fill.style.width = `${percent}%`;
        label.textContent = value;
    } else if (value.includes('%')) {
        // Formato: porcentagem
        const percent = parseInt(value) || 0;
        fill.style.width = `${percent}%`;
        label.textContent = value;
    }
}

// Configurar eventos
function setupEventListeners() {
    // Atualizar barras quando valores mudam
    document.getElementById('char_vida').addEventListener('input', () => updateStatusBar('char_vida'));
    document.getElementById('char_pe').addEventListener('input', () => updateStatusBar('char_pe'));
    document.getElementById('char_sanidade').addEventListener('input', () => updateStatusBar('char_sanidade'));
    
    // Atualizar nível quando exibir
    document.getElementById('char_nivel').addEventListener('change', function() {
        document.getElementById('char_level').textContent = `NÍVEL ${this.value}`;
    });
    
    // Prevenir envio do formulário
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    });
    
    // Configurar salvamento automático parcial
    const autoSaveFields = document.querySelectorAll('.attr-input, .skill-input, .vital-input, .title-input');
    autoSaveFields.forEach(field => {
        field.addEventListener('change', function() {
            // Salvar dados temporariamente
            localStorage.setItem('limbo_autosave', JSON.stringify({
                timestamp: new Date().toISOString(),
                nome: document.getElementById('char_nome').value
            }));
        });
    });
}

// Mostrar notificação
function showNotification(message) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--stain-teal);
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // Adicionar ao documento
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adicionar animações CSS para notificações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);