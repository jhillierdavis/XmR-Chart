/**
 * Object encapsulating basic validation functionality (e.g. totalling, mean etc.)
 *
 * NB: Required underscore.js
 */

function Validator() {
	that = this; // maintain reference to original this
} // Validator

Validator.prototype.isNumericArray = function(pArrayValues)   {
	console.log("DEBUG: isNumberArray: pArrayValues=" + pArrayValues);
	
    if (!pArrayValues || !_.isArray(pArrayValues))    {
        // throw new Error("Invalid parameter: not an array");
		// console.log("DEBUG: isNumberArray: not an array!");
		return false;
    }   

	// Empty?
    if (pArrayValues.length <= 0)	{
		// console.log("DEBUG: isNumberArray: empty array!");
		return false;	
	}

    // Validate as numeric
    for (var i=0; i < pArrayValues.length; i++ )    {
		// console.log("DEBUG: isNumberArray: Check index=" + i + " , value=" + pArrayValues[i]);
        if (!_.isNumber(pArrayValues[i]))   {
            // throw new Error("Invalid parameter: non numeric array: value[" + i + "]=" + pArrayValues[i]);
			// console.log("DEBUG: isNumberArray: invalid value at index=" + i);
			return false;
        }
    } // for
	return true;
}; // isNumericArray