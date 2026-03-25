// Cloudflare Workers 后端
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API 路由
    if (url.pathname === '/api/convert' && request.method === 'POST') {
      return await this.handleConvert(request, env, corsHeaders);
    }

    if (url.pathname === '/api/quota' && request.method === 'GET') {
      return await this.handleQuota(request, env, corsHeaders);
    }

    if (url.pathname === '/api/webhook' && request.method === 'POST') {
      return await this.handleWebhook(request, env, corsHeaders);
    }

    // 默认返回健康检查
    return new Response(JSON.stringify({ 
      status: 'ok',
      message: 'PDF to Word Converter API'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  },

  // 处理PDF转换
  async handleConvert(request, env, corsHeaders) {
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      const userId = formData.get('userId') || 'anonymous';

      if (!file) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: '没有上传文件' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 检查用户配额（从KV读取）
      const isMember = await this.checkMembership(userId, env);
      const usage = await this.getUsage(userId, env);

      if (!isMember && usage >= 2) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: '今日免费次数已用完，请升级会员' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 这里调用ConvertAPI进行实际转换
      // 暂时返回模拟结果
      const result = await this.mockConvert(file);

      // 增加使用次数
      if (!isMember) {
        await this.incrementUsage(userId, env);
      }

      return new Response(JSON.stringify({
        success: true,
        downloadUrl: result.downloadUrl,
        fileName: result.fileName
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('转换错误:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: '转换失败' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },

  // 模拟转换（实际项目中替换为ConvertAPI）
  async mockConvert(file) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          downloadUrl: '#',
          fileName: file.name.replace('.pdf', '.docx')
        });
      }, 2000);
    });
  },

  // 检查会员状态
  async checkMembership(userId, env) {
    if (!env.USERS_KV) return false;
    
    try {
      const memberData = await env.USERS_KV.get(`member:${userId}`);
      if (memberData) {
        const data = JSON.parse(memberData);
        return data.expiresAt > Date.now();
      }
    } catch (e) {
      console.error('检查会员状态失败:', e);
    }
    return false;
  },

  // 获取使用次数
  async getUsage(userId, env) {
    if (!env.USERS_KV) return 0;
    
    const today = new Date().toDateString();
    try {
      const usageData = await env.USERS_KV.get(`usage:${userId}:${today}`);
      return usageData ? parseInt(usageData) : 0;
    } catch (e) {
      console.error('获取使用次数失败:', e);
      return 0;
    }
  },

  // 增加使用次数
  async incrementUsage(userId, env) {
    if (!env.USERS_KV) return;
    
    const today = new Date().toDateString();
    const key = `usage:${userId}:${today}`;
    
    try {
      const current = await this.getUsage(userId, env);
      await env.USERS_KV.put(key, (current + 1).toString(), {
        expirationTtl: 86400 // 24小时过期
      });
    } catch (e) {
      console.error('增加使用次数失败:', e);
    }
  },

  // 处理配额查询
  async handleQuota(request, env, corsHeaders) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'anonymous';
    
    const isMember = await this.checkMembership(userId, env);
    const usage = await this.getUsage(userId, env);
    
    return new Response(JSON.stringify({
      isMember,
      usage,
      remaining: isMember ? -1 : Math.max(0, 2 - usage)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  },

  // 处理PayPal Webhook
  async handleWebhook(request, env, corsHeaders) {
    try {
      const payload = await request.json();
      
      // 验证PayPal Webhook
      // 这里需要实现PayPal Webhook验证逻辑
      
      if (payload.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const userId = payload.custom_id || 'anonymous';
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30天
        
        if (env.USERS_KV) {
          await env.USERS_KV.put(`member:${userId}`, JSON.stringify({
            expiresAt,
            plan: 'monthly',
            createdAt: Date.now()
          }));
        }
        
        console.log('会员开通成功:', userId);
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Webhook处理失败:', error);
      return new Response(JSON.stringify({ success: false }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
