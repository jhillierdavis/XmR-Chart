/**
 * Unit tests for IxmrPointInTime
 */

describe("IxmrDataSet", function() {

    it("Invalid construction (no arguments)", function() {
        try {
            new IxmrDataSet();
        }
        catch (e) {
            expect(e.toString()).toEqual("Error: Missing parameter: pDataSet");
        }
    });

    it("Invalid construction (empty array)", function() {
        try {
            new IxmrDataSet([]);
        }
        catch (e) {
            expect(e.toString()).toEqual("Error: pDataSet is empty!");
        }
    });

    it("Invalid construction (invalid string array)", function() {
        try {
            new IxmrDataSet([['A', 'B']]);
        }
        catch (e) {
            expect(e.toString()).toEqual("Error: Invalid parameter value (non-numeric): pMeasure = B, but was:", e);
        }
    });


    it("Valid construction", function() {
        var ixmrDataSet = new IxmrDataSet(TEST_DATA);
        expect(ixmrDataSet).not.toBe(undefined);
    });

    it("Valid values", function() {
        console.log("DEBUG: Spec: IxmrDataSet: Valid values");
        
        var ixmrDataSet = new IxmrDataSet(TEST_DATA);
        var points = ixmrDataSet.getPoints();
        
        expect(points.length).toBe(23);
        expect(points[0].getIsSignal()).toBe(false);
        expect(points[0].getMean(1)).toEqual(2.2);
        
        expect(points[1].getIsSignal()).toBe(false);
        expect(points[1].getMean(1)).toEqual(2.2);
        expect(points[1].getMovingRangeMean(1)).toEqual(0.8);
        
        expect(points[1].getMovingRangeUpperControlLimit(1)).toEqual(2.7);
        expect(points[1].getMeasureUpperControlLimit(1)).toEqual(4.3);        
        expect(points[1].getMeasureLowerControlLimit(1)).toEqual(0.1);
        

        
        var signalIndices = ixmrDataSet.getSignalIndices();
        expect(signalIndices[0]).toBe(15);
        expect(points[15].getMean(1)).toEqual(1.5);
        expect(points[15].getMovingRange(1)).toEqual(0.7);
        
        
        expect(points[15].getIsSignal()).toBe(true);
        expect(points[15].getMean(1)).toEqual(1.5);        
        expect(points[15].getMovingRangeMean(1)).toEqual(0.5);
        expect(points[15].getMovingRangeUpperControlLimit(1)).toEqual(1.5);
        expect(points[15].getMeasureUpperControlLimit(1)).toEqual(2.8);        
        expect(points[15].getMeasureLowerControlLimit(1)).toEqual(0.2);
        
        // console.log(points[0].getMean());
    });

});

var TEST_DATA = [
["Jan-02", 3.2], // i = 0,
["Feb-02", 2.6], // i = 1, mr = 0.6, mrucl = 2.7, ucl = 4.3, lcl = 0.1
["Mar-02", 1.7], // i = 2, mr = 0.9
["Apr-02", 2.8], // i = 3, mr = 1.1
["May-02", 1.6], // i = 4, mr = 1.2
["Jun-02", 2.4], // i = 5, mr = 0.8
["Jul-02", 1.8], // i = 6, mr = 0.6
["Aug-02", 1.7], // i = 7, mr = 0.1
["Sep-02", 2.6], // i = 8, mr = 0.9
["Oct-02", 1.3], // i = 9, mr = 1.3, av.mr = ( 7.5 / 9 ) = 0.8, total = 21.7, mean = 2.2, mrucl = 2.7
["Nov-02", 1.5], 
["Dec-02", 3.4], 
["Jan-03", 2.2],
["Feb-03", 1.5],
["Mar-03", 2.4],
["Apr-03", 1.7],
["May-03", 1.0],
["Jun-03", 1.9],
["Jul-03", 1.7],
["Aug-03", 1.9],
["Sep-03", 1.1],
["Oct-03", 1.4],
["Nov-03", 1.3]  
];

/*
var TEST_DATA = [
//    ["Month", "Percentage_Operating_Income"],
    ["Jan-09", 6.7],
    ["Feb-09", 14.7],
    ["Mar-09", 9.2],
    ["Apr-09", 10.2],
    ["May-09", 13.7],
    ["Jun-09", 11.3],
    ["Jul-09", 10.6],
    ["Aug-09", 8.7],
    ["Sep-09", 12.1],
    ["Oct-09", 11.9],
    ["Nov-09", 9.1],
    ["Dec-09", 8.6],
    ["Jan-10", 6.2],
    ["Feb-10", 13.2],
    ["Mar-10", 12.9],
    ["Apr-10", 7.5],
    ["May-10", 12.6],
    ["Jun-10", 10.5],
    ["Jul-10", 9.5],
    ["Aug-10", 9.4],
    ["Sep-10", 8.8],
    ["Oct-10", 8.5],
    ["Nov-10", 8.4],
    ["Dec-10", 11.7]
];*/

