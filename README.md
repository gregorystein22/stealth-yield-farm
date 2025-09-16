# Stealth Yield Farm

A privacy-focused yield farming platform that protects your farming strategies using Fully Homomorphic Encryption (FHE) technology.

## Features

- **Encrypted Positions**: Your farming positions are encrypted so whales cannot copy profitable strategies until after withdrawal
- **MEV Protection**: Advanced protection against Maximal Extractable Value attacks
- **Maximum Yields**: Optimized yield farming strategies with privacy protection
- **Real Wallet Integration**: Connect with popular wallets like MetaMask, WalletConnect, and more
- **FHE Technology**: Built on Zama's FHE technology for complete privacy

## Technologies

This project is built with:

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Wallet Integration**: RainbowKit, Wagmi, Viem
- **Blockchain**: Ethereum Sepolia Testnet
- **Privacy**: Zama FHE (Fully Homomorphic Encryption)
- **Smart Contracts**: Solidity with FHE support

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Web3 wallet (MetaMask, WalletConnect, etc.)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gregorystein22/stealth-yield-farm.git
cd stealth-yield-farm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475
NEXT_PUBLIC_INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
NEXT_PUBLIC_RPC_URL=https://1rpc.io/sepolia
```

## Smart Contracts

The project includes FHE-enabled smart contracts for:
- Encrypted yield farming positions
- Privacy-preserving transactions
- Secure fund management

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set the environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue on GitHub.

