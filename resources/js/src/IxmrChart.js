/* 
 * i-XMR chart JavaScript library
 */

// Setup namespace
// var xmrjs = xmrjs || {};


var IxmrChart = function(pSelectorId, pWidth, pHeight) {
    
    // ------------------------
    // Private Member Variables 
    // ------------------------
    
    var that = this;

    that.svg = null; // SVG element
    that.canvas_width = null;
    that.canvas_height = null;
    that.xScale = null; // X scale
    that.yScale = null; // Y scale 
    that.xAxis = null; // y axis
    that.yAxis = null; // y axis
    that.margin = {top: 20, right: 20, bottom: 30, left: 40}; // Chart margin object
    that.width = 960 - that.margin.left - that.margin.right; // Chart width
    that.height = 500 - that.margin.top - that.margin.bottom; // Chart height
    
    that.updateMode = false;
    
    that.TRANSITION_DURATION = 750;    
/*   
    // Minimal options 
    that.options = {
        debug: true, 
        line: false,
        points: false,
        sigmaLines: false, 
        sigmaAreas:false,
        controlLimitLines: false, 
        controlLimitArea: false, 
        meanLine: false, 
        gridLines: false,
        pulseSignals: false
    };
*/    
    
    that.options = {
        debug: true, 
        line: false,
        points: true,
        sigmaLines: false, 
        sigmaAreas: true,
        controlLimitLines: false, 
        controlLimitArea: true, 
        meanLine: true, 
        gridLines: true,
        pulseSignals: true
    };

    // -------------------
    // Priviledged Methods 
    // -------------------
    
    that.draw = function(pIxmrDataset, pXaxisLabel, pYaxisLabel)   {
        // console.log("DEBUG: [draw] pIxmrDataset=" + JSON.stringify(pIxmrDataset));
        var points = pIxmrDataset.getPoints();
                                        
        scale(points, pIxmrDataset.getTimeLabels());
        
        generateChartCanvas(pSelectorId);
          
        /*
        var area = d3.svg.area()
	.x(function(d, i) { 
		return that.xScale(i); 
	})
	.y0(that.height)
	.y1(function(d, i) { 
		// console.log("DEBUG: area.y1 d=" + JSON.stringify(d));		
		return that.yScale(d.getMeasure());
	});
        */
        
        var controlLimitArea = d3.area() 
                .x(function(point, i) {
                    return that.xScale(i);
                })
                .y0(function(point) {
                    return that.yScale(point.getMeasureLowerControlLimit());
                })
                .y1(function(point) {
                    return that.yScale(point.getMeasureUpperControlLimit());                    
                });            
                
        var secondSigmaArea = d3.area() 
                .x(function(point, i) {
                    return that.xScale(i);
                })
                .y0(function(point) {
                    return that.yScale(point.getMeasureLowerSecondSigmaLimit());
                })
                .y1(function(point) {
                    return that.yScale(point.getMeasureUpperSecondSigmaLimit());                    
                });            
                
                
        var firstSigmaArea = d3.area() 
                .x(function(point, i) {
                    return that.xScale(i);
                })
                .y0(function(point) {
                    return that.yScale(point.getMeasureLowerFirstSigmaLimit());
                })
                .y1(function(point) {
                    return that.yScale(point.getMeasureUpperFirstSigmaLimit());                    
                });            
                
        
        var valueline = d3.line()
	.x(function(d, i) { 
            console.log("DEBUG: d=" + JSON.stringify(d.getTime()) + " , i=" + i + " , xScale[i]=" + that.xScale(i));
            return that.xScale(i); 
        })
	.y(function(d, i) { return that.yScale(d.getMeasure()); }); 

	// Add the filled area

        if (that.options.controlLimitArea)    {
            that.svg.append("path")
		.datum(points)
		.attr("class", "controlLimitArea")
		.attr("d", controlLimitArea);
        }                

        if (that.options.sigmaAreas)    {
            that.svg.append("path")
                    .datum(points)
                    .attr("class", "secondSigmaArea")
                    .attr("d", secondSigmaArea);

            that.svg.append("path")
                    .datum(points)
                    .attr("class", "firstSigmaArea")
                    .attr("d", firstSigmaArea);
        }

        // Add the valueline path.
	that.svg.append("path")
		.attr("class", "line")
		.attr("d", valueline(points));
        
        drawAxies(pXaxisLabel, pYaxisLabel, pIxmrDataset.getTimeLabels()); 
        if (that.options.gridLines) {
            drawGridLines();
        }
        
        if (that.options.line) {
            drawConnectingLinesBetweenPoints(points);
        }
        
        // Overlay dots at points        
        if (that.options.points) {        
            drawDotsAtPoints(points);
        }
        
        if (that.options.meanLine)  {
            drawMeanLine(".meanLine", points, "green");
        }
        
        if (that.options.controlLimitLines) {
            drawUpperControlLimit(points);          
            drawLowerControlLimit(points);  
        }

        if (that.options.sigmaLines)    {
            drawUpperFirstSigmaLimit(points);          
            drawLowerFirstSigmaLimit(points);  

            drawUpperSecondSigmaLimit(points);          
            drawLowerSecondSigmaLimit(points);  
        }

        drawLegend();
        
	// Add the title
	that.svg.append("text")
		.attr("x", (that.width / 2))				// places the title in the middle of the graph
		.attr("y", 0 - (that.margin.top / 2) + 2)	// places the title in the middle of the top y margin
		.attr("text-anchor", "middle")		// aligns the text to the middle of the x,y point
		.style("font-size", "16px") 		// sets the font style
		.style("text-decoration", "underline") 	// sets the font style
		.text("iXMR Chart");		// Title text
        
        
        that.updateMode = true;
    }; // draw
    
    
    
    
    
    // ---------------
    // Private Methods 
    // ---------------
    
    function generateChartCanvas(pSelectorId)   {
            // console.log("[generateChartCanvas]");
        
            that.svg = d3.select(pSelectorId).append("svg")
                .attr("width", that.width + that.margin.left + that.margin.right)
                .attr("height", that.height + that.margin.top + that.margin.bottom)
              .append("g")
                .attr("transform", "translate(" + that.margin.left + "," + that.margin.top + ")");              
    } // generateChartCanvas
        
    function scale(pPoints, pTimeLabels)    {
        // console.log("[scale]");
        console.log("[scale]  pTimeLabels=" + JSON.stringify(pTimeLabels));


        that.xScale = d3.scaleLinear().range([0, that.width]);
        that.xScale.domain([0, pPoints.length - 1]);    


        that.yScale = d3.scaleLinear()
            .range([that.height, 0]);

//        data.forEach(function(d) {
//            d[1] = +d[1]; // Convert to number
//          });

          // x.domain(d3.extent(data, function(d) { return d.Month; })).nice();
          var maxAndMin = d3.extent(pPoints, function(point) { return point.getMeasure(); });
          // console.log("DEBUG: maxAndMin = " + JSON.stringify(maxAndMin)); 
            
          var max = d3.max(pPoints, function(point) { return point.getMeasure() > point.getMeasureUpperControlLimit() ? point.getMeasure(1) : point.getMeasureUpperControlLimit(1); });
          var min = d3.min(pPoints, function(point) { return point.getMeasure() < point.getMeasureLowerControlLimit() ? point.getMeasure(1) : point.getMeasureLowerControlLimit(1); });
          // console.log("DEBUG: Y scale: min=" + min + ", max=" + max);
          
          that.yScale.domain([min, max]).nice();
      } // scale
    
    function drawAxies(pXaxisLabel, pYaxisLabel, pXaxisDisplayValues) {
        // console.log("[drawAxies]");
        
        that.xAxis = d3.axisBottom()
            .scale(that.xScale)
            /*
            .tickValues(pIxmrDataset.getTimeLabels().map(
                function(d, i) { 
                    console.log("DEBUG: d=" + d + " , i=" + i);
                    return d; 
                }))           
           */
            .ticks(5);
    
        that.xAxis.tickFormat(function(i){ return pXaxisDisplayValues[i]; });

        var formatYaxisLabel = d3.format(".2s"); // See https://github.com/mbostock/d3/wiki/Formatting
        that.yAxis = d3.axisLeft()
            .scale(that.yScale)
            .ticks(5)
            .tickFormat(formatYaxisLabel); 
        
        
          that.svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + that.height + ")")
              .call(that.xAxis)
              .append("text")
              .attr("class", "label")
              .attr("x", that.width)
              .attr("y", -6)
              .style("text-anchor", "end")
              .text(pXaxisLabel);

          that.svg.append("g")
              .attr("class", "y axis")
              .call(that.yAxis);
      
	// Add a copy of the text label with a white background for legibility
	that.svg.append("text")
              .attr("class", "label")        
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("x", that.margin.top - (that.height / 2))
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.attr("class", "shadow")
		.text(pYaxisLabel);
      
      
          that.svg.append("text")
              .attr("class", "label")
              .attr("transform", "rotate(-90)")
              .attr("x", that.margin.top - (that.height / 2)) // Center label text against Y-axis
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              // .attr("class", "shadow")
              .text(pYaxisLabel);
            
  } // drawAxies
  
  function drawGridLines()  {
      
        function make_x_axis() {		// function for the x grid lines
          return d3.axisBottom()
              .scale(that.xScale)
              .ticks(5);
        }

        function make_y_axis() {		// function for the y grid lines
          return d3.axisLeft()
              .scale(that.yScale)
              .ticks(5);
        }  
      
      	that.svg.append("g")			// Draw the x Grid lines
		.attr("class", "grid")
		.attr("transform", "translate(0," + that.height + ")")
		.call(make_x_axis()
			.tickSize(-that.height, 0, 0)
			.tickFormat("")
		);

	that.svg.append("g")			// Draw the y Grid lines
		.attr("class", "grid")
		.call(make_y_axis()
			.tickSize(-that.width, 0, 0)
			.tickFormat("")
		);      
  } // drawGridLines
  
    
    
    function drawConnectingLinesBetweenPoints(pPoints) {
        console.log("DEBUG: [drawConnectingLinesBetweenPoints] pPoints=" + JSON.stringify(pPoints));
/*
        var area = d3.svg.area()
	.x0(function(d, i) { 
            console.log("DEBUG: area.x0: d=" + d + ", i=" + i + " , xScale=" + that.xScale(i));           
            return that.xScale(i); 
        })
	.y0(function(d, i) { 
            console.log("DEBUG: area.y0: height=" + that.height + " , i=" + i);            
            return that.height;
        })
	.y1(function(d, i) {             
            console.log("DEBUG: area.y1: d=" + d.getMeasure() + ", i=" + i + " , yScale=" + that.yScale(d.getMeasure()));
            return that.yScale(i * 10); 
        });   

        	// Add the filled area
	that.svg.append("path")
		.datum(pPoints)
		.attr("class", "area")
		.attr("d", area);
*/
        
            var lines = that.svg.selectAll(".lines")
                            .data(pPoints)
                            .enter()
                            .append("line")
                            .attr("class", "line")
                            .attr("x1", function(point,i) {                       
                        // console.log("[drawConnectingLinesBetweenPoints] i=" + i + " , that.xScale(i)=" + that.xScale(i));              
                        return that.xScale(i);
                    })
                            .attr("y1", function(point) {
                        return that.yScale(point.getMeasure());
                    })
                            .attr("x2", function(point, i) {
                        // var datum = data[i < data.length ? i + 1 : i];
                        var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                        return that.xScale(nextIndex);
                    })
                            .attr("y2", function(point, i) {
                        var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                        // console.log("i=" + i + ", nextIndex=" + nextIndex + ", length=" + data.length);
                        return that.yScale(pPoints[nextIndex].getMeasure());
                    })
                    .style("stroke", function(point) { return "blue"; });  

        
  
        
        

        
/*        
        	// Add the valueline path.
	that.svg.append("path")
		.attr("class", "line")
		.attr("d", valueline(pPoints));
*/
          
        /*
        var area = d3.svg.area()
                .x(function(d, i) { return that.xScale(i); })
                .y0(that.height)
                .y1(function(d, i) { return that.yScale(pPoints[i].getMeasure()); });
//                .style("fill", function(d) { return "green"; });
        */
/*       
       var area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d, i) { return i; })
    .y0(that.height)
    .y1(function(d,i) { return 120; });

lines.append("path")
      .attr("class", "area")
      .attr("d", function(d) { return area; })
      .style("fill", function(d) { return "green"; });
*/
                    
    } // drawConnectingLinesBetweenPoints
    
    function drawDotsAtPoints(pPoints) {
        // Draw dots
        var dots = that.svg.selectAll(".dot")
                .data(pPoints)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("r", 3.5)
                .attr("cx", function(point, i) {                    
                    // console.log("[drawDotsAtPoints] i=" + i + " , that.xScale(i)=" + that.xScale(i))
                    return that.xScale(i);
                })
                .attr("cy", function(point) {
                    return that.yScale(point.getMeasure());
                })
                .style("fill", function(point) {
                    return (point.getIsSignal() === true ? "red" : "blue"); 
                    // return "black";
                });
                
// Define 'div' for tooltips
var div = d3.select("body").append("div")	// declare the properties for the div used for the tooltips
	.attr("class", "tooltip")				// apply the 'tooltip' class
	.style("opacity", 0);	                
                
        dots	// Tooltip stuff after this
	    .on("mouseover", function(d, i) {							// when the mouse goes over a circle, do the following
			div.transition()									// declare the transition properties to bring fade-in div
				.duration(200)									// it shall take 200ms
				.style("opacity", .9);							// and go all the way to an opacity of .9
			div	.html("y=" + d.getMeasure() + "<br/>x=" + d.getTime())	// add the text of the tooltip as html 
				.style("left", (d3.event.pageX) + "px")			// move it in the x direction 
				.style("top", (d3.event.pageY - 28) + "px");	// move it in the y direction
			})													// 
		.on("mouseout", function(d) {							// when the mouse leaves a circle, do the following
			div.transition()									// declare the transition properties to fade-out the div
				.duration(500)									// it shall take 500ms
				.style("opacity", 0);							// and go all the way to an opacity of nil
		});
                
        
        dots.each(function(d, i)    {
            if (pPoints[i].getIsSignal())   {
            // console.log("DEBUG: each() this=" + JSON.stringify(this) + ", i =" + i);
                        var circle = d3.select(this);
                        /*
                        // circle = this;
			(function repeat() {
				circle = circle.transition()
					.duration(2500)
					.attr("stroke-width", 0.5)
					.attr("r", 3.5)
                                        .style("fill", "blue")
					.transition()
					.duration(2500)
					.attr('stroke-width', 1.5)
					.attr("r", 7.5)
                                        .style("fill", "red")
					// .ease('sine')
					.on("end", repeat);
			})(); 
                        */
                       if (that.options.pulseSignals)   {
                            pulse(circle);
                       }
                    }
        });

        /*        
        dots.transition()
            .duration(1000) // this is 1s
            .delay(function(d, i) { return 250 * i; })     // this is 0.25s x i    
            .attr("r", function(d, i) {
                    return (pPoints[i].getIsSignal() === true ? 5 : 3.5);
                }) 
                .style("fill", function(d, i) {
                    console.log("DEBUG: d=" + JSON.stringify(pPoints[i]) + ", i =" + i);
                    return (pPoints[i].getIsSignal() === true ? "red" : "blue");
                });
       */                
    } // drawPoints
    
        function pulse(pCircle) {
                        // circle = this;
			(function repeat() {
				pCircle = pCircle.transition()
					.duration(2000)
					.attr("stroke-width", 0.5)
					.attr("r", 3.5)
					.transition()
					.duration(2000)
					.attr('stroke-width', 0.5)
					.attr("r", 7.5)
                                        .style("fill", "red")
					// .ease('sine')
					.on("end", repeat);
			})();
		}    
    
    function drawUpperControlLimit(pPoints) {
        that.svg.selectAll(".measureUpperControlLimit")
                .data(pPoints)
                .enter().append("line")
                .attr("class", "upperControlLimitLine") // Style via CSS
                .attr("x1", function(point, i) {
                    return that.xScale(i);
                })
                .attr("y1", function(point) {
                    return that.yScale(point.getMeasureUpperControlLimit());
                })
                .attr("x2", function(point, i) {
                    // var datum = data[i < data.length ? i + 1 : i];
                    var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                    return that.xScale(nextIndex);
                })
                .attr("y2", function(point, i) {
                    var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                    // console.log("i=" + i + ", nextIndex=" + nextIndex + ", length=" + data.length);
                    return that.yScale(pPoints[nextIndex].getMeasureUpperControlLimit());
                });
                /*
                .style("stroke", function(point) {
                    return "purple";
                });
                */
    } // drawUpperControlLimit
    
    
    function drawLowerControlLimit(pPoints) {
        that.svg.selectAll(".measureLowerControlLimitLine")
                .data(pPoints)
                .enter().append("line")
                .attr("class", "lowerControlLimitLine") // Style via CSS
                .attr("x1", function(point, i) {
                    return that.xScale(i);
                })
                .attr("y1", function(point) {
                    return that.yScale(point.getMeasureLowerControlLimit());
                })
                .attr("x2", function(point, i) {
                    // var datum = data[i < data.length ? i + 1 : i];
                    var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                    return that.xScale(nextIndex);
                })
                .attr("y2", function(point, i) {
                    var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                    // console.log("i=" + i + ", nextIndex=" + nextIndex + ", length=" + data.length);
                    return that.yScale(pPoints[nextIndex].getMeasureLowerControlLimit());
                });
                /*
                .style("stroke", function(point) {
                    return "purple";
                });
                */
    } // drawLowerControlLimit
    
    function drawUpperFirstSigmaLimit(pPoints) {
        that.svg.selectAll(".measureUpperFirstSigmaLimit")
                .data(pPoints)
                .enter().append("line")
                .attr("class", "upperFirstSigmaLine") // Style via CSS 
                .attr("x1", function(point, i) {
                    return that.xScale(i);
                })
                .attr("y1", function(point) {
                    return that.yScale(point.getMeasureUpperFirstSigmaLimit());
                })
                .attr("x2", function(point, i) {
                    // var datum = data[i < data.length ? i + 1 : i];
                    var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                    return that.xScale(nextIndex);
                })
                .attr("y2", function(point, i) {
                    var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                    // console.log("i=" + i + ", nextIndex=" + nextIndex + ", length=" + data.length);
                    return that.yScale(pPoints[nextIndex].getMeasureUpperFirstSigmaLimit());
                });
                /*
                .style("stroke", function(point) {
                    return "purple";
                });
                */
    } // drawUpperFirstSigmaLimit
    
    
    function drawLowerFirstSigmaLimit(pPoints) {
        that.svg.selectAll(".measureLowerFirstSigmaLimit")
                .data(pPoints)
                .enter().append("line")
                .attr("class", "lowerFirstSigmaLine") // Style via CSS 
                .attr("x1", function(point, i) {
                    return that.xScale(i);
                })
                .attr("y1", function(point) {
                    return that.yScale(point.getMeasureLowerFirstSigmaLimit());
                })
                .attr("x2", function(point, i) {
                    var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                    return that.xScale(nextIndex);
                })
                .attr("y2", function(point, i) {
                    var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                    return that.yScale(pPoints[nextIndex].getMeasureLowerFirstSigmaLimit());
                });
                /*
                .style("stroke", function(point) {
                    return "purple";
                });
                */
    } // drawLowerFirstSigmaLimit
    
    function drawUpperSecondSigmaLimit(pPoints) {
        that.svg.selectAll(".measureUpperSecondSigmaLimit")
                .data(pPoints)
                .enter().append("line")
                .attr("class",  "upperSecondSigmaLine") // Style via CSS 
                .attr("x1", function(point, i) {
                    return that.xScale(i);
                })
                .attr("y1", function(point) {
                    return that.yScale(point.getMeasureUpperSecondSigmaLimit());
                })
                .attr("x2", function(point, i) {
                    var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                    return that.xScale(nextIndex);
                })
                .attr("y2", function(point, i) {
                    var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                    return that.yScale(pPoints[nextIndex].getMeasureUpperSecondSigmaLimit());
                });
                /*
                .style("stroke", function(point) {
                    return "purple";
                });
                */
    } // drawUpperSecondSigmaLimit
    
    
    function drawLowerSecondSigmaLimit(pPoints) {
        that.svg.selectAll(".measureLowerSecondSigmaLimit")
                .data(pPoints)
                .enter().append("line")
                .attr("class", "upperSecondSigmaLine") // Style via CSS 
                .attr("x1", function(point, i) {
                    return that.xScale(i);
                })
                .attr("y1", function(point) {
                    return that.yScale(point.getMeasureLowerSecondSigmaLimit());
                })
                .attr("x2", function(point, i) {
                    var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                    return that.xScale(nextIndex);
                })
                .attr("y2", function(point, i) {
                    var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                    return that.yScale(pPoints[nextIndex].getMeasureLowerSecondSigmaLimit());
                });
                /*
                .style("stroke", function(point) {
                    return "purple";
                });
                */
    } // drawLowerSecondSigmaLimit
    
    function drawLegend()   {
           var color = d3.scaleOrdinal( d3.schemeCategory10 ); 
        
          // Draw legend
          var legend = that.svg.selectAll(".legend")
              .data(color.domain())
            .enter().append("g")
              .attr("class", "legend")
              .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

          legend.append("rect")
              .attr("x", that.width - 18)
              .attr("width", 18)
              .attr("height", 18)
              .style("fill", color);

          legend.append("text")
              .attr("x", that.width - 24)
              .attr("y", 9)
              .attr("dy", ".35em")
              .style("text-anchor", "end")
              .text(function(d) { return xAxisLabel; });    
        
    } // drawLegend
    
    function drawMeanLine(pClass, pPoints, pColor) {
                       that.svg.selectAll(pClass)
                            .data(pPoints)
                            .enter().append("line")
                            .attr("class", "meanLine")
                            .attr("x1", function(point,i) {
                        return that.xScale(i);
                    })
                            .attr("y1", function(point) {
                        return that.yScale(point.getMean());
                    })
                            .attr("x2", function(point, i) {
                        // var datum = data[i < data.length ? i + 1 : i];
                        var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                        return that.xScale(nextIndex);
                    })
                            .attr("y2", function(point, i) {
                        var nextIndex = i < (pPoints.length - 1) ? i + 1 : i;
                        // console.log("i=" + i + ", nextIndex=" + nextIndex + ", length=" + data.length);
                        return that.yScale(pPoints[nextIndex].getMean());
                    });
                    /*
                    .style("stroke", function(point) { return pColor; });
                    */

    } // drawline
    

    function validateMandatoryObjectParameters()    {
        
        if (!pSelectorId) {
            throw new Error("IxmrChart.construct(): Missing parameter: " + "pSelectorId");
        }         
    } // validateMandatoryObjectParameters    
    
    function construct(pInstance) {
        validateMandatoryObjectParameters();
        
        // Ensure valid construction using new keyword
        if (!(pInstance instanceof IxmrChart)) {
            return new IxmrChart();
        }
        return pInstance;
    }

    return construct(this); // NB: Must be last line in object
}; // IxmrChart