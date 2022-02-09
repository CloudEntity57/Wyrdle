import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { dictionary }  from './utils/words';
import { easyWords } from './utils/easywords';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  
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
  public isGameWon = false;
  public copySuccess = false;

  public difficulty = 'hard';
 
  public wyrdleForm = this.formBuilder.group({});


  ngOnInit(): void {
    this.filterWords();
    this.keyCommands3.push('<-');
  } 
  public filterWords(){
    for(let i=1; i<= this.lettersInWord; i++){
      this.controls.push(`cell${i}`);
      this.letterIndexes.push(i);
    }  
    let wordsArray = easyWords.split('\n');
    let filteredWords = wordsArray.filter(word => word.length === this.lettersInWord);

    this.correctLetterWords = filteredWords.map(word => {
      return (word.length === this.lettersInWord) ? word.toLowerCase() : null;
    });
  }
  public setupGame(){
    this.generateForm();

    setTimeout(()=>{
      this.isPageLoading = false;
      this.filterWords();
      this.generateForm();
      this.setDefaults();
      this.generateWord();
    },250)

  }


  public generateForm(){
    for(let i=1; i<=this.lettersInWord; i++){
      this.wyrdleForm.addControl(`cell${i}`, this.formBuilder.control(null, [Validators.required]));
    }
  }

  public registerInput(value: string){
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
    if(!this.testWord){
      this.isPageLoading = true;
      this.lettersInWord = null
      this.letterIndexes = [];
      this.setDefaults();
      this.generateForm();
      alert('Please try again');
    }
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
    for(let letter in results){
      letters.push(results[letter]);
    }
    const submittedWord = letters.join('');
    this.validWord = submittedWord.length === this.lettersInWord && dictionary.includes(submittedWord);
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

  public modalBlur(blur){
    if(blur){
      this.isGameWon = false;
    }
  }

  public async submitForm(){
    let greenLetters = [];
    let orangeLetters = [];
    const alphabet = this.keyCommands.concat(this.keyCommands2).concat(this.keyCommands3);
    let metaWord = Object.create({});
    let letters = [];
    const results = this.wyrdleForm.value;
    for(let letter in alphabet){
      metaWord[alphabet[letter]] = 0;
    }
    for(let letter in results){
      letters.push(results[letter]);
    }
    for(let char in this.testWord.split('')){
      metaWord[this.testWord.split('')[char]]+=1;
    }
    const submittedWord = letters.join('');
    this.validWord = dictionary.includes(submittedWord);
    let perfect = true;
    let lastRow = [];
    
    /** test cells while spinning in real time */
    for(let i=0; i<this.lettersInWord; i++){
      if(this.testWord[i]===letters[i]){
        greenLetters.push(letters[i]);
      }
    }
    for(let i=0; i<this.lettersInWord; i++){
      await new Promise((res) => {
        setTimeout(()=> {
          if(this.testWord[i]===letters[i]){
            document.getElementById(this.controls[i]).setAttribute('class','wyrdle-cell green');
            document.getElementById(letters[i]).setAttribute('class','keyboardItem green');
            lastRow.push({
              letter:letters[i],
              color:'green'
            });
            metaWord[letters[i]]--;
          }else if(this.testWord.includes(letters[i])){
            const allFound = greenLetters.filter(ltr => ltr === letters[i]).length === metaWord[letters[i]];
            if(metaWord[letters[i]]>0 && !allFound){
              document.getElementById(this.controls[i]).setAttribute('class','wyrdle-cell orange');
              lastRow.push({
                letter:letters[i],
                color:'orange'
              });
            }else{
              document.getElementById(this.controls[i]).setAttribute('class','wyrdle-cell gray');
              lastRow.push({
                letter:letters[i],
                color:'gray'
              });
            }
            if(!greenLetters.includes(letters[i])){
              document.getElementById(letters[i]).setAttribute('class','keyboardItem orange');
            }
            perfect = false;
            metaWord[letters[i]]--;
          }else if(!this.testWord.includes(letters[i])){
            perfect = false;
            document.getElementById(this.controls[i]).setAttribute('class','wyrdle-cell gray');
            document.getElementById(letters[i]).setAttribute('class','keyboardItem gray');
            lastRow.push({
              letter:letters[i],
              color:'gray'
            });
          }

          this.spinningCells.push(`cell${(i+1).toString()}`)
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
      this.isGameWon = true;
    },400)
  }
  public lose(){
    setTimeout(()=>{
      alert('GAME OVER')
    },400)
  }

  public share(){
      let shareText = `Wyrdle ${this.correctLetterWords.indexOf(this.testWord)}(${this.lettersInWord} ltrs) ${this.lastTurns.length + 1}/${this.difficulty === 'hard' ? this.lettersInWord+1 : 'unlimited'}\n`;
      this.lastTurns.forEach(turn =>{
        turn.forEach(attempt => {
          switch(attempt.color){
            case 'gray':
              shareText+="⬜ ";
              break;
            case 'orange':
              shareText+="🟨 ";
              break;
            case 'green':
              shareText+="🟩 ";
            break;
          }
        });
        shareText+=`\n`;
      });
      for(let i=0; i<this.lettersInWord; i++){
        shareText+='🟩 ';
      }
      navigator.clipboard.writeText(shareText).then(() => {
          this.copySuccess = true;
          this.changeDetector.detectChanges();
          setTimeout(()=>{
            this.isGameWon = false;
            this.copySuccess = false;
          },1500);
      })
  }

  public isSpinning(item: string): boolean{
    return this.spinningCells.includes(item);
  }

  public get successButtonText(){
    return this.copySuccess === true ? 'Results copied to clipboard' : 'Share';
  }

}
