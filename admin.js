// Configuração admin
const ADMIN_PASSWORD = 'Vinte81219';
let adminAuthenticated = false;

// Verificar se está autenticado
function checkAdminAuth() {
    adminAuthenticated = sessionStorage.getItem('admin_auth') === 'true';
    updateAdminUI();
}

// Fazer login
function loginAdmin() {
    const passwordInput = document.getElementById('adminPassword');
    const password = passwordInput.value.trim();

    if (!password) {
        alert('Por favor, insira a senha');
        return;
    }

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_auth', 'true');
        adminAuthenticated = true;
        loginModal.classList.remove('active');
        passwordInput.value = '';
        updateAdminUI();
        showAlert('✅ Login como administrador realizado!');
    } else {
        alert('❌ Senha incorreta!');
        passwordInput.value = '';
    }
}

// Sair do painel admin
function logoutAdmin() {
    sessionStorage.removeItem('admin_auth');
    adminAuthenticated = false;
    adminMode = false;
    updateAdminUI();
    renderPads();
    showAlert('👋 Desconectado do painel administrativo');
}

// Abrir painel admin
function openAdminPanel() {
    const loginModal = document.getElementById('loginModal');
    
    if (adminAuthenticated) {
        // Já está autenticado
        toggleAdminMode();
    } else {
        // Mostrar tela de login
        loginModal.classList.add('active');
        document.getElementById('adminPassword').focus();
    }
}

// Alternar modo admin
function toggleAdminMode() {
    adminMode = !adminMode;
    updateAdminUI();
    renderPads();
}

// Atualizar UI do admin
function updateAdminUI() {
    const headerActions = document.getElementById('headerActions');
    
    if (adminAuthenticated) {
        headerActions.innerHTML = `
            <div class="admin-status">
                👑 Modo Administrativo Ativo
            </div>
            <button class="btn-admin" onclick="toggleAdminMode()">
                ${adminMode ? '👤 Modo Usuário' : '⚙️ Modo Admin'}
            </button>
            ${adminMode ? '<button class="btn-admin" onclick="openManagePadsModal()">🎛️ Gerenciar Pads</button>' : ''}
            <button class="admin-logout" onclick="logoutAdmin()">Sair</button>
        `;
    } else {
        headerActions.innerHTML = `
            <button class="btn-admin" onclick="openAdminPanel()">⚙️ Painel Admin</button>
        `;
    }
}

// Fechar modal de login ao clicar fora
document.getElementById('loginModal').addEventListener('click', function(event) {
    if (event.target === this) {
        this.classList.remove('active');
    }
});

// Permitir Enter para enviar senha
document.getElementById('adminPassword').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loginAdmin();
    }
});

// Abrir modal de gerenciar pads
function openManagePadsModal() {
    const modal = document.getElementById('managePadsModal');
    modal.classList.add('active');
    renderManagePadsGrid();
}

// Fechar modal de gerenciar pads
function closeManagePadsModal() {
    document.getElementById('managePadsModal').classList.remove('active');
}

// Renderizar grid de pads para gerenciamento
function renderManagePadsGrid() {
    const grid = document.getElementById('managePadsGrid');
    
    if (pads.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum pad criado</p>';
        return;
    }

    grid.innerHTML = pads.map(pad => `
        <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #ff2c2c; display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1; overflow: hidden;">
                <strong style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pad.name}</strong>
                <small style="color: #999; font-size: 11px;">${pad.audio ? '✓ Com áudio' : '✗ Sem áudio'}</small>
            </div>
            <button class="btn-admin" onclick="openEditPadModal('${pad.id}')" style="padding: 6px 12px; font-size: 12px; margin-left: 10px; background: linear-gradient(135deg, #ff2c2c 0%, #cc0000 100%);">✏️ Editar</button>
        </div>
    `).join('');
}

// Fechar modal ao clicar fora
document.getElementById('managePadsModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeManagePadsModal();
    }
});

// Fechar modal de edição ao clicar fora
document.getElementById('editPadModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeEditPadModal();
    }
});

// Verificar autenticação ao carregar
checkAdminAuth();
