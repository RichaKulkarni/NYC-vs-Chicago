//Set the SVG Element
var width = 600,
    height = 600;//600x600

//define color scale
var pop_colors = d3.scale.threshold().range(colorbrewer.Blues[7])
    .domain([40000, 80000, 120000, 160000, 200000, 220000]);
var life_colors = d3.scale.threshold().range(colorbrewer.Oranges[6])
    .domain([60, 70, 80, 90, 100]);
var income_colors = d3.scale.threshold().range(colorbrewer.Greens[6]);
    income_colors.domain([5000, 15000, 40000, 80000, 100000]);
var crime_colors = d3.scale.threshold().range(colorbrewer.Reds[8])
    .domain([0, 10, 20, 30, 40, 50, 60]);
var select_colors;
//add for legend scale color reference
var pop = colorbrewer.Blues[7]; 
var life = colorbrewer.Oranges[6];
var income = colorbrewer.Greens[6];
var crime = colorbrewer.Reds[8];

//add for legend scale text reference
var popText = ["0-40K", "40K-80K", "80K-120K", "120K-160K","160K-200K","200K+"];
var lifeText = ["0-60", "60-70", "70-80", "80-90", "90-100"];
var incomeText = ["$0-$5000", "$5000-15k", "$15k-$40k", "$40k-$80k", "$80k-$100k"];
var crimeText = ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60+"];
var cssLegend,
    legendRange = {
        poplegend: [[0,40000],[40000,80000],[80000,120000],[120000,160000],[160000,200000],[200000,250000]],
        lifelegend:[[0,60],[60,70],[70,80],[80,90],[90,100]],
        incomelegend:[[0,5000],[5000,15000],[15000,40000],[40000,80000],[80000,100000]],
        crimelegend:[[0,10],[10,20],[20,30],[30,40],[40,50],[50,60],[60,120]]
}

//Detailed Tooltip Selections
var tipDetail = {population:"population", lifeExpectancy:"lifeExpectancy",income:"incomePerCapita",crime:"crimePerK"},select;

//an SVG to append both svg's
var parentSVG= d3.select("body")
    .attr("align","center")
    .append("svg")
    .attr("id","parentSVG")
    .attr("align","center")
    .attr("width", width*2)
    .attr("height", height)
    .on("click", function(){
        ColorScheme(NYdatum,svg,select_colors,select);
        ColorScheme(Cdatum,svg2,select_colors,select);
    });
//an SVG for New York
var svg = d3.select("#parentSVG")
    .append("svg")
    .attr("align","center")
    .attr("width", width)
    .attr("height", height);

