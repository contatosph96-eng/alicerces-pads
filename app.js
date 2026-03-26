
let pads = [];
let currentlyPlaying = new Map();
let masterVolume = 1.0;

// Carregar pads do localStorage ou iniciar padrão
function loadPads() {
    const saved = localStorage.getItem('negueba_pads');
    if (saved) {
        pads = JSON.parse(saved);
        
        // Se houver pads antigos ou genéricos, resetamos para a nova estrutura musical
        const hasOldPads = pads.some(pad => 
            pad.name === '🎵 Test Pad' ||
            pad.name.includes('🎵') || 
            (pad.name.startsWith('Pad ') && /^\d+$/.test(pad.name.replace('Pad ', '')))
        );
        
        if (hasOldPads) {
            pads = [];
            createInitialPads();
            return;
        }
        
        renderPads();
    } else {
        createInitialPads();
    }
}

// Criar os 12 pads iniciais apontando para a pasta /pad
function createInitialPads() {
    const padConfig = [
        { name: 'C', file: 'C.mp3' },
        { name: 'C# ou Db', file: 'Db.mp3' },
        { name: 'D', file: 'D.mp3' },
        { name: 'D# ou Eb', file: 'Eb.mp3' },
        { name: 'E', file: 'E.mp3' },
        { name: 'F', file: 'F.mp3' },
        { name: 'F# ou Gb', file: 'Gb.mp3' },
        { name: 'G', file: 'G.mp3' },
        { name: 'G# ou Ab', file: 'Ab.mp3' },
        { name: 'A', file: 'A.mp3' },
        { name: 'A# ou Bb', file: 'Bb.mp3' },
        { name: 'B', file: 'B.mp3' }
    ];

    pads = padConfig.map((config, i) => ({
        id: Date.now() + i,
        name: config.name,
        audio: `pad/${config.file}`, // Caminho relativo para os arquivos no GitHub
        volume: 70,
        adminOnly: false,
        createdAt: new Date().toISOString()
    }));
    
    savePads();
    renderPads();
}

function savePads() {
    localStorage.setItem('negueba_pads', JSON.stringify(pads));
}

// Renderização da Interface
function renderPads() {
    const grid = document.getElementById('padsGrid');
    if (pads.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>Nenhum pad configurado.</p></div>';
        return;
    }

    const html = pads.map(pad => {
        return `
            <div class="pad-wrapper">
                <button class="pad" onclick="togglePad('${pad.id}')" id="pad-${pad.id}">
                    <div class="pad-content">
                        <div class="pad-name">${pad.name}</div>
                        <div class="pad-status" id="status-${pad.id}">●</div>
                    </div>
                </button>
            </div>
        `;
    }).join('');

    grid.innerHTML = html;
}

// Lógica de Áudio (Tocar/Pausar com Fade)
function togglePad(padId) {
    const pad = pads.find(p => p.id == padId);
    if (!pad) return;

    if (currentlyPlaying.has(padId)) {
        const activeAudio = currentlyPlaying.get(padId);
        fadeOutVolume(activeAudio, 0, 800, () => {
            activeAudio.pause();
            activeAudio.currentTime = 0;
            currentlyPlaying.delete(padId);
            updatePadUI(padId, false);
        });
        return;
    }

    if (!pad.audio) {
        alert('Áudio não encontrado para este pad.');
        return;
    }

    // Crossfade: para o que estiver tocando antes de iniciar o novo
    currentlyPlaying.forEach((otherAudio, otherPadId) => {
        fadeOutVolume(otherAudio, 0, 800, () => {
            otherAudio.pause();
            otherAudio.currentTime = 0;
            currentlyPlaying.delete(otherPadId);
            updatePadUI(otherPadId, false);
        });
    });

    const audio = new Audio(pad.audio);
    audio.loop = true; // Essencial para pads contínuos
    audio.volume = 0;
    audio.play();
    currentlyPlaying.set(padId, audio);
    updatePadUI(padId, true);

    fadeInVolume(audio, (pad.volume / 100) * masterVolume, 800);
}

function fadeOutVolume(audio, target, duration, callback) {
    const startVol = audio.volume;
    const startTime = Date.now();
    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        audio.volume = startVol + (target - startVol) * progress;
        if (progress === 1) {
            clearInterval(interval);
            if (callback) callback();
        }
    }, 30);
}

function fadeInVolume(audio, target, duration) {
    const startTime = Date.now();
    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        audio.volume = progress * target;
        if (progress === 1) clearInterval(interval);
    }, 30);
}

function updatePadUI(padId, isPlaying) {
    const padElement = document.getElementById(`pad-${padId}`);
    const statusElement = document.getElementById(`status-${padId}`);
    if (padElement) {
        if (isPlaying) {
            padElement.classList.add('playing');
            statusElement.textContent = '▶ Ativo';
        } else {
            padElement.classList.remove('playing');
            statusElement.textContent = '●';
        }
    }
}

// Gerenciamento de Master Volume
const masterSlider = document.getElementById('volumeSlider');
if (masterSlider) {
    const handleVolumeChange = function() {
        masterVolume = this.value / 100;
        document.getElementById('volumeDisplay').textContent = this.value + '%';
        currentlyPlaying.forEach((audio, padId) => {
            const pad = pads.find(p => p.id == padId);
            if (pad) audio.volume = (pad.volume / 100) * masterVolume;
        });
    };

    masterSlider.addEventListener('input', handleVolumeChange);
    masterSlider.addEventListener('change', handleVolumeChange); // Adicionado para compatibilidade em alguns celulares
}

// Inicialização
loadPads();

// Lógica para Forçar Atualização e Limpar Cache
const updateBtn = document.getElementById('update-app-btn');

if (updateBtn) {
    updateBtn.addEventListener('click', () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister(); // Remove o Service Worker antigo
                }
                // Limpa o cache de arquivos
                caches.keys().then(names => {
                    for (let name of names) caches.delete(name);
                });
                alert("Atualizando arquivos... O aplicativo irá reiniciar.");
                window.location.reload(true); // Recarrega a página do zero
            });
        } else {
            window.location.reload(true);
        }
    });
}
