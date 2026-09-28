
const dailyQuestions = [
  {q:"What is something your child is really into right now?", category:"little"},
  {q:"What is something you wish you had known during the first month after diagnosis?", category:"experience"},
  {q:"What is something that made your family laugh recently?", category:"little"},
  {q:"What is one thing you wish doctors understood better?", category:"experience"},
  {q:"What are you hopeful about right now?", category:"thinking"},
  {q:"Is there something another PKAN family might be able to help you with?", category:"thinking"},
  {q:"What is something surprisingly helpful lately?", category:"experience"},
  {q:"What song has been playing in your house lately?", category:"little"},
  {q:"What is something you know now that you didn’t know six months ago?", category:"thinking"},
  {q:"What is a small good thing that happened this week?", category:"little"}
];

const sampleAnswers = [
  ["Luca’s family · Italy","Anything with wheels."],
  ["Minseo’s family · Korea","Water. Cups of water, puddles, the bath, the hose."],
  ["Amélie’s family · France","Music — especially anything she can clap to."],
  ["A family in Spain","Being outside after dinner when it finally cools down."]
];

function todayKey(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function questionForToday(){
  const d=new Date();
  const seed=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);
  return dailyQuestions[seed % dailyQuestions.length];
}
function loadAnswers(){
  try{return JSON.parse(localStorage.getItem("pkan_daily_answers")||"[]")}catch(e){return []}
}
function saveAnswers(a){localStorage.setItem("pkan_daily_answers",JSON.stringify(a))}
function niceDate(dateStr){
  const d=new Date(dateStr+"T12:00:00");
  return d.toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"});
}
function escapeHTML(s){
  return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function getProfileName(){
  return localStorage.getItem("pkan_family_name") || "Diana’s family";
}
function categoryLabel(c){
  return c==="little"?"LITTLE THINGS":c==="experience"?"OUR EXPERIENCE":"THINGS WE’RE THINKING ABOUT";
}

document.addEventListener("DOMContentLoaded",()=>{
  const todays=questionForToday();
  const key=todayKey();

  // Homepage module
  const homeQ=document.getElementById("home-daily-question");
  if(homeQ){
    homeQ.textContent=todays.q;
    const dateEl=document.getElementById("home-daily-date");
    if(dateEl) dateEl.textContent=new Date().toLocaleDateString(undefined,{month:"long",day:"numeric"});
    const input=document.getElementById("home-daily-answer");
    const vis=document.getElementById("home-daily-visibility");
    const submit=document.getElementById("home-daily-submit");
    const form=document.getElementById("home-daily-form");
    const saved=document.getElementById("home-daily-saved");
    const existing=loadAnswers().find(a=>a.date===key);
    if(existing){
      if(form) form.hidden=true;
      if(saved){
        saved.hidden=false;
        saved.querySelector(".home-saved-text").textContent=existing.answer;
      }
    }
    if(submit) submit.addEventListener("click",()=>{
      const answer=(input.value||"").trim();
      if(!answer) return;
      addAnswer(answer,vis.value,todays,key);
      form.hidden=true;saved.hidden=false;
      saved.querySelector(".home-saved-text").textContent=answer;
    });
  }

  // Dedicated daily page
  const pageQ=document.getElementById("daily-page-question");
  if(pageQ){
    pageQ.textContent=todays.q;
    document.getElementById("daily-date").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
    const list=document.getElementById("sample-answer-list");
    sampleAnswers.forEach(([who,text],i)=>{
      const el=document.createElement("article");
      el.className="community-daily-answer";
      el.innerHTML=`<p>“${escapeHTML(text)}”</p><small>${escapeHTML(who)}</small><button>✦ leave a spark</button>`;
      list.appendChild(el);
    });
    const existing=loadAnswers().find(a=>a.date===key);
    if(existing) showDailySaved(existing);
    document.getElementById("daily-page-submit").addEventListener("click",()=>{
      const answer=document.getElementById("daily-page-answer").value.trim();
      if(!answer)return;
      const visibility=document.getElementById("daily-page-visibility").value;
      const entry=addAnswer(answer,visibility,todays,key);
      showDailySaved(entry);
    });
  }

  // Living profile
  const chrono=document.getElementById("chronological-answers");
  if(chrono){
    const answers=loadAnswers().sort((a,b)=>b.date.localeCompare(a.date));
    const familyName=getProfileName();
    document.getElementById("living-family-name").textContent=familyName;
    if(answers.length===0){
      chrono.innerHTML='<p class="empty-answers">Your daily answers will collect here over time.</p>';
    } else {
      answers.forEach(a=>{
        const card=document.createElement("article");
        card.className=`living-answer generated ${a.category||"thinking"}`;
        const privacy=a.visibility==="only me" ? '<b class="private-marker">only me</b>' : escapeHTML(a.visibility);
        card.innerHTML=`<small>${escapeHTML(a.question)}</small><p>${escapeHTML(a.answer)}</p><footer><time>${niceDate(a.date)}</time><span>${privacy}</span></footer>`;
        chrono.appendChild(card);
      });
      const latest=answers[0];
      const target=latest.category==="little"?document.getElementById("little-things-stack"):document.getElementById("thinking-stack");
      if(target){
        const featured=document.createElement("article");
        featured.className=`living-answer generated ${latest.category||"thinking"}`;
        featured.innerHTML=`<small>${escapeHTML(latest.question)}</small><p>${escapeHTML(latest.answer)}</p><footer><time>${niceDate(latest.date)}</time><span>${escapeHTML(latest.visibility)}</span></footer>`;
        target.prepend(featured);
      }
    }
  }
});

function addAnswer(answer,visibility,qObj,date){
  let answers=loadAnswers();
  const entry={date,question:qObj.q,category:qObj.category,answer,visibility};
  answers=answers.filter(a=>a.date!==date);
  answers.push(entry);
  saveAnswers(answers);
  return entry;
}
function showDailySaved(entry){
  const form=document.getElementById("daily-answer-form");
  const saved=document.getElementById("daily-saved-state");
  if(form)form.hidden=true;
  if(saved){
    saved.hidden=false;
    document.getElementById("saved-answer").textContent=`“${entry.answer}”`;
    document.getElementById("saved-family-name").textContent=getProfileName();
  }
}
