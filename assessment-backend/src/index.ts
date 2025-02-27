// assessment-backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkSupabaseConnection } from './services/supabase/client';
import { checkMilvusConnection } from './services/vector-db/milvus-client';
import { setupAllCollections } from './services/vector-db/milvus-collection-setup';
import { lmStudioService } from './services/llm/lmstudio-service';

// โหลดค่า environment variables
dotenv.config();

// สร้างแอปพลิเคชัน Express
const app = express();
const port = process.env.PORT || 3001;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// นำเข้าเส้นทาง API
import apiRoutes from './api/routes';

// เส้นทางเริ่มต้นสำหรับการทดสอบ API
app.get('/', (req, res) => {
  res.json({ 
    message: 'Assessment Grading System API' 
  });
});

// ลงทะเบียนเส้นทาง API
app.use('/api', apiRoutes);

// เส้นทางสำหรับตรวจสอบสถานะการเชื่อมต่อกับบริการต่างๆ
app.get('/api/health', async (req, res) => {
  try {
    const supabaseStatus = await checkSupabaseConnection();
    const milvusStatus = await checkMilvusConnection();
    const lmStudioStatus = await lmStudioService.checkConnection();

    res.json({
      status: 'ok',
      connections: {
        supabase: supabaseStatus,
        milvus: milvusStatus,
        lmStudio: lmStudioStatus
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to check service health' 
    });
  }
});

// เริ่มการทำงานของเซิร์ฟเวอร์
async function startServer() {
  try {
    // ตรวจสอบการเชื่อมต่อกับบริการต่างๆ
    console.log('Checking Supabase connection...');
    const supabaseConnected = await checkSupabaseConnection();
    
    console.log('Checking Milvus connection...');
    const milvusConnected = await checkMilvusConnection();
    
    if (milvusConnected) {
      console.log('Setting up Milvus collections...');
      await setupAllCollections();
    }
    
    console.log('Checking LMStudio connection...');
    await lmStudioService.checkConnection();
    
    // เริ่มต้น HTTP server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Service status: Supabase: ${supabaseConnected ? 'Connected' : 'Not connected'}, Milvus: ${milvusConnected ? 'Connected' : 'Not connected'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// เรียกใช้ฟังก์ชันเริ่มต้นเซิร์ฟเวอร์
startServer();