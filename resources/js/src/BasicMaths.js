/**
 * Object encapsulating basic maths functionality (e.g. totalling, mean etc.)
 */

function BasicMaths() {
    that = this; // maintain reference to original this
} // BasicMaths

BasicMaths.prototype.calculateMean = function(pValues) {
    // Validate arguments
    if (!pValues || pValues[0] === undefined) {
        throw "Invalid argument pValues=" + pValues;
    }

    var total = that.calculateTotal(pValues);

    // Calculate initial mean value
    var mean = total / pValues.length;

    return that.toFixedFloat(mean);
};

BasicMaths.prototype.calculateTotal = function(pValues) {
    // Validate arguments
    if (!pValues || pValues[0] === undefined) {
        throw "InvalidArgumentException";
    }

    var total = 0;
    if (pValues.length > 0) {
        // Multiple & then divide by 100 to avoid JavaScript floating point arithmetic issues
        for (var i = 0; i < pValues.length; i++) {
            total += (pValues[i] * 100);
        }
        total = total / 100;
    }
    // console.log("DEBUG: total=" + total);
    return that.toFixedFloat(total);
};

BasicMaths.prototype.toFixedFloat = function(pValue, pOptionDecimalPlaces) {
    var decimalPlaces = 2; // Default
    
    if (pOptionDecimalPlaces)    {
        if (_.isNumber(pOptionDecimalPlaces) && pOptionDecimalPlaces > 0)   {
            decimalPlaces = pOptionDecimalPlaces;
        } else {
            throw new Error("InvalidArgumentException: pOptionDecimalPlaces=" + pOptionDecimalPlaces)           
        }
    }
    return parseFloat(pValue.toFixed(decimalPlaces));
};