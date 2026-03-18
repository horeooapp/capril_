
/**
 * Test script for rent payment scoring logic (v3.6) - JS version
 * Verifies diffDays calculation between payment date and the 5th of the month.
 */

function calculateDiffDays(periodMonth, paymentDate) {
    const [year, month] = periodMonth.split('-').map(Number);
    // Standard due date is the 5th of the period month
    const dueDate = new Date(year, month - 1, 5);
    
    // Normalize dates to midnight for day calculation
    const d1 = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const d2 = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), paymentDate.getDate());
    
    const diffTime = d2.getTime() - d1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

const tests = [
    { period: "2024-03", payDate: new Date(2024, 2, 5), expected: 0 },   // Match (March 5th)
    { period: "2024-03", payDate: new Date(2024, 2, 1), expected: -4 },  // Early (March 1st)
    { period: "2024-03", payDate: new Date(2024, 2, 10), expected: 5 },  // Late (March 10th)
    { period: "2024-03", payDate: new Date(2024, 3, 5), expected: 31 },  // Very Late (April 5th)
    { period: "2024-01", payDate: new Date(2023, 11, 31), expected: -5 } // Very Early (Dec 31st for Jan)
];

console.log("--- QAPRIL SCORING LOGIC TEST ---");
let allPass = true;
tests.forEach((t, i) => {
    const result = calculateDiffDays(t.period, t.payDate);
    const pass = result === t.expected;
    if (!pass) allPass = false;
    const status = pass ? "✅ PASS" : "❌ FAIL";
    console.log(`Test ${i+1}: Period ${t.period}, Paid ${t.payDate.toDateString()} => Diff: ${result} (Expected: ${t.expected}) [${status}]`);
});

if (allPass) {
    process.exit(0);
} else {
    process.exit(1);
}
