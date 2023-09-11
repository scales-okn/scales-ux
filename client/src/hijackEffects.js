import { hijackEffects } from "stop-runaway-react-effects";

if (import.meta.env.MODE === "development") {
  hijackEffects();
}
