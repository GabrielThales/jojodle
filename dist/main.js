/*
 * Documentação: Banco de Dados
 *
 * Criamos uma lista (array) de personagens que o jogo conhece.
 * Para um jogo real, esta lista seria muito maior.
 * Usamos "-1" para idades desconhecidas ou irrelevantes.
 */
const characterDB = [
    { name: "Jonathan Joestar", age: 20, part: 1, nationality: "Britânico" },
    { name: "Joseph Joestar", age: 18, part: 2, nationality: "Britânico" },
    { name: "Jotaro Kujo", age: 17, part: 3, nationality: "Japonês" },
    { name: "Josuke Higashikata", age: 16, part: 4, nationality: "Japonês" },
    { name: "Giorno Giovanna", age: 15, part: 5, nationality: "Italiano" },
    { name: "Jolyne Cujoh", age: 19, part: 6, nationality: "Americana" },
    { name: "Dio Brando", age: 21, part: 1, nationality: "Britânico" }, // (Idade na Parte 1)
    { name: "Noriaki Kakyoin", age: 17, part: 3, nationality: "Japonês" },
];
/*
 * Documentação: Seleção do Personagem
 *
 * Escolhemos o personagem "alvo" que o jogador deve adivinhar.
 * Para simplificar, escolhemos um aleatório da nossa lista (DB).
 */
const targetCharacter = characterDB[Math.floor(Math.random() * characterDB.length)];
// Linha de teste (para sabermos qual é a resposta ao testar)
console.log(`Psst... O personagem secreto é: ${targetCharacter.name}`);
/*
 * Documentação: Elementos do DOM
 *
 * Precisamos "capturar" os elementos do HTML (input, botão, etc.)
 * para que possamos interagir com eles no TypeScript.
 * Usamos "as HTML...Element" para dizer ao TypeScript qual tipo de
 * elemento estamos esperando.
 */
const guessInput = document.getElementById('guess-input');
const guessButton = document.getElementById('guess-button');
const resultsContainer = document.getElementById('results-container');
const feedbackText = document.getElementById('feedback-text');
// Adicionamos um "ouvinte" ao botão de Tentar
guessButton.addEventListener('click', handleGuess);
// Permite tentar apertando "Enter" no input
guessInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handleGuess();
    }
});
/**
 * Documentação: Função handleGuess
 *
 * Esta é a função principal do jogo, executada quando o
 * jogador clica no botão "Tentar" ou aperta Enter.
 */
function handleGuess() {
    const guessName = guessInput.value.trim(); // Pega o valor e limpa espaços extras
    // Reseta a mensagem de feedback
    feedbackText.textContent = '';
    if (!guessName) {
        feedbackText.textContent = 'Por favor, insira um nome.';
        return; // Para a execução
    }
    // Procura o personagem no nosso banco de dados
    // Compara em minúsculas para não diferenciar "Jotaro" de "jotaro"
    const guessedCharacter = characterDB.find((char) => char.name.toLowerCase() === guessName.toLowerCase());
    // Se o personagem não existir no nosso DB
    if (!guessedCharacter) {
        feedbackText.textContent = `Personagem "${guessName}" não encontrado. Tente outro nome.`;
        guessInput.value = ''; // Limpa o input
        return;
    }
    // Se o personagem foi encontrado, criamos os resultados
    createResultRow(guessedCharacter);
    // Verifica se o jogador ganhou
    if (guessedCharacter.name === targetCharacter.name) {
        feedbackText.textContent = `Parabéns! Você acertou: ${targetCharacter.name}!`;
        // Desativa o input e o botão após a vitória
        guessInput.disabled = true;
        guessButton.disabled = true;
    }
    // Limpa o input para a próxima tentativa
    guessInput.value = '';
}
/**
 * Documentação: Função createResultRow
 *
 * Esta função cria a linha de feedback visual (com as pistas)
 * para a tentativa do jogador.
 * @param guessedCharacter O objeto do personagem que o jogador tentou.
 */
function createResultRow(guessedCharacter) {
    // Cria a "div" que representa a linha inteira
    const resultRow = document.createElement('div');
    resultRow.classList.add('result-row');
    // --- 1. Feedback do NOME ---
    const nameCell = createFeedbackCell(guessedCharacter.name);
    if (guessedCharacter.name === targetCharacter.name) {
        nameCell.classList.add('correct'); // Verde
    }
    else {
        nameCell.classList.add('incorrect'); // Vermelho
    }
    resultRow.appendChild(nameCell);
    // --- 2. Feedback da IDADE ---
    const ageFeedback = getNumericFeedback(guessedCharacter.age, targetCharacter.age);
    const ageCell = createFeedbackCell(`${guessedCharacter.age} ${ageFeedback.arrow}`);
    ageCell.classList.add(ageFeedback.className); // correct, partial ou incorrect
    resultRow.appendChild(ageCell);
    // --- 3. Feedback da PARTE ---
    const partFeedback = getNumericFeedback(guessedCharacter.part, targetCharacter.part);
    const partCell = createFeedbackCell(`Parte ${guessedCharacter.part} ${partFeedback.arrow}`);
    partCell.classList.add(partFeedback.className);
    resultRow.appendChild(partCell);
    // --- 4. Feedback da NACIONALIDADE ---
    const natCell = createFeedbackCell(guessedCharacter.nationality);
    if (guessedCharacter.nationality === targetCharacter.nationality) {
        natCell.classList.add('correct');
    }
    else {
        natCell.classList.add('incorrect');
    }
    resultRow.appendChild(natCell);
    // Adiciona a linha de resultado ao topo do container
    resultsContainer.prepend(resultRow);
}
/**
 * Documentação: Função createFeedbackCell
 *
 * Função auxiliar para criar uma única célula de feedback.
 * @param text O texto a ser exibido na célula.
 * @returns Um elemento HTMLDivElement (a célula).
 */
function createFeedbackCell(text) {
    const cell = document.createElement('div');
    cell.classList.add('result-cell');
    cell.textContent = text;
    return cell;
}
/**
 * Documentação: Função getNumericFeedback
 *
 * Função auxiliar para comparar números (Idade, Parte)
 * e retornar a seta (⬆️ ⬇️) e a classe de CSS correta.
 * @param guess O número do palpite.
 * @param target O número do alvo.
 * @returns Um objeto com a seta (arrow) e a classe (className).
 */
function getNumericFeedback(guess, target) {
    if (guess === target) {
        return { arrow: '', className: 'correct' }; // Verde
    }
    // Se não for correto, usamos a classe 'partial' (amarelo)
    // E definimos a seta apropriada.
    if (guess < target) {
        return { arrow: '⬆️', className: 'partial' }; // Palpite é MENOR que o alvo
    }
    else {
        return { arrow: '⬇️', className: 'partial' }; // Palpite é MAIOR que o alvo
    }
}
export {};
//# sourceMappingURL=main.js.map