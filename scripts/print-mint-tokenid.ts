// Script Hardhat que recebe `--nft <NFT_ADDR>` e `--tx <TX_HASH>`, busca o receipt da transação,
// faz o parse dos logs do contrato MuraroNFT e identifica o tokenId cunhado ao localizar o evento
// ERC-721 `Transfer` com `from` igual ao endereço zero (mint), imprimindo blockNumber e tokenId
// e, se não encontrar, lista informações básicas dos logs para depuração.
import { ethers } from "hardhat";

function getArg(flag: string) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
  const nftAddr = getArg("--nft");
  const txHash = getArg("--tx");

  if (!nftAddr || !txHash) {
    throw new Error(
      "Uso:\n" +
        "npx hardhat run scripts/print-mint-tokenid.ts --network localhost --nft <NFT_ADDR> --tx <TX_HASH>\n"
    );
  }

  const receipt = await ethers.provider.getTransactionReceipt(txHash);
  if (!receipt) throw new Error("Receipt não encontrado (txHash inválido ou nó não está rodando).");

  const nft = await ethers.getContractAt("MuraroNFT", nftAddr);

  let mintedTokenId: bigint | null = null;

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== nftAddr.toLowerCase()) continue;

    try {
      const parsed = nft.interface.parseLog(log);
      if (!parsed) continue;

      if (parsed.name === "Transfer") {
        const from = String(parsed.args.from).toLowerCase();
        const tokenId = parsed.args.tokenId as bigint;

        if (from === "0x0000000000000000000000000000000000000000") {
          mintedTokenId = tokenId;
          break;
        }
      }
    } catch {
    }
  }

  console.log("TX:", txHash);
  console.log("NFT:", nftAddr);
  console.log("blockNumber:", receipt.blockNumber.toString());
  console.log("tokenId:", mintedTokenId !== null ? mintedTokenId.toString() : "(não encontrado)");

  if (mintedTokenId === null) {
    console.log("\n--- DEBUG: logs do receipt ---");
    receipt.logs.forEach((l, idx) => {
      console.log(
        `#${idx} address=${l.address} topics=${l.topics.length} dataLen=${(l.data?.length ?? 0)}`
      );
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
