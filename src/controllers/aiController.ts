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

const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const AUTO_CATEGORIZE_MODEL = 'deepseek-r1-distill-llama-70b';

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
- merchant (string)
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
    const responseData = {
      amount: isFinite(amountNum) ? amountNum : undefined,
      currency: typeof parsed.currency === 'string' ? parsed.currency.toUpperCase() : undefined,
      date: typeof parsed.date === 'string' ? parsed.date : undefined,
      merchant: typeof parsed.merchant === 'string' ? parsed.merchant : undefined,
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
- For bills and utilities (electricity, water, internet, phone), use "Bills & Utilities"
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


