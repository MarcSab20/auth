// import { transmitEvent } from "./transmitEvent.js"; 

// export function trackMouseMovement() {
//   document.addEventListener('mousemove', (event) => {
//     const mouseEvent = {
//       type: 'mouse_move',
//       position: {
//         x: event.clientX,
//         y: event.clientY
//       },
//       timestamp: new Date().toISOString(),
//       page: window.location.href,
//       device: getDeviceInfo()
//     };
//     transmitEvent(mouseEvent);
//   });
// }