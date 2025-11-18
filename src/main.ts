/*
 * ==========================================
 * JOJODLE - CLIENT-SIDE (MAIN.TS)
 * ==========================================
 */

/*
 * Documentação: Definição de Tipos
 *
 * Definimos a "forma" do personagem, que deve ser
 * idêntica ao 'characterSchema' do nosso backend.
 */
type Character = {
    name: string;
    age: number;
    part: number;
    nationality: string;
    gender: string;
    stand: string;
    imageUrl: string;
};

// --- URLs DA NOSSA API ---
// Lembre-se que temos DOIS servidores a rodar
const API_URL_DADOS = 'https://jojodle-backendv2.vercel.app'; // Nosso Express (Dados) nova url
const API_URL_IA = 'https://jojodle-backendv2.vercel.app';    // Nosso Genkit (IA/Dicas)


// --- Variáveis Globais do Jogo ---
let targetCharacter: Character;     // O personagem secreto (vem da API)
let allCharactersDB: Character[] = []; // A lista de todos os personagens (vem da API)
let guessCount = 0;                   // Contador de tentativas

/*
 * Documentação: Elementos do DOM
 *
 * Capturamos os elementos do HTML para interagir.
 */
const guessInput = document.getElementById('guess-input') as HTMLInputElement;
const guessButton = document.getElementById('guess-button') as HTMLButtonElement;
const resultsContainer = document.getElementById('results-container') as HTMLDivElement;
const feedbackText = document.getElementById('feedback-text') as HTMLParagraphElement;
const hintButton = document.getElementById('hint-button') as HTMLButtonElement;
const suggestionsContainer = document.getElementById('autocomplete-suggestions') as HTMLDivElement;
const streak = document.getElementById('streak') as HTMLSpanElement;
streak.innerText = '3';
let currentStreak = 1;
/*
 * Documentação: Inicialização do Jogo
 *
 * Esta função é executada assim que a página carrega.
 * Ela é responsável por buscar os dados no backend.
 */
async function initGame() {
    console.log("Iniciando o jogo... Buscando dados do backend...");
    feedbackText.textContent = "A carregar personagens...";

    try {
        // 1. Buscar a lista COMPLETA de personagens
        const responseAll = await fetch(`${API_URL_DADOS}/jojo_characters`);
        if (!responseAll.ok) throw new Error('Falha ao buscar lista de personagens.');
        allCharactersDB = await responseAll.json();
        console.log("Banco de dados local carregado:", allCharactersDB);


        // 2. Buscar o PERSONAGEM DO DIA
        const responseTarget = await fetch(`${API_URL_DADOS}/character_of_the_day`);
        if (!responseTarget.ok) throw new Error('Falha ao buscar personagem do dia.');
        targetCharacter = await responseTarget.json();

        // Psst... A cola para testes
        //console.log("Personagem Secreto (Cola):", targetCharacter.name); 

        // 3. Jogo pronto!
        feedbackText.textContent = "Personagens carregados. Tente adivinhar!";


    } catch (error) {
        console.error("Erro ao iniciar o jogo:", error);
        feedbackText.textContent = "Erro ao carregar o jogo. Verifique se o backend está a rodar.";
        guessInput.disabled = true;
        guessButton.disabled = true;
    }
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
    const matches = allCharactersDB.filter(character => 
        character.name.toLowerCase().startsWith(inputText)
    );

    console.log(`[LOG Autocomplete] Texto: "${inputText}", Correspondências: ${matches.length}`);

    // 2. Renderiza as sugestões
    renderSuggestions(matches);
});

/*
 * Documentação: Função handleGuess
 *
 * Executada quando o jogador tenta um palpite.
 */
function handleGuess(): void {
    const guessName = guessInput.value.trim();
    feedbackText.textContent = ''; // Limpa o feedback

    if (!guessName) {
        feedbackText.textContent = 'Por favor, insira um nome.';
        return;
    }

    // Procura o personagem no nosso banco de dados LOCAL (que veio da API)
    const guessedCharacter = allCharactersDB.find(
        (char) => char.name.toLowerCase() === guessName.toLowerCase()
    );

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
    } else {
        // Se errou, verifica se deve mostrar o botão de dica
        if (guessCount >= 3) { // Mostra a dica após 3 erros
            hintButton.style.display = 'block';
        }
    }

    guessInput.value = ''; // Limpa o input para a próxima
    currentStreak++;
    streak.innerText = currentStreak.toString();
}

// "Ouvintes" para o input e botões
guessButton.addEventListener('click', handleGuess);
guessInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') handleGuess();
});
hintButton.addEventListener('click', handleHint);


/*
 * Documentação: Função handleHint
 *
 * Executada quando o jogador clica no botão "Pedir Dica".
 * Esta função chama o nosso backend de IA (Genkit).
 */
