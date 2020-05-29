import { compose } from 'ramda';
import { fillCompleteTable, fillDiagonalBoxes, getDummyGrid, initializeTable, makePrefilledDigitsReadonly } from '../helpers/sudoku-util';

export interface Grid {
  readonly: boolean;
  value: number;
}

export enum Difficulty {
  'easy' = 0.25,
  'medium' = 0.4,
  'hard' = 0.58
}

export class Sudoku {
  private size: number;
  public table: Array<Array<Grid>>;
  private isSolved: boolean;
  private isDirty: boolean;
  private complexity: number;

  constructor(size: number, complexity: string) {
    this.size = size;
    this.complexity = Difficulty[complexity];
    this.table = this.getSudokuPuzzle(size);
  }

  public getSudokuPuzzle = compose(
    makePrefilledDigitsReadonly,
    this.removeKdigits,
    fillCompleteTable,
    fillDiagonalBoxes,
    initializeTable
  );

  public removeKdigits(table: Array<Array<Grid>>) {
    const digitsToBeRemoved = Math.floor(this.complexity * table.length * table.length);
    let i = 0;
    while ( i <= digitsToBeRemoved ) {
      const x = Math.floor(Math.random() * table.length);
      const y = Math.floor(Math.random() * table.length);
      if (table[x][y].value) {
        table[x][y] = getDummyGrid(0, false);
        i++;
      }
    }
    return table;
  }
}


