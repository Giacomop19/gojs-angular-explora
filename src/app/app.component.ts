import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as go from 'gojs';
import { DataSyncService, DiagramComponent, PaletteComponent } from 'gojs-angular';
import produce from "immer";
import { FlowService } from './service/flow.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{

  processFlow: any;
  chartDiv: string
  orientationValue: number = 90
  id
  minWeight: any
  maxWeight: any
  arrayTest:any[] = [1,2,3,4,5]
  buffer 

  //variables for html components values
  positionValuePaused: any
  @ViewChild('positionValueDiv') positionValueDiv;

  //utils
  framepersec = 30;
  bufsec = 2 * 60;  // buffer da 2 minuti
  bufframesize = this.framepersec * this.bufsec;
  //dateTimePicker -> parametro di confronto [giornaliero,orario] per filtrare endTime - startTime di CaseId


  /*
  clockPicker: any [] = [1,2,3,4,5,6]

  filtering () => (a : clockPicker, a = resultApi.caseId.{positions})
  
  */

  constructor(private flowService: FlowService){}

  ngOnInit(): void {
    this.chartDiv = "processFlow"
    
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
        console.log(flowData)
        console.log("array" , flowData.caseFlow["nodeDataArray"])
        this.processFlow.model = go.Model.fromJson(flowData.caseFlow)
        console.log(this.processFlow.model)
        this.minWeight = flowData.minWeight;
        this.maxWeight = flowData.maxWeight;

        // this.flowService.sortData(1, 'data', flowData); 
    })
  }
  //PLAYDATA
  playData(){

    if (this.positionValuePaused != parseInt(this.positionValueDiv.nativeElement.value)) {
      this.buffer[0] = {
        startTime: parseInt(this.positionValueDiv.nativeElement.value),
        endTime: parseInt(this.positionValueDiv.nativeElement.value) + parseInt(this.positionValueDiv.nativeElement.step) * this.bufframesize,
        datiAnimazione: null
      };
      this.buffer[1] = null;
      
    this.loadFlowAnimation()
    console.log("playing flow")
    }else{
      console.log("not playing data")
    }
  }
  //STOPDATA
  stopData(){
    console.log("stopping flow")
  }
  //PAUSEDATA
  pauseData(){
    console.log("pausing flow")
  }

  //BUILDING THE FLOW PROCESS
  loadFlowAnimation(){

    //if di controllo

    const loadProcessAnim = () => {
      this.flowService.processFlowAnimation1().subscribe(
        (succ) => {
          this.buffer = succ
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


}

  

