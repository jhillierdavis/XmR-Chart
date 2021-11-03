/**
 * Unit tests for BasicMaths
 */

describe("BasicMaths", function() {

    beforeEach(function() {
        basicMaths = new BasicMaths();
    });


    it("calculateTotal", function() {
        var values = [10.7, 13.0, 11.4, 11.5, 12.5, 14.1, 14.8, 14.1, 12.6, 16.0, 11.7, 10.6, 10.0, 11.4, 7.9];
        expect(basicMaths.calculateTotal(values)).toEqual(182.3);
    });


    it("calculateMean", function() {
        var values = [10.7, 13.0, 11.4, 11.5, 12.5, 14.1, 14.8, 14.1, 12.6, 16.0, 11.7, 10.6, 10.0, 11.4, 7.9];
        expect(basicMaths.calculateMean(values)).toEqual(12.15);
    });

    it("toFixedFloat", function() {
        expect(basicMaths.toFixedFloat(123.456789)).toEqual(123.46);
    });

    it("toFixedFloat (to 1 decimal place)", function() {
        expect(basicMaths.toFixedFloat(123.456789, 1)).toEqual(123.5);
    });


    // Edge cases

    it("calculateTotal with no args", function() {
        try {
            basicMaths.calculateTotal();
        }
        catch (e) {
            expect(e.toString()).toEqual("InvalidArgumentException");
        }
    });

    it("calculateTotal with empty array", function() {
        try {
            basicMaths.calculateTotal([]);
        }
        catch (e) {
            expect(e.toString()).toEqual("InvalidArgumentException");
        }
    });


});