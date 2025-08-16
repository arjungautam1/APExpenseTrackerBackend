import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import Category from '../models/Category';

interface ScanBillRequest {
  imageBase64?: string; // data URL or raw base64
  imageUrl?: string;
}

interface AutoCategorizeRequest {
  description: string;
  amount?: number;
  merchant?: string;
}

interface ExtractBulkTransactionsRequest {
  imageBase64: string;
}

const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const AUTO_CATEGORIZE_MODEL = 'deepseek-r1-distill-llama-70b';

// Function to clean up merchant names by extracting just the business name
const cleanMerchantName = (merchant: string): string => {
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
    .replace(/\d+\.\d+%/g, '')
    // Remove specific words like 'PAYMENTS', 'FEE', 'INTEREST'
    .replace(/\b(PAYMENTS|FEE|INTEREST)\b/gi, '')
    // Remove trailing slashes and special characters
    .replace(/\/$/, '')
    .replace(/^'/, '')
    .replace(/'$/, '')
    // Remove any remaining quotes and slashes
    .replace(/'/g, '')
    .replace(/\//g, '')
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

export const scanBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64, imageUrl } = req.body as ScanBillRequest;

    console.log('Scan bill request received:', { 
      hasImageBase64: !!imageBase64, 
      hasImageUrl: !!imageUrl,
      base64Length: imageBase64?.length || 0 
    });

    if (!imageBase64 && !imageUrl) {
      res.status(400).json({ success: false, message: 'Provide imageBase64 or imageUrl' });
      return;
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY not configured');
      res.status(500).json({ success: false, message: 'GROQ_API_KEY is not configured' });
      return;
    }

    const groq = new Groq({ apiKey });

    // Normalize data URL to URL form for the API if needed
    let imageContent: any = undefined;
    if (imageUrl) {
      imageContent = { type: 'image_url', image_url: { url: imageUrl } };
    } else if (imageBase64) {
      // Accept both full data URLs and raw base64
      const isDataUrl = imageBase64.startsWith('data:');
      const url = isDataUrl ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
      imageContent = { type: 'image_url', image_url: { url } };
    }

    console.log('Sending request to Groq with model:', MODEL);

    const systemPrompt = `You are an assistant that extracts structured data from financial documents. 

IMPORTANT: Determine if this is INCOME (deposits, cheques, refunds, salary) or EXPENSE (bills, purchases, payments).

For EXPENSE transactions, carefully categorize:
- GROCERIES: Supermarkets, grocery stores, food markets (milk, bread, vegetables, household items)
- FOOD & DINING: Restaurants, cafes, coffee shops, fast food, takeout, bars, pubs

Return STRICT JSON only with keys: 
- amount (number)
- currency (string, ISO 4217 like USD/INR) 
- date (string, ISO yyyy-mm-dd if possible)
- merchant (string, just the business name - e.g., "TIM HORTONS #2435 TORONTO ON" should be "TIM HORTONS")
- description (string)
- transaction_type (string, either "income" or "expense")
- category_name (string, based on transaction_type):
  * For INCOME: Salary, Freelance, Investment Returns, Business Income, Rental Income, Bonus, Refund, Other Income
  * For EXPENSE: 
    - Groceries (for supermarkets, grocery stores)
    - Food & Dining (for restaurants, cafes, coffee shops)
    - Transportation, Shopping, Bills & Utilities, Entertainment, Healthcare, Education, Travel, Personal Care, Home & Garden, Gifts & Donations, Other Expenses

Examples:
- Cheque deposit, bank deposit, salary = INCOME
- Supermarket, grocery store, food market = EXPENSE with category "Groceries"
- Restaurant, cafe, coffee shop, fast food = EXPENSE with category "Food & Dining"
- Bill payment, purchase receipt, payment = EXPENSE

For merchant names, extract just the business name and remove store numbers, locations, etc.
Examples:
- "TIM HORTONS #2435 TORONTO ON" → "TIM HORTONS"
- "STARBUCKS #1234 VANCOUVER BC" → "STARBUCKS"
- "WALMART #5678 TORONTO ON" → "WALMART"

If uncertain, make your best guess and leave fields empty rather than prose.`;

    const userText = 'Extract the transaction details from this financial document. Determine if this is income or expense and respond with JSON only.';

    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 512,
      top_p: 1,
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: [ { type: 'text', text: userText }, imageContent ].filter(Boolean) as any },
      ],
    }, {
      timeout: 25000, // 25 second timeout for Groq API
    });

    const content = completion.choices?.[0]?.message?.content || '';
    console.log('Groq response received, length:', content.length);
    console.log('Raw response:', content.substring(0, 200) + '...');

    // Try to extract JSON payload
    let parsed: any = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed JSON:', parsed);
      } else {
        console.log('No JSON found in response, using empty object');
        parsed = {};
      }
    } catch (parseError) {
      console.error('Failed to parse JSON from response:', parseError);
      console.log('Raw content that failed to parse:', content);
      parsed = {};
    }

    const amountNum = typeof parsed.amount === 'number' ? parsed.amount : Number(parsed.amount);
    const rawMerchant = typeof parsed.merchant === 'string' ? parsed.merchant : undefined;
    const cleanedMerchant = rawMerchant ? cleanMerchantName(rawMerchant) : undefined;
    
    const responseData = {
      amount: isFinite(amountNum) ? amountNum : undefined,
      currency: typeof parsed.currency === 'string' ? parsed.currency.toUpperCase() : undefined,
      date: typeof parsed.date === 'string' ? parsed.date : undefined,
      merchant: cleanedMerchant,
      description: typeof parsed.description === 'string' ? parsed.description : undefined,
      categoryName: typeof parsed.category_name === 'string' ? parsed.category_name : undefined,
      transactionType: typeof parsed.transaction_type === 'string' ? parsed.transaction_type : undefined,
      raw: content,
    };

    console.log('Final response data:', responseData);
    res.json({ success: true, message: 'Bill scanned successfully', data: responseData });
  } catch (error: any) {
    console.error('Error in scanBill:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to scan bill',
      details: error.toString()
    });
  }
};

