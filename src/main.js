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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// --- URLs DA NOSSA API ---
// Lembre-se que temos DOIS servidores a rodar
var API_URL_DADOS = 'https://jojodle-backendv2.vercel.app'; // Nosso Express (Dados) nova url
var API_URL_IA = 'https://jojodle-backendv2.vercel.app'; // Nosso Genkit (IA/Dicas)
// --- Variáveis Globais do Jogo ---
var targetCharacter; // O personagem secreto (vem da API)
var allCharactersDB = []; // A lista de todos os personagens (vem da API)
var guessCount = 0; // Contador de tentativas
/*
 * Documentação: Elementos do DOM
 *
 * Capturamos os elementos do HTML para interagir.
 */
var guessInput = document.getElementById('guess-input');
var guessButton = document.getElementById('guess-button');
var resultsContainer = document.getElementById('results-container');
var feedbackText = document.getElementById('feedback-text');
var hintButton = document.getElementById('hint-button');
var suggestionsContainer = document.getElementById('autocomplete-suggestions');
var streak = document.getElementById('streak');
streak.innerText = '3';
var currentStreak = 1;
/*
 * Documentação: Inicialização do Jogo
 *
 * Esta função é executada assim que a página carrega.
 * Ela é responsável por buscar os dados no backend.
 */
