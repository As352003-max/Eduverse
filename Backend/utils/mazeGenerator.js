function generateMaze(rows, cols) {
    const maze = Array(rows).fill(0).map(() => Array(cols).fill(1));

    function isValid(r, c) {
        return r >= 0 && r < rows && c >= 0 && c < cols;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    const stack = [];
    let currentRow = 0;
    let currentCol = 0;
    maze[currentRow][currentCol] = 0;
    stack.push([currentRow, currentCol]);

    const directions = [
        [-2, 0], [2, 0], [0, -2], [0, 2]
    ];

    while (stack.length > 0) {
        const [r, c] = stack[stack.length - 1];
        
        const neighbors = [];
        shuffle(directions);

        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (isValid(nr, nc) && maze[nr][nc] === 1) {
                neighbors.push([nr, nc, r + dr / 2, c + dc / 2]);
            }
        }

        if (neighbors.length > 0) {
            const [nextR, nextC, wallR, wallC] = neighbors[0];
            maze[wallR][wallC] = 0;
            maze[nextR][nextC] = 0;
            currentRow = nextR;
            currentCol = nextC;
            stack.push([currentRow, currentCol]);
        } else {
            stack.pop();
        }
    }

    maze[0][0] = 0;
    maze[rows - 1][cols - 1] = 0;

    return maze;
}

module.exports = {
    generateMaze
};