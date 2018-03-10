/// <reference path="typescript/p5.global-mode.d.ts" />
'use strict';

const POSSIBLE_VALUES = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'
];

class VisualCell extends Cell {
    constructor(x, y, z, initialValue = 0, style) {
        super(x, y, z, initialValue = 0);
        this.style = style;

        this.visualX = 0;
        this.visualY = 0;
        this.mouseOver = false;
        this.selected = false;
    }

    setCoords(x, y) {
        this.visualX = x;
        this.visualY = y;
    }

    draw() {
        let ts = this.style;
        let textColor = this.mutable ? ts.mutableTextColor : ts.immutableTextColor;
        let fillColor = this.mouseOver ? ts.hoverColor : ts.backgroundColor;
        
        fillColor = this.selected ? ts.selectedColor : fillColor;

        fill(fillColor);
        stroke(ts.borderColor);
        strokeWeight(ts.borderSize);

        rect(this.visualX, this.visualY, ts.cellSize, ts.cellSize);
        textAlign(CENTER, CENTER);

        noStroke();
        fill(textColor);
        textSize(ts.fontSize);
        text(this.value, this.visualX + (ts.cellSize / 2), this.visualY + (ts.cellSize / 2));
    }
}

class VisualSudokuBoard extends SudokuBoard {
    constructor(cols, rows, columnDivideEvery, rowDivideEvery, styleOptions) {
        super(cols, rows, columnDivideEvery, rowDivideEvery);

        this.selectedCell = -1; // nothing selected
        
        this.style = this.defaultStyle();
        this.overrideStyle(styleOptions);

        if (cols <= POSSIBLE_VALUES.length && rows <= POSSIBLE_VALUES.length) {
            const valueRange = (cols > rows) ? cols : rows;
            this.possibleValues = POSSIBLE_VALUES.slice(0, valueRange);
        } else {
            this.possibleValues = [];
        }

    }

    defaultStyle() {
        return {
            'cellSize': 60, // height and width in pixels of a cell
            'fontSize': 42,
            'backgroundColor': "#FFFFFF", // color of bg of cells
            'hoverColor': "#DDDDDD", // color when mouse is overtop
            'selectedColor': '#CCD7FF', // color when selected
            'borderSize': 1, // border thickness of a cell
            'borderColor': "#000000", // color of borders
            'dividerColor': "#000000", // color of dividers, best left as borderColor
            'dividerSpacing': 2, // how much space between the divider strokes
            'immutableTextColor': '#000000', // color of text that isn't changeable
            'mutableTextColor': '#4258AF', // color of changeable text
            'globalOffsetX': 0, // x offset within canvas for board
            'globalOffsetY': 0, // y offset within canvas for board
        }
    }

    overrideStyle(newStyle) {
        for (let key in newStyle) {
            if (newStyle.hasOwnProperty(key)) {
                this.style[key] = newStyle[key];
            }
        }
    }
    
    mouseMoved() {
        this.forEachCell((cell) => {
            let cellSize = cell.style.cellSize;
            if (mouseX > cell.visualX && mouseX < cell.visualX + cellSize &&
                mouseY > cell.visualY && mouseY < cell.visualY + cellSize) {

                if (cell.mutable) {
                    cell.mouseOver = true;
                }
            } else {
                cell.mouseOver = false;
            }
        });

        redraw();
    }

    mousePressed() {
        this.unselectCell();

        this.forEachCell((cell) => {
            if (cell.mouseOver) {
                this.selectCell(cell.x, cell.y);
            }
        });

        redraw();
    }

    keyPressed() {
        // returning false makes the browser ignore it incase of other functionality        
        let browserIgnore = false;

        if (keyCode === BACKSPACE || keyCode === DELETE) {
            this.forEachCell((cell) => {
                if (cell.selected && cell.mutable) {
                    cell.value = '';
                }
            });
            browserIgnore = true;
        }

        if (keyCode === TAB) {
            this.selectCell(this.getNextMutable(this.selectedCell));
            browserIgnore = true;
        }

        // keyPressed() doesn't differentiate between upper and lower. ideal!
        if (this.possibleValues.indexOf(key) > -1) {
            this.forEachCell((cell) => {
                if (cell.selected && cell.mutable) {
                    cell.value = key;
                }
            });
            browserIgnore = true;
        }

        // check for browser ignoring behavior
        if (browserIgnore) {
            redraw();
            return false;
        } else {
            // if we did nothing, let the browser handle the key
            return true;
        }
    }

    selectCell(x, y = -1) {
        // if only x is provided, use it as the cell's index
        // otherwise use x, y
        
        this.unselectCell();

        let i;
        if (y < 0) {
            i = x;
        } else {
            i = (this.cols * y) + x;
        }

        this.cells[i].selected = true;
        this.selectedCell = i;
    }

