import { transmitEvent } from "../trackingBatch.js";
import { ButtonClickCapturedEvent, SMPEvent } from "./../types/SMPServicesEventType.js";
import { createSMPEvent } from "./index.js"; // TODO move to the right place ...

export function trackButtonClick(elementId: string) {
  const button = document.getElementById(elementId);
  if (button) {
    button.addEventListener('click', () => {
      const buttonElement: ButtonClickCapturedEvent = {
        elementId: elementId, 
        timestamp: new Date().toISOString(),
      };
      const event: SMPEvent = createSMPEvent("click", buttonElement);
      transmitEvent(event);
    });
  }
}
