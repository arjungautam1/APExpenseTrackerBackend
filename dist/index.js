"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const seedDefaultCategories_1 = require("./utils/seedDefaultCategories");
const auth_1 = __importDefault(require("./routes/auth"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const categories_1 = __importDefault(require("./routes/categories"));
const investments_1 = __importDefault(require("./routes/investments"));
const loans_1 = __importDefault(require("./routes/loans"));
const transfers_1 = __importDefault(require("./routes/transfers"));
const monthlyExpenses_1 = __importDefault(require("./routes/monthlyExpenses"));
const users_1 = __importDefault(require("./routes/users"));
const ai_1 = __importDefault(require("./routes/ai"));
// Load environment variables
dotenv_1.default.config();
// Also load .env.local if it exists (for local development)
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config({ path: '.env.local', override: true });
}
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 8080;
// Ensure correct client IP when behind proxies (affects rate limiting)
app.set('trust proxy', 1);
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
// Middleware
app.use((0, helmet_1.default)()); // Security headers
// Dynamic CORS configuration
const getCorsOrigin = () => {
    const allowedOrigins = [];
    // Always include production domain
    allowedOrigins.push('https://smartexpenseai.com');
    // Add CLIENT_URL from environment if specified
    if (process.env.CLIENT_URL) {
        allowedOrigins.push(process.env.CLIENT_URL);
    }
    // For development, allow common localhost ports
    if (process.env.NODE_ENV !== 'production') {
        allowedOrigins.push('http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173');
    }
    console.log('CORS allowed origins:', allowedOrigins);
    return allowedOrigins;
};
app.use((0, cors_1.default)({
    origin: getCorsOrigin(),
    credentials: true
}));
app.use((0, compression_1.default)()); // Compress responses
app.use((0, morgan_1.default)('combined')); // Logging
// Apply rate limiting only in production to avoid 429s during local development
if (process.env.NODE_ENV === 'production') {
    app.use(limiter);
}
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Routes
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/transactions', transactions_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/investments', investments_1.default);
app.use('/api/loans', loans_1.default);
app.use('/api/transfers', transfers_1.default);
console.log('Registering monthly expenses routes...');
app.use('/api/monthly-expenses', monthlyExpenses_1.default);
console.log('Monthly expenses routes registered successfully');
// Settings & users endpoints
app.use('/api/users', users_1.default);
app.use('/api/settings', users_1.default);
console.log('Registering AI routes...');
app.use('/api/ai', ai_1.default);
console.log('AI routes registered successfully');
// TODO: Add remaining route handlers
// app.use('/api/users', userRoutes);
// app.use('/api/loans', loanRoutes);
// app.use('/api/transfers', transferRoutes);
// app.use('/api/analytics', analyticsRoutes);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Start server
const startServer = async () => {
    try {
        console.log('Starting server...');
        console.log('Connecting to database...');
        await (0, database_1.connectDB)();
        console.log('Seeding default categories...');
        await (0, seedDefaultCategories_1.seedDefaultCategories)();
        console.log('Starting Express server...');
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
        });
        server.on('error', (error) => {
            console.error('Server error:', error);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map