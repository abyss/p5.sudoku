'use strict';

class Cell {
    constructor(x, y, z, initialValue = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        
        if (initialValue) {
            this.value = initialValue.toString();
            this.mutable = false;
            this.solved = true;
        } else {
            this.value = '';
            this.mutable = true;
            this.solved = false;
        }
    }

    set value(newValue) {
        if (this.mutable !== false) {
            this.cellValue = newValue.toString();
        } else {
            throw 'Can\'t assign value to a non-mutable cell';
        }
    }

    get value() {
        return this.cellValue;
    }

    setSolved(value) {
        this.solved = true;

        if (typeof value !== 'undefined') {
            this.mutable = true;
            this.value = value;
        }

        this.mutable = false;
    }

    reset() {
        this.solved = false;
        this.mutable = true;
        this.value = "";
    }
}

class SudokuBoard {
    constructor(cols, rows, colSections = 1, rowSections = 1) {
        this.cells = [];
        this.cols = cols;
        this.rows = rows;

        const VALID_VALUES = [
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
            'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
            'U', 'V', 'W', 'X', 'Y', 'Z',
        ];

        if (colSections > cols || rowSections > rows) {
            throw 'Need less sections than cols/rows - don\'t divide by 0';
        }

        if (colSections < 1 || rowSections < 1) {
            throw 'Need at least one section for columns and rows - don\'t divide by 0';
        }

        if (cols % colSections || rows % rowSections) {
            throw 'Sections needs to evenly divide rows and cols';
        }

        if (cols <= VALID_VALUES.length && rows <= VALID_VALUES.length) {
            const valueRange = (cols > rows) ? cols : rows;
            this.validValues = VALID_VALUES.slice(0, valueRange);
        } else {
            this.validValues = [];
        }

        this.colDivideEvery = Math.floor(cols / colSections);
        this.rowDivideEvery = Math.floor(rows / rowSections);
    }

    generateCell(x, y, z, initialValue) {
        return new Cell(x, y, z, initialValue);
    }

