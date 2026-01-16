# nft-pay-with-erc20-contracts (Hardhat)

Projeto da pós: DApp para cunhar (mintar) um NFT (ERC-721) pagando com um token fungível (ERC-20) via fluxo **approve → transferFrom → mint**.

## Requisitos atendidos (resumo)
### ERC-20 (MuraroToken)
- Compatível com padrão ERC-20
- 18 casas decimais (padrão)
- Apenas o **owner** pode cunhar e transferir na mesma função: `mintAndTransfer(to, amount)`

### ERC-721 (MuraroNFT)
- Compatível com padrão ERC-721
- `constructor(address tokenAddress, uint256 price)`
- `price` é variável pública (front lê diretamente)
- `mint()` pode ser chamado por qualquer usuário e:
  - exige `approve` prévio no ERC-20
  - cobra tokens via `transferFrom(msg.sender → owner do ERC-721)`
- Owner NÃO tem privilégio para mintar: precisa ter saldo e dar approve igual qualquer usuário
- `setPrice(uint256 newPrice)` apenas owner do ERC-721
- `tokenURI(uint256 tokenId)` retorna metadados no padrão OpenSea (data URI base64)

## Pré-requisitos
- Node.js (recomendado LTS)
- npm
- Git

## Instalação
```bash
cd nft-pay-with-erc20-contracts
npm install
