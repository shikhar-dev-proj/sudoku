import { addIndex, compose, forEach as rforEach, length, map as rMap, pluck } from 'ramda';
import { Grid } from '../models/sudoku';

// getTableLengthRoot :: (Array<Array<Grid>>) => number
export const getTableLengthRoot = compose(Math.sqrt, length);

// getNilArrayWithLength :: number => Array(number)
export const getNilArrayWithLength = (num: number) => Array(num).fill(0);

// getSequenceArrayWithLength :: number => Array(number)
export const getSequenceArrayWithLength = compose(addIndex(rMap)((v, i) => i + 1), getNilArrayWithLength );

// getDummyGrid :: (number?, boolean?) => Grid
export const getDummyGrid = (value: number = 0, readonly: boolean = true): Grid => ({ value, readonly });

// getDummyRow :: number => Grid[]
export const getDummyRow = (size: number): Grid[] => Array(size).fill(0).map(r => getDummyGrid(r, true));

// initializeTable :: number => Array<Array<Grid>>
export const initializeTable = (size: number) => Array(size).fill(0).map(r => getDummyRow(size));

// getInitializedGridMap :: number => Object
export function getInitializedGridMap(num: number) {
    return Array(num).fill(0).map((v, i) => i + 1).reduce((acc, curr) => ({ ...acc, [curr]: 0}), {});
}

// printTable :: Array<Array<Grid>> => void
export const printTable = rforEach(compose(console.log, pluck('value')));



// randomSequenceGenerator :: number => Array<number>
// returns a shuffle array of sequence from 1...N
export function randomSequenceGenerator(size: number): number[] {

  // get [1,2....N] for N
  const initialSequence = getSequenceArrayWithLength(size);
  for (let i = initialSequence.length - 1; i >= 0; i--) {

    const randomIndex = Math.floor(Math.random() * (i + 1));
    const itemAtIndex = initialSequence[randomIndex];

    // swap elements at these positions
    initialSequence[randomIndex] = initialSequence[i];
    initialSequence[i] = itemAtIndex;
  }
  return initialSequence;
}

// fillBox --> given a sequence of numbers fill specified box within table.
export function fillBox(table: Array<Array<Grid>>, startR: number, startC: number, sequence: number[]): Array<Array<Grid>> {
  const root = getTableLengthRoot(table);
  for (let i = startR; i < startR + root; i++) {
    for (let j = startC; j < startC + root; j++) {
      table[i][j] = getDummyGrid(sequence[ ( i - startR ) * root + ( j - startC ) ], true);
    }
  }
  return table;
}

// fill diagonal boxes of table as they are independant of each other
export function fillDiagonalBoxes(table: Array<Array<Grid>>) {
  const root = getTableLengthRoot(table);
  for (let i = 0; i < table.length; i += root) {
    table = fillBox(table, i, i, randomSequenceGenerator(table.length));
  }
  return table;
}

// implementation for backtracking algorithm
export function fillOtherBoxes(table: Array<Array<Grid>>, rowStart: number, colStart: number) {
  if (rowStart === table.length - 1 && colStart === table.length) {
    if (!isValidSudoku(table)) {
      return null;
    } else {
       return table;
    }
  }
  if ( colStart === table.length ) {
    rowStart += 1;
    colStart = 0;
  }
  if (table[rowStart][colStart].value && table[rowStart][colStart].readonly) {
    return fillOtherBoxes(table, rowStart, colStart + 1 );
  }
  for (let n = 1; n <= 9 ; n++ ) {
    if (findIfNumberValidAtGrid(table, rowStart, colStart, n)) {
      table[rowStart][colStart] = getDummyGrid(n, false);
      if (fillOtherBoxes(table, rowStart, colStart + 1 )) {
        return table;
      }
    }
    table[rowStart][colStart] = getDummyGrid(0, false);
  }
  return null;
}

// initiate recursive backtracking algorithm and take note of time taken
export function fillCompleteTable(table: Array<Array<Grid>>) {
  const start = new Date();
  fillOtherBoxes(table, 0, 0);
  const end = new Date();
  console.log('fillCompleteTable : ', (end.getTime() - start.getTime()) / 1000);
  return table;
}

