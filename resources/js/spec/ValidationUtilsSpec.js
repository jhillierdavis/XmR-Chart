/**
 * Unit tests for BasicMaths
 */

describe("ValidationUtils", function() {
	
	beforeEach(function() {
		validator = new Validator();
	});
	
		
    it("Valid numeric array", function() {
		var result = validator.isNumericArray([10.7, 13.0, 11.4, 11.5, 12.5, 14.1, 14.8, 14.1, 12.6, 16.0, 11.7, 10.6, 10.0, 11.4, 7.9]);
		expect(result).toEqual(true);
    });
	
	
    it("Non-numeric arrary", function() {
		var result = validator.isNumericArray([10.7, "Abc", 11.4, 11.5, 12.5, 14.1, 14.8, 14.1, 12.6, 16.0, 11.7, 10.6, 10.0, 11.4, 7.9]);
		expect(result).toEqual(false);
    });

    it("Empty array", function() {
		var result = validator.isNumericArray([]);
		expect(result).toEqual(false);
    });

    it("Non array", function() {
		var result = validator.isNumericArray("A string");
		expect(result).toEqual(false);
    });

    it("No args", function() {
		var result = validator.isNumericArray();
		expect(result).toEqual(false);
    });	

    it("Undefined", function() {
		var result = validator.isNumericArray(undefined);
		expect(result).toEqual(false);
    });	

});