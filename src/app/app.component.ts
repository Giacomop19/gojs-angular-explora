import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation, ɵflushModuleScopingQueueAsMuchAsPossible } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as go from 'gojs';
import { DataSyncService, DiagramComponent, PaletteComponent } from 'gojs-angular';
import produce from "immer";
import { FlowService } from './service/flow.service';
import { Case, FlowData,Link,Node,Tick } from './model/flow-data.model';
import { delayWhen, filter, groupBy, map, pipe, toArray } from 'rxjs';






@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{
  //CORE VIEWS
  flow
  processFlow: any;
  chartDiv: string
  orientationValue: number = 90
  id
  minWeight: any
  maxWeight: any
  arrayTest:any[] = [1,2,3,4,5]
  buffer 
  linkDataArrayQueue : any [] = []
  nodeDataArrayQueue : any [] = []
  timeSelectValue: any
  lastts: any = null

  //SUPPORT VIEWS
  currentTime : number

  //MODEL CLASSES
  FlowData = new FlowData 
  //TICKS = (MAXTIME - MINTIME) / SPEED = range
  Nodes : Node[] = []
  Links : Link[] = []
  Cases : Case[]
  
  //HTML VIEWS FOR COMPONENTS VALUES
  positionValuePaused: any
  @ViewChild('positionValueDiv') positionValueDiv;
  @ViewChild('speedValueDiv') speedValueDiv;
  @Input() isFlow = true
  @Input() benchmarkIndex: number = 1;

  //UTILS
  delta : number = 20 //numero di tick a velocità speed di preBuffering
  framepersec = 30;
  bufsec = 2 * 60;  // buffer da 2 minuti
  bufframesize = this.framepersec * this.bufsec;
  timeSelected
  timeSelectOptions = [
    { value: '30', label: '30s' },
    { value: '60', label: '1m' },
    { value: '900', label: '15m' },
    { value: '1800', label: '30m' },
    { value: '2700', label: '45m' },
    { value: '3600', label: '1h' },
    { value: '7200', label: '2h' },
    { value: '10800', label: '3h' },
    { value: '14400', label: '4h' },
    { value: '18000', label: '5h' },
    { value: '21600', label: '6h' },
    { value: '28800', label: '8h' },
    { value: '36000', label: '10h' },
    { value: '43200', label: '12h' },
    { value: '54000', label: '15h' },
    { value: '57600', label: '16h' },
    { value: '64800', label: '18h' },
    { value: '72000', label: '20h' },
    { value: '86400', label: '1d' },
    { value: '172800', label: '2d' },
    { value: '259200', label: '3d' },
    { value: '345600', label: '4d' },
    { value: '432000', label: '5d' },
    { value: '518400', label: '6d' },
    { value: '604800', label: '1w' },
    { value: '1209600', label: '2w' },
    { value: '1814400', label: '3w' },
    { value: '2419200', label: '4w' },
  ];

  //main loop
  //timebase = speed -> cambia a seconda dello speed impostato dall'utente
  timeBase = null
  mainLoop = (this.delta * this.timeBase)
  //dateTimePicker -> parametro di confronto [giornaliero,orario] per filtrare endTime - startTime di CaseId


  /*
  86400000 = milliseconds in a day
  clockPicker: any [] = [1,2,3,4,5,6]

  filtering () => (a : clockPicker, a = resultApi.caseId.{positions})

  //onInit()->
  preBuffer(){ ragiona in base allo stato, esempio, quando si esce dal component in pausa fa una request non al server 
                ma allo state, che dovrà avere la positionStamp memorizzata insieme a tutta la struttura dati
    setInterval(() => {
                  this.preBuffer(); 
                  },30000 ); //each 30 secs 
  }
  
  
  */

  constructor(private flowService: FlowService){}

  ngOnInit(): void {
    this.chartDiv = "processFlow"
    console.log("flow.flowService", this.flowService.flow);
    // console.log(this.positionValueDiv.nativeElement)
    this.flow = this.flowService.flow;
    console.log("flow" , this.flow) 
    let times = new Date(1655597361 * 1000)
    let times2 = new Date(1656845252 * 1000)
  }

  ngAfterViewInit(): void{
   
    go.Diagram.licenseKey = "73f042e0b71c28c702d90776423d6bf919a52a60cf8519a35a0447f7e808381c279de87154d7d9c6d5f948fa4a7bc28adfc03b3b874a0268b231848f46b6d6ffbb377abb100c4787f40773c5c9fa7aa6fd7a78a2cbb122f7d97b88f5b9a190c95dedfa874ace0abb2a795661042ea658a7fd8c2bff029e1f6a7f88a4fbe9a756f97372";
    
    //HERE STARTS THE COMPOSITION OF THE DIAGRAM
    //defining the diagram
    var $ = go.GraphObject.make;
    this.processFlow = $(go.Diagram, this.chartDiv,{
      initialAutoScale: go.Diagram.Uniform,
      contentAlignment: go.Spot.Center,
      layout: $(go.LayeredDigraphLayout,
        {
          direction: this.orientationValue,
          setsPortSpots: false,
        })
    })
    this.processFlow.isReadOnly = true
    this.processFlow.animationManager.isEnabled = false

    //defining node's template (ATTIVITA')
    this.processFlow.nodeTemplate = $(go.Node, "Spot",
      $(go.Shape,"RoundedRectangle", {
          fill: "rgb(255,199,0)",
          stroke: null,
          width: 170,
          height: 50
          },
          new go.Binding("fill", "color")
        ),    
        $(go.TextBlock,{
          font: "bold 14px Helvetica",
          alignment: new go.Spot(0.5, 0.2),
          alignmentFocus: go.Spot.Top,
          overflow: go.TextBlock.OverflowEllipsis,
          maxLines: 1,
          wrap: go.TextBlock.None,
          maxSize: new go.Size(160, NaN),
        },
        new go.Binding("text", "key")
        )
    );
    this.processFlow.linkTemplate = $(go.Link, {
        reshapable: true,
        routing: go.Link.None,
        curve: go.Link.Bezier
      },
      $(go.Shape, {
        stroke: "black"
        },
        new go.Binding("strokeWidth", "width")
      ),
    )

    this.processFlow.nodeTemplateMap.add("start",
      $(go.Node, "Auto", {
          selectionAdorned: false,
        },
        $(go.Shape, "Ellipse", {
            fill: "white",
            width: 100,
            height: 50
          }
        ),
        $(go.TextBlock, {
            font: "bold 14px Helvetica",
            overflow: go.TextBlock.OverflowEllipsis,
            maxLines: 1,
            wrap: go.TextBlock.None,
            maxSize: new go.Size(90, NaN),
            margin: 5,
            stroke: "green"
          },
          new go.Binding("text", "key")
        )
      )
    );
    this.processFlow.nodeTemplateMap.add("stop",
      $(go.Node, "Auto", {
          selectionAdorned: false,
        },
        $(go.Shape, "Ellipse", {
            fill: "white",
            width: 100,
            height: 50
          }
        ),
        $(go.TextBlock, {
            font: "bold 14px Helvetica",
            overflow: go.TextBlock.OverflowEllipsis,
            maxLines: 1,
            wrap: go.TextBlock.None,
            maxSize: new go.Size(90, NaN),
            margin: 5,
            stroke: "red"
          },
          new go.Binding("text", "key")
        )
      )
    );
    this.processFlow.addDiagramListener("SelectionMoved", (e: any) => {
        // this.drawAnimation();
    });
    this.processFlow.addDiagramListener("LinkReshaped", (e: any) => {
        // this.drawAnimation();
    });
    // this.processFlow.addDiagramListener("ObjectDoubleClicked", (e: any) => {
    //   if (isNaN(this.id)) {
    //     var part = e.subject.part;
    //     if (part instanceof go.Node) {
    //       this.showNodeInfo(part.data.keyHash);
    //       console.log(part.data);

    //     } else if (part instanceof go.Link) {
    //       this.showLinkInfo(part.fromNode.data.keyHash, part.toNode.data.keyHash);
    //       console.log(part.fromNode, part.toNode);
          
    //     } else if (part.data.category == "token") {
    //       this.showTokenInfo(part.data.keyHash);
    //     }
    //   }
    // });

    this.loadFlowData()
  }

  

  //LOADING THE DATA FROM SERVICE
  loadFlowData(){
    this.flowService.getData().subscribe(
      (succ) =>{
        let flowData = succ
        // console.log("array" , flowData.caseFlow["nodeDataArray"])
        this.processFlow.model = go.Model.fromJson(flowData.caseFlow)
        
        // console.log(this.processFlow.model)
        this.minWeight = flowData.minWeight;
        this.maxWeight = flowData.maxWeight;
        this.positionValueDiv.nativeElement.min = flowData.minStartTime;
        this.positionValueDiv.nativeElement.max = flowData.maxEndTime;
        console.log("minStartTime", flowData.minStartTime,"maxEndTime", flowData.maxEndTime)
        this.speedValueDiv.value = flowData.initialStep;

        this.FlowData.ticks = []      

        
        //building TICK STRUCTURE
        //NODE STRUCTURE
        //LINK STRUCTURE
        // this.Nodes.length = flowData.caseFlow.nodeDataArray.length
        // this.Links.length = flowData.caseFlow.linkDataArray.length
        // this.Nodes[].cases.push(this.Cases)
        // console.log(this.Nodes)
        // this.Nodes[0].cases = this.Cases
        // console.log(this.Nodes)
       
        // this.FlowData.ticks[0].nodes.push(this.Nodes)
        //setting speed/step values
        
        this.timeSelectValue = new FormControl(this.speedValueDiv.value);
        this.positionValueDiv.nativeElement.step = parseInt(this.timeSelected) / this.framepersec;
        if(this.isFlow){
          this.flowService.sortData(this.benchmarkIndex, flowData); 
        }
        let fromTime = parseInt(this.positionValueDiv.nativeElement.min)
        let toTime = fromTime + (this.delta * this.timeSelectValue.value)
        console.log("fromTime", fromTime, "toTime", toTime)
        if(this.initializingTicks)
        this.preBuffer(fromTime, toTime)
    })
  }

  initializingTicks(speed){
    
  }
  //parametri fromTime-toTime-benchmarckIndex)
  //preBuffer(ft,tt){
    //passo ft,tt e benchmarkIndex
    // this.flowService.processFlowAnimation12(ft,tt,this.benchmarkIndex).subscribe(
    //   (succ)=>{
    //     let data = succ
    //     console.log("RESULT OF DATA PREBUFFERED",data)
    //   },
    //   (err) =>{
    //     console.log("err")
    //   }
    //   )
  preBuffer(ft: number,tt: number){
    this.flowService.processFlowAnimation123().subscribe(
        (succ) => {
          //get FlowData
          let buffSuccData:any = succ
          let isLastPosition = false
          console.log("1ST PREBUFFER CALL",buffSuccData)
          //build the range of the whole buffer
          let range = (tt-ft) / this.timeSelectValue.value
          let minFromStart = null
          while(!isLastPosition){
            minFromStart = minFromStart == null ? minFromStart = ft : minFromStart += range
            let filterFirstTick : Case[] = buffSuccData.cases.map(c => c.positions.filter(p => p.startTime >= minFromStart && p.endTime <= minFromStart+range).map(p1 =>({
              caseId : c.caseId,
              variantId : c.variantId,
              color : c.color,
              startTime : p1.startTime,
              endTime: p1.endTime,
              isNode : p1.to == null ? true : false,
              from : p1.from,
              to : p1.to
            }))).filter(c1 =>c1.length>0).reduce((a,b) => a.concat(b))
            console.log("FILTER 1ST TICK",filterFirstTick) 
            let nodi = filterFirstTick.filter(f1=>f1.isNode).reduce((a,b) =>{
              (a[b.from]=a[b.from]||[]).push(b);
               return a
              },{});
            console.log("nodi raggruppati",nodi)
            let link = filterFirstTick.filter(f1=>!f1.isNode)
            let objectLink = link.map(l=>({
              index : l.from + " " + l.to,
              case : []
            }))
            
            // console.log(link)
            let linkGrouped = objectLink.filter(this.onlyUnique)
            console.log("link raggruppati",linkGrouped)

            let nodeN : Node[] = []
            let linkL : Link[] = []
            
            Object.keys(nodi).forEach(key => {
              nodeN.push(nodi[key])             
            });
            this.Nodes = this.Nodes.concat(nodeN)


            // for(let node in n){

            // }
            // for(let c in filterFirstTick){
            //   // console.log(filterFirstTick[c].isNode)
            //   if(filterFirstTick[c].isNode){

            //     //suddivido in base al from, se ci sono duplicati faccio primo ciclo, 
            //     let count = 0
            //     nodeN.find(x=>(x!=null && count++))
            //     console.log(count)
            //     // console.log(numberOfElem)
            //     caseC.push(filterFirstTick[c])
            //     console.log("caseC",caseC)
            //     nodeN[count].cases = caseC
            //     // this.FlowData.ticks[count].push(filterFirstTick[c])
            //     // console.log("NODES",this.Nodes)
            //   }else{
            //     // this.Links.cases.push(filterFirstTick[c])
            //     // console.log("LINKS",this.Links)
            //   }

            // }


            // this.Nodes = nodeN
            console.log("NODES",this.Nodes)
            
            isLastPosition = true
          }
        },
        (err)=>{}
        )
  }
  
  //PLAYDATA
  playData(){
    this.currentTime = parseInt(this.positionValueDiv.nativeElement.value) + parseInt(this.speedValueDiv.value)
    this.FlowData[0].start = this.currentTime
    console.log(this.FlowData)
    // this.FlowData.ticks.push(this.Ticks)
    // console.log(this.loadingFlow)
    // console.log("currentTime", this.currentTime)

    // if (this.positionValuePaused != parseInt(this.positionValueDiv.nativeElement.value)) {
    //   this.buffer[0] = {
    //     startTime: parseInt(this.positionValueDiv.nativeElement.value),
    //     endTime: parseInt(this.positionValueDiv.nativeElement.value) + parseInt(this.positionValueDiv.nativeElement.step) * this.bufframesize,
    //     datiAnimazione: null
    //   };
    //   this.buffer[1] = null;
      
    // this.loadFlowAnimation()
    // console.log("playing flow")
    // }else{
    //   console.log("not playing data")
    // }

    //checking the actual position and updates it by actualPosition = positionPaused + speed

    if(true){
      this.getUpdatedPosition()
    }
    this.loadFlowAnimation(0);
    
  }
  //returns the position updated by pausing or leaving the window.focus()
  getUpdatedPosition(){
    this.positionValueDiv.nativeElement.value = this.positionValuePaused + this.speedValueDiv
      console.log(this.positionValueDiv)
  }

  //STOPDATA
  stopData(){
    console.log("stopping flow")
  }
  //PAUSEDATA
  pauseData(){
    this.positionValuePaused = parseInt(this.positionValueDiv.nativeElement.value)
    console.log(this.positionValuePaused)
    console.log("pausing flow")
  }

  //BUILDING THE FLOW PROCESS
  loadFlowAnimation(bufnum){

    //if di controllo

    const loadProcessAnim = () => {
      let x
      this.flowService.processFlowAnimation1().subscribe(
        (succ) => {
          let data = succ.cases
          x = data.map(cs => cs.positions.filter(ps => ps.to == null).map(ps => ({
            caseId : cs.caseId,
            dateTo : ps.to,
            dateFrom : ps.from,
            startTime : ps.startTime,
            endTime : ps.endTime
          })))
          console.log(x)
          this.drawAnimation()
      })
    }
    loadProcessAnim()
  }

  //BUILDING THE FLOW ANIMATION
  drawAnimation(){

  }

  //MODALS
  showNodeInfo(act: any) {
    // this.showLoadingSpinner(true);
    // this.disableButtons();

    //const loadProcessFlow = () => {
      // this.flowService.processFlowNode(act, this.benchmarkIndex).subscribe(
      //   (succ) => {
      //     let activityInfo;
      //     activityInfo = succ;
      //     activityInfo.t = this.secondToTime(activityInfo.t);
      //     activityInfo.maxd = this.secondToTime(activityInfo.maxd);
      //     activityInfo.mind = this.secondToTime(activityInfo.mind);
          
      //      if (activityInfo != null) {
      //       this.modalActivity = this.actvModalService.open(ActivityModalComponent, {
      //         data: {
      //           actvName: activityInfo.cls,
      //           actvFreq: activityInfo.freq,
      //           actvT: activityInfo.t,
      //           actvMaxc: activityInfo.maxc,
      //           actvMaxd: activityInfo.maxd,
      //           actvMaxt: activityInfo.maxt,
      //           actvMinc: activityInfo.minc,
      //           actvMind: activityInfo.mind,
      //           actvMint: activityInfo.mint
      //         }
      //       });
            
      //       this.showLoadingSpinner(false);
      //       this.disableButtons();           
      //     }      
      //   },
      //   (err) => {
      //     console.log(err);
      //   }
      // );
    //}
    //loadProcessFlow();
  }

  speedChangedSelection(time?: string) {
    console.log("time", time)
    this.timeSelected = time
    this.speedChanged();
  }

  speedChanged() {
    if (isNaN(this.id)) {
      this.lastts = null;
      this.positionValueDiv.nativeElement.step = parseInt(this.timeSelected) / this.framepersec;
      console.log("timeSelected/Frame(30) =", this.positionValueDiv.nativeElement.step)
    }
    
    // initial step setup
    //if(isNaN(this.positionValueDiv.nativeElement.step)){
    /*if(!this.flow.isDataPreloaded){
      this.timeSelected = '43200';
      this.timeSelectValue = new FormControl(this.timeSelected);
      this.positionValueDiv.nativeElement.step = parseInt(this.timeSelected) / this.framepersec;
    }*/
    
    this.saveValues();
  }

  positionChanged(){
    // this.positionValueDiv.nativeElement.value = parseInt(this.timeSelected) / this.framepersec;
    console.log("actualPositionChanged",this.positionValueDiv.nativeElement.value)
    this.speedChanged()
  }

  stepForward() {
    
      var p = parseInt(this.positionValueDiv.nativeElement.value);
      this.positionValueDiv.nativeElement.value = parseInt(this.positionValueDiv.nativeElement.value) + parseInt(this.positionValueDiv.nativeElement.step);
      if (parseInt(this.positionValueDiv.nativeElement.value) == p)
        this.positionValueDiv.nativeElement.value = parseInt(this.positionValueDiv.nativeElement.max);
      // this.printDate();
      //expected changes on animation
      this.drawAnimation();
    
    this.saveValues();
  }

  stepBack() {
   
      this.positionValueDiv.nativeElement.value = parseInt(this.positionValueDiv.nativeElement.value) - parseInt(this.positionValueDiv.nativeElement.step);
      if (parseInt(this.positionValueDiv.nativeElement.value) <= 0)
        this.positionValueDiv.nativeElement.value = parseInt(this.positionValueDiv.nativeElement.min);
      // this.printDate();
      //expected changes on animation
      this.drawAnimation();
    
    this.saveValues();
  }

  saveValues(){
    console.log("positionValue",this.flow.positionValue)
    this.flow.positionValue = parseInt(this.positionValueDiv.nativeElement.value);
    this.flow.speedValue = parseInt(this.speedValueDiv.value);
    this.flow.stepValue = parseInt(this.timeSelected) / this.framepersec;
    console.log(this.flow)
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

}

  

