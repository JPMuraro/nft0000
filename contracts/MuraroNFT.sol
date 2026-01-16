// Contrato ERC-721 que permite cunhar NFTs mediante pagamento em um ERC-20 (paymentToken):
// o owner define o `price`, e no `mint()` o usuário paga via `transferFrom` para o owner do NFT,
// recebendo um tokenId incremental; o `tokenURI()` gera metadata OpenSea on-chain (JSON + SVG)
// usando Data URI/Base64, sem dependência de servidor externo.
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MuraroNFT is ERC721, Ownable {
    using Strings for uint256;

    IERC20 public immutable paymentToken;
    uint256 public price;

    uint256 private _nextId = 1;

    error InvalidPrice();
    error PaymentFailed();

    constructor(address tokenAddress, uint256 initialPrice) ERC721("MuraroNFT", "MNFT") Ownable(msg.sender) {
        if (tokenAddress == address(0)) revert();
        paymentToken = IERC20(tokenAddress);
        price = initialPrice;
    }

    function setPrice(uint256 newPrice) external onlyOwner {
        if (newPrice == 0) revert InvalidPrice();
        price = newPrice;
    }

    function mint() external {
        uint256 p = price;
        if (p == 0) revert InvalidPrice();

        bool ok = paymentToken.transferFrom(msg.sender, owner(), p);
        if (!ok) revert PaymentFailed();

        uint256 tokenId = _nextId++;
        _safeMint(msg.sender, tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721: invalid token ID");

        string memory svg = string.concat(
            "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>",
            "<rect width='100%' height='100%' fill='white'/>",
            "<text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='black'>Muraro NFT</text>",
            "<text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='34' fill='black'>#",
            tokenId.toString(),
            "</text>",
            "</svg>"
        );

        string memory image = string.concat(
            "data:image/svg+xml;base64,",
            Base64.encode(bytes(svg))
        );

        string memory json = string.concat(
            "{",
                "\"name\":\"Muraro NFT #", tokenId.toString(), "\",",
                "\"description\":\"NFT cunhado pagando com MuraroToken (ERC-20) via approve + transferFrom.\",",
                "\"image\":\"", image, "\",",
                "\"attributes\":[",
                    "{\"trait_type\":\"Project\",\"value\":\"NFT Pay with ERC-20\"},",
                    "{\"trait_type\":\"TokenId\",\"value\":", tokenId.toString(), "}",
                "]",
            "}"
        );

        return string.concat(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        );
    }
}