// set prefilled digits of table as readonly
export function makePrefilledDigitsReadonly(table: Array<Array<Grid>>) {
  return table.map(row =>
            row.map(grid =>
                    (getDummyGrid(grid.value ? grid.value : 0, grid.value ? true : false))));
}


// isValidSudoku :: Array<Array<Grid>> => boolean
export function isValidSudoku(table: Array<Array<Grid>>) {
  // square root of table length
  const root = getTableLengthRoot(table);

  // HashMap initialised for rows
  let rowHM = getNilArrayWithLength(length(table)).map(r =>
    (getInitializedGridMap(table.length)));

  // HashMap initialised for columns
  let colHM = getNilArrayWithLength(length(table)).map(r =>
    (getInitializedGridMap(table.length)));

  // HashMap initialised for boxes
  let boxHM = getNilArrayWithLength(length(table)).map(r =>
    getNilArrayWithLength(root).map(v => (getInitializedGridMap(table.length))));

  // increment number counts in above hashmaps for every grid
  for (let row = 0; row < table.length; row++) {
    for (let col = 0; col < table.length; col++) {
      let row3 = Math.floor(row / root);
      let col3 = Math.floor(col / root);

      // increment number counts
      rowHM[row][table[row][col].value] += 1;
      colHM[col][table[row][col].value] += 1;
      boxHM[row3][col3][table[row][col].value] += 1;

      // terminate and tell invalid if number counts for any number in hashmap position is > 1.
      if (
        boxHM[row3][col3][table[row][col].value] > 1 ||
        colHM[col][table[row][col].value] > 1 ||
        rowHM[row][table[row][col].value] > 1
        ) {
        return false;
      }
    }
  }
  return true;
}

// isCompletelyFilled :: Array<Array<Grid>> => boolean
export function isCompletelyFilled(table: Array<Array<Grid>>): boolean {
  return !table.find(row => row.find(g => g.value === 0));
}

// isSolved :: Array<Array<Grid>> => boolean
export function isSolved(table: Array<Array<Grid>>): boolean {
  return isValidSudoku(table) && isCompletelyFilled(table);
}

// to find if number is used in specified row of table
export function isNumberUsedInRow(table: Array<Array<Grid>>, row: number, num: number): boolean {
  return !!table[row].find(col => col.value === num);
}

// to find if number is used in specified column of table
export function isNumberUsedInColumn(table: Array<Array<Grid>>, column: number, num: number): boolean {
  return !!table.find(row => row[column].value === num);
}

// to find if number is used in specified box of table
export function isNumberUsedInBox(table: Array<Array<Grid>>, r: number, c: number, num: number): boolean {
  for (let i = r; i < r + getTableLengthRoot(table); i++) {
    for (let j = c; j < c + getTableLengthRoot(table); j++) {
      if (table[i][j].value === num) {
        return true;
      }
    }
  }
  return false;
}

// to find if number can be kept at given position within the table
export function findIfNumberValidAtGrid(table: Array<Array<Grid>>, i: number, j: number, num: number): boolean {
  return !(
    isNumberUsedInRow(table, i, num) ||
    isNumberUsedInColumn(table, j, num) ||
    isNumberUsedInBox(
      table,
      i - i % getTableLengthRoot(table),
      j - j % getTableLengthRoot(table),
      num
    )
  );
}


// GENERATOR solving iteratively and returning correct numbers for asked grid
export function* solveGenerator(table: Array<Array<Grid>> = null, rowStart: number, colStart: number) {
  if (rowStart === table.length - 1 && colStart === table.length) {
    if (!isValidSudoku(table)) {
      return null;
    } else {
      return table;
    }
  }
  if ( colStart === table.length ) {
    rowStart += 1;
    colStart = 0;
  }
  if (table[rowStart][colStart].value && table[rowStart][colStart].readonly) {
    if (yield * solveGenerator(table, rowStart, colStart + 1 )) {
      yield table;
    } else {
      return null;
    }
  }
  for (let n = 1; n <= 9 ; n++ ) {
    if (findIfNumberValidAtGrid(table, rowStart, colStart, n)) {
      table[rowStart][colStart] = getDummyGrid(n, false);
      yield table;
      if (yield * solveGenerator(table, rowStart, colStart + 1 )) {
        yield table;
      }
    }
    table[rowStart][colStart] = getDummyGrid(0, false);
  }
  return null;
}


