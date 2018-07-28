/**
 * Constructs a IxmrPointInTime instance, representing a chart point in a time series.
 *
 * @method IxmrPointInTime
 * @param {Number} pMeasureValue Y axis value (measure)
 * @param {Object} pTimeValue X axis value (time)
 */

function IxmrPointInTime(pMeasureValue, pTimeValue) {
    that = this; // maintain reference to original this

    var measureValue = 0;  // Y value
    var timeValue = 0; // X value
    var meanValue = 0; // average (at X,Y)

    // Moving Range
    var movingRangeValue = 0;
    var movingRangeMeanValue = 0;
    // var movingRangeUpperControlLimitValue = 0;

    // Control limits
    // var measureUpperControlLimitValue = 0;
    // var measureLowerControlLimitValue = 0;

    // Whether represents a signal
    var isSignal = false; // private boolean
    
    // var basicMaths = new BasicMaths();

    // -------------------
    // Priviledged Methods - Interface definition
    // -------------------

    that.getMeasure = function() {
        return measureValue;
    };

    that.getTime = function() {
        return timeValue;
    };
        
    that.getMean = function() {           
        if (arguments[0]) {
            // Handle optional parameter for number of decimal places in response
            return (new BasicMaths()).toFixedFloat(meanValue, arguments[0]);
        }
        return meanValue;
    };

    that.setMean = function(pMean) {
        if (!_.isNumber(pMean)) {
            throw new Error("Invalid parameter: Not a number: pMean =" + pMean);
        }
        meanValue = pMean;
    };

    that.getMovingRange = function() {
        if (arguments[0]) {
            // Handle optional parameter for number of decimal places in response
            return (new BasicMaths()).toFixedFloat(movingRangeValue, arguments[0]);
        }        
        return movingRangeValue;
    };

    that.setMovingRange = function(pMovingRange) {
        if (!_.isNumber(pMovingRange)) {
            throw new Error("Invalid parameter: Not a number: pMovingRange = " + pMovingRange);
        }
        movingRangeValue = pMovingRange;
    };

    that.getMovingRangeMean = function() {
        if (arguments[0]) {
            // Handle optional parameter for number of decimal places in response
            return (new BasicMaths()).toFixedFloat(movingRangeMeanValue, arguments[0]);
        }        
        
        return movingRangeMeanValue;
    };

    that.setMovingRangeMean = function(pMovingRangeMean) {
        if (!_.isNumber(pMovingRangeMean)) {
            throw new Error("Invalid parameter: Not a number: pMovingRangeMean = " + pMovingRangeMean);
        }
        movingRangeMeanValue = pMovingRangeMean;
    };

    that.getMovingRangeUpperControlLimit = function() {
        var movingRangeUpperControlLimitValue = 3.27 * this.getMovingRangeMean();
        // console.log("DEBUG: movingRangeUpperControlLimitValue=" + movingRangeUpperControlLimitValue + "(3.27 * getMovingRangeMean())=" + this.getMovingRangeMean());
        
        if (arguments[0]) {
            // Handle optional parameter for number of decimal places in response
            return (new BasicMaths()).toFixedFloat(movingRangeUpperControlLimitValue , arguments[0]);
        }                
        return movingRangeUpperControlLimitValue ;
    };


    that.getMeasureUpperControlLimit = function() {
        var measureUpperControlLimitValue = this.getMean(1) + (2.66 * this.getMovingRangeMean(1));
        // console.log("DEBUG: measureUpperControlLimitValue=" + measureUpperControlLimitValue + ", mean=" + this.getMean(1) + " , movingRangeMean="+ this.getMovingRangeMean(1));
        
        if (arguments[0]) {
            // Handle optional parameter for number of decimal places in response
            return (new BasicMaths()).toFixedFloat(measureUpperControlLimitValue , arguments[0]);
        }                
        
        return measureUpperControlLimitValue;
    };

    that.getMeasureLowerControlLimit = function() {
        var measureLowerControlLimitValue = this.getMean(1) - (2.66 * this.getMovingRangeMean(1));
        // console.log("DEBUG: measureLowerControlLimitValue=" + measureLowerControlLimitValue + ", mean=" + this.getMean(1) + " , movingRangeMean="+ this.getMovingRangeMean(1));

        if (arguments[0]) {
            // Handle optional parameter for number of decimal places in response
            return (new BasicMaths()).toFixedFloat(measureLowerControlLimitValue , arguments[0]);
        }                
        
        return measureLowerControlLimitValue;
    };
    
    that.getMeasureUpperFirstSigmaLimit = function() {
        var limit = this.getMean(1) + ((2.66 * this.getMovingRangeMean(1)) / 3);
        // console.log("DEBUG: measureUpperFirstSigmaValue=" + limit );
        
        if (arguments[0]) {
            // Handle optional parameter for number of decimal places in response
            return (new BasicMaths()).toFixedFloat(limit , arguments[0]);
        }                
        
        return limit;
    };

    that.getMeasureLowerFirstSigmaLimit = function() {
        var limit = this.getMean(1) - ((2.66 * this.getMovingRangeMean(1)) / 3);
        // console.log("DEBUG: measureLowerFirstSigmaValue=" + limit );
        
        if (arguments[0]) {
            // Handle optional parameter for number of decimal places in response
            return (new BasicMaths()).toFixedFloat(limit , arguments[0]);
        }                
        
        return limit;
    };

    that.getMeasureUpperSecondSigmaLimit = function() {
        var limit = this.getMean(1) + (2 * (2.66 * this.getMovingRangeMean(1)) / 3);
        // console.log("DEBUG: measureUpperSecondSigmaValue=" + limit );
        
        if (arguments[0]) {
            // Handle optional parameter for number of decimal places in response
            return (new BasicMaths()).toFixedFloat(limit , arguments[0]);
        }                
        
        return limit;
    };

    that.getMeasureLowerSecondSigmaLimit = function() {
        var limit = this.getMean(1) - (2 * (2.66 * this.getMovingRangeMean(1)) / 3);
        // console.log("DEBUG: measureLowerSecondSigmaValue=" + limit );
        
        if (arguments[0]) {
            // Handle optional parameter for number of decimal places in response
            return (new BasicMaths()).toFixedFloat(limit , arguments[0]);
        }                
        
        return limit;
    };

    that.setIsSignal = function(pBoolean) {
        if (!_.isBoolean(pBoolean)) {
            throw new Error("Invalid parameter: Not a boolean: pBoolean = " + pBoolean);
        }
        isSignal = pBoolean;
    };


    that.getIsSignal = function() {
        return isSignal;
    };

    // ---------------
    // Private Methods 
    // ---------------

    function validateMandatoryObjectParameters() {
        // console.log("DEBUG: validateMandatoryObjectParameters: pMeasureValue=" + pMeasureValue + " , pTimeValue=" + pTimeValue );

        if (_.isUndefined(pMeasureValue)) {
            throw new Error("Missing parameter: pMeasureValue");
        }

        if (_.isUndefined(pTimeValue)) {
            throw new Error("Missing parameter: pTimeValue");
        }

        if (!_.isNumber(pMeasureValue)) {
            var parsedValue = parseFloat(pMeasureValue);
            if (NaN === parsedValue) {
                throw new Error("Invalid parameter value (non-numeric): pMeasure = " + pMeasureValue);
            }
            pMeasureValue = parsedValue; // Convert
        }
    }

    function setConstructorParameters() {
        measureValue = Number(pMeasureValue);
        timeValue = pTimeValue;
    } // setConstructorParameters

    function construct(pInstance) {
        // Ensure valid construction using new keyword
        if (!(pInstance instanceof IxmrPointInTime)) {
            return new IxmrPointInTime(pMeasureValue, pTimeValue);
        } else {
            validateMandatoryObjectParameters();
            setConstructorParameters();
            return pInstance;
        }
    } // construct

    return construct(that); // NB: Must be last line in object
} // IxmrPointInTime