import { FlowModel, FlowVariant,  } from "../model/flow.model";
import { Injectable } from "@angular/core";
import { HttpClient} from "@angular/common/http"
import { Observable, of } from "rxjs";
import * as flowData from '../data/data.json'
import * as flowDataAnimation1 from '../data/dataProcessFlowAnimation1.json'

@Injectable({
    providedIn: 'root'
   })

export class FlowService {
    data = flowData
    dataAnimation = flowDataAnimation1
    flow =[] 

    constructor(private http: HttpClient) {}

    getData(): Observable<FlowModel>{
        return of<FlowModel>(this.data)
        
    }

    sortData(index: number, type: string, res: any){
        this.flow[index-1][type] = res
        console.log(this.flow)
    }

    processFlowAnimation1(){
        return of (this.dataAnimation)
      }


}
