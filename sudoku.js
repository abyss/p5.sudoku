'use strict';

class Cell {
    constructor(x, y, initialValue = 0) {
        this.x = x;
        this.y = y;
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
    constructor(cols, rows, columnDivideEvery, rowDivideEvery) {
        this.cells = [];
        this.cols = cols;
        this.rows = rows;
        this.columnDivideEvery = columnDivideEvery;
        this.rowDivideEvery = rowDivideEvery;
    }

    generateCell(x, y, initialValue) {
        return new Cell(x, y, initialValue);
    }

    generateStructure() {
        this.cells = [];
        this.forEachCell((cell, x, y) => {
            this.cells.push(this.generateCell(x, y))
        });
    }

    forEachCell(callback) {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let i = x + (y * this.cols);
                callback(this.cells[i], x, y, i);
            }
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

            if (this.cells.length !== this.rows * this.cols) {
                generateStructure();
            }

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

