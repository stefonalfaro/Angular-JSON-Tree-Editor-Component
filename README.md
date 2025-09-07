# Angular-JSON-Tree-Editor-Component
This does not exist and the packages on NPM are have bugs, don't work, have no documentation, or only for React. Therefore I decided to make my own component that actually works.
<img width="571" height="375" alt="image" src="https://github.com/user-attachments/assets/84de4a98-8724-4130-80ab-7bcc1061da83" />


## How to use
``<app-json-editor *ngIf="Data" [jsonData]="Data | jsonParse" (jsonChange)="jsonDataChange($event)"></app-json-editor>``

So in the parent component you can get changes via
```
jsonDataChange(data:any){
  console.debug(`Data Changed ${data}`);
  console.debug(`Data Changed:`, JSON.stringify(data, null, 2));
}
```

### Automatic Changes to Save
This is disabled by default but you can just set this to true, then anytime you make a change it will output. Normally you need to click the Save button.
``@Input() autoUpdate:boolean = false;``

### jsonParse Pipe
This may or not be needed depending on how your data is structured but even when I am editing JSON in a plain textbox before I had this component I still had to prepare my data since I am reading from a SQL Server column.
```
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jsonParse'
})
export class JsonParsePipe implements PipeTransform {

  transform(value: string): any {
    try {
      return JSON.parse(value);
    } 
    catch (e) {
      return value;
    }
  }
}
```
