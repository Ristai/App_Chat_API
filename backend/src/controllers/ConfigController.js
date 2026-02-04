class ConfigController {
  /**
   * Get Firebase config for frontend
   * GET /api/config/firebase
   */
  getFirebaseConfig(req, res) {
    const config = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    };

    res.status(200).json({
      success: true,
      data: config,
    });
  }

  /**
   * Get Zego config for frontend
   * GET /api/config/zego
   */
  getZegoConfig(req, res) {
    const config = {
      appId: parseInt(process.env.ZEGO_APP_ID) || 0,
      appSign: process.env.ZEGO_APP_SIGN || '',
    };

    res.status(200).json({
      success: true,
      data: config,
    });
  }

  /**
   * Generate Zego token for user
   * POST /api/config/zego/token
   */
  generateZegoToken(req, res, next) {
    try {
      const userId = req.user.userId;
      const { roomId } = req.body;

      // TODO: Implement Zego token generation
      // This requires Zego server SDK
      // For now, return mock data
      
      const token = 'mock-zego-token';

      res.status(200).json({
        success: true,
        data: {
          token,
          userId,
          roomId,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ConfigController();
