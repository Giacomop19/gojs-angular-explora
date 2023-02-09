export class FlowData {
  public ticks ?: Tick[]
}

export class Tick{
  public nodes ?: Node[]
  public links ?: Link[]
  public start ?: number
  public end ?: number
}

export class Node{
  public cases ?: Case[]
  public numVerdi
  public numGialli
  public numRossi
  public alias
  public from
}

export class Link{
  public cases ?: Case[]
  public numVerdi
  public numGialli
  public numRossi
  public from
  public to
}

export class Case{
  public caseId ?: number
  public variantId ?: number
  public color ?: number
  public startTime ?: any
  public endTime ?: any
  public isNode ?: boolean
  public from ?: any
  public to ?: any
}
  