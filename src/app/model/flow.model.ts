export class FlowModel {
    caseFlow: Object;
    initialStep: number;
    maxEndTime: number;
    maxWeight: number;
    minStartTime: number;
    minWeight: number;
  }
  
  export class FlowVariant {
    success: boolean;
    output: object;
  }
  
  export class FlowLinkModel {
    from: any;
    to: any;
    duration: any;
    freq: any;
  }
  
  export class FlowTokenModel {
    caseId: number;
    variant: number;
    st: any;
    ed: any;
    d: any;
    ne: number;
  }
  