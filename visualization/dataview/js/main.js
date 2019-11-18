const chartDiv = document.getElementById("chart");

const tickDuration = 1000;
const top_n = 12;

// let brandData = d3.csv('https://gist.githubusercontent.com/flexlev/d21fe540d4a464970fb4f790bd765bf1/raw/df59463244afc028d981704db3871a51038cda88/data_insults.csv')

const svg = d3.select(chartDiv)
               .append("svg")
               .attr("width", width)
               .attr("height", height);
  
const margin = {
    top: 80,
    right: 0,
    bottom: 5,
    left: 0
};

let barPadding = (height-(margin.bottom+margin.top))/(top_n*5);

function myColor(i){
    if(i < 4){
      return d3.scaleLinear().domain([-2,5])
              .range(["#A8A595", "#A38640"])(i)
    } else {
      return d3.scaleLinear().domain([6,11])
              .range(["#A38640", "#8C7B64"])(i)
    }
}

let title = svg.append('text')
               .attr("class", "title")
               .attr("y", 24)
               .text('Donald J. Trump Retweets Sum by Insult');

let subTitle = svg.append('text')
                   .attr("class", "subTitle")
                   .attr("y", 55)
                   .text('(2012-2019)');

let caption = svg.append('text')
                 .attr("class", "caption")
                 .attr("x", width)
                 .attr("y", height-5)
                 .style("text-anchor", "end")
                 .text("Source: Twitter");

let current_month = 1;
let current_year = 2012;
let brandData = []

var flags = [], unique_names = [], l = brandData.length, i;

d3.csv("https://gist.githubusercontent.com/flexlev/d21fe540d4a464970fb4f790bd765bf1/raw/df59463244afc028d981704db3871a51038cda88/data_insults.csv",function(d, i){
    brandData[i] = d;
    if( !flags[brandData[i].name]){
        flags[brandData[i].name] = true;
        unique_names.push(brandData[i].name);
    }
  
});

brandData.forEach(function (d, i) {
    console.log(i);
    if( flags[brandData[i].name]){
          continue;
      }
      flags[brandData[i].name] = true;
      unique_names.push(brandData[i].name);
});

brandData.forEach(function (d, i) {
    d.value = +d.value,
    d.lastValue = +d.lastValue,
    d.value = isNaN(d.value) ? 0 : d.value + 1,
    d.year = +d.year,
    d.colour = myColor(unique_names.indexOf(d.name))//d3.hsl(Math.random()*30, 0.75 ,0.35)
});

let yearSlice = brandData.filter(d => d.year == current_year && !isNaN(d.value))
                         .sort((a,b) => b.value - a.value)
                         .slice(0,top_n);

yearSlice.forEach((d,i) => d.rank = i);

let x = d3.scaleLinear()
          .domain([0, d3.max(yearSlice, d => d.value)])
          .range([margin.left + 150, width-margin.right-115]);

let y = d3.scaleLinear()
          .domain([top_n, 0])
          .range([height-margin.bottom, margin.top]);

let xAxis = d3.axisTop()
              .scale(x)
              .ticks(width > 500 ? 5:2)
              .tickSize(-(height-margin.top-margin.bottom))
              .tickFormat(d => d3.format(',')(d));

svg.append('g')
   .attr("class", "axis xAxis")
   .attr("transform", `translate(0, ${margin.top})`)
   .call(xAxis)
   .selectAll('.tick line')
   .classed('origin', d => d == 0);

svg.selectAll('rect.bar')
    .data(yearSlice, d => d.name)
    .enter()
    .append('rect')
    .attr("class", "bar")
    .attr("x", x(0)+1)
    .attr("width", function(d){
        return x(d.value)-x(0)-1;
    })
    .attr("y", function(d){return y(d.rank)+5;})
    .attr("height", y(1)-y(0)-barPadding)
    .style("fill", function(d){ return d.colour; });

svg.selectAll('text.label')
    .data(yearSlice, d => d.name)
    .enter()
    .append('text')
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("x", margin.left + 140)
    .attr("y", function(d){ return y(d.rank)+5+((y(1)-y(0))/2)+1; })
    .text(function(d){return '"' + d.name + '"'; } ); //.html(d => x(d.value)-x(0)-1 > 200 ? '"' + d.name + '"' : "");

