/// <reference path="typescript/p5.global-mode.d.ts" />
'use strict';

let sudokuBoard = new VisualSudokuBoard(9,9,3,3, {'globalOffsetX': 10, 'globalOffsetY': 10});
const DEBUG = {};

function setup() {
    createCanvas(1000, 800);
    background(255);
    frameRate(30);
    noLoop();
    
    sudokuBoard.generateStructure();
    // Timing Test:
    // let totalAttempts = [0];
    // console.time("originalGeneration");
    // for (let i = 0; i < 10000; i++) { // approx 5ms per
    //     let attempts = sudokuBoard.generateCompleted();
    //     if (totalAttempts[attempts]) {
    //         totalAttempts[attempts]++;
    //     } else {
    //         totalAttempts[attempts] = 1;
    //     }
    // }
    // console.timeEnd("originalGeneration");
    // DEBUG.t = totalAttempts;

    // Random Incorrect Board:
    // sudokuBoard.forEachCell((cell) => {
    //     let mutable = (random() < 0.70) ? true : false

    //     if (!mutable) { 
    //         cell.value = floor(random(9) + 1);
    //         cell.mutable = false;
    //     }
    // });

    // board found online lol
    sudokuBoard.initializeBoard(['8','','9','','','5','4','','','','','2','','','8','','6','','','5','','7','','','9','','2','3','4','1','','','','','','','','9','','','5','','','4','','','','','','','','3','2','9','1','','6','','3','','','7','','','3','','4','','','8','','','','','4','8','','','5','','3']);
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
