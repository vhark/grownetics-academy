import ceaControl from "../modules/cea-control/module.js";
import climateDesign from "../modules/climate-design/module.js";

// Status controls availability; hidden drafts appear only in preview mode.
export const modules = [ceaControl, climateDesign];

export const legacyProgressModuleId = ceaControl.id;
