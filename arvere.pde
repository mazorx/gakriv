float len;
branch b;
float angle;

void setup(){
  size(800,600);
  angle = random(1)>0.5? random(7.5*PI/4,8*PI/4) : random(0,0.5*PI/4);
  len = random(80,130);
  b = new branch(len);
  background(255);
  stroke(25);
}

void draw(){
  frameRate(30);
  translate(400,600);
  rotate(angle);
  b.update();
}

void keyPressed(){
  if(keyCode==ENTER | key==' '){
    size(800,600);
    angle = random(1)>0.5? random(7.5*PI/4,8*PI/4) : random(0,0.5*PI/4);
    len = random(80,130);
    b = new branch(len);
    background(255);
    stroke(25);
  }
}

class branch{
  float speed = 30;
  float y;
  float w;
  float len;
  int separations;
  branch[] brancho;
  float[] angle;
  float[] breakpoint;
  boolean done;
  boolean finished;
  boolean lastone;
  
  branch(float len){
    separations = int(random(2,6));
    angle = new float[separations];
    breakpoint = new float[separations];
    brancho = new branch[separations];
    for(int i = 0; i < separations; i++){
      angle[i] = random(1)>0.5? random(6*PI/4,8*PI/4) : random(0,2*PI/4);
    }
    done = false;
    finished = false;
    lastone = false;
    this.len = len;
    y = 0;
    w = len/8 < 1? 1 : len/8;
    line(0,y,w,-len/5);
    
    if(len > 7){
      for (int i = 0; i < separations; i++){
        breakpoint[i] = random(len*0.4, len*0.9);
        brancho[i] = new branch(breakpoint[i]);
      }
    }else{
      separations=0;
      lastone = true;
    }
  }
  
  boolean getFinished(){
    return finished;
  }
  
  boolean getLastOne(){
    return lastone;
  }
  
  boolean getDone(){
    return done;
  }
  
  void update(){
    strokeWeight(w);
    if(-y > len - len/speed & !done){
      line(0,y,0,-len);
      y = -len;
      done = true;
      if(lastone){
        finished = true;
      }
    }else if (!done){
      line(0,y,0,y-len/speed);
      y-= len/speed;
    }
    
    for(int i = 0; i < separations; i++){
      if (-y >= breakpoint[i]){
        pushMatrix();
        translate(0,-breakpoint[i]);
        rotate(angle[i]);
        brancho[i].update();
        popMatrix();
      }
    }
  }
}
