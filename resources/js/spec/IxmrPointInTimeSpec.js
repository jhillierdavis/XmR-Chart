/**
 * Unit tests for IxmrPointInTime
 */

describe("IxmrPointInTime", function() {


    it("Valid construction", function() {
        var ixmrPointInTime = new IxmrPointInTime(12.3, "Jan 2014");
        
        expect(ixmrPointInTime.measureValue).toBe(undefined); // No access to private variable
        expect(ixmrPointInTime.timeValue).toBe(undefined); // No access to private variable
        expect(ixmrPointInTime instanceof IxmrPointInTime).toBe(true);
        expect(ixmrPointInTime.getMeasure()).toEqual(12.3);
        expect(ixmrPointInTime.getTime()).toEqual("Jan 2014");
    });

    it("Valid construction missing new", function() {
        var ixmrPointInTime = IxmrPointInTime(12.3, "Jan 2014");
        
        expect(ixmrPointInTime.measureValue).toBe(undefined); // No access to private variable
        expect(ixmrPointInTime.timeValue).toBe(undefined); // No access to private variable
        expect(ixmrPointInTime instanceof IxmrPointInTime).toBe(true);

        expect(ixmrPointInTime.getMeasure()).toEqual(12.3);
        expect(ixmrPointInTime.getTime()).toEqual("Jan 2014");
    });

    it("IsSignal mutator & accessor", function() {
        var ixmrPointInTime = IxmrPointInTime(12.3, "Jan 2014");
        
        expect(ixmrPointInTime.isSignal).toBe(undefined); // No access to private variable
        expect(ixmrPointInTime.getIsSignal()).toBe(false); // Check default
        
        ixmrPointInTime.setIsSignal(true);
        
        expect(ixmrPointInTime.getIsSignal()).toBe(true);
    });

});