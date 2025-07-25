// import { transmitEvent } from "./transmitEvent.js";

// export function trackFormInput() {
//   document.querySelectorAll('input, textarea').forEach(input => {
//     input.addEventListener('input', (event) => {
//       const inputEvent = {
//         type: 'form_input',
//         elementId: (event.target as HTMLElement).id,
//         valueLength: (event.target as HTMLInputElement).value.length, // Ne capture pas la valeur exacte pour des raisons de sécurité
//         timestamp: new Date().toISOString(),
//         page: window.location.href,
//         device: getDeviceInfo()
//       };
//       transmitEvent(inputEvent);
//     });
//   });
// }
