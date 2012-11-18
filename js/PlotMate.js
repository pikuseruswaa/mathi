
window.PlotMate = "asfd";

// Array Remove function
Array.prototype.remove = function(e) {
  var t, _ref;
  if ((t = this.indexOf(e)) > -1) {
    return [].splice.apply(this, [t, t - t + 1].concat(_ref = []))
  }
  return null;
};

function log(msg){
  document.getElementById("log").innerHTML += msg + "\n";
  console.log(msg);
};

window.PlotMate = function PlotMate(config){
  self = this;
  self.config = config;
  var init = function(){
    self.stage = new Kinetic.Stage({
      container:      config.container,
      width:          config.width,
      height:         config.height
    });
    
    // Add layers
    self.eventLayer   = new Kinetic.Layer();
    self.gridLayer    = new Kinetic.Layer();
    self.layer    = new Kinetic.Layer();
    self.layer  = new Kinetic.Layer();
    self.stage.add(self.eventLayer);
    self.stage.add(self.gridLayer);
    self.stage.add(self.layer);
    self.stage.add(self.layer);
    
    // Create event background
    var background = new Kinetic.Rect({
      x:              0,
      y:              0,
      width:          config.width,
      height:         config.height,
      fill:           'white'
    });
    self.eventLayer.add(background);
    background.on('click', self.clickEventHandler);
    background.on('tap', self.tapEventHandler);
    
    self.anchors = [];
    self.line = null;
    self.layer.beforeDraw(self.updateLine);
    self.layer.beforeDraw(self.updateLine);
    
    self.stage.on('mouseout', function(){
      self.stage.draw();
    });
    
    self.drawGrid();
    self.stage.draw();
  };
  
  self.clickEventHandler = function(){
    self.addAnchor(self.stage.getMousePosition());
  };
  
  self.tapEventHandler = function(){
    self.addAnchor(self.stage.getTouchPosition());
  };
  
  self.addAnchor = function(pos){
    if(self.config.limit == 0)
      return;
    self.config.limit -= 1;
    pos = self.snapToGrid(pos);
    var anchor = new Kinetic.Circle({
      x:                    pos.x,
      y:                    pos.y,
      radius:               self.config.spacing  / 2,
      stoke:                "#777",
      fill:                 "#ddd",
      strokeWidth:          2,
      draggable:            true,
      dragBoundFunc:        self.snapToGrid
    });
    anchor.on('mouseover', function(){
      document.getElementById(self.config.container).style.cursor = 'pointer';
      this.setStrokeWidth(4);
      self.layer.draw();
    });
    anchor.on('mouseout', function(){
      if(self.config.limit == 0)
        document.getElementById(self.config.container).style.cursor = 'default';
      else
        document.getElementById(self.config.container).style.cursor = 'crosshair';
      this.setStrokeWidth(2);
      self.layer.draw();
    });
    anchor.on('dbltap', function(){
      self.anchors.remove(anchor);
      anchor.remove();
      self.stage.draw();
      anchor = null;
      self.config.limit += 1;
    });
    anchor.on('dblclick', function(){
      self.anchors.remove(anchor);
      anchor.remove();
      self.stage.draw();
      anchor = null;
      self.config.limit += 1;
    });
    self.anchors.push(anchor);
    self.layer.add(anchor);
    self.stage.draw();
  };
  
  self.labels = null;
  self.updateLine = function(){
    if(!self.line && self.anchors.length >= 2){
      self.line = new Kinetic.Line({
        strokeWidth:          3,
        stroke:               'black',
        lineCap:              'round',
        opacity:              0.5
      });
      self.layer.add(self.line);
    }
    if(self.line && self.anchors.length >= 2){
      var points = [];
      for(var i = 0; i < self.anchors.length; i++){
        points.push({
          x:          self.anchors[i].attrs.x,
          y:          self.anchors[i].attrs.y
        });
      }
      if(self.config.limit == 0){
        points.push({
          x:          self.anchors[0].attrs.x,
          y:          self.anchors[0].attrs.y
        });
        self.checkWin();
        if(document.getElementById(self.config.container).style.cursor == 'crosshair')
          document.getElementById(self.config.container).style.cursor = 'default';
        if(!self.labels){
          self.labels = [];
          for(var i = 0; i < self.anchors.length; i++){
            var label = new Kinetic.Text({
              text:         "",
              fontStyle:    "Bold",
              textFill:     "red",
              fontFamily:   "Arial",
              fontSize:     "22",
              x:            0,
              y:            0
            });
            self.labels.push(label);
            self.layer.add(label);
          }
        }
        var n = self.anchors.length;
        for(var i = 0; i < n; i++){
          var label = self.labels[i];
          var x0 = self.anchors[i].attrs.x;
          var y0 = self.anchors[i].attrs.y;
          var x1 = self.anchors[(i+1) % n].attrs.x;
          var y1 = self.anchors[(i+1) % n].attrs.y;
          var len = Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
          label.setText('' + Math.round(len * 10 / self.config.spacing) / 10);
          var d = 0;
          if(x0 > x1 && y0 > y1) d = 20;
          if(x0 < x1 && y0 < y1) d = 20;
          label.setX(x0 - (x0 - x1) / 2 - d);
          label.setY(y0 - (y0 - y1) / 2);
          if(self.winning){
            label.setTextFill('green');
          }else{
            label.setTextFill('red');
          }
        }
      }
      self.line.setPoints(points);
      self.line.moveToBottom();
    }
    if(self.line && self.anchors.length < 2){
      self.line.remove();
      self.line = null;
      document.getElementById(self.config.container).style.cursor = 'crosshair';
      if(self.labels){
        for(var i = 0; i < self.anchors.length; i++)
          self.labels[i].remove();
        self.labels = null;
      }
    }
  };
 
  self.computePerimeter = function(){
    var retval = 0;
    var n = self.anchors.length;
    for(var i = 0; i < n; i++){
      var x0 = self.anchors[i].attrs.x / self.config.spacing;
      var y0 = self.anchors[i].attrs.y / self.config.spacing;
      var x1 = self.anchors[(i+1) % n].attrs.x / self.config.spacing;
      var y1 = self.anchors[(i+1) % n].attrs.y / self.config.spacing;
      retval += Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
    }
    return retval;
  };
  
  self.winning = null;
  self.winImg = new Image();
  self.winImg.src = "images/check.png";
  self.checkWin = function(){
    var perimeter = self.computePerimeter();
    var lower = self.config.targetPerimeter - self.config.threshold;
    var upper = self.config.targetPerimeter + self.config.threshold;
    if(lower <= perimeter && perimeter <= upper){
      if(!self.winning){
        self.winning = new Kinetic.Image({
          image:  self.winImg,
          x:      (self.config.width - 250) / 2,
          y:      (self.config.height - 250) / 2,
          width:  250,
          height: 250
        });
        self.gridLayer.add(self.winning);
        self.gridLayer.draw();
      }
    }else if(self.winning){
      self.winning.remove();
      self.winning = null;
      self.gridLayer.draw();
    }
  };
  
  self.snapToGrid = function(pos){
    var x = Math.round(pos.x / config.spacing) * self.config.spacing;
    var y = Math.round(pos.y / config.spacing) * self.config.spacing;
    x = Math.max(x, self.config.spacing);
    y = Math.max(y, self.config.spacing);
    x = Math.min(x, self.config.width - self.config.spacing);
    y = Math.min(y, self.config.height - self.config.spacing);
    return {x: x, y: y};
  };
  
  self.drawGrid = function() {
    var width = self.config.width;
    var height = self.config.height;
    var spacing = self.config.spacing;
    
    // Some variables
    var verticalSpacing = Math.floor(width / spacing);
    var verticalCenter = Math.floor(verticalSpacing / 2);
    var horizontalSpacing = Math.floor(height / spacing);
    var horizontalCenter = Math.floor(horizontalSpacing / 2);

    var lineOpacity;
    var lineDash;

    function drawLines(bounds, max, orientation) {
      var args = {
        stroke: "black",
          strokeWidth: 1,
      }

      for(var i = 1; i <= bounds.spacing; i++) {
        if(i == bounds.center) {
          args.opacity = 1;
          delete args.dashArray;
        } else {
          args.opacity = 0.2;
          args.dashArray = [5, 5]
        }
        args.points = (orientation == "vertical" ? [i*spacing, 0, i*spacing, max] : [0, i*spacing, max, i*spacing]); 
        var line = new Kinetic.Line(args);
        line.on('click', self.clickEventHandler);
        line.on('tap', self.tapEventHandler);
        self.gridLayer.add(line);
        
        var text = new Kinetic.Text({
          text:         "" + (orientation == "vertical" ? i - bounds.center : bounds.center - i),
          textFill:     "black",
          fontFamily:   "Arial",
          x:            (orientation == "vertical" ? i*spacing : max / 2) + 3,
          y:            (orientation == "vertical" ? max / 2 : i*spacing) + 3
        });
        text.on('click', self.clickEventHandler);
        text.on('tap', self.tapEventHandler);
        self.gridLayer.add(text);
      }
    }

    drawLines({
      spacing:    verticalSpacing,
      center:     verticalCenter
    }, height, "vertical");
    
    drawLines({
      spacing:    horizontalSpacing,
      center:     horizontalCenter
    }, width, "horizontal");
  }
  
  init();
}