function initGame() {
    return __awaiter(this, void 0, void 0, function () {
        var responseAll, responseTarget, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Iniciando o jogo... Buscando dados do backend...");
                    feedbackText.textContent = "A carregar personagens...";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("".concat(API_URL_DADOS, "/jojo_characters"))];
                case 2:
                    responseAll = _a.sent();
                    if (!responseAll.ok)
                        throw new Error('Falha ao buscar lista de personagens.');
                    return [4 /*yield*/, responseAll.json()];
                case 3:
                    allCharactersDB = _a.sent();
                    console.log("Banco de dados local carregado:", allCharactersDB);
                    return [4 /*yield*/, fetch("".concat(API_URL_DADOS, "/character_of_the_day"))];
                case 4:
                    responseTarget = _a.sent();
                    if (!responseTarget.ok)
                        throw new Error('Falha ao buscar personagem do dia.');
                    return [4 /*yield*/, responseTarget.json()];
                case 5:
                    targetCharacter = _a.sent();
                    // Psst... A cola para testes
                    //console.log("Personagem Secreto (Cola):", targetCharacter.name); 
                    // 3. Jogo pronto!
                    feedbackText.textContent = "Personagens carregados. Tente adivinhar!";
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error("Erro ao iniciar o jogo:", error_1);
                    feedbackText.textContent = "Erro ao carregar o jogo. Verifique se o backend está a rodar.";
                    guessInput.disabled = true;
                    guessButton.disabled = true;
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// "Ouvinte" que espera o HTML estar pronto para iniciar o jogo
document.addEventListener('DOMContentLoaded', initGame);
/**
 * Documentação: Lógica do Autocomplete
 * Acionado a cada letra digitada no input.
 */
guessInput.addEventListener('input', function () {
    console.log("[LOG Autocomplete] Evento 'input' disparado.");
    var inputText = guessInput.value.trim().toLowerCase();
    // Limpa as sugestões se o campo estiver vazio
    if (inputText.length === 0) {
        clearSuggestions();
        return;
    }
    // 1. Filtra o nosso banco de dados local
    var matches = allCharactersDB.filter(function (character) {
        return character.name.toLowerCase().startsWith(inputText);
    });
    console.log("[LOG Autocomplete] Texto: \"".concat(inputText, "\", Correspond\u00EAncias: ").concat(matches.length));
    console.log(guessCount);
    // 2. Renderiza as sugestões
    renderSuggestions(matches);
});
/*
 * Documentação: Função handleGuess
 *
 * Executada quando o jogador tenta um palpite.
 */
function handleGuess() {
    var guessName = guessInput.value.trim();
    feedbackText.textContent = ''; // Limpa o feedback
    guessCount++; // Incrementa a tentativa
    console.log("aaaaaaaaaaa");
    if (!guessName) {
        feedbackText.textContent = 'Por favor, insira um nome.';
        return;
    }
    // Procura o personagem no nosso banco de dados LOCAL (que veio da API)
    var guessedCharacter = allCharactersDB.find(function (char) { return char.name.toLowerCase() === guessName.toLowerCase(); });
    // Se o personagem não existir no nosso DB
    if (!guessedCharacter) {
        feedbackText.textContent = "Personagem \"".concat(guessName, "\" n\u00E3o encontrado na nossa lista.");
        guessInput.value = ''; // Limpa o input
        return;
    }
    // Se encontrou, cria a linha de resultado
    createResultRow(guessedCharacter);
    // Verifica se o jogador ganhou
    if (guessedCharacter.name === targetCharacter.name) {
        feedbackText.textContent = "Parab\u00E9ns! Voc\u00EA acertou: ".concat(targetCharacter.name, "!");
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
    currentStreak++;
    streak.innerText = currentStreak.toString();
}
// "Ouvintes" para o input e botões
guessButton.addEventListener('click', handleGuess);
guessInput.addEventListener('keyup', function (event) {
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
    return __awaiter(this, void 0, void 0, function () {
        var response, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    feedbackText.textContent = "Gerando uma dica... (Chamando IA)";
                    hintButton.disabled = true; // Desativa o botão para evitar spam
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_URL_IA, "/getJojoTip"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                nomeDoPersonagem: targetCharacter.name // Envia o nome do secreto
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('O servidor de IA falhou em dar uma dica.');
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    feedbackText.textContent = "DICA: ".concat(result.tip);
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error("Erro ao buscar dica:", error_2);
                    feedbackText.textContent = "Não foi possível obter a dica.";
                    hintButton.disabled = false; // Re-ativa o botão se falhar
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
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
    var container = document.getElementById('character-cards-container');
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
    var _loop_1 = function (char) {
        var card = document.createElement('div');
        card.className = 'character-card'; // Usa a classe do CSS
        var img = document.createElement('img');
        // Usa char.imageUrl (se vier do DB com esse nome)
        img.src = char.imageUrl;
        img.alt = char.name;
        // Placeholder caso a imagem quebre
        img.onerror = function () { img.src = 'https://placehold.co/100x100/333/FFF?text=JoJo'; };
        var name_1 = document.createElement('p');
        name_1.textContent = char.name;
        card.appendChild(img);
        card.appendChild(name_1);
        container.appendChild(card);
    };
    for (var _i = 0, characters_1 = characters; _i < characters_1.length; _i++) {
        var char = characters_1[_i];
        _loop_1(char);
    }
    console.log("[Galeria] ".concat(characters.length, " cards renderizados."));
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
    var resultRow = document.createElement('div');
    resultRow.classList.add('result-row');
    // --- 1. Personagem (Nome + Imagem) ---
    var nameCell = createFeedbackCell(''); // Célula vazia
    nameCell.classList.add('cell-character'); // Adiciona classe especial
    // Adiciona a imagem
    var img = document.createElement('img');
    img.src = guessedCharacter.imageUrl;
    img.alt = guessedCharacter.name;
    img.classList.add('char-image');
    // Adiciona o nome
    var nameSpan = document.createElement('span');
    nameSpan.textContent = guessedCharacter.name;
    nameCell.appendChild(img);
    nameCell.appendChild(nameSpan);
    nameCell.classList.add(guessedCharacter.name === targetCharacter.name ? 'correct' : 'incorrect');
    resultRow.appendChild(nameCell);
    // --- 2. Idade ---
    var ageFeedback = getNumericFeedback(guessedCharacter.age, targetCharacter.age);
    var ageCell = createFeedbackCell("".concat(guessedCharacter.age, " ").concat(ageFeedback.arrow));
    ageCell.classList.add(ageFeedback.className);
    resultRow.appendChild(ageCell);
    // --- 3. Parte ---
    var partFeedback = getNumericFeedback(guessedCharacter.part, targetCharacter.part);
    var partCell = createFeedbackCell("Parte ".concat(guessedCharacter.part, " ").concat(partFeedback.arrow));
    partCell.classList.add(partFeedback.className);
    resultRow.appendChild(partCell);
    // --- 4. Nacionalidade ---
    var natCell = createFeedbackCell(guessedCharacter.nationality);
    natCell.classList.add(guessedCharacter.nationality === targetCharacter.nationality ? 'correct' : 'incorrect');
    resultRow.appendChild(natCell);
    // --- 5. Gênero ---
    var genderCell = createFeedbackCell(guessedCharacter.gender);
    genderCell.classList.add(guessedCharacter.gender === targetCharacter.gender ? 'correct' : 'incorrect');
    resultRow.appendChild(genderCell);
    // --- 6. Stand ---
    var standCell = createFeedbackCell(guessedCharacter.stand);
    standCell.classList.add(guessedCharacter.stand === targetCharacter.stand ? 'correct' : 'incorrect');
    resultRow.appendChild(standCell);
    resultsContainer.prepend(resultRow);
}
/**
 * Função auxiliar para criar uma única célula de feedback.
 */
function createFeedbackCell(text) {
    var cell = document.createElement('div');
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
    console.log("[LOG Autocomplete] Renderizando ".concat(matches.length, " sugest\u00F5es."));
    clearSuggestions(); // Limpa a lista anterior
    // Limita a 10 sugestões para não poluir
    matches.slice(0, 10).forEach(function (match) {
        var suggestionDiv = document.createElement('div');
        suggestionDiv.classList.add('suggestion-item');
        suggestionDiv.textContent = match.name;
        // --- A MAGIA ACONTECE AQUI ---
        // Adiciona um 'click' a cada sugestão
        suggestionDiv.addEventListener('click', function () {
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
document.addEventListener('click', function (event) {
    // Se o clique NÃO foi no input E NÃO foi na caixa de sugestões...
    if (event.target !== guessInput && !suggestionsContainer.contains(event.target)) {
        clearSuggestions();
    }
});
