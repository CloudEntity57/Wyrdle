import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { buffer, delay, map } from 'rxjs/operators';
import { dictionary }  from './utils/words';
import { easyWords } from './utils/easywords';
// var dictionary = import('an-array-of-english-words');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit{
  
  constructor(private formBuilder: FormBuilder, private changeDetector: ChangeDetectorRef){
  }
  public correctLetterWords = [];
  public testWord = "wrung";
  public validWord = false;
  public controls = [];
  public letterIndexes = [];
  public spinningCells: string[] = [];
  public lastTurns = [];
  public nextTurns = [];
  public spinning = false;
  public gameNumber = null;
  public keyCommands: string[] = 'qwertyuiop'.split('');
  public keyCommands2: string[] ='asdfghjkl'.split('');
  public keyCommands3: string[] = 'zxcvbnm'.split('');
  public currentLetter = 1;
  public manualKeyChoice = false;
  public lettersInWord: number = null;
  public isPageLoading = true;

  public difficulty = 'hard';
 
  public wyrdleForm = this.formBuilder.group({});


  ngOnInit(): void {
    // this.generateForm();
    this.filterWords();
    this.keyCommands3.push('<-');
    // this.generateWord();
    // this.setDefaults();
  } 
  public filterWords(){
    for(let i=1; i<= this.lettersInWord; i++){
      this.controls.push(`cell${i}`);
      this.letterIndexes.push(i);
    }  
    let wordsArray = easyWords.split('\n');
    console.log('wordsArray: ', wordsArray)
    let filteredWords = wordsArray.filter(word => word.length === this.lettersInWord);
    console.log('filteredWords: ', filteredWords)

    this.correctLetterWords = filteredWords.map(word => {
      // if(word.length === this.lettersInWord){
      //   this.correctLetterWords.push(word);
      // }
      return (word.length === this.lettersInWord) ? word.toLowerCase() : null;
    });
    console.log('correctLetteredWords: ', this.correctLetterWords)
  }
  public setupGame(){
    this.generateForm();
    console.log('lettersInWord: ', this.lettersInWord)

    setTimeout(()=>{
      this.isPageLoading = false;
      this.filterWords();
      this.generateForm();
      this.setDefaults();
      this.generateWord();
      document.getElementById('cell1').focus();

    },250)

  }
  
  ngAfterViewInit(){
    // document.getElementById('cell1').focus();
  }

  public generateForm(){
    for(let i=1; i<=this.lettersInWord; i++){
      this.wyrdleForm.addControl(`cell${i}`, this.formBuilder.control(null, [Validators.required]));
    }
  }

  public registerInput(value: string){
    // if(this.currentLetter > 5 && value != 'Enter') return;
    console.log(value)
    if(value === 'Enter' && this.isValidWord()){
      this.submitForm();
      return;
    }
    if(value === 'Enter' && !this.isValidWord()){
      return;
    }
    if(value === '<-'){
      this.currentLetter = this.manualKeyChoice ? this.currentLetter : this.currentLetter - 1;
      if(this.currentLetter === 0){
        this.currentLetter = 1;
      }
      value = '';
      this.wyrdleForm.get(`cell${this.currentLetter}`).setValue(value);
      this.manualKeyChoice = false;
      return;
    }
    if(this.currentLetter > this.lettersInWord) return;
    const control = `cell${this.currentLetter}`;
    this.wyrdleForm.get(control).setValue(value);
    this.changeDetector.detectChanges();
    this.currentLetter++;
    this.manualKeyChoice = false;
  }

  public isEnterKey(char){
    return char === 'Enter';
  }

  public cellClicked(index:number){
    this.manualKeyChoice = true;
    this.currentLetter = index;
  }
  public loadGame(){
    this.startOver();
    const gameIndex = this.gameNumber;
    this.generateWord(gameIndex); 
    this.gameNumber = null;
  }
  public setDefaults(){
    this.currentLetter = 1;
    this.nextTurns = [];
    for(let i = 0; i<this.lettersInWord; i++){
      this.nextTurns.push([]);
      for(let x = 0; x<this.lettersInWord; x++){
        this.nextTurns[i].push({
          letter: '',
          color: 'white'
        });
      }
    }
  }

  public generateWord(index:number = null){
    const randomIndex = Math.floor(Math.random() * this.correctLetterWords.length);
    this.testWord = index ? this.correctLetterWords[index] : this.correctLetterWords[randomIndex];
    console.log('OFFICIAL WORD - ', this.testWord)
  }

  public nextCell(index:number): void{
    if(this.wyrdleForm.get(this.controls[index-1]).value){
      document.getElementById(this.controls[index]).focus();
    }
    this.isValidWord();
  }

  public isValidWord(): boolean{
    let letters = [];
    const results = this.wyrdleForm.value;
    console.log({results})
    for(let letter in results){
      letters.push(results[letter]);
    }
    const submittedWord = letters.join('');
    console.log({submittedWord})
    this.validWord = submittedWord.length === this.lettersInWord && dictionary.includes(submittedWord);
    console.log('VALID - ',this.validWord);
    return this.validWord;
  }

  public advanceForm(lastRow:any){
    this.wyrdleForm.reset();
    this.controls.forEach(control => {
      document.getElementById(control).setAttribute('class','wyrdle-cell');
    });
    this.lastTurns.push(lastRow);
    this.nextTurns.pop();
    document.getElementById('cell1').focus();
    this.validWord = false;
  }

  public startOver(){
    if(confirm('Sure about this?')){
      const keysArray = Array.from(document.getElementsByClassName('keyboardItem'));
      keysArray.forEach(key => {
        key.setAttribute('class', 'keyboardItem');
      })
      this.lastTurns = [];
      this.setDefaults();
      this.wyrdleForm.reset();
      this.controls.forEach(control => {
        document.getElementById(control).setAttribute('class','wyrdle-cell');
      });
      this.generateWord();    
    }
  }

  public async submitForm(){
    let letters = [];
    const results = this.wyrdleForm.value;
    console.log({results})
    for(let letter in results){
      letters.push(results[letter]);
    }
    const submittedWord = letters.join('');
    console.log({submittedWord})
    this.validWord = dictionary.includes(submittedWord);
    console.log('VALID - ',this.validWord)
    let perfect = true;
    let lastRow = [];
    
    /** test cells while spinning in real time */

    for(let i=0; i<this.lettersInWord; i++){
      await new Promise((res) => {
        setTimeout(()=> {
          if(this.testWord[i]===letters[i]){
            console.log(letters[i],'- TRUE')
            document.getElementById(this.controls[i]).setAttribute('class','wyrdle-cell green');
            document.getElementById(letters[i]).setAttribute('class','keyboardItem green');
            lastRow.push({
              letter:letters[i],
              color:'green'
            });
          }else if(this.testWord.includes(letters[i])){
            console.log(letters[i],'- INCLUDED ELSEWHERE')
            document.getElementById(this.controls[i]).setAttribute('class','wyrdle-cell orange');
            document.getElementById(letters[i]).setAttribute('class','keyboardItem orange');
            perfect = false;
            lastRow.push({
              letter:letters[i],
              color:'orange'
            });
    
          }else if(!this.testWord.includes(letters[i])){
            console.log(letters[i],' not included')
            perfect = false;
            document.getElementById(this.controls[i]).setAttribute('class','wyrdle-cell gray');
            document.getElementById(letters[i]).setAttribute('class','keyboardItem gray');
            lastRow.push({
              letter:letters[i],
              color:'gray'
            });
          }

          this.spinningCells.push(`cell${(i+1).toString()}`)
          console.log('spinning ', this.spinningCells)
          res(true);
          },350);
          this.changeDetector.detectChanges();
      });
      if(perfect && i===this.lettersInWord - 1){
        this.win();
        return;
      }
    }

    
    if(this.difficulty === 'hard' && !perfect && this.validWord && this.lastTurns.length >= this.lettersInWord){
      this.lose();
      return;
    }
    setTimeout(()=> {
      this.spinningCells = [];
      this.advanceForm(lastRow);
      this.currentLetter = 1;
    }, 1000)

  }
  public win(){
    setTimeout(()=>{
      alert('YOU WIN')
    },400)
  }
  public lose(){
    setTimeout(()=>{
      alert('GAME OVER')
    },400)
  }

  public isSpinning(item: string): boolean{
    return this.spinningCells.includes(item);
  }

}
