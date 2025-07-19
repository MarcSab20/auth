// import { transmitEvent } from "./transmitEvent.js";

// export function trackInactivity(timeout: number) {
//   let inactivityTimer: NodeJS.Timeout;

//   const resetTimer = () => {
//     clearTimeout(inactivityTimer);
//     inactivityTimer = setTimeout(() => {
//       const event: InactivityEvent = {
//         type: "inactivity",
//         duration: timeout,
//         timestamp: new Date().toISOString()
//       };
//       transmitEvent(event);
//     }, timeout);
//   };

//   window.addEventListener('mousemove', resetTimer);
//   window.addEventListener('keydown', resetTimer);
//   resetTimer(); // Initialisation au début
// }
