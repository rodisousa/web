const swiper = new Swiper('.swiper', {
    slidesPerView: 5, // Display 4 elements fully
    spaceBetween: 30,
    centeredSlides: true, // Center the active slide
    loop: true, // Infinite loop
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination', // Dots for navigation
      clickable: true, // Make the dots clickable
    },
    breakpoints: {
      768: {
        slidesPerView: 2, // Adjust for smaller screens
      },
      1024: {
        slidesPerView: 5,
      },
    },
});
// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // Get the navigation bar and the hero section
  const navbar = document.querySelector('.navbar');
  const hero = document.querySelector('#hero');

  // Add a scroll event listener to the window
  window.addEventListener('scroll', function () {
      // Get the height of the hero section
      const heroHeight = hero.offsetHeight;

      // Check if the scroll position is beyond the hero section
      if (window.scrollY > heroHeight) {
          navbar.classList.add('transparent-navbar'); // Add transparency class
      } else {
          navbar.classList.remove('transparent-navbar'); // Remove transparency class
      }
  });
});
document.addEventListener('DOMContentLoaded', function () {
  // Get all anchor links in the navbar
  const navLinks = document.querySelectorAll('.navbar a[href^="#"]');
  

  // Add a click event listener to each link
  navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
          e.preventDefault(); // Prevent default anchor behavior

          // Get the target section id from the link's href
          const targetId = this.getAttribute('href').substring(1);
          const targetSection = document.getElementById(targetId);

          // Scroll to the section with a small offset for the fixed navbar
          if (targetSection) {
              const offset = targetSection.offsetTop - document.querySelector('.navbar').offsetHeight;
              window.scrollTo({
                  top: offset,
                  behavior: 'smooth' // Smooth scrolling
              });
          }
      });
  });
});

