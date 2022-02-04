import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { buffer, delay, map } from 'rxjs/operators';
import { dictionary }  from './utils/words';
import { fiveLetterWords } from './utils/easywords';
// var dictionary = import('an-array-of-english-words');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  
  constructor(private formBuilder: FormBuilder, private changeDetector: ChangeDetectorRef){
  }
  public fiveLetterWords = [];
  public testWord = "wrung";
  public validWord = false;
  public controls = ['cell1','cell2','cell3','cell4','cell5'];
  public spinningCells: string[] = [];
  public lastTurns = [];
  public nextTurns = [];
  public spinning = false;
  public gameNumber = null;
  public keyCommands: string[] = 'qwertyuiop'.split('');
  public keyCommands2: string[] ='asdfghjkl'.split('');
  public keyCommands3: string[] = 'zxcvbnm'.split('');



  public difficulty = 'hard';

 
  public wyrdleForm = this.formBuilder.group({
    cell1: this.formBuilder.control(null, [Validators.required]),
    cell2: this.formBuilder.control(null, [Validators.required]),
    cell3: this.formBuilder.control(null, [Validators.required]),
    cell4: this.formBuilder.control(null, [Validators.required]),
    cell5: this.formBuilder.control(null, [Validators.required])
  });

  ngOnInit(): void {
    this.keyCommands3.push('->');
    this.keyCommands3.unshift('Enter');

      this.setDefaults();
      fiveLetterWords.forEach(word => {
        if(word.length === 5){
          this.fiveLetterWords.push(word);
        }
      });
      this.generateWord();
  }
  public loadGame(){
    this.startOver();
    const gameIndex = this.gameNumber;
    console.log('generating game ', gameIndex)
    this.generateWord(gameIndex);
  }
  public setDefaults(){
    this.nextTurns = [];
    for(let i = 0; i<5; i++){
      this.nextTurns.push([]);
      for(let x = 0; x<5; x++){
        this.nextTurns[i].push({
          letter: '',
          color: 'white'
        });
      }
    }
    document.getElementById('cell1').focus();
  }

  public generateWord(index:number = null){
    const randomIndex = Math.floor(Math.random() * this.fiveLetterWords.length);
    this.testWord = index ? this.fiveLetterWords[index] : this.fiveLetterWords[randomIndex];
    console.log('OFFICIAL WORD - ', this.testWord)
  }

  public nextCell(index:number): void{
    if(this.wyrdleForm.get(this.controls[index-1]).value){
      document.getElementById(this.controls[index]).focus();
    }
    this.isValidWord();
  }

  public isValidWord(){
    let letters = [];
    const results = this.wyrdleForm.value;
    console.log({results})
    for(let letter in results){
      letters.push(results[letter]);
    }
    const submittedWord = letters.join('');
    console.log({submittedWord})
    this.validWord = submittedWord.length === 5 && dictionary.includes(submittedWord);
    console.log('VALID - ',this.validWord)  
  }

  public advanceForm(lastRow:any){
    this.wyrdleForm.reset();
    this.controls.forEach(control => {
      document.getElementById(control).setAttribute('class','wyrdle-cell');
    });
    this.lastTurns.push(lastRow);
    this.nextTurns.pop();
    document.getElementById('cell1').focus();

  }

  public startOver(){
    if(confirm('Sure about this?')){
      this.lastTurns = [];
      this.setDefaults();
      this.wyrdleForm.reset();
      this.controls.forEach(control => {
        document.getElementById(control).setAttribute('class','wyrdle-cell');
      });
      this.generateWord();    
    }
  }

  public registerInput(value: string){
    console.log(value)
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
    
    /** test cells while animating in real time */
    for(let i=0; i<5; i++){
      await new Promise((res) => {
        setTimeout(()=> {
          if(this.testWord[i]===letters[i]){
            console.log(letters[i],'- TRUE')
            document.getElementById(this.controls[i]).setAttribute('class','wyrdle-cell green');
            lastRow.push({
              letter:letters[i],
              color:'green'
            });
          }else if(this.testWord.includes(letters[i])){
            console.log(letters[i],'- INCLUDED ELSEWHERE')
            document.getElementById(this.controls[i]).setAttribute('class','wyrdle-cell orange');
            perfect = false;
            lastRow.push({
              letter:letters[i],
              color:'orange'
            });
    
          }else if(!this.testWord.includes(letters[i])){
            console.log(letters[i],' not included')
            perfect = false;
            document.getElementById(this.controls[i]).setAttribute('class','wyrdle-cell gray');
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
      if(perfect && i===4){
        this.win();
        return;
      }
    }
    if(this.difficulty === 'hard' && !perfect && this.validWord && this.lastTurns.length >= 5){
      this.lose();
      return;
    }
    setTimeout(()=> {
      this.spinningCells = [];
      this.advanceForm(lastRow);
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
