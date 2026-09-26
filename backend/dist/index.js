"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./lib/prisma");
const PORT = parseInt(process.env.PORT || '3001', 10);
async function main() {
    try {
        await prisma_1.prisma.$connect();
        console.log('✅ Database connected');
        const server = app_1.default.listen(PORT, () => {
            console.log(`🚀 TraceForge API running on http://localhost:${PORT}`);
            console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🎭 Demo mode: ${process.env.DEMO_MODE === 'true' ? 'enabled' : 'disabled'}`);
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use. Is TraceForge already running?`);
                console.error(`   To find the process: netstat -ano | findstr :${PORT}`);
            }
            else {
                console.error('❌ Server error:', err);
            }
            process.exit(1);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map