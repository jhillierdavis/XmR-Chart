/**
 * Constructs a IxmrDataSet instance, representing the data set (points) for an iXMR graph.
 *
 * @method IxmrDataSet
 * @param {Array} pDataSet Multi-dimensional array.  Array of (X,Y) points in graph.
 */

var IxmrDataSet = function(pDataSet) {
    
    // ------------------------
    // Private Member Variables 
    // ------------------------
    
    var that = this;
    var points = []; // Holds array of IxmrDataSet
        
    // -------------------
    // Priviledged Methods 
    // -------------------
    
//    that.getDataset = function()   {
//      return pDataSet;  
//    };
    
    that.getPoints = function() {
        return points;
    };
    
    that.getTimeLabels = function()  {
      var arrayTimeLabels = [];
      for (var i=0; i < points.length; i++)   {
          arrayTimeLabels[i] = points[i].getTime();
      }
      return arrayTimeLabels;
    };
    
    
    that.hasSignals = function()    {
        return that.getFirstSignal() ? true : false;
    };
    
    that.getFirstSignal = function()   {
        for (var i=0; i < points.length; i++ )  {
            // if (points[i].isSignal())   {
            if (points[i].getIsSignal())   {            
                return points[i];
            }
        }        
    };
    
    that.getSignalIndices = function()   {
        var signalIndices = [];
        for (var i=0; i < points.length; i++ )  {
            // if (points[i].isSignal())   {
            if (points[i].getIsSignal())   {
                signalIndices.push(i);
            }
        } // for       
        return signalIndices;
    };
    
    
    // ---------------
    // Private Methods 
    // ---------------

    function validateMandatoryObjectParameters()    {
        
        if (!pDataSet) {
            throw new Error("Missing parameter: pDataSet");
        }         
        
        if (!_.isArray(pDataSet))   {
            throw new Error("pDataSet is not an Array!");
        }
        
        if (_.isEmpty(pDataSet))    {
            throw new Error("pDataSet is empty!");
        }
        
        for (var i=0; i < pDataSet.length; i++)    {
            var datum = pDataSet[i];
            if (!_.isArray(datum))   {
                throw new Error("Not an Array: pDataSet[" + i + "] = " + JSON.stringify(datum));
            }            
        }        
    }    
    
    function setConstructorParameters()  {
        for (var i=0; i < pDataSet.length; i++)    {
/*            
            // Ignore header
            if (0 === i)    {
                continue;
            }
*/            
            var datum = pDataSet[i];
            // var obj = new ObjIxmrDatapoint(Number(datum[1]), datum[0]);
            var obj = new IxmrPointInTime(datum[1], datum[0]);
            points.push(obj);
        }        
        
        setInitialMean(points); 
        setMovingRange();
        setInitialMovingRangeMean(points);    
        setInitialSignals();        
        // recalculateMeans();
    }
    
    function setInitialMean(pPoints)    {
        // JHD: Limit to a maximum number of points
        var initialMax = pPoints.length > 12 ? 12 : pPoints.length;
        
        var total = 0;
        for (var i=0; i < initialMax; i++)    {
            total += pPoints[i].getMeasure();
        }        

        // Calculate initial mean value
        var mean = total / initialMax;
        console.log("DEBUG: mean=" + mean);  
        
        for (i=0; i < pPoints.length; i++)   {
            pPoints[i].setMean(mean);
        }        
    }
    
    function setMovingRange()   {
        
        if (points.length <= 1) {
            // console.log("No moving range values possible");
            return; 
        }
        
        for (var i = 1; i < points.length; i++)   {
            var mrValue = Math.abs(points[i].getMeasure() - points[i-1].getMeasure());
            points[i].setMovingRange(mrValue);
        }                
    }
    
    function setInitialMovingRangeMean(pPoints) {
        // JHD: Limit to a maximum number of points
        var initialMax = pPoints.length > 10 ? 10 : pPoints.length;
        
        
        var total = 0;
        for (var i=1; i < initialMax; i++)    {
            total += pPoints[i].getMovingRange();
            // console.log("DEBUG: pPoints[" + i + "].getMovingRange()=" + pPoints[i].getMovingRange() + " , total=" + total);            
        }        

        // Calculate initial mean value
        var mean = (total * 10) / ((initialMax -1) * 10);
        // console.log("DEBUG: MovingRangeMean=" + mean);  
        
        
        // Set initial moving range on all points
        for (i=0; i < pPoints.length; i++)   {
            pPoints[i].setMovingRangeMean(mean);
        }                
    } // setInitialMovingRangeMean
    
    function setInitialSignals()    {
        var runArray = [];
        var trendUpArray = [];
        var trendDownArray = [];
        var cyclingArray = [];
        
        for(var i=0; i < points.length; i++)    {
            
            // Find outliers
            if (points[i].getMeasure() > points[i].getMeasureUpperControlLimit() || points[i].getMeasure() < points[i].getMeasureLowerControlLimit())    {
                points[i].setIsSignal(true);
            }
            
            
            // Find Sifts (i.e. Runs) on either side of the mean line
            if (_.isEmpty(runArray))    {
                runArray.push(points[i]);
            } else {
                var lastRunPoint = _.last(runArray);
                if ((lastRunPoint.getMeasure() > lastRunPoint.getMean() && points[i].getMeasure() > points[i].getMean()) 
                        || (lastRunPoint.getMeasure() < lastRunPoint.getMean() && points[i].getMeasure() < points[i].getMean())) {
                    runArray.push(points[i]);
                    if (runArray.length >= 7)    {
                        for (var x = 0; x < 7; x++ )  {
                            runArray[x].setIsSignal(true);
                        }
                        recalculateMeans((i + 1) - x);  
                        runArray = [];
                        runArray.push(points[i]);                        
                    } 
                    
                } else {
                    // Reset array
                    runArray = [];
                    runArray.push(points[i]);
                }
            }
            
            
            if (_.isEmpty(trendUpArray))  {
               trendUpArray.push(points[i]);
            } else {
                
                var lastTrendPoint = _.last(trendUpArray);
                if (lastTrendPoint.getMeasure() > points[i].getMeasure())   {
                    trendUpArray.push(points[i]);
                    if (trendUpArray.length >= 7)    {
                        for (var x = 0; x < 7; x++ )  {
                            trendUpArray[x].setIsSignal(true);
                        }
                        recalculateMeans();
                        trendUpArray = [];
                        trendUpArray.push(points[i]);                        
                    }
                } else {
                    trendUpArray = [];
                    trendUpArray.push(points[i]);
                }
            }
            

            if (_.isEmpty(trendDownArray))  {
               trendDownArray.push(points[i]);
            } else {
                
                var lastTrendPoint = _.last(trendDownArray);
                if (lastTrendPoint.getMeasure() > points[i].getMeasure())   {
                    trendDownArray.push(points[i]);
                    if (trendDownArray.length >= 7)    {
                        for (var x = 0; x < trendDownArray.length; x++ )  {
                            trendDownArray[x].setIsSignal(true);
                        }
                        recalculateMeans();
                        trendDownArray = [];
                        trendDownArray.push(points[i]);                        
                    }
                } else {
                    trendDownArray = [];
                    trendDownArray.push(points[i]);
                }
            }

            
            // Find cycling points (regular oscillations about the mean line)
            if (_.isEmpty(cyclingArray))  {
               cyclingArray.push(points[i]);
            } else {
                
                var lastCyclingPoint = _.last(cyclingArray);
                if ((lastCyclingPoint.getMeasure() > lastCyclingPoint.getMean() && points[i].getMeasure() < points[i].getMean()) || 
                        (lastCyclingPoint.getMeasure() < lastCyclingPoint.getMean() && points[i].getMeasure() > points[i].getMean()))   {
                    cyclingArray.push(points[i]);
                    if (cyclingArray.length >= 10)    {
                        for (var x = 0; x < cyclingArray.length; x++ )  {
                            cyclingArray[x].setIsSignal(true);
                        }
                    }
                } else {
                    cyclingArray = [];
                    cyclingArray.push(points[i]);
                }
            }
            
        }
    } // setInitialSignals
    
    function recalculateMeans(pSignalIndex) {
        // console.log("DEBUG: recalculateMeans:  pSignalIndex=" + pSignalIndex);
        
        if (!that.hasSignals())  {
            return; // Nothing to do!
        }
        
        var signalIndex = pSignalIndex;
        if (!signalIndex)  {
            var signalPoint = that.getFirstSignal();
            signalIndex = _.indexOf(points, signalPoint);
        }
        
        if ((signalIndex + 1 )=== points.length)  {            
            return; // Don't recalculate if the last point
        }
        
        var subsetPoints = _.rest(points, signalIndex);
        console.log("DEBUG: recalculateMeans: signalIndex = " + signalIndex + ", subsetPoints = " + JSON.stringify(subsetPoints) + ", subsetPoints.length=" + subsetPoints.length);
        
        setInitialMean(subsetPoints);
        setInitialMovingRangeMean(subsetPoints);
    } // recalculateMeans
        
    function construct(pInstance) {
        // Ensure valid construction using new keyword
        if (!(pInstance instanceof IxmrDataSet)) {
            return new IxmrDataSet(pDataSet);
        }
        
        validateMandatoryObjectParameters();
        setConstructorParameters();
        
        return pInstance;
    }

    return construct(this); // NB: Must be last line in object
};