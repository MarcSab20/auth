// import { transmitEvent } from "./transmitEvent.js";

// export function trackTimeSpentInSection(sectionId: string) {
//   const section = document.getElementById(sectionId);
//   let startTime: number;

//   section?.addEventListener('mouseenter', () => {
//     startTime = Date.now();
//   });

//   section?.addEventListener('mouseleave', () => {
//     const timeSpent = Date.now() - startTime;
//     const event: SectionTimeSpentEvent = {
//       type: "section_time_spent",
//       sectionId: sectionId,
//       timeSpent: timeSpent,
//       timestamp: new Date().toISOString()
//     };
//     transmitEvent(event);
//   });
// }
