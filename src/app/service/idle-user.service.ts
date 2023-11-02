import { Injectable } from '@angular/core';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { IdleStatus, IdleUserTimes } from '../models';

@Injectable({
  providedIn: 'root',
})
export class IdleUserService {
  constructor(private _idle: Idle) {
    // sets an idle timeout of 5 seconds, use value from enum
    this._idle.setIdle(IdleUserTimes.IDLE_TIME);
    // sets a timeout period of 5 seconds, use value from enum
    this._idle.setTimeout(IdleUserTimes.TIMEOUT);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this._idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    // // Event: The user has returned from being idle
    // this._idle.onIdleEnd.subscribe(() => {
    //   /* Handle event */
    // });

    // // Event: The user's session is about to time out
    // this._idle.onTimeoutWarning.subscribe((countdown) => {
    //   /* Handle event */
    // });

    // // Event: The user's session has timed out
    // this._idle.onTimeout.subscribe(() => {
    //   /* Handle event */
    // });

    window.addEventListener('storage', (event) => {
      if (event.key === 'idleState' && event.newValue === 'Started') {
        this.startWatching();
      }

      if (event.key === 'idleState' && event.newValue === 'Stopped') {
        this.stopWatching();
      }
    });
  }

  // Provide a getter to access the private idle field from outside the service
  get idle() {
    return this._idle;
  }

  startWatching() {
    this._idle.watch();
    localStorage.setItem('idleState', IdleStatus.IDLE_STARTED);
  }

  setInterrupts() {
    this._idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
  }
  stopWatching() {
    this._idle.stop();
    localStorage.setItem('idleState', IdleStatus.IDLE_STOPPED);
  }
}
