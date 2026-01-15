// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MuraroToken
 * @notice ERC-20 com 18 decimais (padrão). Apenas o owner pode cunhar e transferir em uma única função.
 */
contract MuraroToken is ERC20, Ownable {
    constructor() ERC20("Muraro Token", "MURA") Ownable(msg.sender) {}

    /**
     * @notice Somente o owner pode cunhar novos tokens e transferi-los para uma conta
     * em uma mesma função (mint + transfer).
     * @dev amount deve estar em 18 casas decimais (parseUnits no front/testes).
     */
    function mintAndTransfer(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Destino invalido");

        // Cunha para o owner e transfere para o destinatario (mint + transfer)
        _mint(owner(), amount);
        _transfer(owner(), to, amount);
    }
}
