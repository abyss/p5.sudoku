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
                // i = x + (y * this.cols);

                let z = Math.floor(x / this.colDivideEvery) + (Math.floor(y / this.rowDivideEvery) * colSections);
                let i = (this.cells.push(this.generateCell(x, y, z))) - 1;
                this.cells[i].possibleValues = this.validValues.slice();
            }
        }
    }
    
    setCellPossibilities() {
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
            }
        }
    }
    
    attemptGeneration() {
        this.generateStructure();

        let remainingCells = this.cells.slice(); // shallow copy array, keep cells reference

        while (remainingCells.length > 0) {
            let lowestNum = []; // array of all remaining possible value lengths
            for (let i = 0; i < remainingCells.length; i++) {
                lowestNum.push(remainingCells[i].possibleValues.length);
            }

            let min = Math.min(...lowestNum);
            let lowest = remainingCells.filter(lowCell => lowCell.possibleValues.length === min);

            let randomLowestCell = Math.floor(Math.random() * lowest.length);
            let cell = lowest[randomLowestCell];
            remainingCells = remainingCells.filter(rCell => rCell !== cell);

            if (cell.possibleValues.length < 1) {
                return false; // hit a dead end. restart.
            }

            if (!cell.solved) {
                // chose a random value to set it to
                let randomValue = cell.possibleValues[Math.floor(Math.random() * cell.possibleValues.length)];
                cell.setSolved(randomValue);
            }

            // this could be minorly optimized to only do this for all remainingCells instead of the entire cells array
            this.setCellPossibilities();
        }

        return true;
    }

    generateCompleted() {
        let i = 0;
        let failure = true;

        while (failure) {
            failure = !this.attemptGeneration();
            i++;
        }

        return i;
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
            generateStructure();
            
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