(function(){
                var words=[
                  {t:"Python",s:1.32,c:"#1c5288"},
                  {t:"HTML5",s:1.18,c:"#396ed0"},
                  {t:"CSS3",s:1.1,c:"#2d5da8"},
                  {t:"SQL",s:1.0,c:"#2d5da8"},
                  {t:"Earth Observations",s:0.9,c:"#396ed0"},
                  {t:"Initiative",s:0.83,c:"#555"},
                  {t:"Decision Making",s:0.83,c:"#396ed0"},
                  {t:"Planning",s:0.8,c:"#777"},
                  {t:"Flexibility",s:0.8,c:"#777"},
                  {t:"Proactivity",s:0.8,c:"#1c5288"},
                  {t:"Organization",s:0.78,c:"#777"}
                ];

                var wrap=document.getElementById('sc-wrap');
                var canvas=document.getElementById('sc-canvas');
                var wordDiv=document.getElementById('sc-words');
                var ctx=canvas.getContext('2d');
                var DPR=window.devicePixelRatio||1;

                /* --- sizing --- */
                var R=120, H=290, CW=R*2+30;
                var cy=H/2, cx=wrap.offsetWidth/2||200;
                var CCX=CW/2, CCY=CW/2; /* canvas local centre */
                canvas.width=CW*DPR; canvas.height=CW*DPR;
                canvas.style.width=CW+'px'; canvas.style.height=CW+'px';
                ctx.scale(DPR,DPR);

                /* --- rotation state --- */
                var rotX=0.3, rotY=0, velX=0, velY=0.00002;
                var dragging=false, lastMX=0, lastMY=0, time=0;

                /* shared rotate fn — uses closure vars rotX/rotY */
                function rv(x,y,z){
                  var y1=y*Math.cos(rotX)-z*Math.sin(rotX);
                  var z1=y*Math.sin(rotX)+z*Math.cos(rotX);
                  var x2=x*Math.cos(rotY)+z1*Math.sin(rotY);
                  var z2=-x*Math.sin(rotY)+z1*Math.cos(rotY);
                  return[x2,y1,z2];
                }

                /* --- word points (Fibonacci lattice) --- */
                var n=words.length;
                var pts=words.map(function(_,i){
                  var phi=Math.acos(1-2*(i+0.5)/n);
                  var theta=Math.PI*(1+Math.sqrt(5))*(i+0.5);
                  return{ox:Math.sin(phi)*Math.cos(theta),oy:Math.sin(phi)*Math.sin(theta),oz:Math.cos(phi)};
                });

                /* --- word spans --- */
                var spans=words.map(function(w){
                  var el=document.createElement('span');
                  el.className='sc-w';
                  el.textContent=w.t;
                  el.style.fontSize=w.s+'rem';
                  el.style.color=w.c;
                  wordDiv.appendChild(el);
                  return el;
                });

                /* --- hover tracking --- */
                var hoveredIdx=-1;
                var curOp=words.map(function(){return 0.6;}); /* lerped opacity */
                spans.forEach(function(el,i){
                  el.addEventListener('mouseenter',function(){hoveredIdx=i;});
                  el.addEventListener('mouseleave',function(){hoveredIdx=-1;});
                });

                /* --- surface dots (different theta offset so they don't overlap words) --- */
                var NUM_DOTS=110;
                var dots=[];
                for(var d=0;d<NUM_DOTS;d++){
                  var dphi=Math.acos(1-2*(d+0.5)/NUM_DOTS);
                  var dtheta=Math.PI*(1+Math.sqrt(5))*(d+0.5)+1.8;
                  dots.push([Math.sin(dphi)*Math.cos(dtheta),Math.sin(dphi)*Math.sin(dtheta),Math.cos(dphi)]);
                }

                /* === canvas draw === */
                function drawSphere(){
                  ctx.clearRect(0,0,CW,CW);

                  /* drop shadow */
                  ctx.save();
                  ctx.shadowColor='rgba(60,110,200,0.18)';
                  ctx.shadowBlur=22;
                  ctx.shadowOffsetX=3;
                  ctx.shadowOffsetY=5;

                  /* sphere fill — radial gradient simulating light from top-left */
                  var grad=ctx.createRadialGradient(CCX-R*0.32,CCY-R*0.38,R*0.04,CCX,CCY,R);
                  grad.addColorStop(0,'rgba(250,252,255,1)');
                  grad.addColorStop(0.45,'rgba(228,238,252,0.95)');
                  grad.addColorStop(1,'rgba(182,208,238,0.88)');
                  ctx.beginPath();
                  ctx.arc(CCX,CCY,R,0,Math.PI*2);
                  ctx.fillStyle=grad;
                  ctx.fill();
                  ctx.restore();

                  /* clip everything inside the circle */
                  ctx.save();
                  ctx.beginPath();
                  ctx.arc(CCX,CCY,R,0,Math.PI*2);
                  ctx.clip();

                  /* latitude lines */
                  [-60,-30,0,30,60].forEach(function(latDeg){
                    var lat=latDeg*Math.PI/180;
                    var cosL=Math.cos(lat), sinL=Math.sin(lat);
                    ctx.beginPath();
                    var started=false;
                    for(var t=0;t<=364;t+=3){
                      var th=t*Math.PI/180;
                      var r=rv(cosL*Math.cos(th),sinL,cosL*Math.sin(th));
                      if(r[2]<-0.08){started=false;continue;}
                      var px=CCX+r[0]*R, py=CCY+r[1]*R;
                      if(!started){ctx.moveTo(px,py);started=true;}else ctx.lineTo(px,py);
                    }
                    ctx.strokeStyle='rgba(90,140,210,0.13)';
                    ctx.lineWidth=0.8;
                    ctx.stroke();
                  });

                  /* longitude lines */
                  [0,30,60,90,120,150].forEach(function(lonDeg){
                    var lon=lonDeg*Math.PI/180;
                    ctx.beginPath();
                    var started=false;
                    for(var t=-90;t<=92;t+=3){
                      var phi=t*Math.PI/180;
                      var r=rv(Math.cos(phi)*Math.cos(lon),Math.sin(phi),Math.cos(phi)*Math.sin(lon));
                      if(r[2]<-0.08){started=false;continue;}
                      var px=CCX+r[0]*R, py=CCY+r[1]*R;
                      if(!started){ctx.moveTo(px,py);started=true;}else ctx.lineTo(px,py);
                    }
                    ctx.strokeStyle='rgba(90,140,210,0.13)';
                    ctx.lineWidth=0.8;
                    ctx.stroke();
                  });

                  /* surface dots */
                  dots.forEach(function(d){
                    var r=rv(d[0],d[1],d[2]);
                    if(r[2]<-0.04)return; /* back-face cull */
                    var depth=(r[2]+1)/2;
                    var px=CCX+r[0]*R, py=CCY+r[1]*R;
                    var dotR=0.7+depth*1.1;
                    var alpha=(0.08+depth*0.32).toFixed(2);
                    ctx.beginPath();
                    ctx.arc(px,py,dotR,0,Math.PI*2);
                    ctx.fillStyle='rgba(65,115,200,'+alpha+')';
                    ctx.fill();
                  });

                  ctx.restore();

                  /* sphere border */
                  ctx.beginPath();
                  ctx.arc(CCX,CCY,R,0,Math.PI*2);
                  ctx.strokeStyle='rgba(110,160,225,0.38)';
                  ctx.lineWidth=1.3;
                  ctx.stroke();

                  /* specular highlight */
                  var spec=ctx.createRadialGradient(CCX-R*0.36,CCY-R*0.42,0,CCX-R*0.18,CCY-R*0.2,R*0.52);
                  spec.addColorStop(0,'rgba(255,255,255,0.48)');
                  spec.addColorStop(1,'rgba(255,255,255,0)');
                  ctx.beginPath();
                  ctx.arc(CCX,CCY,R,0,Math.PI*2);
                  ctx.fillStyle=spec;
                  ctx.fill();
                }

                /* === animation loop === */
                function frame(){
                  time+=0.008;
                  if(!dragging){
                    rotX+=velX; rotY+=velY;
                    velX*=0.95;
                    velY=velY*0.999+0.00002;
                  }
                  cx=wrap.offsetWidth/2||200;

                  drawSphere();

                  var anyHov=(hoveredIdx!==-1);
                  var proj=pts.map(function(p,i){
                    var osc=Math.sin(time*0.82+i*0.68)*0.012;
                    var r=rv(p.ox*(1+osc),p.oy*(1+osc),p.oz*(1+osc));
                    var depth=(r[2]+1)/2;
                    /* front: scale 1.15, opacity 1.0 — back: scale 0.28, opacity 0.04 */
                    return{x:cx+r[0]*R,y:cy+r[1]*R,z:r[2],
                          sc:0.28+depth*0.87,
                          op:0.04+depth*0.96,
                          i:i};
                  });
                  proj.sort(function(a,b){return a.z-b.z;});

                  proj.forEach(function(p){
                    var el=spans[p.i];
                    var isHov=(p.i===hoveredIdx);
                    var targetOp=isHov?1.0:(anyHov?p.op*0.12:p.op);
                    var targetSc=isHov?p.sc*1.65:p.sc;
                    /* lerp opacity for smooth fade */
                    curOp[p.i]+=(targetOp-curOp[p.i])*0.1;
                    el.style.left=p.x.toFixed(1)+'px';
                    el.style.top=p.y.toFixed(1)+'px';
                    el.style.transform='translate(-50%,-50%) scale('+targetSc.toFixed(3)+')';
                    el.style.opacity=curOp[p.i].toFixed(3);
                    el.style.zIndex=isHov?999:Math.round(p.z*100+100);
                  });

                  requestAnimationFrame(frame);
                }

                /* === drag events === */
                wordDiv.addEventListener('mousedown',function(e){
                  dragging=true;lastMX=e.clientX;lastMY=e.clientY;
                  wordDiv.classList.add('sc-grabbing');e.preventDefault();
                });
                window.addEventListener('mousemove',function(e){
                  if(!dragging)return;
                  velY=(e.clientX-lastMX)*0.003;velX=(e.clientY-lastMY)*0.003;
                  rotY+=velY;rotX+=velX;lastMX=e.clientX;lastMY=e.clientY;
                });
                window.addEventListener('mouseup',function(){
                  dragging=false;wordDiv.classList.remove('sc-grabbing');
                });
                wordDiv.addEventListener('touchstart',function(e){
                  lastMX=e.touches[0].clientX;lastMY=e.touches[0].clientY;dragging=true;
                },{passive:true});
                wordDiv.addEventListener('touchmove',function(e){
                  if(!dragging)return;
                  velY=(e.touches[0].clientX-lastMX)*0.003;velX=(e.touches[0].clientY-lastMY)*0.003;
                  rotY+=velY;rotX+=velX;lastMX=e.touches[0].clientX;lastMY=e.touches[0].clientY;
                },{passive:true});
                wordDiv.addEventListener('touchend',function(){dragging=false;});

                frame();
              })();