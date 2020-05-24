import { Component, OnInit } from '@angular/core';
import { Sudoku, Difficulty } from 'src/app/models/sudoku';

@Component({
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
  selector: 'app-home'
})
export class HomeComponent {

  private level: string;
  private sudokuPuzzle: Sudoku;

  constructor() {}

  generateBoard(level: string) {
    this.level = level;
    this.sudokuPuzzle = new Sudoku(9, this.level);
  }
}
