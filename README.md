# nft-pay-with-erc20-contracts (Hardhat + TypeScript)

Projeto acadêmico: **DApp para cunhar (mintar) um NFT (ERC-721) pagando com um token fungível (ERC-20)** via fluxo **approve → transferFrom → mint**.

Este repositório contém:
- Smart contract ERC-20 (**MuraroToken**)
- Smart contract ERC-721 (**MuraroNFT**) que cobra o ERC-20 no mint
- Scripts de deploy e validação
- Testes com cobertura acima de 50% (Hardhat + solidity-coverage)

---

## Sumário
- [Requisitos atendidos](#requisitos-atendidos)
- [Stack](#stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Rodar rede local](#rodar-rede-local)
- [Deploy local](#deploy-local)
- [Rodar testes e cobertura](#rodar-testes-e-cobertura)
- [Scripts úteis](#scripts-úteis)
- [Troubleshooting](#troubleshooting)
- [Licença](#licença)

---

## Requisitos atendidos

### Token fungível (ERC-20) — MuraroToken
- Compatível com ERC-20.
- 18 casas decimais (padrão).
- Nome e símbolo livres.
- **Apenas o owner do contrato pode cunhar e transferir tokens** na mesma chamada (função `mintAndTransfer`).

### Token não fungível (ERC-721) — MuraroNFT
- Compatível com ERC-721.
- Nome e símbolo livres.
- `constructor(address tokenAddress, uint256 price)`
  - `tokenAddress` é o endereço do ERC-20 no deploy.
  - `price` é o preço do NFT em unidades do ERC-20 (considerando 18 decimais).
- `price` é variável pública (front-end consulta diretamente).
- `mint()` pode ser chamado por qualquer usuário e:
  - exige que o usuário tenha feito `approve` no ERC-20 para o contrato ERC-721
  - cobra o valor via `transferFrom` do usuário para o **owner do ERC-721**
- O owner do ERC-721 **não tem privilégio** para mintar NFTs: também precisa ter saldo e fazer approve.
- `setPrice(uint256)` apenas owner do ERC-721.
- `tokenURI(uint256)` retorna metadados no padrão OpenSea (JSON), via **data URI base64**.

### Testes
- Testes via Hardhat.
- Cobertura via `solidity-coverage` acima de 50%.

---

## Stack
- Hardhat `v2.28.3`
- TypeScript
- OpenZeppelin Contracts
- solidity-coverage

---

## Estrutura do projeto

Exemplo (pode variar conforme seu repo, mas a ideia é esta):
```text
nft-pay-with-erc20-contracts/
├─ contracts/
│  ├─ MuraroToken.sol
│  └─ MuraroNFT.sol
├─ test/
│  ├─ MuraroToken.test.ts
│  └─ MuraroNFT.test.ts
├─ scripts/
│  ├─ deploy.ts
│  └─ check-tokenuri.ts
├─ deployments/
│  └─ localhost.json
├─ hardhat.config.ts
├─ package.json
└─ README.md


## Pré-requisitos
- Node.js (recomendado LTS)
- npm
- Git

## Instalação
```bash
cd nft-pay-with-erc20-contracts
npm install