async function handleHint(): Promise<void> {
    feedbackText.textContent = "Gerando uma dica... (Chamando IA)";
    hintButton.disabled = true; // Desativa o botão para evitar spam

    try {
        const response = await fetch(`${API_URL_IA}/getJojoTip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nomeDoPersonagem: targetCharacter.name // Envia o nome do secreto
            })
        });

        if (!response.ok) throw new Error('O servidor de IA falhou em dar uma dica.');

        const result = await response.json();
        feedbackText.textContent = `DICA: ${result.tip}`;

    } catch (error) {
        console.error("Erro ao buscar dica:", error);
        feedbackText.textContent = "Não foi possível obter a dica.";
        hintButton.disabled = false; // Re-ativa o botão se falhar
    }
}

/**
 * ==========================================
 * NOVA FUNÇÃO: Renderizar Cartões de Personagem
 * ==========================================
 * Percorre a lista de todos os personagens e cria
 * um cartão visual para cada um.
 */
function renderCharacterCards(characters: Character[]): void {
    const container = document.getElementById('character-cards-container');
    
    if (!container) {
        console.warn("Aviso: Container da galeria (#character-cards-container) não encontrado no HTML.");
        return;
    }

    container.innerHTML = '';

    // Debug: Ver se a lista está vazia
    if (characters.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">Nenhum personagem carregado.</p>';
        return;
    }

    for (const char of characters) {
        const card = document.createElement('div');
        card.className = 'character-card'; // Usa a classe do CSS

        const img = document.createElement('img');
        // Usa char.imageUrl (se vier do DB com esse nome)
        img.src = char.imageUrl; 
        img.alt = char.name;
        // Placeholder caso a imagem quebre
        img.onerror = () => { img.src = 'https://placehold.co/100x100/333/FFF?text=JoJo'; };

        const name = document.createElement('p');
        name.textContent = char.name;

        card.appendChild(img);
        card.appendChild(name);
        container.appendChild(card);
    }
    console.log(`[Galeria] ${characters.length} cards renderizados.`);
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
function createResultRow(guessedCharacter: Character): void {
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
    
    nameCell.classList.add(
        guessedCharacter.name === targetCharacter.name ? 'correct' : 'incorrect'
    );
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
    natCell.classList.add(
        guessedCharacter.nationality === targetCharacter.nationality ? 'correct' : 'incorrect'
    );
    resultRow.appendChild(natCell);

    // --- 5. Gênero ---
    const genderCell = createFeedbackCell(guessedCharacter.gender);
    genderCell.classList.add(
        guessedCharacter.gender === targetCharacter.gender ? 'correct' : 'incorrect'
    );
    resultRow.appendChild(genderCell);

    // --- 6. Stand ---
    const standCell = createFeedbackCell(guessedCharacter.stand);
    standCell.classList.add(
        guessedCharacter.stand === targetCharacter.stand ? 'correct' : 'incorrect'
    );
    resultRow.appendChild(standCell);

    resultsContainer.prepend(resultRow);
}

/**
 * Função auxiliar para criar uma única célula de feedback.
 */
function createFeedbackCell(text: string): HTMLDivElement {
    const cell = document.createElement('div');
    cell.classList.add('result-cell');
    cell.textContent = text;
    return cell;
}

/**
 * Função auxiliar para comparar números (Idade, Parte).
 */
function getNumericFeedback(guess: number, target: number): { arrow: string; className: string } {
    if (guess === target) {
        return { arrow: '', className: 'correct' }; // Verde
    }
    if (guess < target) {
        return { arrow: '⬆️', className: 'partial' }; // Amarelo (Palpite MENOR)
    } else {
        return { arrow: '⬇️', className: 'partial' }; // Amarelo (Palpite MAIOR)
    }
}

/**
 * Documentação: renderSuggestions
 * Desenha a lista de sugestões no ecrã.
 * @param matches Um array de 'Character' que corresponde ao que foi digitado.
 */
function renderSuggestions(matches: Character[]): void {
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
            clearSuggestions();            // Fecha a caixa de sugestões
            guessInput.focus();            // Devolve o foco ao input
        });

        suggestionsContainer.appendChild(suggestionDiv);
    });
}

/**
 * Documentação: clearSuggestions
 * Limpa o HTML da caixa de sugestões.
 */
function clearSuggestions(): void {
    suggestionsContainer.innerHTML = '';
}

/**
 * Documentação: Fechar ao Clicar Fora
 * Se o utilizador clicar em qualquer outro sítio, fecha as sugestões.
 */
document.addEventListener('click', (event) => {
    // Se o clique NÃO foi no input E NÃO foi na caixa de sugestões...
    if (event.target !== guessInput && !suggestionsContainer.contains(event.target as Node)) {
        clearSuggestions();
    }
});