svg.selectAll('text.valueLabel')
    .data(yearSlice, d => d.name)
    .enter()
    .append('text')
    .attr("class", "valueLabel")
    .attr("x", function(d){return x(d.value)+5;})
    .attr("y", function(d){return y(d.rank)+5+((y(1)-y(0))/2)+1;})
    .text(function(d){return d3.format(',.0f')(d.value);} );

svg.append('text')
    .attr("class", "annotation")
    .attr("transform", `translate(${width-margin.right-15}, ${height-margin.bottom-240})`)
    .style('text-anchor', 'end')
    .text('')
    .selectAll('tspan')
    .data(['Annotations go here', 'like this'], d => d)
    .enter()
    .append('tspan')
    .text(function(d){return d;})
    .attr("x", 0)
    .attr("y", function(d,i){ return i * 28;})
    .attr("opacity", 0)

let yearText = svg.append('text')
                  .attr("class", "yearText")
                  .attr("x", width-margin.right)
                  .attr("y", height-25)
                  .style('text-anchor', 'end')
                  .text(current_year + "-" + current_month);

let annotate = function(text){

    let annotation = svg.selectAll('.annotation').selectAll('tspan').data(text, d => d);

    //console.log(annotation.enter().data());

    annotation
      .enter()
      .append('tspan')
      .html(d => d)
      .attr("x", 0)
      .attr("y", function(d,i){ return i * 28;})
        .transition()
        .ease(d3.easeLinear)
        .duration(250)
        .attr("opacity", 1)
          .transition()
          .ease(d3.easeLinear)
          .delay(9000)
          .duration(250)
          .attr("opacity", 0);

    annotation.exit().remove();
}

