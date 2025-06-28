// Generate a secure webhook secret for Morning Voyage
console.log('='.repeat(60))
console.log('WEBHOOK SECRET GENERATOR')
console.log('='.repeat(60))

// Method 1: Generate a random secure token
function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Method 2: Generate using crypto-style approach
function generateCryptoToken() {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

// Method 3: UUID-style token
function generateUUIDToken() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

console.log('\n🔐 GENERATED WEBHOOK SECRETS:')
console.log('Choose any one of these for your WEBHOOK_SECRET environment variable:\n')

console.log('Option 1 (Recommended):')
console.log(`WEBHOOK_SECRET=${generateSecureToken()}`)

console.log('\nOption 2 (Hex format):')
console.log(`WEBHOOK_SECRET=${generateCryptoToken()}`)

console.log('\nOption 3 (UUID format):')
console.log(`WEBHOOK_SECRET=${generateUUIDToken()}`)

console.log('\n' + '='.repeat(60))
console.log('HOW TO USE:')
console.log('='.repeat(60))

console.log('\n1. Copy one of the WEBHOOK_SECRET values above')
console.log('2. Add it to your Vercel environment variables:')
console.log('   - Go to your Vercel dashboard')
console.log('   - Select your project')
console.log('   - Go to Settings > Environment Variables')
console.log('   - Add: WEBHOOK_SECRET = [your chosen value]')

console.log('\n3. Redeploy your project after adding the variable')

console.log('\n💡 WHAT IS A WEBHOOK SECRET?')
console.log('A webhook secret is a password that protects your webhook endpoint.')
console.log('When Google Sheets (or other services) send updates to your site,')
console.log('they include this secret to prove the request is legitimate.')

console.log('\n🔒 SECURITY NOTES:')
console.log('- Keep this secret private (never commit to git)')
console.log('- Use a different secret for each environment (dev/prod)')
console.log('- Change it periodically for better security')

console.log('\n✅ NEXT STEPS:')
console.log('1. Add the WEBHOOK_SECRET to Vercel')
console.log('2. Test your Google Sheets connection again')
console.log('3. The webhook is optional - your basic integration will work without it')