    generateStructure() {
        this.cells = [];
        let colSections = Math.floor(this.cols / this.colDivideEvery);

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let z = Math.floor(x / this.colDivideEvery) + (Math.floor(y / this.rowDivideEvery) * colSections);
                let i = (this.cells.push(this.generateCell(x, y, z))) - 1;
                this.cells[i].possibleValues = this.validValues.slice();
            }
        }
    }
    
    searchCellPossibilities() {
        let bestCell = -1;
        let bestScore = -1;

        for (let i = 0; i < this.cells.length; i++) {
            let cell = this.cells[i];

            if (cell.solved) {
                cell.possibleValues = [cell.value];
            } else {
                cell.possibleValues = this.validValues.slice();

                this.forEachCell((checkCell) => {
                    if (checkCell.solved && (checkCell.x === cell.x || checkCell.y === cell.y || checkCell.z === cell.z)) {
                        cell.possibleValues = cell.possibleValues.filter(val => val !== checkCell.value);
                    }
                });

                if (bestScore < 0 || cell.possibleValues.length < bestScore) {
                    bestCell = cell;
                }
            }
        }

        return bestCell;
    }

    attemptGeneration() {
        this.generateStructure();

        let remainingCells = this.cells.slice(); // shallow copy array, keep cells reference
        while (remainingCells.length > 0) {
            
            let lowestNumber = -1;
            let lowestCells = [];
            
            for (let i = 0; i < remainingCells.length; i++) {
                let cell = remainingCells[i];
                cell.rcIndex = i; // fill cells with rcIndex for later use

                // inserted searchCellPossibilities() for efficiency
                this.forEachCell((checkCell) => {
                    if (checkCell.solved && (checkCell.x === cell.x || checkCell.y === cell.y || checkCell.z === cell.z)) {
                        cell.possibleValues = cell.possibleValues.filter(val => val !== checkCell.value);
                    }
                });

                if (lowestNumber < 0 || cell.possibleValues.length < lowestNumber) {
                    lowestNumber = cell.possibleValues.length;
                    lowestCells = [cell];
                } else if (cell.possibleValues.length === lowestNumber) {
                    lowestCells.push(cell);
                }
            }


            let cell = lowestCells[randomIndex(lowestCells)];
            remainingCells.splice(cell.rcIndex, 1);

            if (cell.possibleValues.length < 1) {
                return false; // hit a dead end. restart.
            }

            if (!cell.solved) {
                // chose a random value to set it to
                let randomValue = cell.possibleValues[randomIndex(cell.possibleValues)];
                cell.setSolved(randomValue);
            }
        }

        return true;
    }

    generateCompleted() {
        let i = 0;
        let failure = true;

        while (failure && i < 5) {
            failure = !this.attemptGeneration();
            i++;
        }

        return i;
    }

    recursiveSmartGenerator() {
        if (this.rows === 9 && this.cols === 9 && this.colDivideEvery === 3 && this.rowDivideEvery === 3) {
            this.generateStructure();
            
            this.smartSectionOne();
            this.smartSectionTwo();
            this.smartSectionThree();
            this.smartColumnOne();
            return !this.smartRecursiveRest();
        } else {
            throw 'Can only use fancyGenerator() on Standard 9x9 (3x3 Sections) Sudoku';
        }
    }
    
    // randomly determines first section
    smartSectionOne() {
        let possibleValues = this.validValues.slice();
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                let i = randomIndex(possibleValues);
                let chosenValue = possibleValues[i];
                possibleValues.splice(i, 1);
                this.cells[x + y * this.cols].setSolved(chosenValue);
            }
        }
    }

    smartSectionTwo() {
        let used = [[], [], []];
        let chosen = [[], [], []];
        let set_x = [];
        let set_y = [];

        // Gather used values from first section into rows
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                used[y].push(this.cells[x + y * this.cols].value);
            }
        }

        // Chose values for top row of section two
        set_x = used[1].concat(used[2]);
        for (let x = 0; x < 3; x++) {
            let i = randomIndex(set_x);
            chosen[0].push(set_x[i]);
            set_x.splice(i, 1);
        }

        // Chose values for middle row of section two, as long as we can
        set_x = used[0].concat(used[2]).filter(x => !chosen[0].includes(x));
        set_y = used[0].concat(used[1]).filter(x => !chosen[0].includes(x));

        // Until we run out of values for row 3, fill row 2
        while (set_y.length > 3) {
            let i = randomIndex(set_x);
            chosen[1].push(set_x[i]);
            set_y = set_y.filter(z => z !== set_x[i]); // remove from row 3 as well
            set_x.splice(i, 1);
        }

        // No choice for the remaining
        chosen[1] = chosen[1].concat(set_x.filter(z => !set_y.includes(z)));
        chosen[2] = set_y;

        // Permute values into each row of section 2
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                let i = randomIndex(chosen[y]);
                this.cells[x + y * this.cols + 3].setSolved(chosen[y][i]);
                chosen[y].splice(i, 1);
            }
        }
    }

    smartSectionThree() {
        for (let y = 0; y < 3; y++) {
            let possibleValues = this.validValues.slice();
            
            // eliminate already used values in this row
            for (let x = 0; x + 3 < 9; x++) {
                possibleValues = possibleValues.filter(z => z !== this.cells[x + y * this.cols].value);
            }

            // permute remaining values into the row
            for (let x = 0; x < 3; x++) {
                let i = randomIndex(possibleValues);
                this.cells[x + y * this.cols + this.cols - 3].setSolved(possibleValues[i]);
                possibleValues.splice(i, 1);
            }
        }
    }

    smartColumnOne() {
        let possibleValues = this.validValues.slice();

        for (let y = 0; y < 3; y++) {
            possibleValues = possibleValues.filter(z => z !== this.cells[y * this.cols].value);
        }

        for (let y = 3; y < 9; y++) {
            let i = randomIndex(possibleValues);
            this.cells[y * this.cols].setSolved(possibleValues[i]);
            possibleValues.splice(i, 1);
        }
    }

    smartRecursiveRest() {
        let cell = this.searchCellPossibilities();

        if (cell === -1) {
            return 0;
        }

        let possibleValues;
        if (cell.possibleValues) {
            possibleValues = cell.possibleValues.slice();
        } else {
            possibleValues = [];
        }

        while (possibleValues.length) {
            let i = Math.floor(Math.random() * cell.possibleValues.length);
            cell.setSolved(possibleValues[i]);
            possibleValues.splice(i, 1);

            if (!this.smartRecursiveRest()) {
                return 0;
            }
        }

        cell.reset();
        return -1;
    }

    forEachCell(callback) {
        for (let i = 0; i < this.cols * this.rows; i++) {
            let cell = this.cells[i];
            callback(cell);
        }
    }

    setValidValues(list) {
        this.validValues = [];
        for (let key in list) {
            this.validValues.push(key.toUpperCase());
        }
    }

    initializeBoard(initialBoard) {
        // first make sure it's an array
        if (!Array.isArray(initialBoard)) {
            throw 'initializeBoard not provided an Array';
        }

        if (Array.isArray(initialBoard[0])) {
            // assumption is array of arrays - double check that correct length
            if (initialBoard.length !== this.rows) {
                throw 'Incorrect Board Size (rows)';
            }

            for (let y = 0; y < this.rows; y++) {
                // check each of these, too
                if (initialBoard[y].length !== this.cols) {
                    throw 'Incorrect Board Size (cols)';
                }
            }

            // out with the old, in with the new!
            generateStructure();

            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    // current index of this cell in our board
                    let i = x + (y * this.cols);

                    // need to make it mutable, incase previously initialized
                    this.cells[i].mutable = true;
                    if (initialBoard[y][x]) {
                        this.cells[i].value = initialBoard[y][x];
                        this.cells[i].mutable = false;
                    } else {
                        this.cells[i].value = '';
                    }
                }
            }

        } else {
            let length = this.cols * this.rows;
            // assumption is one long array with all values
            if (initialBoard.length !== length) {
                throw 'Incorrect Board Length';
            }

            // out with the old, in with the new!
            this.generateStructure();
            
            for (let i = 0; i < length; i++) {

                // need to make it mutable, incase previously initialized
                this.cells[i].mutable = true;
                if (initialBoard[i]) {
                    this.cells[i].value = initialBoard[i];
                    this.cells[i].mutable = false;
                } else {
                    this.cells[i].value = "";
                }
            }
        }
    }
}

function randomIndex(arr) {
    return Math.floor(Math.random() * arr.length);
}