function animate() {
    yearSlice = brandData.filter(d => (d.year == current_year) && (d.month == current_month) && !isNaN(d.value))
                        .sort((a,b) => b.value - a.value)
                        .slice(0,top_n);

    yearSlice.forEach(function(d,i){
        d.rank = i;
        d.colour = myColor(unique_names.indexOf(d.name));
        console.log(d.colour);
    });

    x.domain([0, d3.max(yearSlice, d => d.value)]);

    svg.select('.xAxis')
      .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .call(xAxis);

    let bars = svg.selectAll('.bar').data(yearSlice, d => d.name);


    bars
      .enter()
      .append('rect')
      .attr("class", function(d,i){ 
        return `bar ${d.name}`;
    })
      .attr("x", x(0)+1)
      .attr("width", function(d,i){ return x(d.value)-x(0)-1;})
      .attr("y", y(top_n+1)+5)
      .attr("height", y(1)-y(0)-barPadding)
      .style("fill", function(d,i){ 
        return d.colour;
    })
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr("width", function(d,i){ return y(d.rank)+5;});


    bars
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr("width", function(d,i){ return x(d.value)-x(0)-1;})
        .attr("y", function(d,i){ 
            return y(d.rank)+5;
        })

    bars
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr("width", function(d,i){ return x(d.value)-x(0)-1;})
        .attr("y", y(top_n+1)+5)
        .remove();

    let labels = svg.selectAll('.label').data(yearSlice, d => d.name);

    labels
      .enter()
      .append('text')
      .attr("class", 'label')
      .attr("x", margin.left + 140)
      .attr("y", y(top_n+1)+5+((y(1)-y(0))/2))
      .attr("text-anchor", 'end')
      .html(d => '"' + d.name + '"')    
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr("y", function(d){ return y(d.rank)+5+((y(1)-y(0))/2)+1;});

    labels
      .transition()
      .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr("x", margin.left + 140)
        .attr("y", function(d,i){ return y(d.rank)+5+((y(1)-y(0))/2)+1;});

    labels
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr("x", margin.left + 140)
        .attr("y", y(top_n+1)+5)
        .remove();

    let valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d.name);

    valueLabels
      .enter()
      .append('text')
      .attr("class", 'valueLabel')
      .attr("x", function(d,i){ return x(d.value)+5;})
      .attr("y", y(top_n+1)+5)
      .text(d => d3.format(',.0f')(d.lastValue))
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr("y", function(d,i){ return y(d.rank)+5+((y(1)-y(0))/2)+1;});

    valueLabels
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr("x", function(d,i){ return x(d.value)+5;})
        .attr("y", function(d,i){ return y(d.rank)+5+((y(1)-y(0))/2)+1;})
        .tween("text", function(d) {
          let i = d3.interpolateRound(d.lastValue, d.value);
          return function(t) {
            this.textContent = d3.format(',')(i(t));
          };
        });

    valueLabels
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr("x", function(d,i){ return x(d.value)+5;})
        .attr("y", y(top_n+1)+5)
        .remove();

    //animation pause

    if( (current_year == 2012) && (current_month == 10)){
      ticker.stop();
      annotate([`".@antbaxter Thanks for helping promote`,
                `& make Trump International Golf Links`, 
                `Scotland so successful--you stupid fool!" - 2012-10`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2013) && (current_month == 11)){
      ticker.stop();
      annotate([`"Can you believe that the builder of the`,
                `failed ObamaCare website was just given`, 
                `a new government contract - how`,
                `stupid is that - CLUELESS!!!" - 2013-11`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2013) && (current_month == 5)){
      ticker.stop();
      annotate([`"Sorry losers and haters, but my I.Q.`,
                `is one of the highest -and you all`, 
                `know it! Please don't feel so stupid`,
                `or insecure,it's not your fault" - 2013-05`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2014) && (current_month == 6)){
      ticker.stop();
      annotate([`"Do these very stupid politicians who`,
                `got us involved in Iraq look bad, or what?`, 
                `Everybody wants their oil - only made`,
                `possible by U.S.!" - 2014-06`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2014) && (current_month == 10)){
      ticker.stop();
      annotate([`"I have been saying for weeks for`,
                `President Obama to stop the flights from`, 
                `West Africa. So simple, but he refused.`,
                `A TOTAL incompetent!" - 2014-10`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2015) && (current_month == 11)){
      ticker.stop();
      annotate([`"Hillary Clinton is weak on illegal immigration, among`,`many other things. She is strong on corruption`, `- corruption is what she's best at!" - 2015-11`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2015) && (current_month == 8)){
      ticker.stop();
      annotate([`"For those that don’t think a wall (fence) works,`,
                `why don’t they suggest taking down the fence around`, 
                `the White House? Foolish people!" - 2015-08`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2016) && (current_month == 9)){
      ticker.stop();
      annotate([`"If dopey Mark Cuban of failed`,  
                `Benefactor fame wants to sit in the`, 
                `front row, perhaps I will put Gennifer"`,
                `Flowers right alongside of him!" - 2016-09`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2016) && (current_month == 5)){
      ticker.stop();
      annotate([`"Hillary Clinton is not qualified to`,  
                `be president because her judgement has`, 
                `been proven to be so bad! Would be four"`,
                `more years of stupidity!" - 2016-05`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2017) && (current_month == 11)){
      ticker.stop();
      annotate([`"Crooked Hillary Clinton is the worst (and biggest)`,
                `loser of all time. She just can’t stop,`,
                `which is so good for the Republican Party.`, 
                `Hillary, get on with your life..." - 2017-11`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2017) && (current_month == 3)){
      ticker.stop();
      annotate([`"Terrible! Just found out that Obama had my`,
                `"wires tapped" in Trump Tower just`, 
                `before the victory..." - 2017-03`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2018) && (current_month == 3)){
      ticker.stop();
      annotate(['"Crazy Joe Biden is trying to act', 
                `like a tough guy. Actually, he is weak,` ,
                'both mentally and physically..." - 2018-03']);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2018) && (current_month == 6)){
      ticker.stop();
      annotate([`"...I had to beat the Clinton Dynasty, and`, 
                `now I have to beat a phony Witch Hunt` ,
                `and all of the dishonest people..." - 2018-06`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2019) && (current_month == 1)){
      ticker.stop();
      annotate([`" “General” McChrystal got fired like`, 
                `a dog by Obama. Last assignment a total` ,
                `bust. Known for big, dumb mouth.`, 
                `Hillary lover!" - 2019-01`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    if( (current_year == 2019) && (current_month == 6)){
      ticker.stop();
      annotate([`"@SadiqKhan, who by all accounts has done`, 
                `a terrible job as Mayor of London, has been` ,
                `foolishly “nasty” to the visiting President...`,
                `...He is a stone cold loser ..." - 2019-06`]);
      d3.timeout(function(){
        ticker = d3.interval(function(){
          animate()
        }, tickDuration)
      },0);
    }

    yearText.html(current_year + "-" + current_month);

    if(current_year >= 2019) ticker.stop();

    current_month = current_month + 1;
    if (current_month > 12){
      current_month = 1;
      current_year = current_year +1;
    }

}

let ticker = d3.interval(e => {
    animate();
},tickDuration);
