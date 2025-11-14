/*
 * ==========================================
 * JOJODLE - CLIENT-SIDE (MAIN.TS)
 * ==========================================
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// --- URLs DA NOSSA API ---
// Lembre-se que temos DOIS servidores a rodar
const API_URL_DADOS = 'http://localhost:3000'; // Nosso Express (Dados)
const API_URL_IA = 'http://localhost:4000'; // Nosso Genkit (IA/Dicas)
// --- Variáveis Globais do Jogo ---
let targetCharacter; // O personagem secreto (vem da API)
let allCharactersDB = []; // A lista de todos os personagens (vem da API)
let guessCount = 0; // Contador de tentativas
/*
 * Documentação: Elementos do DOM
 *
 * Capturamos os elementos do HTML para interagir.
 */
const guessInput = document.getElementById('guess-input');
const guessButton = document.getElementById('guess-button');
const resultsContainer = document.getElementById('results-container');
const feedbackText = document.getElementById('feedback-text');
const hintButton = document.getElementById('hint-button');
const suggestionsContainer = document.getElementById('autocomplete-suggestions');
/*
 * Documentação: Inicialização do Jogo
 *
 * Esta função é executada assim que a página carrega.
 * Ela é responsável por buscar os dados no backend.
 */
function initGame() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Iniciando o jogo... Buscando dados do backend...");
        feedbackText.textContent = "A carregar personagens...";
        try {
            // 1. Buscar a lista COMPLETA de personagens
            const responseAll = yield fetch(`${API_URL_DADOS}/jojo_characters`);
            if (!responseAll.ok)
                throw new Error('Falha ao buscar lista de personagens.');
            allCharactersDB = yield responseAll.json();
            console.log("Banco de dados local carregado:", allCharactersDB);
            //renderCharacterCards(allCharactersDB);
            // 2. Buscar o PERSONAGEM DO DIA
            const responseTarget = yield fetch(`${API_URL_DADOS}/character_of_the_day`);
            if (!responseTarget.ok)
                throw new Error('Falha ao buscar personagem do dia.');
            targetCharacter = yield responseTarget.json();
            // Psst... A cola para testes
            console.log("Personagem Secreto (Cola):", targetCharacter.name);
            // 3. Jogo pronto!
            feedbackText.textContent = "Personagens carregados. Tente adivinhar!";
        }
        catch (error) {
            console.error("Erro ao iniciar o jogo:", error);
            feedbackText.textContent = "Erro ao carregar o jogo. Verifique se o backend está a rodar.";
            guessInput.disabled = true;
            guessButton.disabled = true;
        }
    });
}
// "Ouvinte" que espera o HTML estar pronto para iniciar o jogo
document.addEventListener('DOMContentLoaded', initGame);
/**
 * Documentação: Lógica do Autocomplete
 * Acionado a cada letra digitada no input.
 */
guessInput.addEventListener('input', () => {
    console.log(`[LOG Autocomplete] Evento 'input' disparado.`);
    const inputText = guessInput.value.trim().toLowerCase();
    // Limpa as sugestões se o campo estiver vazio
    if (inputText.length === 0) {
        clearSuggestions();
        return;
    }
    // 1. Filtra o nosso banco de dados local
    const matches = allCharactersDB.filter(character => character.name.toLowerCase().startsWith(inputText));
    console.log(`[LOG Autocomplete] Texto: "${inputText}", Correspondências: ${matches.length}`);
    // 2. Renderiza as sugestões
    renderSuggestions(matches);
});
/*
 * Documentação: Função handleGuess
 *
 * Executada quando o jogador tenta um palpite.
 */
