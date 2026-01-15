import { ethers } from "hardhat";

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim().length === 0) {
    throw new Error(`Variável de ambiente ${name} não definida.`);
  }
  return v.trim();
}

async function main() {
  const tokenAddr = mustEnv("TOKEN");
  const to = mustEnv("TO");
  const amountStr = (process.env.AMOUNT ?? "100").trim(); // em tokens inteiros, ex: "100"

  const [deployer] = await ethers.getSigners();
  console.log("Deployer (owner do token, esperado):", deployer.address);

  const token = await ethers.getContractAt("MuraroToken", tokenAddr, deployer);

  const decimals = await token.decimals();
  const symbol = await token.symbol();

  const amountUnits = ethers.parseUnits(amountStr, decimals);

  console.log(`TOKEN: ${tokenAddr}`);
  console.log(`TO:    ${to}`);
  console.log(`AMOUNT: ${amountStr} ${symbol} (${amountUnits.toString()} units)`);

  console.log(`Executando mintAndTransfer...`);
  const tx = await token.mintAndTransfer(to, amountUnits);
  console.log("TX:", tx.hash);

  const receipt = await tx.wait();
  console.log("Confirmado no bloco:", receipt?.blockNumber);

  const newBal = await token.balanceOf(to);
  console.log("Novo saldo do destinatário:", ethers.formatUnits(newBal, decimals), symbol);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
