/// <reference path="typescript/p5.global-mode.d.ts" />
'use strict';

let sudokuBoard = new VisualSudokuBoard(9,9,3,3, {'globalOffsetX': 10, 'globalOffsetY': 10});

function setup() {
    createCanvas(1000, 800);
    background(255);
    frameRate(30);
    noLoop();
    
    sudokuBoard.generateStructure();

    sudokuBoard.forEachCell((cell) => {
        let mutable = (random() < 0.70) ? true : false

        if (!mutable) { 
            cell.value = floor(random(9) + 1);
            cell.mutable = false;
        }
    });

}

function draw() {
    sudokuBoard.draw();
}

function mouseMoved() {
    sudokuBoard.mouseMoved();
    return false; // To prevent any default behavior for this event
}

function mousePressed() {
    sudokuBoard.mousePressed();
    return false; // To prevent any default behavior for this event
}

function keyPressed() {
    return sudokuBoard.keyPressed();
}