function handleGuess() {
    const guessName = guessInput.value.trim();
    feedbackText.textContent = ''; // Limpa o feedback
    if (!guessName) {
        feedbackText.textContent = 'Por favor, insira um nome.';
        return;
    }
    // Procura o personagem no nosso banco de dados LOCAL (que veio da API)
    const guessedCharacter = allCharactersDB.find((char) => char.name.toLowerCase() === guessName.toLowerCase());
    // Se o personagem não existir no nosso DB
    if (!guessedCharacter) {
        feedbackText.textContent = `Personagem "${guessName}" não encontrado na nossa lista.`;
        guessInput.value = ''; // Limpa o input
        return;
    }
    // Se encontrou, cria a linha de resultado
    createResultRow(guessedCharacter);
    guessCount++; // Incrementa a tentativa
    // Verifica se o jogador ganhou
    if (guessedCharacter.name === targetCharacter.name) {
        feedbackText.textContent = `Parabéns! Você acertou: ${targetCharacter.name}!`;
        guessInput.disabled = true;
        guessButton.disabled = true;
        hintButton.style.display = 'none'; // Esconde o botão de dica
    }
    else {
        // Se errou, verifica se deve mostrar o botão de dica
        if (guessCount >= 3) { // Mostra a dica após 3 erros
            hintButton.style.display = 'block';
        }
    }
    guessInput.value = ''; // Limpa o input para a próxima
}
// "Ouvintes" para o input e botões
guessButton.addEventListener('click', handleGuess);
guessInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter')
        handleGuess();
});
hintButton.addEventListener('click', handleHint);
/*
 * Documentação: Função handleHint
 *
 * Executada quando o jogador clica no botão "Pedir Dica".
 * Esta função chama o nosso backend de IA (Genkit).
 */
