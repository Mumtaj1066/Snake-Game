var Snake = (function () {

  const SIZE = 400;
  const TILE = 40;
  const COUNT = 10;

  var canvas, ctx, loop=null;
  var snake=[], dir={x:0,y:0}, food;
  var score=0, speed=4;
  var started=false, paused=false, gameOver=false;
  var particles=[];
  var audio=null;
  var restartTimer=5;
  var restartInterval=null;

  // 🔔 HAPTIC
  function vibrate(ms=30){
    if(navigator.vibrate) navigator.vibrate(ms);
  }

  function beep(f,t){
    if(!audio) audio=new(window.AudioContext||window.webkitAudioContext)();
    let o=audio.createOscillator(),g=audio.createGain();
    o.frequency.value=f; g.gain.value=.1;
    o.connect(g); g.connect(audio.destination);
    o.start(); o.stop(audio.currentTime+t);
  }

  function setup(){
    canvas=document.getElementById("gc");
    ctx=canvas.getContext("2d");
    drawIdle();
    document.addEventListener("keydown",keys);
  }

  function startGame(){
    vibrate(40);
    if(started) return;
    started=true;
    reset();
  }

  function togglePause(){
    vibrate(30);
    if(!started||gameOver)return;
    paused=!paused;
  }

  function reset(){
    clearInterval(loop);
    clearInterval(restartInterval);

    snake=[
      {x:5,y:5},
      {x:4,y:5},
      {x:3,y:5}
    ];

    dir={x:1,y:0};
    score=0;
    speed=4;
    gameOver=false;
    paused=false;
    particles=[];
    restartTimer=5;
    spawnFood();
    loop=setInterval(update,1000/speed);
  }

  function spawnFood(){
    food={x:Math.floor(Math.random()*COUNT),y:Math.floor(Math.random()*COUNT)};
  }

  function keys(e){
    if([32,37,38,39,40].includes(e.keyCode)) e.preventDefault();

    if(e.keyCode===32){
      vibrate(40);
      if(!started) startGame();
      else if(gameOver) reset();
    }

    if(paused||gameOver)return;

    if(e.keyCode===37&&dir.x!==1)dir={x:-1,y:0};
    if(e.keyCode===38&&dir.y!==1)dir={x:0,y:-1};
    if(e.keyCode===39&&dir.x!==-1)dir={x:1,y:0};
    if(e.keyCode===40&&dir.y!==-1)dir={x:0,y:1};
  }

  function explode(x,y){
    for(let i=0;i<25;i++)
      particles.push({
        x:x*TILE+20,
        y:y*TILE+20,
        vx:(Math.random()-.5)*6,
        vy:(Math.random()-.5)*6,
        life:40
      });
  }

  function drawParticles(){
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.life--;
      ctx.fillStyle="lime";
      ctx.fillRect(p.x,p.y,4,4);
    });
    particles=particles.filter(p=>p.life>0);
  }

  function update(){

    ctx.fillStyle="#111";
    ctx.fillRect(0,0,SIZE,SIZE);

    if(paused){
      drawText("PAUSED");
      return;
    }

    if(gameOver){
      drawGameOver();
      drawParticles();
      return;
    }

    let head={
      x:(snake[0].x+dir.x+COUNT)%COUNT,
      y:(snake[0].y+dir.y+COUNT)%COUNT
    };

    for(let s of snake)
      if(s.x===head.x&&s.y===head.y){die();return;}

    snake.unshift(head);

    if(head.x===food.x&&head.y===food.y){
      score++;
      vibrate(25);           // food haptic
      beep(700,.1);

      if(score%3===0){
        speed++;
        clearInterval(loop);
        loop=setInterval(update,1000/speed);
      }
      spawnFood();
    } else snake.pop();

    ctx.fillStyle="lime";
    snake.forEach(s=>ctx.fillRect(s.x*TILE,s.y*TILE,38,38));

    ctx.fillStyle="red";
    ctx.fillRect(food.x*TILE,food.y*TILE,38,38);

    ctx.fillStyle="white";
    ctx.font="16px Arial";
    ctx.textAlign="left";
    ctx.fillText("Score: "+score,10,20);
    ctx.fillText("Speed: "+speed,10,40);
  }

  function die(){
    vibrate([100,50,100]);   // GAME OVER haptic
    gameOver=true;
    explode(snake[0].x,snake[0].y);
    beep(150,.5);

    restartInterval=setInterval(()=>{
      restartTimer--;
      if(restartTimer<=0){
        clearInterval(restartInterval);
        reset();
      }
    },1000);
  }

  function drawGameOver(){
    ctx.fillStyle="rgba(0,0,0,.6)";
    ctx.fillRect(0,0,SIZE,SIZE);
    drawText("GAME OVER\nRestart in "+restartTimer);
  }

  function drawIdle(){
    ctx.fillStyle="#111";
    ctx.fillRect(0,0,SIZE,SIZE);
    drawText("PRESS SPACE\nOR START");
  }

  function drawText(t){
    ctx.fillStyle="white";
    ctx.textAlign="center";
    ctx.font="24px Arial";
    t.split("\n").forEach((l,i)=>ctx.fillText(l,200,180+i*30));
  }

  return{
    start(){setup();},
    startGame(){startGame();},
    togglePause(){togglePause();},
    action(d){
      vibrate(20);        // keypad haptic

      if(paused||gameOver)return;
      if(d==="left"&&dir.x!==1)dir={x:-1,y:0};
      if(d==="up"&&dir.y!==1)dir={x:0,y:-1};
      if(d==="right"&&dir.x!==-1)dir={x:1,y:0};
      if(d==="down"&&dir.y!==-1)dir={x:0,y:1};
    }
  };

})();

Snake.start();
