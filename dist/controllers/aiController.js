"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanBill = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const scanBill = async (req, res) => {
    try {
        const { imageBase64, imageUrl } = req.body;
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
        const groq = new groq_sdk_1.default({ apiKey });
        // Normalize data URL to URL form for the API if needed
        let imageContent = undefined;
        if (imageUrl) {
            imageContent = { type: 'image_url', image_url: { url: imageUrl } };
        }
        else if (imageBase64) {
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
                { role: 'user', content: [{ type: 'text', text: userText }, imageContent].filter(Boolean) },
            ],
        }, {
            timeout: 25000, // 25 second timeout for Groq API
        });
        const content = completion.choices?.[0]?.message?.content || '';
        console.log('Groq response received, length:', content.length);
        console.log('Raw response:', content.substring(0, 200) + '...');
        // Try to extract JSON payload
        let parsed = null;
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
                console.log('Successfully parsed JSON:', parsed);
            }
            else {
                console.log('No JSON found in response, using empty object');
                parsed = {};
            }
        }
        catch (parseError) {
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
    }
    catch (error) {
        console.error('Error in scanBill:', error);
        console.error('Error stack:', error.stack);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to scan bill',
            details: error.toString()
        });
    }
};
exports.scanBill = scanBill;
//# sourceMappingURL=aiController.js.map