// Test script for cleanMerchantName function
const cleanMerchantName = (merchant) => {
  if (!merchant) return '';
  
  // Remove common suffixes and location information
  let cleaned = merchant
    // Remove store numbers like #2435, #09
    .replace(/#\d+/g, '')
    // Remove location codes like TORONTO ON, VANCOUVER BC, WOODBRIDGE ON, etc.
    .replace(/\b[A-Z]{2,}\s+[A-Z]{2}\b/g, '')
    // Remove postal codes
    .replace(/\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/g, '')
    // Remove phone numbers
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '')
    // Remove common words that are not part of the business name
    .replace(/\b(INC|LLC|LTD|CORP|CORPORATION|CO|COMPANY)\b/gi, '')
    // Remove specific patterns like 'RIDE SAT 12PM', 'RIDE SAT 2PM'
    .replace(/\bRIDE\s+[A-Z]{3}\s+\d{1,2}[AP]M\b/gi, '')
    // Remove transaction IDs like '2504022229'
    .replace(/\b\d{10,}\b/g, '')
    // Remove specific app identifiers like 'APPLISGIDGZC2RMRX'
    .replace(/\b[A-Z0-9]{10,}\b/g, '')
    // Remove percentage rates like '22.99%'
    .replace(/\b\d+\.\d+%\b/g, '')
    // Remove specific words like 'PAYMENTS', 'FEE', 'INTEREST'
    .replace(/\b(PAYMENTS|FEE|INTEREST)\b/gi, '')
    // Remove trailing slashes and special characters
    .replace(/\/$/, '')
    .replace(/^'/, '')
    .replace(/'$/, '')
    // Remove any remaining quotes
    .replace(/'/g, '')
    // Remove trailing dots and other punctuation
    .replace(/\.$/, '')
    // Remove extra whitespace and trim
    .replace(/\s+/g, ' ')
    .trim();
  
  // If the cleaned name is too short, return the original
  if (cleaned.length < 2) {
    return merchant.trim();
  }
  
  return cleaned;
};

// Test cases from the user's current output
const testCases = [
  "LYFT 'RIDE SAT 12PM VANCOUVER BC",
  "LYFT 'RIDE SAT 2PM VANCOUVER BC", 
  "CASH ADVANCE 22.99%",
  "HOPPIO/2504022229 TORONTO ON",
  "SHOPPERS DRUG MART #09 TORONTO ON",
  "KING TANDORI BAR AND GRIL WOODBRIDGE ON",
  "PRESTO APPLISGIDGZC2RMRX TORONTO ON",
  "WISE PAYMENTS CANADA INC.OTTAWA ON"
];

console.log("Testing cleanMerchantName function with current issues:\n");

testCases.forEach(testCase => {
  const cleaned = cleanMerchantName(testCase);
  console.log(`"${testCase}" → "${cleaned}"`);
});

console.log("\nTest completed!");
