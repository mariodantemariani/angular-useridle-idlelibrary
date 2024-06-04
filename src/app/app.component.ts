import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { IdleExpiry, SimpleExpiry } from '@ng-idle/core';
import { Keepalive, NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { HttpClient } from '@angular/common/http';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

import { IdleUserTimes, IdleMessages, IdleStatus } from './models';
import { IdleUserService } from './service/idle-user.service';

const MODULES: any[] = [
  CommonModule,
  FormsModule,
  HttpClientModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatDividerModule,
  MatIconModule,
  NgIdleKeepaliveModule, //.forRoot(),
  RouterOutlet,
];

const SERVICES: any[] = [IdleUserService];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MODULES],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // Add Keepalive to providers
    HttpClient,
    Keepalive,
    {
      provide: IdleExpiry,
      useClass: SimpleExpiry,
    },
    SERVICES,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  idleTime: number = IdleUserTimes.IDLE_TIME;
  idleStatus: string = IdleMessages.IDLE_NO_STARTED;
  isButtonEnabled = true;

  title = 'idle-user using ng-idle library';
  purpose = IdleMessages.IDLE_PURPOSE;

  constructor(
    //private idle: Idle,
    private idleUserService: IdleUserService,
    private keepalive: Keepalive,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Set timeout period to 5 minutes
    //this.idleUserService.idle.setIdle(this.idleTime);

    // Set interrupt sources to listen for mousemove events
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    //this.idleUserService.setInterrupts();
    //this.idleUserService.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    //It will call when user is idle and it shows the message 'Timeout!'
    this.idleUserService.idle.onTimeout.subscribe(() => {
      this.idleStatus = IdleMessages.IDLE_TIMEOUT;
      //  this.timedOut = true;
    });

    this.idleUserService.idle.onIdleStart.subscribe(() => {
      this.idleStatus = IdleMessages.IDLE_ENDED;
      console.log('@@' + this.idleStatus);
    });

    this.idleUserService.idle.onInterrupt.subscribe(() => {
      const message = IdleMessages.IDLE_INTERRUPTED;
      this.idleStatus = message;
      this.cd.detectChanges();
      localStorage.setItem('idleState', IdleStatus.IDLE_INTERRUPTED);
      console.log('@@' + message);
    });

    this.idleUserService.idle.onIdleEnd.subscribe(() => {
      const message = IdleMessages.IDLE_END;
      console.log('@@@' + message);
      this.idleStatus = message;
      localStorage.setItem('idleState', IdleStatus.IDLE_USER_ACTIVE);
      this.cd.detectChanges();
    });

    this.idleUserService.idle.onTimeoutWarning.subscribe((countdown) => {
      const message = IdleMessages.IDLE_TIMEOUT_WARNING.replace(
        '%time%',
        countdown.toString()
      );

      this.idleStatus = message;
      //'You will time out in ' + countdown + ' seconds!';
      console.log('@@' + this.idleStatus);
      localStorage.setItem('idleState', IdleStatus.IDLE_TIMEOUT_STARTED);
      this.cd.detectChanges();
    });

    // Set keepalive interval to 15 seconds
    this.keepalive.interval(1); //15

    // Start watching for idle user
    //this.idleUserService.idle.watch();
    this.idleUserService.startWatching();

    // Handle idle user
    this.idleUserService.idle.onTimeout.subscribe(() => {
      this.idleUserService.idle.clearInterrupts();
      const message = IdleMessages.IDLE_TIMEOUTPUT_MESSAGE;
      console.log('@@@' + message);
      this.idleStatus = message;
      this.isButtonEnabled = false;
      // Perform necessary actions, such as logging the user out

      this.cd.detectChanges();
    });
  }

  reset() {
    this.idleUserService.setInterrupts();
    this.idleUserService.startWatching();
    this.idleStatus = IdleMessages.IDLE_STARTED;
    this.isButtonEnabled = true;
    this.cd.detectChanges();
    window.localStorage.setItem('loggedIn', 'true');
  }

  ngOnDestroy() {
    this.idleUserService.stopWatching();
  }
}
