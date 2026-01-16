# NFT Pay with ERC-20 (Smart Contracts)

DApp: cunhar (mintar) um NFT ERC-721 pagando com um token ERC-20 via fluxo **approve → transferFrom**.

Este repositório contém:
- `MuraroToken` (ERC-20): somente o owner pode `mintAndTransfer(to, amount)` (cunha e transfere na mesma chamada).
- `MuraroNFT` (ERC-721): qualquer usuário pode `mint()`, mas deve pagar `price` em ERC-20. O contrato faz `transferFrom` do comprador para o **owner do ERC-721**.
- `setPrice(newPrice)` apenas pelo owner do ERC-721.
- `tokenURI(tokenId)` retorna metadados on-chain no formato `data:application/json;base64,...` (padrão OpenSea).

## Requisitos
- Node.js 18+ (recomendado 20+)
- npm

## Instalação
```bash
npm install