function handleHint() {
    return __awaiter(this, void 0, void 0, function* () {
        feedbackText.textContent = "A gerar uma dica... (Chamando IA)";
        hintButton.disabled = true; // Desativa o botão para evitar spam
        try {
            const response = yield fetch(`${API_URL_IA}/getJojoTip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nomeDoPersonagem: targetCharacter.name // Envia o nome do secreto
                })
            });
            if (!response.ok)
                throw new Error('O servidor de IA falhou em dar uma dica.');
            const result = yield response.json();
            feedbackText.textContent = `DICA: ${result.tip}`;
        }
        catch (error) {
            console.error("Erro ao buscar dica:", error);
            feedbackText.textContent = "Não foi possível obter a dica.";
            hintButton.disabled = false; // Re-ativa o botão se falhar
        }
    });
}
/**
 * ==========================================
 * NOVA FUNÇÃO: Renderizar Cartões de Personagem
 * ==========================================
 * Percorre a lista de todos os personagens e cria
 * um cartão visual para cada um.
 */
function renderCharacterCards(characters) {
    // 1. Captura o container (só precisamos dele aqui)
    const container = document.getElementById('character-cards-container');
    // Se não encontrar o container, para a execução
    if (!container) {
        console.error("Erro: Container '#character-cards-container' não foi encontrado.");
        return;
    }
    // 2. Limpa o container (caso esta função seja chamada novamente)
    container.innerHTML = '';
    // 3. Faz um loop por cada personagem e cria o HTML
    for (const char of characters) {
        // Cria o elemento 'div' principal do cartão
        const card = document.createElement('div');
        card.classList.add('character-card');
        // Cria a imagem
        const img = document.createElement('img');
        img.src = char.imageUrl;
        img.alt = `Imagem de ${char.name}`;
        // Cria o nome
        const name = document.createElement('p');
        name.textContent = char.name;
        // Adiciona um "tooltip" (dica) ao passar o rato
        // para o caso de o nome estar cortado
        card.title = char.name;
        // "Monta" o cartão
        card.appendChild(img);
        card.appendChild(name);
        // Adiciona o cartão final ao container na página
        container.appendChild(card);
    }
}
/*
 * ==========================================
 * Funções Auxiliares (Renderização)
 * (Estas funções são quase idênticas às que tínhamos)
 * ==========================================
 */
/**
 * Documentação: Função createResultRow
 * Cria a linha de feedback visual para a tentativa.
 */
function createResultRow(guessedCharacter) {
    const resultRow = document.createElement('div');
    resultRow.classList.add('result-row');
    // --- 1. Personagem (Nome + Imagem) ---
    const nameCell = createFeedbackCell(''); // Célula vazia
    nameCell.classList.add('cell-character'); // Adiciona classe especial
    // Adiciona a imagem
    const img = document.createElement('img');
    img.src = guessedCharacter.imageUrl;
    img.alt = guessedCharacter.name;
    img.classList.add('char-image');
    // Adiciona o nome
    const nameSpan = document.createElement('span');
    nameSpan.textContent = guessedCharacter.name;
    nameCell.appendChild(img);
    nameCell.appendChild(nameSpan);
    nameCell.classList.add(guessedCharacter.name === targetCharacter.name ? 'correct' : 'incorrect');
    resultRow.appendChild(nameCell);
    // --- 2. Idade ---
    const ageFeedback = getNumericFeedback(guessedCharacter.age, targetCharacter.age);
    const ageCell = createFeedbackCell(`${guessedCharacter.age} ${ageFeedback.arrow}`);
    ageCell.classList.add(ageFeedback.className);
    resultRow.appendChild(ageCell);
    // --- 3. Parte ---
    const partFeedback = getNumericFeedback(guessedCharacter.part, targetCharacter.part);
    const partCell = createFeedbackCell(`Parte ${guessedCharacter.part} ${partFeedback.arrow}`);
    partCell.classList.add(partFeedback.className);
    resultRow.appendChild(partCell);
    // --- 4. Nacionalidade ---
    const natCell = createFeedbackCell(guessedCharacter.nationality);
    natCell.classList.add(guessedCharacter.nationality === targetCharacter.nationality ? 'correct' : 'incorrect');
    resultRow.appendChild(natCell);
    // --- 5. Gênero ---
    const genderCell = createFeedbackCell(guessedCharacter.gender);
    genderCell.classList.add(guessedCharacter.gender === targetCharacter.gender ? 'correct' : 'incorrect');
    resultRow.appendChild(genderCell);
    // --- 6. Stand ---
    const standCell = createFeedbackCell(guessedCharacter.stand);
    standCell.classList.add(guessedCharacter.stand === targetCharacter.stand ? 'correct' : 'incorrect');
    resultRow.appendChild(standCell);
    resultsContainer.prepend(resultRow);
}
/**
 * Função auxiliar para criar uma única célula de feedback.
 */
function createFeedbackCell(text) {
    const cell = document.createElement('div');
    cell.classList.add('result-cell');
    cell.textContent = text;
    return cell;
}
/**
 * Função auxiliar para comparar números (Idade, Parte).
 */
function getNumericFeedback(guess, target) {
    if (guess === target) {
        return { arrow: '', className: 'correct' }; // Verde
    }
    if (guess < target) {
        return { arrow: '⬆️', className: 'partial' }; // Amarelo (Palpite MENOR)
    }
    else {
        return { arrow: '⬇️', className: 'partial' }; // Amarelo (Palpite MAIOR)
    }
}
/**
 * Documentação: renderSuggestions
 * Desenha a lista de sugestões no ecrã.
 * @param matches Um array de 'Character' que corresponde ao que foi digitado.
 */
function renderSuggestions(matches) {
    console.log(`[LOG Autocomplete] Renderizando ${matches.length} sugestões.`);
    clearSuggestions(); // Limpa a lista anterior
    // Limita a 10 sugestões para não poluir
    matches.slice(0, 10).forEach(match => {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.classList.add('suggestion-item');
        suggestionDiv.textContent = match.name;
        // --- A MAGIA ACONTECE AQUI ---
        // Adiciona um 'click' a cada sugestão
        suggestionDiv.addEventListener('click', () => {
            guessInput.value = match.name; // Preenche o input
            clearSuggestions(); // Fecha a caixa de sugestões
            guessInput.focus(); // Devolve o foco ao input
        });
        suggestionsContainer.appendChild(suggestionDiv);
    });
}
/**
 * Documentação: clearSuggestions
 * Limpa o HTML da caixa de sugestões.
 */
function clearSuggestions() {
    suggestionsContainer.innerHTML = '';
}
/**
 * Documentação: Fechar ao Clicar Fora
 * Se o utilizador clicar em qualquer outro sítio, fecha as sugestões.
 */
document.addEventListener('click', (event) => {
    // Se o clique NÃO foi no input E NÃO foi na caixa de sugestões...
    if (event.target !== guessInput && !suggestionsContainer.contains(event.target)) {
        clearSuggestions();
    }
});
export {};
//# sourceMappingURL=main.js.map