export const autoCategorize = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, amount, merchant } = req.body as AutoCategorizeRequest;

    console.log('Auto categorize request received:', { description, amount, merchant });

    if (!description || description.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Description is required' });
      return;
    }

    const apiKey = process.env.GROQ_TEXT;
    if (!apiKey) {
      console.error('GROQ_TEXT not configured');
      res.status(500).json({ success: false, message: 'GROQ_TEXT is not configured' });
      return;
    }

    console.log('Using GROQ_TEXT API key:', apiKey.substring(0, 10) + '...');

    const groq = new Groq({ apiKey });

    // Get all available categories from the database
    const categories = await Category.find({
      $or: [
        { userId: req.user?.id },
        { isDefault: true }
      ]
    }).sort({ name: 1 });

    console.log('Available categories:', categories.map(c => ({ name: c.name, type: c.type })));

    // Create category mapping for the AI
    const categoryList = categories.map(cat => `${cat.name} (${cat.type})`).join(', ');
    
    const systemPrompt = `You are an AI assistant that automatically categorizes financial transactions based on their description.

Available categories:
${categoryList}

Your task is to analyze the transaction description and determine:
1. The most appropriate category from the list above
2. Whether this is likely an income or expense transaction

Rules:
- For food-related transactions (coffee, restaurants, cafes, fast food), use "Food & Dining"
- For grocery stores, supermarkets, food markets, use "Groceries"
- For transportation (gas, parking, public transport, rideshare), use "Transportation"
- For bills and utilities (electricity, water, internet, phone, mobile carriers), use "Bills & Utilities"
- For mobile phone carriers (Freedom Mobile, Rogers, Bell, Telus, Fido, Virgin, Koodo), use "Bills & Utilities"
- For entertainment (movies, games, streaming), use "Entertainment"
- For healthcare (doctor, pharmacy, medical), use "Healthcare"
- For shopping (clothes, electronics, general shopping), use "Shopping"
- For education (books, courses, tuition), use "Education"
- For travel (hotels, flights, vacation), use "Travel"
- For personal care (salon, spa, gym), use "Personal Care"
- For home and garden (furniture, tools, plants), use "Home & Garden"
- For gifts and donations (charity, gifts), use "Gifts & Donations"
- For salary, wages, payments received, use "Salary"
- For freelance work, use "Freelance"
- For investment returns, dividends, use "Investment Returns"
- For business income, use "Business Income"
- If none of the above fit, use "Other Expenses" for expenses or "Other Income" for income

Return ONLY a JSON object with these fields:
{
  "category_name": "exact category name from the list",
  "transaction_type": "income" or "expense",
  "confidence": "high", "medium", or "low"
}

Example for "coffee at starbucks":
{
  "category_name": "Food & Dining",
  "transaction_type": "expense",
  "confidence": "high"
}

Example for "salary deposit":
{
  "category_name": "Salary",
  "transaction_type": "income",
  "confidence": "high"
}`;

    const userPrompt = `Categorize this transaction: "${description}"${merchant ? ` (Merchant: ${merchant})` : ''}${amount ? ` (Amount: ${amount})` : ''}`;

    console.log('Sending request to Groq with model:', AUTO_CATEGORIZE_MODEL);

    const completion = await groq.chat.completions.create({
      model: AUTO_CATEGORIZE_MODEL,
      temperature: 0.6,
      max_tokens: 4096,
      top_p: 0.95,
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    const content = completion.choices?.[0]?.message?.content || '';
    console.log('Groq response received:', content);

    // Try to extract JSON payload
    let parsed: any = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed JSON:', parsed);
      } else {
        console.log('No JSON found in response, using fallback');
        parsed = {
          category_name: 'Other Expenses',
          transaction_type: 'expense',
          confidence: 'low'
        };
      }
    } catch (parseError) {
      console.error('Failed to parse JSON from response:', parseError);
      console.log('Raw content that failed to parse:', content);
      parsed = {
        category_name: 'Other Expenses',
        transaction_type: 'expense',
        confidence: 'low'
      };
    }

    // Find the actual category from the database
    const matchedCategory = categories.find(cat => 
      cat.name.toLowerCase() === (parsed.category_name || '').toLowerCase()
    );

    if (!matchedCategory) {
      console.log('Category not found, using fallback');
      const fallbackCategory = categories.find(cat => 
        cat.name.toLowerCase().includes('other') && 
        cat.type === (parsed.transaction_type || 'expense')
      ) || categories[0];

      parsed.category_name = fallbackCategory?.name || 'Other Expenses';
      parsed.confidence = 'low';
    }

    const responseData = {
      categoryId: matchedCategory?._id || null,
      categoryName: parsed.category_name,
      transactionType: parsed.transaction_type,
      confidence: parsed.confidence,
      raw: content,
      availableCategories: categories.map(cat => ({
        id: cat._id,
        name: cat.name,
        type: cat.type
      }))
    };

    console.log('Final response data:', responseData);
    res.json({ success: true, message: 'Transaction categorized successfully', data: responseData });
  } catch (error: any) {
    console.error('Error in autoCategorize:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to categorize transaction',
      details: error.toString()
    });
  }
};