    unselectCell() {
        if (this.selectedCell >= 0) {
            this.cells[this.selectedCell].selected = false;
            this.selectedCell = -1;
        }
    }

    getNextMutable(startCell) {
        for (let i = startCell + 1; i < this.rows * this.cols; i++) {
            if (this.cells[i].mutable) {
                return i;
            }
        }

        for (let i = 0; i < startCell; i++) {
            if (this.cells[i].mutable) {
                return i;
            }
        }
    }

    draw() {
        this.drawLines();
        this.forEachCell(cell => cell.draw());
    }

    drawLines() {
         // draw divider lines
        if (this.style.dividerSpacing > 0) {
            const borderColor = this.style.borderColor;
            const dividerSpacing = this.style.dividerSpacing;
            const cellSize = this.style.cellSize;
            const offsetX = this.style.globalOffsetX;
            const offsetY = this.style.globalOffsetY;
            const borderSize = this.style.borderSize;

            strokeCap(PROJECT);
            stroke(borderColor);
            strokeWeight(dividerSpacing);

            let columnSections = (this.cols / this.columnDivideEvery);
            let rowSections = (this.rows / this.rowDivideEvery);
            // all column lines
            for (let i = 1; i < columnSections; i++) {
                
                let x1 = offsetX + (this.columnDivideEvery * i * cellSize) + (borderSize * i) + (dividerSpacing * (i - 1)) - floor(borderSize / 2) + floor(dividerSpacing / 2);
                
                let y1 = offsetY - floor(borderSize / 2) + floor(dividerSpacing / 2);
                
                let x2 = x1;
                
                let y2 = offsetY + (this.rows * cellSize) + (borderSize * rowSections) + (dividerSpacing * (rowSections - 2)) - floor(borderSize / 2) + floor(dividerSpacing / 2);

                // let y2 = offsetY + (this.rows * (cellSize)) + (floor(rowSections - 1) * (regularBorder + dividerSpacing)) + floor((regularBorder - 1)/2 - floor((dividerSpacing - 1)/2)); // functionally the same as above ¯\_(ツ)_/¯
                
                line(x1, y1, x2, y2);
            }

            // all row lines
            for (let i = 1; i < rowSections; i++) {
                let x1 = offsetX - floor(borderSize / 2) + floor(dividerSpacing / 2);
                
                let y1 = offsetY + (this.rowDivideEvery * i * cellSize) + (borderSize * i) + (dividerSpacing * (i - 1)) - floor(borderSize / 2) + floor(dividerSpacing / 2);

                // let y1 = offsetY + (this.rowDivideEvery * i * cellSize) + ((regularBorder + dividerSpacing) * i) - regularBorder + floor((regularBorder - 1)/2) - floor((dividerSpacing - 1)/2); // functionally the same as above ¯\_(ツ)_/¯

                let x2 = offsetX + (this.cols * cellSize) + (borderSize * columnSections) + (dividerSpacing * (columnSections - 2)) - floor(borderSize / 2) + floor(dividerSpacing / 2);

                let y2 = y1;

                line(x1, y1, x2, y2);
            }
            
            // reset strokeCap to default, just in case.
            strokeCap(ROUND);
        }
    }

    validValues(list) {
        this.possibleValues = [];
        for (let key in list) {
            this.possibleValues.push(key.toUpperCase());
        }
    }

    generateCell(x, y, z, initialValue) {
        return new VisualCell(x, y, z, initialValue, this.style);
    }

    generateStructure() {
        super.generateStructure();

        // add setupCells() for drawing capabilities
        this.setupCells();
    }

    // set up cells to know their pixel location on screen for drawing
    setupCells() {
        let offsetX = this.style.globalOffsetX;
        let offsetY = this.style.globalOffsetY;
    
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let cell = this.cells[x + (y * this.cols)];

                if (x === 0) {
                    // reset offsetX every left column
                    offsetX = this.style.globalOffsetX;
                } else {
                    if (x % this.columnDivideEvery === 0) {
                        offsetX += this.style.dividerSpacing + this.style.borderSize;
                    }
                }
    
                if (y === 0) {
                    // don't change the offset on the first row
                    offsetY = this.style.globalOffsetY;
                } else {
                    // every divider columns, but only do it once per row
                    if (y % this.rowDivideEvery === 0 && x === 0) {
                        offsetY += this.style.dividerSpacing + this.style.borderSize;
                    }
                }
    
                // inform cell of the top left x,y coordinate
                let topleftX = offsetX + (x * this.style.cellSize);
                let topleftY = offsetY + (y * this.style.cellSize);
                cell.setCoords(topleftX, topleftY);
            }
        }
    }
}
