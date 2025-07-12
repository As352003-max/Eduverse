function generateProblem(type, difficulty) {
    let question = '';
    let answer = '';
    let num1, num2;

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    switch (type) {
        case 'addition':
            num1 = getRandomInt(difficulty === 'easy' ? 1 : 10, difficulty === 'easy' ? 20 : 100);
            num2 = getRandomInt(difficulty === 'easy' ? 1 : 10, difficulty === 'easy' ? 20 : 100);
            question = `${num1} + ${num2} = ?`;
            answer = String(num1 + num2);
            break;
        case 'subtraction':
            num1 = getRandomInt(difficulty === 'easy' ? 10 : 50, difficulty === 'easy' ? 30 : 150);
            num2 = getRandomInt(difficulty === 'easy' ? 1 : 10, difficulty === 'easy' ? 20 : 100);
            if (num1 < num2) [num1, num2] = [num2, num1];
            question = `${num1} - ${num2} = ?`;
            answer = String(num1 - num2);
            break;
        case 'multiplication':
            num1 = getRandomInt(difficulty === 'easy' ? 1 : 10, difficulty === 'easy' ? 10 : 20);
            num2 = getRandomInt(difficulty === 'easy' ? 1 : 5, difficulty === 'easy' ? 10 : 15);
            question = `${num1} * ${num2} = ?`;
            answer = String(num1 * num2);
            break;
        case 'division':
            let result;
            do {
                num2 = getRandomInt(difficulty === 'easy' ? 2 : 5, difficulty === 'easy' ? 10 : 15);
                result = getRandomInt(difficulty === 'easy' ? 1 : 2, difficulty === 'easy' ? 10 : 20);
                num1 = num2 * result;
            } while (num1 === 0 || num2 === 0);
            question = `${num1} / ${num2} = ?`;
            answer = String(result);
            break;
        case 'algebra-linear':
            let a = getRandomInt(1, 5);
            let b = getRandomInt(1, 10);
            let c = getRandomInt(10, 50);
            question = `${a}x + ${b} = ${c}, x = ?`;
            answer = String((c - b) / a);
            break;
        default:
            question = `What is 1 + 1?`;
            answer = `2`;
            type = 'addition';
    }

    return { question, answer, problemType: type };
}

module.exports = {
    generateProblem
};