// @desc    Extract multiple transactions from bank statement image
// @route   POST /api/ai/extract-bulk-transactions
// @access  Private
export const extractBulkTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64 } = req.body as ExtractBulkTransactionsRequest;
    console.log('Bulk transaction extraction request received');
    console.log('Image base64 length:', imageBase64.length);
    console.log('Image base64 preview:', imageBase64.substring(0, 100) + '...');

    if (!imageBase64) {
      res.status(400).json({ success: false, message: 'Image is required' });
      return;
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY not configured');
      res.status(500).json({ success: false, message: 'GROQ_API_KEY is not configured' });
      return;
    }

    const groq = new Groq({ apiKey });

    const categories = await Category.find({
      $or: [
        { userId: req.user?.id },
        { isDefault: true }
      ]
    }).sort({ name: 1 });

    const categoryList = categories.map(cat => `${cat.name} (${cat.type})`).join(', ');

    const systemPrompt = `You are an AI assistant that extracts multiple financial transactions from bank statement screenshots.
    
    CRITICAL: You must analyze the ACTUAL image content and extract ONLY real transactions you can see. 
    DO NOT generate example, sample, or placeholder data.
    If you cannot clearly read transactions from the image, return an empty transactions array.
    
    Available categories:
    ${categoryList}
    
    Your task is to analyze the bank statement image and extract ALL visible transactions. Look for:
    - Transaction amounts (positive for income, negative for expenses)
    - Transaction descriptions/merchant names
    - Transaction dates
    - Any additional details like reference numbers
    
    Rules for categorization:
    - For food-related transactions (coffee, restaurants, cafes, fast food), use "Food & Dining"
    - For grocery stores, supermarkets, food markets, use "Groceries"
    - For transportation (gas, parking, public transport, rideshare), use "Transportation"
    - For bills and utilities (electricity, water, internet, phone, mobile carriers), use "Bills & Utilities"
    - For mobile phone carriers (Freedom Mobile, Rogers, Bell, Telus, Fido, Virgin, Koodo), use "Bills & Utilities"
    - For entertainment (movies, games, streaming), use "Entertainment"
    - For healthcare (doctor, pharmacy, medical), use "Healthcare"
    - For shopping (clothes, electronics, general shopping), use "Shopping"
    - For education (books, courses, tuition), use "Education"
    - For travel (hotels, flights, vacation), use "Travel"
    - For personal care (salon, spa, gym), use "Personal Care"
    - For home and garden (furniture, tools, plants), use "Home & Garden"
    - For gifts and donations (charity, gifts), use "Gifts & Donations"
    - For salary, wages, payments received, use "Salary"
    - For freelance work, use "Freelance"
    - For investment returns, dividends, use "Investment Returns"
    - For business income, use "Business Income"
    - If none of the above fit, use "Other Expenses" for expenses or "Other Income" for income
    
    For merchant names, extract just the business name and remove store numbers, locations, etc.
    Examples:
    - "TIM HORTONS #2435 TORONTO ON" → "TIM HORTONS"
    - "STARBUCKS #1234 VANCOUVER BC" → "STARBUCKS"
    - "WALMART #5678 TORONTO ON" → "WALMART"
    
    Return ONLY a JSON object with this structure. Ensure all quotes are properly closed:
    {
      "transactions": [
        {
          "amount": 25.50,
          "description": "Starbucks Coffee",
          "date": "2025-08-13",
          "merchant": "Starbucks",
          "category_name": "Food & Dining",
          "transaction_type": "expense",
          "confidence": "high"
        }
      ],
      "total_found": 5
    }
    
    Important:
    - Extract ALL visible transactions from the image
    - Use YYYY-MM-DD format for dates
    - Determine transaction type based on amount (negative = expense, positive = income)
    - Set confidence level based on clarity of the transaction
    - If you can't read a transaction clearly, skip it rather than guess
    - Include the total number of transactions found
    - For merchant names, use just the business name without store numbers or locations`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.1,
      max_tokens: 4096,
      top_p: 0.95,
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: 'Analyze this bank statement image and extract ONLY the actual transactions you can see. Do NOT generate example or sample data. Extract ONLY real transactions from the image.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
    });

    const content = completion.choices?.[0]?.message?.content || '';
    console.log('Groq response received for bulk extraction');
    console.log('AI response length:', content.length);
    console.log('AI response preview:', content.substring(0, 200) + '...');

    let parsed: any = null;
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonString = jsonMatch[0];
        console.log('Found JSON string:', jsonString.substring(0, 200) + '...');
        
        // Fix common JSON syntax errors
        jsonString = jsonString
          .replace(/"type":\s*"([^"]*),/g, '"type": "$1",') // Fix missing quotes
          .replace(/"confidence":\s*"([^"]*),/g, '"confidence": "$1",') // Fix missing quotes
          .replace(/"category":\s*"([^"]*),/g, '"category": "$1",') // Fix missing quotes
          .replace(/"category_name":\s*"([^"]*),/g, '"category_name": "$1",') // Fix missing quotes
          .replace(/"transaction_type":\s*"([^"]*),/g, '"transaction_type": "$1",') // Fix missing quotes
          .replace(/"description":\s*"([^"]*),/g, '"description": "$1",') // Fix missing quotes
          .replace(/"merchant":\s*"([^"]*),/g, '"merchant": "$1",') // Fix missing quotes
          .replace(/"date":\s*"([^"]*),/g, '"date": "$1",') // Fix missing quotes
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
        
        console.log('Cleaned JSON string:', jsonString.substring(0, 200) + '...');
        parsed = JSON.parse(jsonString);
        console.log('Successfully parsed bulk extraction JSON');
      } else {
        console.log('No JSON found in bulk extraction response. Raw content:', content.substring(0, 200));
        parsed = { transactions: [], total_found: 0 };
      }
    } catch (parseError) {
      console.error('Failed to parse JSON from bulk extraction response:', parseError);
      console.log('Raw content that failed to parse:', content.substring(0, 500));
      parsed = { transactions: [], total_found: 0 };
    }

    // Process and categorize each transaction
    console.log('Raw parsed transactions:', JSON.stringify(parsed.transactions, null, 2));
    
    const processedTransactions = await Promise.all(
      (parsed.transactions || []).map(async (transaction: any, index: number) => {
        console.log(`Processing transaction ${index + 1}:`, transaction);
        
        const matchedCategory = categories.find(cat =>
          cat.name.toLowerCase() === (transaction.category_name || '').toLowerCase()
        );

        const rawMerchant = transaction.merchant || '';
        const cleanedMerchant = cleanMerchantName(rawMerchant);
        
        // Clean the description field as well since it often contains the merchant name
        const rawDescription = transaction.description || 'Unknown Transaction';
        const cleanedDescription = cleanMerchantName(rawDescription);
        
        const processed = {
          amount: Math.abs(transaction.amount || 0),
          description: cleanedDescription,
          date: transaction.date || new Date().toISOString().split('T')[0],
          merchant: cleanedMerchant,
          categoryId: matchedCategory?._id || null,
          categoryName: transaction.category_name || 'Other Expenses',
          transactionType: transaction.transaction_type || 'expense',
          confidence: transaction.confidence || 'medium'
        };
        
        console.log(`Processed transaction ${index + 1}:`, processed);
        return processed;
      })
    );

    const responseData = {
      transactions: processedTransactions,
      totalFound: parsed.total_found || processedTransactions.length,
      raw: content
    };

    console.log(`Bulk extraction completed: ${processedTransactions.length} transactions found`);
    console.log('Final response data:', JSON.stringify(responseData, null, 2));
    res.json({ success: true, message: 'Bulk transactions extracted successfully', data: responseData });
  } catch (error: any) {
    console.error('Error in extractBulkTransactions:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to extract bulk transactions',
      details: error.toString()
    });
  }
};