//space for tooltip
    var tooltip = d3.select("body")
	.append("div")
    .attr("class","tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
    .style("opacity",0)
	.style("display", "none");

//Should a detailed tooltip be shown?
var DetailedTooltip=false;

var popRange, lifeRange, incomeRange, crimeRange;

//To make NY data Global
var NYdatum;

d3.json("NYData.json", function(error, json) {
    if (error) return console.error(error);
    
    var features = topojson.feature(json,json.objects.features);
    
    //copy to global variable
    NYdatum = features;
    
    //data Ranges
    popRange=minMax("population", json);//51673,247354
    lifeRange=minMax("lifeExpectancy", json);//74,85
    incomeRange=minMax("incomePerCapita", json);//11042,99858
    crimeRange=minMax("crimePerK",json);//3.75,98.63
    
    var projection = d3.geo.mercator()
  					.center([-73.94, 40.70])
  					.scale(54000)
  					.translate([(width/2)+30, (height)/2]);
    
    var path = d3.geo.path().projection(projection);

    //color the Areas
    svg.selectAll(".features")
        .data(topojson.feature(json, json.objects.features).features)
        .enter().append("path")
        .attr("class", "NYfeatures")
        .attr("d", path)
        .on("mouseover", function(d){
            //fit the tooltip to the information shown
            tooltip.style("height","100px").style("width","225px");
            tooltip.transition()
            .duration(200)
            .style("opacity", .9);
            //change the details inside the tooltip
            //skip the rest if theres no data to show
            if(bDistrict(d)=="bearsNstuff"){
                tooltip.style("height","15px").style("width","115px");
                tooltip.html("Unpopulated Area");
            } else
            //if showing general information:
            if(!DetailedTooltip) {
                TooltipTextNY(d,"boro_name","population","lifeExpectancy","incomePerCapita","crimePerK");
            } else{ //else show details on topic.
                        //put these under the income button
                  switch(select){
                      case tipDetail.income:
                        tooltip.style("height", "290px").style("width", "185px");
                        tooltip.html("<b><center>" + d.properties.boro_name + "</center></b><br/>"+"Income Below Poverty: "+ d.properties.poverty+"%"+"<br/>"
                        +"Employed: "+d.properties.employed+"%"+"<br/>"
                        +"Management, business, science, & arts occupations: "+d.properties.management+"%"+"<br/>"
                        +"Service occupations: "+d.properties.service+"%"+"<br/>"
                        +"Sales and office occupations: "+d.properties.sales+"%"+"<br/>"
                        +"Natural resources, construction, and maintenance occupations: "+d.properties.natural+"%"+"<br/>"
                        +"Production, transportation, and material moving occupations: "+d.properties.production+"%"+"<br/>");
                        break;
                        //put these under the population button
                      case tipDetail.population:  
                        tooltip.style("height", "175px").style("width", "180px");
                        tooltip.html("<b><center>" + d.properties.boro_name + "</center></b><br/>" + "Total Population: "+d.properties.population+"<br/>"
                        +"Male Population: "+d.properties.male+"%"+"<br/>"
                        +"Female Population: "+d.properties.female+"%"+"<br/>"
                        +"Caucasian: "+d.properties.caucasian+"%"+"<br/>"
                        +"African American: "+d.properties.aa+"%"+"<br/>"
                        +"American Indian: "+d.properties.ai+"%"+"<br/>"
                        +"Asian: "+d.properties.asian+"%"+"<br/>"
                        +"Hawaiian: "+d.properties.hawaiian+"%"+"<br/>"
                        +"Other: "+d.properties.other+"%"+"<br/>");
                        break;
                        //put these under the life button
                        case tipDetail.lifeExpectancy:
                          tooltip.style("height", "130px").style("width", "180px");
                        tooltip.html("<b><center>" + d.properties.boro_name + "</center></b><br/>" + "Life Expectancy: "+d.properties.lifeExpectancy+" years"+"<br/>"
                        +"Premature Mortality Rate: "+d.properties.premature+"<br/>"
                        +"Outdoor Air Pollution in Fine Particulate Matter Levels: "+d.properties.pollution+"<br/>");
                        break;
                        //put these under the crime button
                        case tipDetail.crime:
                         tooltip.style("height", "260px").style("width", "180px");
                        tooltip.html("<b><center>" + d.properties.boro_name + "</center></b><br/>"+"Crime Rate per 1000 residents: "+d.properties.crimePerK+"<br/>"
                        +"Murder Rate per 1000 residents: "+d.properties.murder+"<br/>"
                        +"Rape Rate per 1000 residents: "+d.properties.rape+"<br/>"
                        +"Robbery Rate per 1000 residents: "+d.properties.robbery+"<br/>"
                        +"Felony Assault Rate per 1000 residents: "+d.properties.felonyAssault+"<br/>"
                        +"Burglary Rate per 1000 residents: "+d.properties.burglary+"<br/>"
                        //+"Grand Larceny Rate per 1000 residents: "+d.properties.grandLarceny+"<br/>"
                        +"Grand Larceny Auto Rate per 1000 residents: "+d.properties.grandLarcenyAuto+"<br/>"
                        +'<div id="crime-help">*Per 1000 Residents<div>'
                        );
                        break;
                  }
            }
            //tooltip is initially hidden, activates when mouse first goes over map.
            return tooltip.style("display","inline");
        })
        /*.on("click", function(d){
            if(bDistrict(d)=="bearsNstuff");else{
                DetailedTooltip=!DetailedTooltip; //toggle.
                if(!DetailedTooltip) {
                    tooltip.style("height","100px").style("width","175px")
                    TooltipTextNY(d,"boro_name","population","lifeExpectancy","incomePerCapita","crimePerK");
                } else{
                       tooltip.html(
                        "<center><b>"+d.properties.boro_name+" District "
                        + bDistrict(d));
                        //put these under the income button
                  switch(select){
                      case tipDetail.income:
                        tooltip.style("height", "290px").style("width", "185px");
                        tooltip.html("<b><center>" + d.properties.boro_name + "</center></b><br/>"+"Income Below Poverty: "+ d.properties.poverty+"%"+"<br/>"
                        +"Employed: "+d.properties.employed+"%"+"<br/>"
                        +"Management, business, science, & arts occupations: "+d.properties.management+"%"+"<br/>"
                        +"Service occupations: "+d.properties.service+"%"+"<br/>"
                        +"Sales and office occupations: "+d.properties.sales+"%"+"<br/>"
                        +"Natural resources, construction, and maintenance occupations: "+d.properties.natural+"%"+"<br/>"
                        +"Production, transportation, and material moving occupations: "+d.properties.production+"%"+"<br/>");
                        break;
                        //put these under the population button
                      case tipDetail.population:  
                        tooltip.style("height", "175px").style("width", "180px");
                        tooltip.html("<b><center>" + d.properties.boro_name + "</center></b><br/>" + "Total Population: "+d.properties.population+"<br/>"
                        +"Male Population: "+d.properties.male+"%"+"<br/>"
                        +"Female Population: "+d.properties.female+"%"+"<br/>"
                        +"Caucasian: "+d.properties.caucasian+"%"+"<br/>"
                        +"African American: "+d.properties.aa+"%"+"<br/>"
                        +"American Indian: "+d.properties.ai+"%"+"<br/>"
                        +"Asian: "+d.properties.asian+"%"+"<br/>"
                        +"Hawaiian: "+d.properties.hawaiian+"%"+"<br/>"
                        +"Other: "+d.properties.other+"%"+"<br/>");
                        break;
                        //put these under the life button
                        case tipDetail.lifeExpectancy:
                          tooltip.style("height", "130px").style("width", "180px");
                        tooltip.html("<b><center>" + d.properties.boro_name + "</center></b><br/>" + "Life Expectancy: "+d.properties.lifeExpectancy+" years"+"<br/>"
                        +"Premature Mortality Rate: "+d.properties.premature+"<br/>"
                        +"Outdoor Air Pollution in Fine Particulate Matter Levels: "+d.properties.pollution+"<br/>");
                        break;
                        //put these under the crime button
                        case tipDetail.crime:
                         tooltip.style("height", "260px").style("width", "180px");
                        tooltip.html("<b><center>" + d.properties.boro_name + "</center></b><br/>"+"Crime Rate per 1000 residents: "+d.properties.crimePerK+"<br/>"
                        +"Murder Rate per 1000 residents: "+d.properties.murder+"<br/>"
                        +"Rape Rate per 1000 residents: "+d.properties.rape+"<br/>"
                        +"Robbery Rate per 1000 residents: "+d.properties.robbery+"<br/>"
                        +"Felony Assault Rate per 1000 residents: "+d.properties.felonyAssault+"<br/>"
                        +"Burglary Rate per 1000 residents: "+d.properties.burglary+"<br/>"
                        //+"Grand Larceny Rate per 1000 residents: "+d.properties.grandLarceny+"<br/>"
                        +"Grand Larceny Auto Rate per 1000 residents: "+d.properties.grandLarcenyAuto+"<br/>"
                        +'<div id="crime-help">*Per 1000 Residents<div>'

                        );
                        break;
                  }
                }
            }
        })*/
        .on("mousemove", function(d){
            return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", function(d){
            tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        })
        //New York City Label
    svg.append("text")
    .attr("x",70)
    .attr("y",100)
    .attr("id","nyLabel")
    .style("opacity",0)
    .text("New York City")
    .transition(2000)
    .delay(500)
    .style("opacity",1);
    
    function TooltipTextNY(d,name,pop,life,inc,crime){
        tooltip.html(
                        "<center><b>"+d.properties[name]+" District "
                        + bDistrict(d)
                        +"</b></center><br/>"
                        +"Population <hideText>___di__</hideText>: <em>"+d.properties[pop]+" people"+"</em><br/>"
                        +"Life Expectancy<hideText> L ii</hideText>: <em>"+d.properties[life]+" years</em>"+"<br/>"
                        +"Income Per Capita<hideText> </hideText>: <em>$"+d.properties[inc]+"</em><br/>"
                        +"Crime<hideText>__________ </hideText>: <em>"+d.properties[crime]+"</em><br/>"
                        +'<div id="help">*Crime Rate Per 1000 Residents<div>'
        );
    }
    
    //Gets the map coloring started @ Population
    cssLegend = "poplegend";
    select=tipDetail.population;
    select_colors=pop_colors;
    ColorScheme(NYdatum,svg,pop_colors,"population");  
    ShowLegendPLIC(1,0,0,0);
    UpdateSlider([2500,250000]);
});

//SVG for Chicago
var svg2= d3.select("#parentSVG")
    .append("svg")
    .attr("align","center")
    .attr("x",width)
    .attr("width", width)
    .attr("height", height);
//To make Chicago data global
var Cdatum;
///Chicago Map with data
d3.json("ChicagoData.json", function(error, json) {
    if (error) return console.error(error);
   
    //data Ranges: Population,LifeExpectancy,CrimePerK,income
    popRange=minMax("population",json);//2916,98514
    lifeRange=minMax("lifeExpectancy",json);//68.8,85.2
    crimeRange=minMax("crimePerK",json);//0.27,51.33
    incomeRange=minMax("incomePerCapita",json);//8201,88669
    
     //location of geometries/properties
    var features = topojson.feature(json,json.objects.features);
    
    //copy features to global
    Cdatum = features;

    //allows view of the map (Otherwise it'll be drawn off-screen)
    var projection = d3.geo.albers()
                    .center([8.25, 41.88205])
                    .parallels([40, 45])
                    .scale(90000)
                    .rotate([92.35, .5, -4])
                    .translate([width / 2, height / 2]);
    var path = d3.geo.path().projection(projection);
    
    //color the Areas
    svg2.selectAll(".features")
    .data(topojson.feature(json, json.objects.features).features)
  .enter().append("path")
    .attr("class", "Cfeatures")
    .attr("d", path)
    .on("mouseover", function(d){
        tooltip.transition()
        .duration(200)
        .style("opacity", .9);
        //change what's inside the tooltip
        if(!DetailedTooltip){
            tooltip.style("height","100px").style("width","220px");
            TooltipTextC(d,"comName","population","lifeExpectancy","incomePerCapita","crimePerK");
        } else {
            switch(select){
                case tipDetail.population:
                    tooltip.style("height", "118px").style("width", "180px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Population: " + d.properties.population + "<br/>" + "Crowded Housing: " + d.properties.percentcrowdedhousing + "<br/>" + "Age 25+ and no HS Diploma: " + d.properties.percent25plusnoHSD + "<br/>" + "Teen Birth Rate: " + d.properties.teenBirthRate );
                    break;
                case tipDetail.lifeExpectancy:
                    tooltip.style("height", "118px").style("width", "175px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Life Expectancy: " + d.properties.lifeExpectancy + "<br/>" + "Hardship Index: " + d.properties.hardshipIndex + "<br/>" + "Elevated blood lead levels in children ages 0-6: " + d.properties.pElevatedBlood0_6 + "<br/>" + "Birth Rate: " + d.properties.birthRate);
                    break;
                case tipDetail.income:
                    tooltip.style("height", "100px").style("width", "175px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Income Per Capita: $" + d.properties.incomePerCapita + "<br/>" + "Below Poverty: " + d.properties.percentbelowpoverty + "%<br/>" + "16+ Unemployed: " + d.properties.percent16plusunemployed + "%<br/>" + "Dependents: " + d.properties.dependents);
                    break;
                case tipDetail.crime:
                    tooltip.style("height", "118px").style("width", "175px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Crime Per K: " + d.properties.crimePerK + "<br/>" + "Violent Crimes: " + d.properties.violentCrimes + "<br/>" + "Homicide Assaults: " + d.properties.homocideAssault + "<br/>" + "Fire-Arm Related Crimes: " + d.properties.firearmRelated);
                    break;
            }
        }
        //tooltip activates the moment the mouse first goes over the map.
        return tooltip.style("display","inline");
    })
    /*.on("click", function(d){
        console.log(d);
        DetailedTooltip=!DetailedTooltip; //toggle.
        if(!DetailedTooltip) {
            tooltip.style("height","100px").style("width","175px");
            TooltipTextC(d,"comName","population","lifeExpectancy","incomePerCapita","crimePerK");
        } else{
            switch(select){
                case tipDetail.population:
                    tooltip.style("height", "118px").style("width", "180px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Population: " + d.properties.population + "<br/>" + "Crowded Housing: " + d.properties.percentcrowdedhousing + "<br/>" + "Age 25+ and no HS Diploma: " + d.properties.percent25plusnoHSD + "<br/>" + "Teen Birth Rate: " + d.properties.teenBirthRate );
                    break;
                case tipDetail.lifeExpectancy:
                    tooltip.style("height", "118px").style("width", "175px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Life Expectancy: " + d.properties.lifeExpectancy + "<br/>" + "Hardship Index: " + d.properties.hardshipIndex + "<br/>" + "Elevated blood lead levels in children ages 0-6: " + d.properties.pElevatedBlood0_6 + "<br/>" + "Birth Rate: " + d.properties.birthRate);
                    break;
                case tipDetail.income:
                    tooltip.style("height", "100px").style("width", "175px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Income Per Capita: $" + d.properties.incomePerCapita + "<br/>" + "Below Poverty: " + d.properties.percentbelowpoverty + "%<br/>" + "16+ Unemployed: " + d.properties.percent16plusunemployed + "%<br/>" + "Dependents: " + d.properties.dependents);
                    break;
                case tipDetail.crime:
                    tooltip.style("height", "118px").style("width", "175px");
                    tooltip.html("<center><b>" + d.properties.comName + "</center></b><br/>" + "Crime Per K: " + d.properties.crimePerK + "<br/>" + "Violent Crimes: " + d.properties.violentCrimes + "<br/>" + "Homicide Assaults: " + d.properties.homocideAssault + "<br/>" + "Fire-Arm Related Crimes: " + d.properties.firearmRelated);
                    break;
            }
        }
    })*/
    .on("mousemove", function(d){
        //update tooltip position
        return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
    })
    .on("mouseout", function(d){
        //fade tooltip over .5s
        tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    })
    //Chicago Label
    svg2.append("text")
    .attr("x",100)
    .attr("y",300)
    .attr("id","chicagoLabel")
    .style("opacity",0)
    .text("Chicago")
    .transition(2000)
    .delay(500)
    .style("opacity",1);
    
    //initial shading of the map.
    ColorScheme(Cdatum,svg2,pop_colors,"population");
});
//Draw the buttons & set slider div
document.write('<br><div align="center" id="buttonOptions"><button id="Population" class="PopButton" onclick="Population();">Population</button> ');
document.write('<button id="lifeExpectancy" class="LifeButton" onclick="Life();">Life Expectancy</button> ');
document.write('<button id="income" class="IncomeButton" onclick="Income();">Income</button> ');
document.write('<button id="Crime" class="CrimeButton" onclick="Crime();">Crime</button><div id="slider-text"></div><div align="left" id="slider"></div>');
document.write('<div align="center" id="slider-left-value"></div><div id="slider-right-value"></div></div>');

//Slider var;create element;On slide, change colors.
var slider = document.getElementById('slider');
var sliderValues = [document.getElementById('slider-left-value'),document.getElementById('slider-right-value')]
var sliderText = document.getElementById('slider-text');
var format = wNumb({
        decimals: 0,
        thousand:',',
        postfix: Postfix()
})
noUiSlider.create(slider, {
    start: [0,0],
    tooltips:[false,false],
    behaviour: 'drag-tap',
	connect: true,
	range: {
	'min': 0,
	'max': 42
    },
    format: format
});

sliderValues[0].innerHTML=slider.noUiSlider.get()[0];
sliderValues[1].innerHTML=slider.noUiSlider.get()[1];
slider.noUiSlider.on('slide', function(values,handle){
    sliderValues[handle].innerHTML=values[handle] +" ";
    Highlight(NYdatum,Cdatum,svg,svg2,select_colors,select,slider.noUiSlider.get(),true);
});

//Gets the legend started. Hidden
AppendLegend(pop_colors,pop,popText,"poplegend",0);
AppendLegend(life_colors,life,lifeText,"lifelegend",0);
AppendLegend(income_colors,income,incomeText,"incomelegend",0);
AppendLegend(crime_colors,crime,crimeText,"crimelegend",0);

//button functions
function Population() {
    cssLegend = "poplegend"
    select=tipDetail.population;
    select_colors=pop_colors;
    ColorScheme(NYdatum,svg,pop_colors,"population");
    ColorScheme(Cdatum,svg2,pop_colors,"population");  
    ShowLegendPLIC(1,0,0,0);
    UpdateSlider([2500,250000]);
}
function Life() {
    cssLegend = "lifelegend";
    select=tipDetail.lifeExpectancy;
    select_colors=life_colors;
    ColorScheme(NYdatum,svg,life_colors,"lifeExpectancy");
    ColorScheme(Cdatum,svg2,life_colors,"lifeExpectancy");
    ShowLegendPLIC(0,1,0,0);
    UpdateSlider([68,86]);
}
function Income() {
    cssLegend = "incomelegend";
    select=tipDetail.income;
    select_colors=income_colors;
    ColorScheme(NYdatum,svg,income_colors,"incomePerCapita");
    ColorScheme(Cdatum,svg2,income_colors,"incomePerCapita"); 
    ShowLegendPLIC(0,0,1,0);
    UpdateSlider([8201,99858]);
}
function Crime() {
    cssLegend = "crimelegend";
    select=tipDetail.crime;
    select_colors=crime_colors;
    ColorScheme(NYdatum,svg,crime_colors,"crimePerK");
    ColorScheme(Cdatum,svg2,crime_colors,"crimePerK");
    ShowLegendPLIC(0,0,0,1);
    UpdateSlider([0,99]);
}

/*-----Helper Functions------*/

//returns a [min,max] array of argument. Target is in json Properties.
function minMax(toGet,d){
    var data = d.objects.features.geometries;
    return [d3.min(data, function(i){return i.properties[toGet];}),d3.max(data, function(i){return i.properties[toGet];})];
}

function UpdateSlider(rangeVals){
    if(rangeVals[0]<1)rangeVals[0]=1;
    slider.noUiSlider.updateOptions({
        range:{
            'min':(rangeVals[0]-2),
            'max':(rangeVals[1]+5)
        }
        
    });
    slider.noUiSlider.set([rangeVals[0]-1, rangeVals[0]-1]); 
    sliderValues[0].innerHTML=slider.noUiSlider.get()[0];
    sliderValues[1].innerHTML=slider.noUiSlider.get()[1];
    sliderText.innerHTML=Postfix();
}

function Highlight(NYdata,CData,NYmap,Cmap,color,property,setVals,bool){
    if(bool){
    setVals[0]=format.from(setVals[0]);
    setVals[1]=format.from(setVals[1]);
    } else;
    console.log(setVals);
     NYmap.selectAll("path")
    .data(NYdata.features)
    .transition().duration(1000)
    .style("fill",
      function(d) {
      if (d.properties[property]){ 
          if(d.properties[property] >= setVals[0]  && d.properties[property] <= setVals[1])
            return "yellow";
          else return color(d.properties[property]);
      }
      else return "white"});
   ///////////////////////////// 
    Cmap.selectAll("path")
    .data(CData.features)
    .transition().duration(1000)
    .style("fill",
      function(d) {
      if (d.properties[property]){ 
          if(d.properties[property] >= setVals[0]  && d.properties[property] <= setVals[1])
            return "yellow";
          else return color(d.properties[property]);
      }
      else return "white"});
}

//draws colors for the buttons
function ColorScheme(data,map,color,property){
    map.selectAll("path")
    .data(data.features)
    .transition().duration(1000)
    .style("fill",
      function(d) {
      if (d.properties[property]) return color(d.properties[property]);
      else return "white"});  
}

function AppendLegend(cScale, brewSet, textArray,cssClass,opacity){
    var legendHeight=600;
    parentSVG.selectAll(".legend")
        .data(cScale.domain(),function(d){return d;})
        .enter()
        .append("g")
        .attr("class", cssClass)
        .attr("opacity",opacity)
        .append("rect")//55*i
        //sets the location and width of each colored rectangles and adds the iteratively
        .attr("x", 600)
        .attr("y", function(d,i){return height-175-(55*i)})
        .attr("width", 15)
        .attr("height", 55)
        .attr("fill", function(d, i){ return brewSet[i];})
        .style("stroke", "rgba(105, 105, 105, 0.86)")
        .style("stroke-width", "2px")
        .style("opacity",1)
        .on("mouseover",function(d,i){
        Highlight(NYdatum,Cdatum,svg,svg2,select_colors,select,legendRange[cssLegend][i],false)
        });
    //further appending will append it inside rect. Starting again appending to g.
    parentSVG.selectAll("g."+cssClass)
        .append("text")
        .attr("class", cssClass)
        .attr("x", function(d){ return 600+25})
        .attr("y", function(d,i){return height-140-(55*i)})
        .attr("width", 200)
        .attr("height", 15)
        .style("opacity",opacity)
        .style("fill", "black")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("font-size", 10)
        .text(function(d, i) { return (textArray[i]);});
    //Legend Text
    parentSVG.select("g."+cssClass)
        .append("text")
        .attr("class", cssClass)
        .attr("id","legendText")
        .attr("x", 585)
        .attr("y", height-90)
        .attr("width", 200)
        .attr("height", 15)
        .attr("align","center")
        .style("opacity",opacity)
        .style("fill", "black")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("font-size", 12)
        .text(function(){
            switch(cssClass){
                case "poplegend":
                    return "People";
                    break;
                case "lifelegend":
                    return "In Years";
                    break;
                case "incomelegend":
                    return "US ($)";
                case "crimelegend":
                    return "Per 1000 Residents";
                    break;
            }
        })
}

function ShowLegendPLIC(popOpac,lifeOpac,incomeOpac,crimeOpac){
    d3.selectAll(".poplegend")
        .transition(1000)
        .style("opacity",popOpac);
    d3.selectAll(".lifelegend")
        .transition(1000)
        .style("opacity",lifeOpac);
    d3.selectAll(".incomelegend")
        .transition(1000)
        .style("opacity",incomeOpac);
    d3.selectAll(".crimelegend")
        .transition(1000)
        .style("opacity",crimeOpac);
}
//NY-remove the hundredth digit from the Districts.
function bDistrict(d){
    var ManString=["Manhattan",100],BronxString=["Bronx",200],BrookString=["Brooklyn",300],qString=["Queens",400],StateString=["Staten Island",500];
    switch(d.properties.boro_name){
        case ManString[0]:
            return d.properties.boro_cd-ManString[1];
            break;
        case BronxString[0]:
            return d.properties.boro_cd-BronxString[1];
            break;
        case BrookString[0]:
            return d.properties.boro_cd-BrookString[1];
            break;
        case qString[0]:
            return d.properties.boro_cd-qString[1];
            break;
        case StateString[0]:
            return d.properties.boro_cd-StateString[1];
            break;
        default:
            return "bearsNstuff";
    }
}
function TooltipTextC(d,name,pop,life,inc,crime){
    tooltip.html("<center><b>"+d.properties[name]+"</b></center><br/>"
                        +"Population<hideText>___di___</hideText>: <em>"+d.properties[pop]+" people</em>"+"<br/>"
                        +"Life Expectancy<hideText>_L ii</hideText>: <em>"+d.properties[life]+" years"+"</em><br/>"
                        +"Income Per Capita<hideText>_</hideText>: <em>$"+d.properties[inc]+"</em><br/>"
                        +"Crime<hideText>___________</hideText>: <em>"+d.properties[crime]+"</em><br/>"
                        +'<div id="help">*Crime Rate Per 1000 Residents<div>'
                        );
}

function Postfix(){
    switch(select){
        case tipDetail.population:
            return 'People';
            break;
        case tipDetail.lifeExpectancy:
            return 'Years';
            break;
        case tipDetail.income:
            return 'US $';
            break;
        case tipDetail.crime:
            return 'Per 1000 Residents';
            break;
        default:
            return "";
    }
}