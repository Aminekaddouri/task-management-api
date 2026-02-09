import app from './app'
import config from './config';

app.listen(config.port, () => {
  console.log(`🚀 Server is running on http://localhost:${config.port}`);
  console.log(`📝 Environment: ${config.env}`);
  console.log(`📍 API Base: http://localhost:${config.port}/api/${config.apiVersion}`);
});
