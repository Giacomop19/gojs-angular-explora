import { FlowModel, FlowVariant,  } from "../model/flow.model";
import { FlowData, Case} from "../model/flow-data.model";
import { Injectable } from "@angular/core";
import { HttpClient} from "@angular/common/http"
import { Observable, of, pipe } from "rxjs";
import * as flowData from '../data/data.json'
import * as flowDataAnimation1 from '../data/dataProcessFlowAnimation1.json'
import { Link } from "gojs";
import { BackendService } from "./backend.service";
import * as flowDataAnimatioCut from '../data/processFlowAnimationCut.json'

@Injectable({
    providedIn: 'root'
   })

export class FlowService {
    data = flowData
    dataAnimation = flowDataAnimation1
    flow =[]
    dataCut = flowDataAnimatioCut
    

    constructor(private http: HttpClient, private backendSrv:BackendService) {}

    getData(): Observable<FlowModel>{
        return of<FlowModel>(this.data)  
    }

    sortData(index: number, res: any){
        this.flow[index-1] = res
    }

    processFlowAnimation1(){
        return of(this.dataAnimation)
    }

    processFlowAnimation12(ft,tt,benchmarckIndex){
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.backendSrv.auth_token}`
          })
        return this.http.get(this.backendSrv.baseURL + '/exploradata/explora-data/api/v3.0/datasources/' + 554 + '/flows/processAnimation1?fromTime=' + ft + '&toTime=' + tt + '&benchmarkIndex=' + benchmarckIndex)
    }

    processFlowAnimation123(){
        return of(this.dataCut)
    }

   


}
