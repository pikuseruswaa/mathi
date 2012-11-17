
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
    
    self.stage.draw();
  };
  
  self.clickEventHandler = function(){
    self.addAnchor(self.stage.getMousePosition());
  };
  
  self.tapEventHandler = function(){
    self.addAnchor(self.stage.getTouchPosition());
  };
  
  self.addAnchor = function(pos){
    var anchor = new Kinetic.Circle({
      x:                    pos.x,
      y:                    pos.y,
      radius:               20,
      stoke:                "#777",
      fill:                 "#ddd",
      strokeWidth:          2,
      draggable:            true
    });
    anchor.on('mouseover', function(){
      document.body.style.cursor = 'pointer';
      this.setStrokeWidth(4);
      self.layer.draw();
    });
    anchor.on('mouseout', function(){
      document.body.style.cursor = 'default';
      this.setStrokeWidth(4);
      self.layer.draw();
    });
    anchor.on('dbltap', function(){
      self.anchors.remove(anchor);
      anchor.remove();
      self.stage.draw();
      anchor = null;
    });
    anchor.on('dblclick', function(){
      self.anchors.remove(anchor);
      anchor.remove();
      self.stage.draw();
      anchor = null;
    });
    self.anchors.push(anchor);
    self.layer.add(anchor);
    self.stage.draw();
  };
  
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
      self.line.setPoints(points);
      self.line.moveToBottom();
    }
    if(self.line && self.anchors.length < 2){
      self.layer.remove(self.line);
      self.line = null;
    }
  };
  
  init();
}


