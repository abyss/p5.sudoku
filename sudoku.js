'use strict';

class Cell {
    constructor(x, y, z, initialValue = 0) {
        this.x = x;
        this.y = y;
        this.z = z;

        this.mutable = true;

        if (initialValue) {
            this.value = initialValue.toString();
            this.mutable = false;
        } else {
            this.value = '';
            this.mutable = true;
        }
    }

    set value(newValue) {
        if (this.mutable) {
            this.cellValue = newValue.toString();
        } else {
            throw 'Can\'t assign value to a non-mutable cell';
        }
    }

    get value() {
        return this.cellValue;
    }

}

class SudokuBoard {
    constructor(cols, rows, colSections = 1, rowSections = 1) {
        this.cells = [];
        this.cols = cols;
        this.rows = rows;

        const POSSIBLE_VALUES = [
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'
        ];

        if (colSections > cols || rowSections > rows) {
            throw 'Need less sections than cols/rows - don\'t divide by 0';
        }

        if (colSections < 1 || rowSections < 1) {
            throw 'Need at least one section for columns and rows - don\'t divide by 0';
        }

        if (cols <= POSSIBLE_VALUES.length && rows <= POSSIBLE_VALUES.length) {
            const valueRange = (cols > rows) ? cols : rows;
            this.possibleValues = POSSIBLE_VALUES.slice(0, valueRange);
        } else {
            this.possibleValues = [];
        }

        this.colDivideEvery = Math.floor(cols / colSections);
        this.rowDivideEvery = Math.floor(rows / rowSections);
    }

    generateCell(x, y, z, initialValue) {
        return new Cell(x, y, z, initialValue);
    }

    generateStructure() {
        this.cells = [];
        let colSections = this.cols / this.colDivideEvery;

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                // i = x + (y * this.cols);

                let z = floor(x / this.colDivideEvery) + (floor(y / this.rowDivideEvery) * colSections);
                this.cells.push(this.generateCell(x, y, z));
            }
        }
    }

    forEachCell(callback) {
        for (let i = 0; i < this.cols * this.rows; i++) {
            let cell = this.cells[i];
            callback(cell);
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

    validValues(list) {
        this.possibleValues = [];
        for (let key in list) {
            this.possibleValues.push(key.toUpperCase());
        }
    }
}

