// Contrato ERC-20 (18 decimais) controlado por owner: implementa o token MuraroToken (MURA)
// e expõe a função administrativa `mintAndTransfer(to, amount)`, que permite ao owner cunhar
// novos tokens e transferi-los ao destinatário em uma única chamada (mint + transfer).
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MuraroToken is ERC20, Ownable {
    constructor() ERC20("Muraro Token", "MURA") Ownable(msg.sender) {}

    function mintAndTransfer(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Destino invalido");

        _mint(owner(), amount);
        _transfer(owner(), to, amount);
    }
}
