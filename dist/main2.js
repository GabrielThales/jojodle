/*
 * =======================================================
 * Jojodle - O Cérebro do Frontend
 * =======================================================
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
// --- Constantes Globais ---
const BACKEND_URL = 'http://localhost:3100'; // O URL do seu backend Genkit
// --- Variáveis de Estado do Jogo ---
let allCharacters = []; // Lista para a galeria e palpites
let targetCharacter; // O personagem secreto do dia
// --- Captura dos Elementos do DOM ---
const guessInput = document.getElementById('guess-input');
const guessButton = document.getElementById('guess-button');
const resultsContainer = document.getElementById('results-container');
const feedbackText = document.getElementById('feedback-text');
const galleryContainer = document.getElementById('character-gallery-container');
// TODO: Adicionar o botão de dica
// const hintButton = document.getElementById('hint-button') as HTMLButtonElement;
/**
 * Documentação: initializeGame
 * Esta é a função principal. É executada assim que a página carrega.
 * Ela busca os dados do backend e prepara o jogo.
 */
function initializeGame() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            feedbackText.textContent = 'Carregando personagens...';
            // 1. Buscar TODOS os personagens (para a galeria e palpites)
            const allCharsResponse = yield fetch(`${BACKEND_URL}/getAllCharacters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) // Envia {} para o inputSchema: z.object({})
            });
            if (!allCharsResponse.ok)
                throw new Error('Falha ao buscar lista de personagens.');
            allCharacters = yield allCharsResponse.json();
            // 2. Buscar o Personagem Secreto do Dia
            const targetCharResponse = yield fetch(`${BACKEND_URL}/getCharacterOfTheDay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            if (!targetCharResponse.ok)
                throw new Error('Falha ao buscar personagem do dia.');
            targetCharacter = yield targetCharResponse.json();
            // 3. O jogo está pronto!
            populateGallery(allCharacters);
            // 4. Ativar os botões de palpite
            guessButton.addEventListener('click', handleGuess);
            guessInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter')
                    handleGuess();
            });
            feedbackText.textContent = 'Jogo pronto! Faça seu palpite.';
            // (Linha de debug - pode apagar em produção)
            console.log("Personagem Secreto é:", targetCharacter.name);
        }
        catch (error) {
            console.error(error);
            feedbackText.textContent = 'Erro ao carregar o jogo. Tente recarregar a página.';
            guessInput.disabled = true;
            guessButton.disabled = true;
        }
    });
}
/**
 * Documentação: populateGallery
 * Recebe a lista de personagens e cria os cartões na galeria.
 */
function populateGallery(characters) {
    galleryContainer.innerHTML = ''; // Limpa a galeria
    // Ordena os personagens por nome para a galeria
    const sortedCharacters = [...characters].sort((a, b) => a.name.localeCompare(b.name));
    for (const char of sortedCharacters) {
        const card = document.createElement('div');
        card.className = 'character-card';
        // Cria o HTML do cartão
        card.innerHTML = `
            <img src="${char.imageUrl}" alt="${char.name}" class="card-image">
            <p class="card-name">${char.name}</p>
        `;
        galleryContainer.appendChild(card);
    }
}
/**
 * Documentação: handleGuess
 * Chamada quando o jogador clica em "Tentar" ou aperta Enter.
 */
function handleGuess() {
    const guessName = guessInput.value.trim();
    feedbackText.textContent = ''; // Limpa feedback de erro
    if (!guessName) {
        feedbackText.textContent = 'Por favor, insira um nome.';
        return;
    }
    // Procura o palpite na lista de personagens que buscámos
    const guessedCharacter = allCharacters.find((char) => char.name.toLowerCase() === guessName.toLowerCase());
    // Se o personagem não existir na nossa lista
    if (!guessedCharacter) {
        feedbackText.textContent = `Personagem "${guessName}" não encontrado na lista.`;
        guessInput.value = ''; // Limpa o input
        return;
    }
    // Se o personagem foi encontrado, criamos a linha de resultado
    createResultRow(guessedCharacter);
    // Verifica se o jogador ganhou
    if (guessedCharacter.name === targetCharacter.name) {
        feedbackText.textContent = `Parabéns! Você acertou: ${targetCharacter.name}!`;
        guessInput.disabled = true;
        guessButton.disabled = true;
    }
    // Limpa o input para a próxima tentativa
    guessInput.value = '';
}
/**
 * Documentação: createResultRow
 * Cria a linha de feedback visual (6 colunas)
 */
function createResultRow(guessedCharacter) {
    const resultRow = document.createElement('div');
    resultRow.classList.add('result-row');
    // --- 1. Personagem (Imagem + Nome) ---
    const nameCell = document.createElement('div');
    nameCell.classList.add('result-cell', 'cell-character'); // Usa a classe especial
    // Insere o HTML da imagem e do nome
    nameCell.innerHTML = `
        <img src="${guessedCharacter.imageUrl}" alt="${guessedCharacter.name}" class="char-image">
        <span>${guessedCharacter.name}</span>
    `;
    // Adiciona a cor baseada na correção
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
    // (Lembrando que o seu schema diz "Dica referente o Stand")
    const standCell = createFeedbackCell(guessedCharacter.stand);
    standCell.classList.add(guessedCharacter.stand === targetCharacter.stand ? 'correct' : 'incorrect');
    resultRow.appendChild(standCell);
    // Adiciona a linha de resultado ao topo do container
    resultsContainer.prepend(resultRow);
}
/**
 * Documentação: createFeedbackCell (Função Auxiliar)
 * Cria uma célula de feedback simples (sem imagem).
 */
function createFeedbackCell(text) {
    const cell = document.createElement('div');
    cell.classList.add('result-cell');
    cell.textContent = text;
    return cell;
}
/**
 * Documentação: getNumericFeedback (Função Auxiliar)
 * Compara números (Idade, Parte) e retorna a seta e a classe.
 */
function getNumericFeedback(guess, target) {
    if (guess === target) {
        return { arrow: '', className: 'correct' }; // Verde
    }
    // Se não for correto, usamos a classe 'partial' (amarelo)
    if (guess < target) {
        return { arrow: '⬆️', className: 'partial' }; // Palpite é MENOR
    }
    else {
        return { arrow: '⬇️', className: 'partial' }; // Palpite é MAIOR
    }
}
// --- Iniciar o Jogo ---
initializeGame();
export {};
//# sourceMappingURL=main2.js.map