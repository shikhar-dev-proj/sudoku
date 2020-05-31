import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Sudoku, Difficulty, Grid } from 'src/app/models/sudoku';
import { fromEvent } from 'rxjs';
import { isNumber } from 'util';
import { isValidSudoku, solveGenerator, isSolved, getDummyGrid, fillCompleteTable, initializeTable, fillDiagonalBoxes, makePrefilledDigitsReadonly } from 'src/app/helpers/sudoku-util';
import { clone } from 'ramda';

@Component({
  styleUrls: ['./board.component.scss'],
  templateUrl: './board.component.html',
  selector: 'app-sudoku-board'
})
export class SudokuBoardComponent implements OnChanges, OnInit {

  @Input() board: Sudoku;

  private activeGrid = [0, 0];
  private isValidSudoku = true;
  private isSolved = false;
  private solver;

  constructor() {}

  ngOnChanges() {
    this.solver = solveGenerator(this.board.table, 0, 0);
    this.isValidSudoku = isValidSudoku(this.board.table);
    this.isSolved = isSolved(this.board.table);
  }

  ngOnInit() {
    fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
      this.handleGameActions(event);
    });
  }

  handleGameActions(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        if (this.activeGrid[0] === this.board.table.length - 1) {
          this.activeGrid[0] = 0;
        } else {
          this.activeGrid[0] = this.activeGrid[0] + 1;
        }
        break;
      case 'ArrowUp':
        if (this.activeGrid[0] === 0) {
          this.activeGrid[0] = this.board.table.length - 1;
        } else {
          this.activeGrid[0] = this.activeGrid[0] - 1;
        }
        break;
      case 'ArrowLeft':
        if (this.activeGrid[1] === 0) {
          this.activeGrid[1] = this.board.table.length - 1;
        } else {
          this.activeGrid[1] = this.activeGrid[1] - 1;
        }
        break;
      case 'ArrowRight':
        if (this.activeGrid[1] === this.board.table.length - 1) {
          this.activeGrid[1] = 0;
        } else {
          this.activeGrid[1] = this.activeGrid[1] + 1;
        }
        break;
      default :
        if (isNumber(+event.key) && !this.board.table[this.activeGrid[0]][this.activeGrid[1]].readonly) {
          this.assignGrid(this.activeGrid[0], this.activeGrid[1], +event.key);
          this.isValidSudoku = isValidSudoku(this.board.table);
          this.isSolved = isSolved(this.board.table);
        }
        break;
    }
  }

  isActiveGrid(row: number, col: number): boolean {
    return this.activeGrid[0] === row && this.activeGrid[1] === col;
  }

  isReadonlyGrid(row: number, col: number): boolean {
    return this.board.table[row][col].readonly;
  }

  assignGrid(row: number, col: number, num: number) {
    this.board.table[row][col] = getDummyGrid(num, false);
  }

  solveIteratively() {
    let generated = this.solver.next();
    this.board.table = [...generated.value];
    this.isValidSudoku =  isValidSudoku(this.board.table);
    this.isSolved = isSolved(this.board.table);
  }

  solveCompletely() {
    fillCompleteTable(this.board.table);
    this.isSolved = isSolved(this.board.table);
  }

  initializeTable() {
    this.board.table = initializeTable(9);
  }

  fillDiagonalBoxes() {
    this.board.table = fillDiagonalBoxes(this.board.table);
  }

  fillAllBoxes() {
    this.board.table = fillCompleteTable(this.board.table);
  }

  removeKDigits() {
    this.board.table = this.board.removeKdigits(this.board.table);
  }

  setPrefilledReadOnly() {
    this.board.table = makePrefilledDigitsReadonly(this.board.table);
  }
}
