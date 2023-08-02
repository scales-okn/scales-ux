import { ResponseManager } from "./ResponseManager";
import { PlanManager } from "./PlanManager";

class Satyrn {
  constructor(targetEntity, operations, analysisSpace, primaryRing) {
    this.targetEntity = targetEntity;
    this.operations = operations;
    this.analysisSpace = analysisSpace;
    this.primaryRing = primaryRing;
    this.planManager = new PlanManager(
      targetEntity,
      operations,
      analysisSpace,
      primaryRing,
    );
    this.responseManager = new ResponseManager(
      this.planManager,
      this.analysisSpace,
    );
  }
}

export { Satyrn };
