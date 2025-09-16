# Vercel Deployment Guide for Stealth Yield Farm

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Ensure your code is pushed to GitHub
3. **Environment Variables**: Prepare the required environment variables

## Step-by-Step Deployment

### Step 1: Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project" or "Add New..." → "Project"
3. Import your GitHub repository: `gregorystein22/stealth-yield-farm`
4. Click "Import" to proceed

### Step 2: Configure Project Settings

1. **Project Name**: `stealth-yield-farm` (or your preferred name)
2. **Framework Preset**: Select "Vite"
3. **Root Directory**: Leave as default (`.`)
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

### Step 3: Set Environment Variables

In the Vercel dashboard, go to "Settings" → "Environment Variables" and add:

```env
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990
VITE_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475
VITE_INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
VITE_RPC_URL_BACKUP=https://1rpc.io/sepolia
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

**Important**: Replace `VITE_CONTRACT_ADDRESS` with your actual deployed contract address after deploying the smart contracts.

### Step 4: Deploy

1. Click "Deploy" button
2. Wait for the build process to complete (usually 2-3 minutes)
3. Your application will be available at the provided Vercel URL

### Step 5: Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Wait for SSL certificate to be issued

## Post-Deployment Configuration

### Smart Contract Deployment

1. **Deploy to Sepolia Testnet**:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

2. **Update Environment Variables**:
   - Copy the deployed contract address
   - Update `VITE_CONTRACT_ADDRESS` in Vercel dashboard
   - Redeploy the application

### Verification

1. **Test Wallet Connection**: Ensure RainbowKit wallet connection works
2. **Test Contract Interaction**: Verify contract calls are successful
3. **Test Responsive Design**: Check mobile and desktop views
4. **Test Privacy Features**: Verify encrypted position display

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables are set correctly
   - Ensure all dependencies are in package.json
   - Check build logs in Vercel dashboard

2. **Wallet Connection Issues**:
   - Verify WalletConnect Project ID is correct
   - Check RPC URL is accessible
   - Ensure network configuration matches

3. **Contract Interaction Issues**:
   - Verify contract address is correct
   - Check contract is deployed on correct network
   - Ensure ABI matches deployed contract

### Performance Optimization

1. **Enable Edge Functions** (if needed)
2. **Configure CDN** for static assets
3. **Enable Compression** for better loading times
4. **Monitor Performance** using Vercel Analytics

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_CHAIN_ID` | Ethereum chain ID | `11155111` (Sepolia) |
| `VITE_RPC_URL` | Primary RPC endpoint | `https://sepolia.infura.io/v3/...` |
| `VITE_WALLET_CONNECT_PROJECT_ID` | WalletConnect project ID | `2ec9743d0d0cd7fb94dee1a7e6d33475` |
| `VITE_INFURA_API_KEY` | Infura API key | `b18fb7e6ca7045ac83c41157ab93f990` |
| `VITE_RPC_URL_BACKUP` | Backup RPC endpoint | `https://1rpc.io/sepolia` |
| `VITE_CONTRACT_ADDRESS` | Deployed contract address | `0x...` |

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to repository
2. **API Keys**: Use environment variables for all API keys
3. **Contract Verification**: Verify smart contracts on Etherscan
4. **HTTPS**: Ensure all connections use HTTPS
5. **CORS**: Configure CORS properly for API calls

## Monitoring and Maintenance

1. **Vercel Analytics**: Monitor performance and usage
2. **Error Tracking**: Set up error monitoring
3. **Uptime Monitoring**: Monitor application availability
4. **Regular Updates**: Keep dependencies updated
5. **Security Audits**: Regular security reviews

## Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs
3. Test locally first
4. Contact support if needed

---

**Note**: This deployment guide assumes you have already deployed the smart contracts to Sepolia testnet. Make sure to update the contract address in environment variables after deployment.
