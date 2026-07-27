// Simulated SMS Gateway memory stores
declare global {
  var otpStore: Map<string, string> | undefined;
  var smsLogs: Array<{ id: string; mobile: string; message: string; timestamp: Date }> | undefined;
}

if (!global.otpStore) {
  global.otpStore = new Map();
}
if (!global.smsLogs) {
  global.smsLogs = [];
}

export function sendSimulatedSMS(mobile: string, message: string) {
  const logEntry = {
    id: Math.random().toString(36).substring(7),
    mobile,
    message,
    timestamp: new Date()
  };

  // Add to in-memory log list (keep last 20 messages)
  global.smsLogs!.unshift(logEntry);
  if (global.smsLogs!.length > 20) {
    global.smsLogs!.pop();
  }

  // Print a prominent log banner in the terminal console
  console.log(`
┌────────────────────────────────────────────────────────┐
│             📱 simulated sms gateway send              │
├────────────────────────────────────────────────────────┤
│ TO:      +91 ${mobile.padEnd(42)} │
│ MESSAGE: ${message.padEnd(46)} │
│ TIME:    ${new Date().toLocaleTimeString().padEnd(46)} │
└────────────────────────────────────────────────────────┘
  `);

  return logEntry;
}

export function generateOTP(username: string): string {
  // Generate random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  global.otpStore!.set(username, otp);
  return otp;
}

export function verifyOTP(username: string, enteredOtp: string): boolean {
  const storedOtp = global.otpStore!.get(username);
  if (storedOtp && storedOtp === enteredOtp) {
    // Clear OTP after successful verification
    global.otpStore!.delete(username);
    return true;
  }
  return false;
}

export function getSMSLogs() {
  return global.smsLogs || [];
}
