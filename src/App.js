import React, {useState, useEffect} from 'react';
import './App.css';
import dateFormat from 'dateformat';
import flag from 'country-code-emoji';
import { parse } from 'twemoji-parser';
import { useTransition, animated } from "react-spring";

let runData = require("./runs/nfsmw_w20n48dn.json");


function upDate(date){
  const today = date.split(" ")[0];
  const tomorrow = new Date(today)
  return dateFormat(tomorrow.setDate(tomorrow.getDate() + 1), "yyyy-mm-dd");
}

function uniquify(runs){
  let uniqueRuns = [];
  runs.forEach((item, i) => {
    if(uniqueRuns.filter(r => r.player == item.player).length == 0){
      uniqueRuns.push(item);
    }
  });
  uniqueRuns = uniqueRuns.slice(0, 20).map((data, i) => ({ ...data, y: i * 30 }));

  let top = uniqueRuns[0].time;
  let bottom = uniqueRuns[uniqueRuns.length - 1].time;
  uniqueRuns = uniqueRuns.map(run => {
    run.percent = (bottom - run.time) / (bottom - top) * 90 + 10;
    return run;
  });
  return uniqueRuns;
}

function timeBeautifier(totalSeconds){
  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  return (
    <div>{hours}<small>h</small> {minutes}<small>m</small> {seconds}<small>s</small></div>
  )
}

function dateBeautifier(date){
  const db = new Date(date);
  return dateFormat(db, "d mmmm yyyy");
}

function App() {
  let runRaw = runData.runs;
  const height = 30;
  const [runs, setRuns] = useState([]);
  const [date, setDate] = useState(0);

  useEffect(() => {
    restartTicker();
  }, []);

  let restartTicker = () => {
    setDate(runRaw[0].date);
    let index = 1;
    let interval = setInterval(() => {
      setRuns(uniquify(runRaw.slice(0, index).sort((a, b) => (a.time > b.time) ? 1 : -1)));
      setDate(runRaw[index-1].date);
      index++;
      if(index > runRaw.length){
        clearInterval(interval);
        console.log("DONE!");
      }
    }, 1000);
  }

  const transitions = useTransition(
    runs.map((data, i) => ({ ...data, y: i * height })),
    d => d.player,
    {
      from: { position: "absolute", opacity: 0 },
      leave: { height: 0, opacity: 0 },
      enter: ({ y }) => ({ y, opacity: 1 }),
      update: ({ y }) => ({ y })
    }
  );

  if(date && runs.length){
    return (
      <div className="App">
      <div className="logo">speedrun</div>
      <div className="Game">
        <img src={runData.assets["cover-medium"].uri} style={{width:runData.assets["cover-medium"].width,  height:runData.assets["cover-medium"].height}}/>
        <div className="content">
          <p className="category">{runData.category.name}</p>
          <h1>{runData.names.international}</h1>
          <p className="releaseDate">Released: {runData.released}</p>
          <p className="runAmount">Number of Record Runs: {runRaw.length}</p>
          <p>This animated graph visualizes timeline of the verified runs for {runData.names.international} in {runData.category.name} category that have been in the best 20 at the time of their submission.</p>
        </div>
      </div>
      Date: {dateBeautifier(date)}
        <div className="runs">
          {transitions.map(({ item, props: { y, ...rest }, key }, index) => {
            let flagUrl = parse(item.country.split("/")[0] ? flag(item.country.split("/")[0]) : "🏁")[0].url;
            let color1 = "#000";
            let color2 = "#aaa";
            if(item.style.style == "solid"){
              color1 = item.style.color.dark;
              color2 = item.style.color.dark;
            }else{
              color1 = item.style["color-from"].dark;
              color2 = item.style["color-to"].dark;
            }
            return (
              <animated.div key={key} className="runItem" style={{
                  transform: y.interpolate(y => `translate3d(0,${y}px,0)`),
                  ...rest
                }}>
                <div className="playerName">
                  <img src={flagUrl} style={{height: 20, display: "inline"}}/>
                  <span>{item.player}</span>
                </div>
                <div className="percent" style={{backgroundImage: "linear-gradient(45deg, "+color1+", "+color2+")", height: 20, width: 120 - item.percent}}></div>
                <div className="runTime">{timeBeautifier(item.time)}</div>
              </animated.div>
            );
          })}
        </div>
      </div>
    );
  }else{
    return <p>fetching...</p>;
  }
}

export default App;





















/**/
