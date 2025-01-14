import { Component } from '@angular/core';

import { RepeaterDemoItem } from './repeater-demo-item';

let nextId = 0;

@Component({
  selector: 'app-repeater-demo',
  templateUrl: './repeater-demo.component.html',
  styleUrls: ['./repeater-demo.component.scss'],
})
export class RepeaterDemoComponent {
  public items: RepeaterDemoItem[] = [
    {
      title: 'Call Robert Hernandez',
      note: 'Robert recently gave a very generous gift.  We should call him to thank him.',
      status: 'Completed',
    },
    {
      title: 'Send invitation to Spring Ball',
      note: "The Spring Ball is coming up soon.  Let's get those invitations out!",
      status: 'Past due',
    },
  ];

  public addItem(): void {
    this.items.push({
      title: 'New reminder ' + ++nextId,
      note: 'This is a new reminder',
      status: 'Active',
    });
  }

  public changeItems(tags: RepeaterDemoItem[]): void {
    console.log('Tags in order ', tags);
  }

  public onActionClicked(buttonText: string): void {
    alert(buttonText + ' was clicked!');
  }

  public removeItem(): void {
    this.items.pop();
  }
}
