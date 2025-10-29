const { sendNewsletterWelcomeEmail } = require('./utils/emailService');

// Test email sending
async function testEmail() {
  console.log('🧪 Testing newsletter email...');
  
  try {
    const result = await sendNewsletterWelcomeEmail('nicknicc95@gmail.com');
    if (result) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Check your inbox at nicknicc95@gmail.com');
    } else {
      console.log('❌ Failed to send test email');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

testEmail();
