import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IStudent } from './student';
import { StudentService } from './student.service';
import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';

import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css'],
  providers: [StudentService],
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '186px',
        opacity: 1,
      })),
      state('closed', style({
        height: '0px',
        opacity: 0,
      })),
      transition('open => closed', animate('0.2s')),
      transition('closed => open', animate('0.2s'))
    ])
  ]
})



export class StudentsComponent implements OnInit, OnDestroy {
  sub!: Subscription;
  students: any = [];
  grades: any = [];
  studentTags: string[] = [];
  searchName: string = '';
  filteredStudents:any = [];
  private _listFilter: string = '';
  filterTag: string = '';
   currentTab: any = {};
  

  readonly separatorKeysCodes: number[] = [ENTER, COMMA, TAB];

  tags: string[] = [];

  constructor(private studentService : StudentService) { }
  
  ngOnInit(): void {
    this.sub = this.studentService.getStudents().subscribe({
      next : students => {
        this.students = students;
        console.log("all", this.students);
        this.calculateAvg(this.students.students);        
        this.filteredStudents = this.students.students;
      }
    });
  }

  calculateAvg(students: IStudent[]) {
    students.forEach((student: any) => student['avg'] = student.grades.reduce((prev: number, next: string | number) => prev + +next, 0) / student.grades.length);
  }

  get listFilter(): string {
    return this._listFilter;
  }
 
  set listFilter(value: string) {
    this._listFilter = value;
    console.log('IN setter', value);
    this.filteredStudents = this.performFilter(value);
  }

 
  
  performFilter(filterBy: string):IStudent[] { 
   filterBy = filterBy.toLocaleLowerCase();
   return this.students.students.filter((student: any) =>
   (student.firstName.toLocaleLowerCase().includes(filterBy) || student.lastName.toLocaleLowerCase().includes(filterBy))
   );
  
  }
 
  viewList(studentId : number) {
    this.currentTab = this.students.students.find((student: any) => student.id == studentId);
    this.currentTab.show = !this.currentTab.show;   
  }


  add(event: MatChipInputEvent , id : number | string) {
    let currentStudent;
    const value = (event.value || '').trim();
    if (value) {
      
       this.students.students.forEach((student: any) => {
        if(student.id == id) {
          this.tags.push(value);
          if(!student['tag']) {
            student['tag'] = this.tags;
          } else {
            student.tag.push(value);
          }         
        }
        this.tags = [];
       });   
    }
    if (event.input) {
      event.input.value = '';
    }
  }

  searchTag(tags : string) {
    let arr : any  = [];
   this.students.students.forEach((student: any) => {
     if(student.tag && student.tag.length > 0) {
      const tagPresent =  student.tag.find((tag: string) => tag.includes(tags));
       if(tagPresent && tagPresent.length > 0) {
        if(tags.length > 0) {
          arr.push(student);
          this.filteredStudents = arr;
        } else {
          this.filteredStudents = this.students.students;
        }
      } else if(arr.length > 0) {
        this.filteredStudents = arr;

      } else {
        this.filteredStudents = [];
      }         
     }
    }); 
  }
  
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
