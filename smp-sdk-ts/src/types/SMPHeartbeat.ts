export interface SMPHeartbeat {
  heartbeat?: number ;
  interval?: number  ;
  lastPing?: Date    ;
  firstPing?: Date   ;
  lastUpPing?: Date  ;
  maxTimeOut?: number;
  timeOut?: number   ;
  timeOutCount?: number;
}
